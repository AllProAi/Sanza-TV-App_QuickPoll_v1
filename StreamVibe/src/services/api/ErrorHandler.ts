import type { APIResponse } from './ContentAPI';

/**
 * Error response structure
 */
interface ErrorDetail {
  code: string;
  message: string;
  field?: string;
  suggestion?: string;
  timestamp: number;
}

interface ErrorWithStatus {
  status: number;
  message?: string;
}

/**
 * Log level options
 */
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * API Error Handler for consistent error processing
 */
export class APIErrorHandler {
  private static instance: APIErrorHandler;
  private retryableStatusCodes: number[] = [408, 429, 500, 502, 503, 504];
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // Base delay in ms
  private errorHistory: Map<string, ErrorDetail[]>;
  private maxHistoryPerType: number = 10;
  private logLevel: LogLevel = 'error';
  
  private constructor() {
    this.errorHistory = new Map();
  }

  /**
   * Get singleton instance of APIErrorHandler
   */
  public static getInstance(): APIErrorHandler {
    if (!APIErrorHandler.instance) {
      APIErrorHandler.instance = new APIErrorHandler();
    }
    return APIErrorHandler.instance;
  }

  /**
   * Handle any API error and convert to an APIResponse
   */
  public handleError<T>(error: unknown, context?: string): APIResponse<T> {
    // Default error response
    const response: APIResponse<T> = {
      data: null,
      error: 'An unexpected error occurred',
      status: 500,
      timestamp: Date.now()
    };
    
    // Extract error details based on error type
    if (error instanceof Error) {
      response.error = error.message;
      
      // Check for network errors
      if (
        'NetworkError' === error.name ||
        error.message.includes('network') ||
        error.message.includes('Network request failed')
      ) {
        response.error = 'Network connection issue. Please check your internet connection.';
        response.status = 0; // Network error status code
      }
      
      // Check for timeout errors
      if (
        error.message.includes('timeout') ||
        error.message.includes('Timeout')
      ) {
        response.error = 'Request timed out. Please try again later.';
        response.status = 408; // Request Timeout
      }
    }
    
    // If we have an HTTP status code in the error
    if (typeof (error as ErrorWithStatus).status === 'number') {
      response.status = (error as ErrorWithStatus).status;
      
      // Map status code to friendly message
      response.error = this.getErrorMessageForStatus(response.status);
    }
    
    // Log the error
    this.logError(response.error || 'Unknown error', context || 'API Request', error);
    
    // Store in error history
    this.addToErrorHistory(response.error || 'Unknown error', response.status.toString());
    
    return response;
  }

  /**
   * Check if an error should trigger a retry
   */
  public isRetryable(status: number): boolean {
    return this.retryableStatusCodes.includes(status);
  }

  /**
   * Get exponential backoff delay for retries
   */
  public getRetryDelay(attempt: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = this.retryDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
    return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
  }

  /**
   * Retry a function with exponential backoff
   */
  public async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = this.maxRetries
  ): Promise<T> {
    let lastError: unknown;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Check if we should retry
        const status = typeof (error as ErrorWithStatus).status === 'number' 
          ? (error as ErrorWithStatus).status
          : 500;
        
        if (attempt < maxRetries && this.isRetryable(status)) {
          const delay = this.getRetryDelay(attempt);
          this.log('info', `Retrying request (${attempt + 1}/${maxRetries}) after ${delay}ms delay...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Get a user-friendly error message for HTTP status code
   */
  public getErrorMessageForStatus(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'You need to be logged in to access this content.';
      case 403:
        return 'You do not have permission to access this content.';
      case 404:
        return 'The requested content could not be found.';
      case 408:
        return 'Request timed out. Please try again later.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Our team has been notified and is working on a fix.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      case 0:
        return 'Network connection error. Please check your internet connection.';
      default:
        return `Error ${status}. Please try again later.`;
    }
  }

  /**
   * Get fallback content for specific content types
   */
  public getFallbackContent<T>(contentType: string): T | null {
    // This would be expanded in a real app with more fallback types
    switch (contentType) {
      case 'categories':
        return [
          {
            id: 'fallback-category',
            name: 'Popular Content',
            description: 'Popular content available offline',
            contentIds: []
          }
        ] as unknown as T;
      
      case 'content':
        return [] as unknown as T;
      
      default:
        return null;
    }
  }

  /**
   * Add an error to the history
   */
  private addToErrorHistory(message: string, code: string): void {
    if (!this.errorHistory.has(code)) {
      this.errorHistory.set(code, []);
    }
    
    const errors = this.errorHistory.get(code) as ErrorDetail[];
    
    // Add the new error
    errors.push({
      code,
      message,
      timestamp: Date.now()
    });
    
    // Limit the history size
    if (errors.length > this.maxHistoryPerType) {
      errors.shift(); // Remove oldest
    }
  }

  /**
   * Get error history for a specific error code
   */
  public getErrorHistory(code?: string): ErrorDetail[] {
    if (code && this.errorHistory.has(code)) {
      return [...(this.errorHistory.get(code) as ErrorDetail[])];
    }
    
    // Return all errors if no code specified
    if (!code) {
      const allErrors: ErrorDetail[] = [];
      for (const errors of this.errorHistory.values()) {
        allErrors.push(...errors);
      }
      return allErrors.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    return [];
  }

  /**
   * Clear error history
   */
  public clearErrorHistory(code?: string): void {
    if (code) {
      this.errorHistory.delete(code);
    } else {
      this.errorHistory.clear();
    }
  }

  /**
   * Set the log level
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Log an error with context
   */
  private logError(message: string, context: string, error?: unknown): void {
    this.log('error', `[${context}] ${message}`, error);
  }

  /**
   * Log a message with the specified level
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    const logLevels: Record<LogLevel, number> = {
      error: 3,
      warn: 2,
      info: 1,
      debug: 0
    };
    
    // Only log if the level is high enough
    if (logLevels[level] >= logLevels[this.logLevel]) {
      switch (level) {
        case 'error':
          console.error(message, data || '');
          break;
        case 'warn':
          console.warn(message, data || '');
          break;
        case 'info':
          console.info(message, data || '');
          break;
        case 'debug':
          console.debug(message, data || '');
          break;
      }
    }
  }

  /**
   * Set the maximum number of retries
   */
  public setMaxRetries(retries: number): void {
    this.maxRetries = retries;
  }

  /**
   * Set which status codes should be considered retryable
   */
  public setRetryableStatusCodes(codes: number[]): void {
    this.retryableStatusCodes = codes;
  }

  /**
   * Set the base retry delay
   */
  public setRetryDelay(delayMs: number): void {
    this.retryDelay = delayMs;
  }
} 