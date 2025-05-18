/**
 * Interface for cache entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiryTime: number; // Time in milliseconds
}

/**
 * Cache statistics interface
 */
interface CacheStatistics {
  totalEntries: number;
  totalSize: number; // Approximate size in bytes
  oldestEntry: number;
  newestEntry: number;
  hitCount: number;
  missCount: number;
  hitRate: number; // hit / (hit + miss)
}

/**
 * API Cache Service for efficient data storage
 */
export class APICacheService {
  private static instance: APICacheService;
  private cache: Map<string, CacheEntry<unknown>>;
  private localStorage: Storage | null;
  private defaultExpiryTime: number = 1000 * 60 * 30; // 30 minutes
  private maxCacheSize: number = 5 * 1024 * 1024; // 5MB approximate limit
  private currentCacheSize: number = 0;
  private persistenceEnabled: boolean = true;
  private statistics: {
    hitCount: number;
    missCount: number;
  };

  private constructor() {
    this.cache = new Map();
    this.statistics = {
      hitCount: 0,
      missCount: 0
    };
    
    // Check if localStorage is available
    try {
      this.localStorage = typeof window !== 'undefined' ? window.localStorage : null;
      this.loadFromPersistence();
    } catch (error) {
      console.warn('LocalStorage not available for caching:', error);
      this.localStorage = null;
      this.persistenceEnabled = false;
    }
  }

  /**
   * Get singleton instance of APICacheService
   */
  public static getInstance(): APICacheService {
    if (!APICacheService.instance) {
      APICacheService.instance = new APICacheService();
    }
    return APICacheService.instance;
  }

  /**
   * Get an item from the cache
   */
  public get<T>(key: string): T | null {
    // Check if the key exists in the cache
    if (!this.cache.has(key)) {
      this.statistics.missCount++;
      return null;
    }

    const cacheEntry = this.cache.get(key) as CacheEntry<T>;
    
    // Check if the cache entry has expired
    if (Date.now() - cacheEntry.timestamp > cacheEntry.expiryTime) {
      this.cache.delete(key);
      this.statistics.missCount++;
      return null;
    }

    // Return the cached data
    this.statistics.hitCount++;
    return cacheEntry.data;
  }

  /**
   * Set an item in the cache
   */
  public set<T>(key: string, data: T, expiryTime?: number): void {
    // Create the cache entry
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiryTime: expiryTime || this.defaultExpiryTime
    };

    // Estimate the size of the entry (rough approximation)
    const estimatedSize = this.estimateSize(key, data);
    
    // If adding this would exceed cache size, make room
    if (this.currentCacheSize + estimatedSize > this.maxCacheSize) {
      this.makeRoom(estimatedSize);
    }

    // Add to the cache
    this.cache.set(key, entry);
    this.currentCacheSize += estimatedSize;
    
