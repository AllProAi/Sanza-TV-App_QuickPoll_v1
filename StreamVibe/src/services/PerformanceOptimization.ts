/**
 * Performance optimization service
 * Provides utility functions for optimizing AI service performance
 */

// Type for performance settings
interface PerformanceSettings {
  // Cache settings
  cacheEnabled: boolean;
  cacheTTL: number;
  maxCacheItems: number;
  prioritizeCacheForSlowConnections: boolean;
  
  // API call optimization
  batchingEnabled: boolean;
  maxBatchSize: number;
  batchingWindow: number;
  
  // Network condition detection
  autoDetectNetworkConditions: boolean;
  networkCheckInterval: number;
  
  // Request priority
  deprioritizeBackgroundRequests: boolean;
  
  // Performance metrics
  collectMetrics: boolean;
  metricsReportingInterval: number;
  
  // Throttling
  maxRequestsPerMinute: number;
  
  // Offline support
  offlineModeEnabled: boolean;
  preloadOfflineFallbackData: boolean;
  
  // Prefetching
  contentPrefetchingEnabled: boolean;
  prefetchThreshold: number;
  
  // Progressive loading
  progressiveLoadingEnabled: boolean;
  initialLoadTimeLimit: number;
}

// Type for performance metrics
interface PerformanceMetrics {
  apiCalls: number;
  cachedResponses: number;
  totalResponseTime: number;
  averageResponseTime: number;
  networkErrorCount: number;
  slowestEndpoint: string;
  slowestResponseTime: number;
  requestsPerEndpoint: Record<string, number>;
  cacheHitRate: number;
  offlineModeActivations: number;
}

// Type for cache statistics
interface CacheStats {
  totalSize: number;
  hitCount: number;
  missCount: number;
  entryCount: number;
  evictionCount: number;
}

// Type for queued request
interface QueuedRequest<T> {
  id: string;
  endpoint: string;
  params: Record<string, unknown>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
}

class PerformanceOptimization {
  private static instance: PerformanceOptimization;
  
  // Default settings
  private settings: PerformanceSettings = {
    // Cache settings
    cacheEnabled: true,
    cacheTTL: 60 * 60 * 1000, // 1 hour in milliseconds
    maxCacheItems: 100,
    prioritizeCacheForSlowConnections: true,
    
    // API call optimization
    batchingEnabled: true,
    maxBatchSize: 5,
    batchingWindow: 300, // 300ms window to batch requests
    
    // Network condition detection
    autoDetectNetworkConditions: true,
    networkCheckInterval: 60000, // Check network every minute
    
    // Request priority
    deprioritizeBackgroundRequests: true,
    
    // Performance metrics
    collectMetrics: true,
    metricsReportingInterval: 60 * 5 * 1000, // 5 minutes
    
    // Throttling
    maxRequestsPerMinute: 60,
    
    // Offline support
    offlineModeEnabled: true,
    preloadOfflineFallbackData: true,
    
    // Prefetching
    contentPrefetchingEnabled: true,
    prefetchThreshold: 0.8, // Prefetch when 80% likely to be needed
    
    // Progressive loading
    progressiveLoadingEnabled: true,
    initialLoadTimeLimit: 300, // 300ms for initial load
  };
  
  // Performance metrics
  private metrics: PerformanceMetrics = {
    apiCalls: 0,
    cachedResponses: 0,
    totalResponseTime: 0,
    averageResponseTime: 0,
    networkErrorCount: 0,
    slowestEndpoint: '',
    slowestResponseTime: 0,
    requestsPerEndpoint: {},
    cacheHitRate: 0,
    offlineModeActivations: 0,
  };
  
  // Cache stats
  private cacheStats: CacheStats = {
    totalSize: 0,
    hitCount: 0,
    missCount: 0,
    entryCount: 0,
    evictionCount: 0,
  };
  
  // Network condition
  private networkCondition: 'fast' | 'slow' | 'offline' = 'fast';
  
  // Request queue for batching
  private requestQueue: Array<QueuedRequest<unknown>> = [];
  
  // Queue processing timeout
  private queueProcessingTimeout: ReturnType<typeof setTimeout> | null = null;
  
  private constructor() {
    this.initializeNetworkDetection();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): PerformanceOptimization {
    if (!PerformanceOptimization.instance) {
      PerformanceOptimization.instance = new PerformanceOptimization();
    }
    return PerformanceOptimization.instance;
  }
  
