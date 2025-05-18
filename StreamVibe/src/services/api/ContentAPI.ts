import type { ContentItem, Category, SeriesContent, ContentFilter, WatchProgress } from '../../types/Content';
import { APICacheService } from './CacheService';
import { APIErrorHandler } from './ErrorHandler';
import { ResponseTransformer } from './ResponseTransformer';
import mockData from './mockData';

/**
 * Response structure for API calls
 */
export interface APIResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  timestamp: number;
}

/**
 * Content API service for handling content data requests
 * This is a mock implementation for the hackathon
 */
export class ContentAPI {
  private static instance: ContentAPI;
  private cacheService: APICacheService;
  private errorHandler: APIErrorHandler;
  private transformer: ResponseTransformer;
  private mockNetworkDelay: number = 300; // Simulate network delay in ms
  private mockFailureRate: number = 0.05; // 5% chance of simulated failure

  private constructor() {
    this.cacheService = APICacheService.getInstance();
    this.errorHandler = APIErrorHandler.getInstance();
    this.transformer = ResponseTransformer.getInstance();
  }

  /**
   * Get singleton instance of ContentAPI
   */
  public static getInstance(): ContentAPI {
    if (!ContentAPI.instance) {
      ContentAPI.instance = new ContentAPI();
    }
    return ContentAPI.instance;
  }

  /**
   * Fetch all content items
   */
  public async getAllContent(): Promise<APIResponse<ContentItem[]>> {
    const cacheKey = 'content:all';
    
    // Check cache first
    const cachedData = this.cacheService.get<ContentItem[]>(cacheKey);
    if (cachedData) {
      return {
        data: cachedData,
        error: null,
        status: 200,
        timestamp: Date.now()
      };
    }
    
    try {
      // Simulate API call
      await this.simulateNetworkRequest();
      
      // Transform data
      const transformedData = this.transformer.normalizeContentList(mockData.content);
      
      // Cache the result
      this.cacheService.set(cacheKey, transformedData);
      
      return {
        data: transformedData,
        error: null,
        status: 200,
        timestamp: Date.now()
      };
    } catch (error) {
      return this.errorHandler.handleError<ContentItem[]>(error);
    }
  }

  /**
   * Fetch a content item by ID
   */
  public async getContentById(id: string): Promise<APIResponse<ContentItem>> {
    const cacheKey = `content:${id}`;
    
    // Check cache first
    const cachedData = this.cacheService.get<ContentItem>(cacheKey);
    if (cachedData) {
      return {
        data: cachedData,
        error: null,
        status: 200,
        timestamp: Date.now()
      };
    }
    
    try {
      // Simulate API call
      await this.simulateNetworkRequest();
      
      // Find the content item
      const contentItem = mockData.content.find((item: ContentItem) => item.id === id);
      
      if (!contentItem) {
        return {
          data: null,
          error: 'Content not found',
          status: 404,
          timestamp: Date.now()
        };
      }
      
      // Transform data
      const transformedData = this.transformer.normalizeContentItem(contentItem);
      
      // Cache the result
      this.cacheService.set(cacheKey, transformedData);
      
      return {
        data: transformedData,
        error: null,
        status: 200,
        timestamp: Date.now()
      };
    } catch (error) {
      return this.errorHandler.handleError<ContentItem>(error);
    }
  }

  /**
   * Fetch all categories
   */
  public async getCategories(): Promise<APIResponse<Category[]>> {
    const cacheKey = 'categories:all';
    
    // Check cache first
    const cachedData = this.cacheService.get<Category[]>(cacheKey);
    if (cachedData) {
      return {
        data: cachedData,
        error: null,
        status: 200,
        timestamp: Date.now()
      };
    }
    
    try {
      // Simulate API call
      await this.simulateNetworkRequest();
      
      // Transform data
      const transformedData = this.transformer.normalizeCategories(mockData.categories);
      
      // Cache the result
      this.cacheService.set(cacheKey, transformedData);
      
      return {
        data: transformedData,
        error: null,
        status: 200,
        timestamp: Date.now()
      };
    } catch (error) {
      return this.errorHandler.handleError<Category[]>(error);
    }
  }

