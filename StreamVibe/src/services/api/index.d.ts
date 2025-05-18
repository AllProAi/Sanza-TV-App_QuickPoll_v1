// Type declarations for API modules
declare module './CacheService' {
  export interface CacheStatistics {
    totalEntries: number;
    totalSize: number;
    oldestEntry: number;
    newestEntry: number;
    hitCount: number;
    missCount: number;
    hitRate: number;
  }

  export class APICacheService {
    static getInstance(): APICacheService;
    get<T>(key: string): T | null;
    set<T>(key: string, data: T, expiryTime?: number): void;
    has(key: string): boolean;
    remove(key: string): void;
    clear(): void;
    clearByPrefix(prefix: string): void;
    getStatistics(): CacheStatistics;
    setDefaultExpiryTime(milliseconds: number): void;
    setMaxCacheSize(bytes: number): void;
    setPersistenceEnabled(enabled: boolean): void;
  }
}

declare module './ErrorHandler' {
  import type { APIResponse } from './ContentAPI';
  
  export interface ErrorDetail {
    code: string;
    message: string;
    field?: string;
    suggestion?: string;
    timestamp: number;
  }

  export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
  
  export class APIErrorHandler {
    static getInstance(): APIErrorHandler;
    handleError<T>(error: unknown, context?: string): APIResponse<T>;
    isRetryable(status: number): boolean;
    getRetryDelay(attempt: number): number;
    retryWithBackoff<T>(fn: () => Promise<T>, maxRetries?: number): Promise<T>;
    getErrorMessageForStatus(status: number): string;
    getFallbackContent<T>(contentType: string): T | null;
    getErrorHistory(code?: string): ErrorDetail[];
    clearErrorHistory(code?: string): void;
    setLogLevel(level: LogLevel): void;
    setMaxRetries(retries: number): void;
    setRetryableStatusCodes(codes: number[]): void;
    setRetryDelay(delayMs: number): void;
  }
}

declare module './ResponseTransformer' {
  import type { ContentItem, Category } from '../../types/Content';
  
  export interface ExternalRating {
    source: string;
    score: number;
    maxScore: number;
    url?: string;
  }

  export interface EnrichmentOptions {
    addPopularity?: boolean;
    addReleaseDate?: boolean;
    addRecommendationScore?: boolean;
  }
  
  export class ResponseTransformer {
    static getInstance(): ResponseTransformer;
    normalizeContentItem(item: ContentItem | Record<string, unknown>): ContentItem;
    normalizeContentList(items: Array<ContentItem | Record<string, unknown>>): ContentItem[];
    normalizeCategories(categories: Array<Category | Record<string, unknown>>): Category[];
    enrichContent(content: ContentItem, options?: EnrichmentOptions): ContentItem;
    addExternalRatings(content: ContentItem): ContentItem & { ratings: ExternalRating[] };
    filterBySearch(content: ContentItem[], query: string): ContentItem[];
    sortContent(content: ContentItem[], field: string, ascending?: boolean): ContentItem[];
    groupByField(content: ContentItem[], field: string): Record<string, ContentItem[]>;
  }
}

declare module './mockData' {
  import type { ContentItem, Category } from '../../types/Content';
  
  const mockData: {
    content: ContentItem[];
    categories: Category[];
  };
  
  export default mockData;
} 