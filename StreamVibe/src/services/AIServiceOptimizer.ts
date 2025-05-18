/**
 * AI Service Optimizer
 * Provides optimization strategies for AI services
 */

import PerformanceOptimization from './PerformanceOptimization';
import OpenAIService from './OpenAIService';
import { ContentAPI } from './api/ContentAPI';
import PreferencesService from './PreferencesService';

// Response type for AI requests
export interface AIOptimizedResponse<T> {
  data: T;
  source: 'api' | 'cache' | 'fallback';
  responseTime: number;
  cached: boolean;
  timestamp: string;
}

// Cache configuration
interface CacheConfig {
  enabled: boolean;
  ttl: number;
  key: string;
}

// Request options
export interface AIRequestOptions {
  cachingStrategy?: 'normal' | 'aggressive' | 'none';
  priority?: 'high' | 'normal' | 'low';
  allowFallback?: boolean;
  timeout?: number;
  forceRefresh?: boolean;
}

// Cache item interface
interface CacheItem<T> {
  data: T;
  expires: number;
  accessCount: number;
}

class AIServiceOptimizer {
  private static instance: AIServiceOptimizer;
  private performanceService: PerformanceOptimization;
  /** @preserved Used for potential future AI service integration */
  private openAIService: OpenAIService;
  /** @preserved Used for potential future content API integration */
  private contentAPI: ContentAPI;
  /** @preserved Used for potential future preference service integration */
  private userPreferenceService: PreferencesService;
  private cache: Map<string, CacheItem<unknown>> = new Map();
  private readonly DEFAULT_TTL = 60 * 60 * 1000; // 1 hour
  private readonly DEFAULT_TIMEOUT = 5000; // 5 seconds
  
  private constructor() {
    this.performanceService = PerformanceOptimization.getInstance();
    this.openAIService = OpenAIService.getInstance();
    this.contentAPI = ContentAPI.getInstance();
    this.userPreferenceService = PreferencesService.getInstance();
    this.loadCacheFromStorage();
    
    // Set up cache cleanup interval
    setInterval(() => this.cleanupCache(), 30 * 60 * 1000); // Clean every 30 minutes
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): AIServiceOptimizer {
    if (!AIServiceOptimizer.instance) {
      AIServiceOptimizer.instance = new AIServiceOptimizer();
    }
    return AIServiceOptimizer.instance;
  }
  