    // Persist to localStorage if enabled
    if (this.persistenceEnabled) {
      this.persistEntry(key, entry);
    }
  }

  /**
   * Check if a key exists in the cache and is valid
   */
  public has(key: string): boolean {
    if (!this.cache.has(key)) {
      return false;
    }

    const cacheEntry = this.cache.get(key) as CacheEntry<unknown>;
    return Date.now() - cacheEntry.timestamp <= cacheEntry.expiryTime;
  }

  /**
   * Remove an item from the cache
   */
  public remove(key: string): void {
    if (this.cache.has(key)) {
      // Update the estimated cache size
      const entry = this.cache.get(key);
      if (entry) {
        this.currentCacheSize -= this.estimateSize(key, entry.data);
      }
      
      // Remove from the cache
      this.cache.delete(key);
      
      // Remove from persistence if enabled
      if (this.persistenceEnabled && this.localStorage) {
        try {
          this.localStorage.removeItem(`cache_${key}`);
        } catch (error) {
          console.warn(`Failed to remove item from localStorage: ${key}`, error);
        }
      }
    }
  }

  /**
   * Clear all items from the cache
   */
  public clear(): void {
    this.cache.clear();
    this.currentCacheSize = 0;
    
    // Clear persisted cache if enabled
    if (this.persistenceEnabled && this.localStorage) {
      try {
        // Only clear cache-related items
        const keysToRemove: string[] = [];
        for (let i = 0; i < this.localStorage.length; i++) {
          const key = this.localStorage.key(i);
          if (key && key.startsWith('cache_')) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          this.localStorage?.removeItem(key);
        });
      } catch (error) {
        console.warn('Failed to clear localStorage cache', error);
      }
    }
  }

  /**
   * Clear items by prefix
   */
  public clearByPrefix(prefix: string): void {
    // Get all keys with the given prefix
    const keysToRemove: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove matching items
    keysToRemove.forEach(key => {
      this.remove(key);
    });
  }

  /**
   * Get cache statistics
   */
  public getStatistics(): CacheStatistics {
    let oldestEntry = Date.now();
    let newestEntry = 0;
    
    // Calculate statistics from the cache
    for (const entry of this.cache.values()) {
      if (entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
      if (entry.timestamp > newestEntry) {
        newestEntry = entry.timestamp;
      }
    }
    
    const totalRequests = this.statistics.hitCount + this.statistics.missCount;
    const hitRate = totalRequests > 0 ? this.statistics.hitCount / totalRequests : 0;
    
    return {
      totalEntries: this.cache.size,
      totalSize: this.currentCacheSize,
      oldestEntry,
      newestEntry,
      hitCount: this.statistics.hitCount,
      missCount: this.statistics.missCount,
      hitRate
    };
  }

  /**
   * Set the default expiry time for cache entries
   */
  public setDefaultExpiryTime(milliseconds: number): void {
    this.defaultExpiryTime = milliseconds;
  }

  /**
   * Set the maximum cache size
   */
  public setMaxCacheSize(bytes: number): void {
    this.maxCacheSize = bytes;
    // If current cache exceeds the new limit, make room
    if (this.currentCacheSize > this.maxCacheSize) {
      this.makeRoom(0);
    }
  }

  /**
   * Enable or disable persistence
   */
  public setPersistenceEnabled(enabled: boolean): void {
    this.persistenceEnabled = enabled && this.localStorage !== null;
  }

  /**
   * Make room in the cache by removing oldest entries first
   */
  private makeRoom(requiredSpace: number): void {
    if (requiredSpace > this.maxCacheSize) {
      console.warn(`Requested cache entry size (${requiredSpace} bytes) exceeds max cache size (${this.maxCacheSize} bytes)`);
      return;
    }
    
    // Sort entries by timestamp (oldest first)
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );
    
    let removedSize = 0;
    
    // Remove oldest entries until we have enough space
    for (const [key, entry] of entries) {
      // Skip if we've already made enough room
      if (this.currentCacheSize + requiredSpace - removedSize <= this.maxCacheSize) {
        break;
      }
      
      const entrySize = this.estimateSize(key, entry.data);
      this.cache.delete(key);
      removedSize += entrySize;
      
      // Remove from persistence if enabled
      if (this.persistenceEnabled && this.localStorage) {
        try {
          this.localStorage.removeItem(`cache_${key}`);
        } catch (error) {
          console.warn(`Failed to remove item from localStorage: ${key}`, error);
        }
      }
    }
    
    this.currentCacheSize -= removedSize;
  }

  /**
   * Estimate the size of a cache entry
   */
  private estimateSize(key: string, data: unknown): number {
    try {
      // Get the JSON string representation
      const jsonString = JSON.stringify({key, data});
      // Rough estimate: 2 bytes per character
      return jsonString.length * 2;
    } catch (error) {
      // If serialization fails, use a conservative estimate
      console.warn(`Failed to estimate size for cache key ${key}:`, error);
      return 1024; // Assume 1KB
    }
  }

  /**
   * Persist an entry to localStorage
   */
  private persistEntry<T>(key: string, entry: CacheEntry<T>): void {
    if (!this.localStorage) return;
    
    try {
      const storageKey = `cache_${key}`;
      this.localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      // If storage is full or another error occurs
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing oldest entries');
        this.clearOldestPersistedEntries();
        // Try again
        try {
          const storageKey = `cache_${key}`;
          this.localStorage?.setItem(storageKey, JSON.stringify(entry));
        } catch (retryError) {
          console.error('Failed to persist cache entry after clearing space:', retryError);
          this.persistenceEnabled = false;
        }
      } else {
        console.warn('Failed to persist cache entry:', error);
      }
    }
  }

  /**
   * Clear oldest entries from localStorage to make room
   */
  private clearOldestPersistedEntries(): void {
    if (!this.localStorage) return;
    
    try {
      const cacheEntries: {key: string; timestamp: number}[] = [];
      
      // Collect all cache entries with their timestamps
      for (let i = 0; i < this.localStorage.length; i++) {
        const key = this.localStorage.key(i);
        if (key && key.startsWith('cache_')) {
          const entryJson = this.localStorage.getItem(key);
          if (entryJson) {
            try {
              const entry = JSON.parse(entryJson);
              cacheEntries.push({
                key,
                timestamp: entry.timestamp || 0
              });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (_error) {
              // Invalid entry, remove it
              this.localStorage.removeItem(key);
            }
          }
        }
      }
      
      // Sort by timestamp (oldest first)
      cacheEntries.sort((a, b) => a.timestamp - b.timestamp);
      
      // Remove the oldest 20% of entries
      const entriesToRemove = Math.ceil(cacheEntries.length * 0.2);
      for (let i = 0; i < entriesToRemove && i < cacheEntries.length; i++) {
        this.localStorage.removeItem(cacheEntries[i].key);
      }
    } catch (error) {
      console.error('Failed to clear oldest persisted entries:', error);
      this.persistenceEnabled = false;
    }
  }

  /**
   * Load persisted cache entries from localStorage
   */
  private loadFromPersistence(): void {
    if (!this.localStorage) return;
    
    try {
      const now = Date.now();
      
      for (let i = 0; i < this.localStorage.length; i++) {
        const key = this.localStorage.key(i);
        if (key && key.startsWith('cache_')) {
          const cacheKey = key.substring(6); // Remove 'cache_' prefix
          const entryJson = this.localStorage.getItem(key);
          
          if (entryJson) {
            try {
              const entry = JSON.parse(entryJson) as CacheEntry<unknown>;
              
              // Skip expired entries
              if (now - entry.timestamp > entry.expiryTime) {
                this.localStorage.removeItem(key);
                continue;
              }
              
              // Add to in-memory cache
              this.cache.set(cacheKey, entry);
              this.currentCacheSize += this.estimateSize(cacheKey, entry.data);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (_error) {
              // Invalid entry, remove it
              this.localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted cache:', error);
    }
  }
} 