  /**
   * Fetch content for a specific category
   */
  public async getCategoryContent(categoryId: string): Promise<APIResponse<ContentItem[]>> {
    const cacheKey = `category:${categoryId}:content`;
    
    // Check cache first
    const cachedData = this.cacheService.get<ContentItem[]>(cacheKey);
    if (cachedData) {
      return {
        data: cachedData,
        error: null,
        status: 200,
        timestamp: Date.now()
      };
    }
    
    try {
      // Simulate API call
      await this.simulateNetworkRequest();
      
      // Find the category
      const category = mockData.categories.find((cat: Category) => cat.id === categoryId);
      
      if (!category) {
        return {
          data: null,
          error: 'Category not found',
          status: 404,
          timestamp: Date.now()
        };
      }
      
      // Get content items for the category
      const categoryContent = category.contentIds.map(
        (id: string) => mockData.content.find((item: ContentItem) => item.id === id)
      ).filter(Boolean) as ContentItem[];
      
      // Transform data
      const transformedData = this.transformer.normalizeContentList(categoryContent);
      
      // Cache the result
      this.cacheService.set(cacheKey, transformedData);
      
      return {
        data: transformedData,
        error: null,
        status: 200,
        timestamp: Date.now()
      };
    } catch (error) {
      return this.errorHandler.handleError<ContentItem[]>(error);
    }
  }

  /**
   * Search for content
   */
  public async searchContent(query: string): Promise<APIResponse<ContentItem[]>> {
    const cacheKey = `search:${query.toLowerCase()}`;
    
    // Check cache first
    const cachedData = this.cacheService.get<ContentItem[]>(cacheKey);
    if (cachedData) {
      return {
        data: cachedData,
        error: null,
        status: 200,
        timestamp: Date.now()
      };
    }
    
    try {
      // Simulate API call
      await this.simulateNetworkRequest();
      
      // Filter content based on search query
      const normalizedQuery = query.toLowerCase();
      
      const searchResults = mockData.content.filter((item: ContentItem) => {
        return (
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.description.toLowerCase().includes(normalizedQuery) ||
          item.genres.some((genre: string) => genre.toLowerCase().includes(normalizedQuery)) ||
          item.tags.some((tag: string) => tag.toLowerCase().includes(normalizedQuery))
        );
      });
      
      // Transform data
      const transformedData = this.transformer.normalizeContentList(searchResults);
      
      // Cache the result
      this.cacheService.set(cacheKey, transformedData);
      
      return {
        data: transformedData,
        error: null,
        status: 200,
        timestamp: Date.now()
      };
    } catch (error) {
      return this.errorHandler.handleError<ContentItem[]>(error);
    }
  }

  /**
   * Filter content based on criteria
   */
  public async filterContent(filter: ContentFilter): Promise<APIResponse<ContentItem[]>> {
    // Create a unique cache key based on filter properties
    const filterKey = JSON.stringify(filter);
    const cacheKey = `filter:${filterKey}`;
    
    // Check cache first
    const cachedData = this.cacheService.get<ContentItem[]>(cacheKey);
    if (cachedData) {
      return {
        data: cachedData,
        error: null,
        status: 200,
        timestamp: Date.now()
      };
    }
    
    try {
      // Simulate API call
      await this.simulateNetworkRequest();
      
      // Apply filters (this would be done server-side in a real API)
      let filteredContent = [...mockData.content];
      
      // Apply type filter
      if (filter.type) {
        const types = Array.isArray(filter.type) ? filter.type : [filter.type];
        filteredContent = filteredContent.filter(item => types.includes(item.type));
      }
      
      // Apply genre filter
      if (filter.genres && filter.genres.length > 0) {
        filteredContent = filteredContent.filter(item => 
          filter.genres!.some(genre => item.genres.includes(genre))
        );
      }
      
      // Apply year filter
      if (filter.year) {
        if (Array.isArray(filter.year)) {
          const [minYear, maxYear] = filter.year;
          filteredContent = filteredContent.filter(
            item => item.releaseYear >= minYear && item.releaseYear <= maxYear
          );
        } else {
          filteredContent = filteredContent.filter(item => item.releaseYear === filter.year);
        }
      }
      
      // Apply age rating filter
      if (filter.ageRating && filter.ageRating.length > 0) {
        filteredContent = filteredContent.filter(item => 
          filter.ageRating!.includes(item.ageRating)
        );
      }
      
      // Apply duration filter
      if (filter.duration) {
        const [minDuration, maxDuration] = filter.duration;
        filteredContent = filteredContent.filter(
          item => item.duration >= minDuration && item.duration <= maxDuration
        );
      }
      
      // Apply search query if provided
      if (filter.searchQuery) {
        const normalizedQuery = filter.searchQuery.toLowerCase();
        filteredContent = filteredContent.filter(item => 
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.description.toLowerCase().includes(normalizedQuery)
        );
      }
      
      // Transform data
      const transformedData = this.transformer.normalizeContentList(filteredContent);
      
      // Cache the result
      this.cacheService.set(cacheKey, transformedData);
      
      return {
        data: transformedData,
        error: null,
        status: 200,
        timestamp: Date.now()
      };
    } catch (error) {
      return this.errorHandler.handleError<ContentItem[]>(error);
    }
  }