  /**
   * Optimize an AI request with caching and fallback
   */
  public async optimizeRequest<T>(
    requestFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
    cacheConfig: CacheConfig,
    options: AIRequestOptions = {}
  ): Promise<AIOptimizedResponse<T>> {
    const start = performance.now();
    const timestamp = new Date().toISOString();
    
    try {
      // Set defaults for options
      const {
        cachingStrategy = 'normal',
        priority = 'normal',
        allowFallback = true,
        timeout = this.DEFAULT_TIMEOUT,
        forceRefresh = false
      } = options;
      
      // Determine if caching is enabled based on strategy
      const cachingEnabled = cachingStrategy !== 'none' && cacheConfig.enabled;
      
      // Check cache first if caching is enabled and not forcing refresh
      if (cachingEnabled && !forceRefresh) {
        const cacheKey = cacheConfig.key;
        const cachedItem = this.cache.get(cacheKey) as CacheItem<T> | undefined;
        
        if (cachedItem && cachedItem.expires > Date.now()) {
          // Cache hit
          this.performanceService.recordCacheHit(true);
          cachedItem.accessCount++;
          
          const end = performance.now();
          
          return {
            data: cachedItem.data,
            source: 'cache',
            responseTime: end - start,
            cached: true,
            timestamp
          };
        } else {
          // Cache miss
          this.performanceService.recordCacheHit(false);
        }
      }
      
      // If network is slow or offline, use aggressive caching or fallback
      const networkCondition = this.performanceService.getNetworkCondition();
      if (networkCondition !== 'fast' && cachingStrategy === 'aggressive') {
        // Try to find any cached item, even expired ones
        const cacheKey = cacheConfig.key;
        const cachedItem = this.cache.get(cacheKey) as CacheItem<T> | undefined;
        
        if (cachedItem) {
          // Use expired cache for aggressive strategy
          cachedItem.accessCount++;
          
          const end = performance.now();
          
          return {
            data: cachedItem.data,
            source: 'cache',
            responseTime: end - start,
            cached: true,
            timestamp
          };
        }
      }
      
      // No cache hit, need to make the request
      // Use promise race with timeout
      let responseData: T;
      
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeout);
        });
        
        // Queue the request with priority
        const requestPromise = this.performanceService.queueRequest<T>(
          cacheConfig.key,
          {},
          priority
        ).then(() => requestFn());
        
        // Race the request against timeout
        responseData = await Promise.race([requestPromise, timeoutPromise]);
        
        // Request succeeded, cache the result if caching is enabled
        if (cachingEnabled) {
          const ttl = cacheConfig.ttl || this.DEFAULT_TTL;
          this.cache.set(cacheConfig.key, {
            data: responseData,
            expires: Date.now() + ttl,
            accessCount: 1
          });
          this.saveCacheToStorage();
        }
        
        const end = performance.now();
        
        return {
          data: responseData,
          source: 'api',
          responseTime: end - start,
          cached: false,
          timestamp
        };
      } catch (error) {
        // Request failed or timed out
        if (!allowFallback) {
          throw error;
        }
        
        // Use fallback function
        const fallbackData = await fallbackFn();
        const end = performance.now();
        
        return {
          data: fallbackData,
          source: 'fallback',
          responseTime: end - start,
          cached: false,
          timestamp
        };
      }
    } catch (error) {
      console.error('Error in optimized request:', error);
      throw error;
    }
  }
  
  /**
   * Prefetch data that is likely to be needed soon
   */
  public prefetchData<T>(
    requestFn: () => Promise<T>,
    cacheConfig: CacheConfig,
    likelihood: number = 0.5
  ): void {
    // Check if we should prefetch based on likelihood threshold
    if (!this.performanceService.shouldPrefetch(likelihood)) {
      return;
    }
    
    // Check if already cached
    const cacheKey = cacheConfig.key;
    const cachedItem = this.cache.get(cacheKey) as CacheItem<T> | undefined;
    if (cachedItem && cachedItem.expires > Date.now()) {
      return; // Already in cache, no need to prefetch
    }
    
    // Queue a low-priority request to fetch the data
    this.performanceService.queueRequest(
      cacheKey,
      {},
      'low'
    ).then(() => {
      requestFn().then(data => {
        const ttl = cacheConfig.ttl || this.DEFAULT_TTL;
        this.cache.set(cacheKey, {
          data,
          expires: Date.now() + ttl,
          accessCount: 0 // Start with 0 since this is a prefetch
        });
        this.saveCacheToStorage();
      }).catch(error => {
        // Silently fail for prefetching
        console.warn('Prefetch failed:', error);
      });
    });
  }
  
  /**
   * Clear cache for a specific key
   */
  public clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
    this.saveCacheToStorage();
  }
  
  /**
   * Load cache from storage
   */
  private loadCacheFromStorage(): void {
    try {
      const cachedData = localStorage.getItem('ai_optimizer_cache');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        
        // Convert stored data back to Map
        this.cache = new Map();
        for (const [key, value] of Object.entries(parsedData)) {
          this.cache.set(key, value as CacheItem<unknown>);
        }
        
        // Clean up expired items
        this.cleanupCache();
      }
    } catch (error) {
      console.error('Error loading cache from storage:', error);
      this.cache = new Map();
    }
  }
  
  /**
   * Save cache to storage
   */
  private saveCacheToStorage(): void {
    try {
      // Convert Map to object for storage
      const cacheObj: Record<string, CacheItem<unknown>> = {};
      this.cache.forEach((value, key) => {
        cacheObj[key] = value;
      });
      
      localStorage.setItem('ai_optimizer_cache', JSON.stringify(cacheObj));
    } catch (error) {
      console.error('Error saving cache to storage:', error);
    }
  }
  
  /**
   * Clean up expired cache items
   */
  private cleanupCache(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    // Remove expired items
    this.cache.forEach((value, key) => {
      if (value.expires < now) {
        this.cache.delete(key);
        expiredCount++;
      }
    });
    
    if (expiredCount > 0) {
      this.saveCacheToStorage();
    }
  }
  
  /**
   * Get performance metrics for AI services
   */
  public getMetrics(): Record<string, unknown> {
    return {
      ...this.performanceService.getPerformanceMetrics(),
      cacheSize: this.cache.size,
      cacheKeys: Array.from(this.cache.keys()),
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Optimize batch content processing
   */
  public async processBatch<T, R>(
    items: T[],
    processFn: (item: T) => Promise<R>,
    options: {
      concurrency?: number;
      progressCallback?: (progress: number) => void;
      timeout?: number;
    } = {}
  ): Promise<R[]> {
    const {
      concurrency = 3,
      progressCallback,
      timeout = 30000
    } = options;
    
    // Create a timeout for the entire batch
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Batch processing timeout')), timeout);
    });
    
    // Process function with progress reporting
    const process = async (): Promise<R[]> => {
      const results: R[] = [];
      let completed = 0;
      
      // Process in chunks based on concurrency
      for (let i = 0; i < items.length; i += concurrency) {
        const chunk = items.slice(i, i + concurrency);
        
        // Process chunk in parallel
        const chunkResults = await Promise.all(
          chunk.map(item => processFn(item))
        );
        
        // Add results
        results.push(...chunkResults);
        
        // Update progress
        completed += chunk.length;
        if (progressCallback) {
          progressCallback(completed / items.length);
        }
      }
      
      return results;
    };
    
    // Race the processing against timeout
    return Promise.race([process(), timeoutPromise]);
  }
}

export default AIServiceOptimizer; 