  /**
   * Initialize network condition detection
   */
  private initializeNetworkDetection(): void {
    if (this.settings.autoDetectNetworkConditions) {
      this.checkNetworkCondition();
      
      // Set up interval for continued checks
      setInterval(() => this.checkNetworkCondition(), this.settings.networkCheckInterval);
      
      // Also listen for online/offline events
      window.addEventListener('online', () => {
        this.networkCondition = 'fast';
        this.processQueuedRequests();
      });
      
      window.addEventListener('offline', () => {
        this.networkCondition = 'offline';
        this.metrics.offlineModeActivations++;
      });
    }
  }
  
  /**
   * Check the current network condition
   */
  private async checkNetworkCondition(): Promise<void> {
    // If already offline according to browser, no need to check
    if (!navigator.onLine) {
      this.networkCondition = 'offline';
      return;
    }
    
    try {
      // Perform a small request to check network speed
      const start = performance.now();
      const response = await fetch('https://www.googleapis.com/dns/v1/managedZones', {
        method: 'HEAD',
        cache: 'no-store',
      });
      const end = performance.now();
      
      if (!response.ok) {
        this.networkCondition = 'offline';
        return;
      }
      
      const responseTime = end - start;
      
      // Define thresholds for network conditions
      if (responseTime < 500) {
        this.networkCondition = 'fast';
      } else {
        this.networkCondition = 'slow';
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // Error making the request means we're probably offline
      this.networkCondition = 'offline';
    }
  }
  
  /**
   * Get current network condition
   */
  public getNetworkCondition(): 'fast' | 'slow' | 'offline' {
    return this.networkCondition;
  }
  
  /**
   * Check if API calls should be optimized based on network conditions
   */
  public shouldOptimizeApiCalls(): boolean {
    return this.networkCondition === 'slow' || this.networkCondition === 'offline';
  }
  
  /**
   * Record API call performance
   */
  public recordApiCall(endpoint: string, responseTime: number, success: boolean): void {
    if (!this.settings.collectMetrics) return;
    
    this.metrics.apiCalls++;
    this.metrics.totalResponseTime += responseTime;
    this.metrics.averageResponseTime = this.metrics.totalResponseTime / this.metrics.apiCalls;
    
    // Track requests per endpoint
    this.metrics.requestsPerEndpoint[endpoint] = (this.metrics.requestsPerEndpoint[endpoint] || 0) + 1;
    
    // Track slowest endpoint
    if (responseTime > this.metrics.slowestResponseTime) {
      this.metrics.slowestResponseTime = responseTime;
      this.metrics.slowestEndpoint = endpoint;
    }
    
    // Track network errors
    if (!success) {
      this.metrics.networkErrorCount++;
    }
  }
  
  /**
   * Record cache usage
   */
  public recordCacheHit(hit: boolean): void {
    if (hit) {
      this.cacheStats.hitCount++;
      this.metrics.cachedResponses++;
    } else {
      this.cacheStats.missCount++;
    }
    
    // Calculate cache hit rate
    const totalAccesses = this.cacheStats.hitCount + this.cacheStats.missCount;
    this.cacheStats.entryCount++;
    this.metrics.cacheHitRate = totalAccesses > 0 ? this.cacheStats.hitCount / totalAccesses : 0;
  }
  
  /**
   * Get current performance metrics
   */
  public getPerformanceMetrics(): Record<string, unknown> {
    return {
      ...this.metrics,
      cacheStats: { ...this.cacheStats },
      timestamp: new Date().toISOString(),
    };
  }
  
  /**
   * Get settings for a specific service
   */
  public getSettingsForService(serviceName: string): PerformanceSettings {
    // Service-specific optimizations could be defined here
    switch (serviceName) {
      case 'ContentTagger':
        return {
          ...this.settings,
          cacheTTL: 24 * 60 * 60 * 1000, // 24 hours for content tags
          maxCacheItems: 500, // More cache for content tags
        };
      case 'PersonalizedGreeting':
        return {
          ...this.settings,
          cacheTTL: 60 * 60 * 1000, // 1 hour for greetings
          prefetchThreshold: 0.9, // Higher threshold for greetings
        };
      case 'MoodRecommender':
        return {
          ...this.settings,
          cacheTTL: 2 * 60 * 60 * 1000, // 2 hours for mood recommendations
          contentPrefetchingEnabled: true,
        };
      case 'DescriptionGenerator':
        return {
          ...this.settings,
          cacheTTL: 7 * 24 * 60 * 60 * 1000, // 7 days for descriptions
          maxCacheItems: 200, // More cache for descriptions
        };
      default:
        return this.settings;
    }
  }
  
  /**
   * Update settings
   */
  public updateSettings(newSettings: Partial<PerformanceSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }
  
  /**
   * Determine if content should be prefetched
   */
  public shouldPrefetch(likelihood: number): boolean {
    return this.settings.contentPrefetchingEnabled && 
           likelihood >= this.settings.prefetchThreshold && 
           this.networkCondition === 'fast';
  }
  
  /**
   * Queue an API request for potential batching
   */
  public queueRequest<T>(
    endpoint: string, 
    params: Record<string, unknown>, 
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Don't batch high priority requests if that setting is enabled
      if (priority === 'high' && this.settings.deprioritizeBackgroundRequests) {
        // Just execute high priority immediately
        this.executeRequest(endpoint)
          .then(result => resolve(result as T))
          .catch(reject);
        return;
      }
      
      // Add to queue
      const requestId = `${endpoint}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      this.requestQueue.push({
        id: requestId,
        endpoint,
        params,
        resolve: resolve as (value: unknown) => void,
        reject,
        priority,
        timestamp: Date.now()
      });
      
      // Schedule processing if not already scheduled
      if (!this.queueProcessingTimeout && this.settings.batchingEnabled) {
        this.queueProcessingTimeout = setTimeout(() => {
          this.processQueuedRequests();
        }, this.settings.batchingWindow);
      }
    });
  }
  
  /**
   * Process queued requests, potentially batching them
   */
  private async processQueuedRequests(): Promise<void> {
    if (this.requestQueue.length === 0) {
      this.queueProcessingTimeout = null;
      return;
    }
    
    // Clear the timeout
    if (this.queueProcessingTimeout) {
      clearTimeout(this.queueProcessingTimeout);
      this.queueProcessingTimeout = null;
    }
    
    // Sort by priority and timestamp
    this.requestQueue.sort((a, b) => {
      const priorityOrder = { 'high': 0, 'normal': 1, 'low': 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return priorityDiff === 0 ? a.timestamp - b.timestamp : priorityDiff;
    });
    
    // Process requests in batches
    const batchSize = this.settings.maxBatchSize;
    
    // Take up to batchSize requests
    const batch = this.requestQueue.splice(0, batchSize);
    
    // Group by endpoint
    const endpointGroups: Record<string, typeof batch> = {};
    batch.forEach(request => {
      if (!endpointGroups[request.endpoint]) {
        endpointGroups[request.endpoint] = [];
      }
      endpointGroups[request.endpoint].push(request);
    });
    
    // Process each endpoint group
    for (const endpoint in endpointGroups) {
      const requests = endpointGroups[endpoint];
      
      if (requests.length === 1) {
        // Single request, no need to batch
        const request = requests[0];
        try {
          const result = await this.executeRequest(request.endpoint);
          request.resolve(result);
        } catch (error) {
          request.reject(error);
        }
      } else {
        // Batch request
        try {
          // For now, just execute requests sequentially
          // In a real system, you'd use a batch API endpoint
          for (const request of requests) {
            const result = await this.executeRequest(request.endpoint);
            request.resolve(result);
          }
        } catch (error) {
          // Fail all requests in the batch
          requests.forEach(request => request.reject(error));
        }
      }
    }
    
    // Schedule next batch if there are more requests
    if (this.requestQueue.length > 0) {
      this.queueProcessingTimeout = setTimeout(() => {
        this.processQueuedRequests();
      }, this.settings.batchingWindow);
    }
  }
  
  /**
   * Execute a single API request
   */
  private async executeRequest(endpoint: string): Promise<unknown> {
    // This is a placeholder - in a real app, you'd implement the actual API call
    // For now, just simulating a response
    const start = performance.now();
    
    // Artificial delay to simulate network
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const success = Math.random() > 0.1; // 10% chance of failure for simulation
    const end = performance.now();
    
    // Record metrics
    this.recordApiCall(endpoint, end - start, success);
    
    if (!success) {
      throw new Error(`Failed to call ${endpoint}`);
    }
    
    return { success: true, data: `Response from ${endpoint}` };
  }
  
  /**
   * Reset metrics
   */
  public resetMetrics(): void {
    this.metrics = {
      apiCalls: 0,
      cachedResponses: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      networkErrorCount: 0,
      slowestEndpoint: '',
      slowestResponseTime: 0,
      requestsPerEndpoint: {},
      cacheHitRate: 0,
      offlineModeActivations: 0,
    };
    
    this.cacheStats = {
      totalSize: 0,
      hitCount: 0,
      missCount: 0,
      entryCount: 0,
      evictionCount: 0,
    };
  }
}

export default PerformanceOptimization; 