  /**
   * Save watch progress
   */
  public async saveWatchProgress(progress: WatchProgress): Promise<APIResponse<boolean>> {
    try {
      // Simulate API call
      await this.simulateNetworkRequest();
      
      // In a real app, this would send data to the server
      console.log('Saving watch progress:', progress);
      
      // Simulate successful save
      return {
        data: true,
        error: null,
        status: 200,
        timestamp: Date.now()
      };
    } catch (error) {
      return this.errorHandler.handleError<boolean>(error);
    }
  }

  /**
   * Get watch progress
   */
  public async getWatchProgress(contentId: string, episodeId?: string): Promise<APIResponse<WatchProgress>> {
    const cacheKey = `progress:${contentId}${episodeId ? `:${episodeId}` : ''}`;
    
    // Check cache first
    const cachedData = this.cacheService.get<WatchProgress>(cacheKey);
    if (cachedData) {
      return {
        data: cachedData,
        error: null,
        status: 200,
        timestamp: Date.now()
      };
    }
    
    try {
      // Simulate API call
      await this.simulateNetworkRequest();
      
      // In a real app, this would fetch from the server
      // For mock purposes, we'll create a random progress
      
      // Find the content item to get its duration
      const contentItem = mockData.content.find((item: ContentItem) => item.id === contentId);
      if (!contentItem) {
        return {
          data: null,
          error: 'Content not found',
          status: 404,
          timestamp: Date.now()
        };
      }
      
      let duration = contentItem.duration * 60; // Convert minutes to seconds
      
      // For episodes, use episode duration if found
      if (episodeId && contentItem.type === 'series') {
        const series = contentItem as SeriesContent;
        for (const season of series.seasons) {
          const episode = season.episodes.find(ep => ep.id === episodeId);
          if (episode) {
            duration = episode.duration * 60; // Convert minutes to seconds
            break;
          }
        }
      }
      
      // Create a random progress between 0 and duration
      // With a 20% chance of being unwatched (position 0)
      const unwatched = Math.random() < 0.2;
      const position = unwatched ? 0 : Math.floor(Math.random() * duration);
      const percentage = Math.floor((position / duration) * 100);
      const completed = percentage > 90; // Consider completed if over 90%
      
      const mockProgress: WatchProgress = {
        contentId,
        episodeId,
        position,
        duration,
        percentage,
        lastWatched: new Date().toISOString(),
        completed
      };
      
      // Cache the result
      this.cacheService.set(cacheKey, mockProgress);
      
      return {
        data: mockProgress,
        error: null,
        status: 200,
        timestamp: Date.now()
      };
    } catch (error) {
      return this.errorHandler.handleError<WatchProgress>(error);
    }
  }

  /**
   * Simulate a network request with potential failures
   */
  private async simulateNetworkRequest(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, this.mockNetworkDelay));
    
    // Simulate random failures
    if (Math.random() < this.mockFailureRate) {
      throw new Error('Network request failed');
    }
  }

  /**
   * Clear all API caches
   */
  public clearCache(): void {
    this.cacheService.clear();
  }
} 