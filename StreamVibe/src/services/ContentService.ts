import type { ContentItem, Category, SeriesContent, ContentFilter, ContentSortOption, WatchProgress } from '../types/Content';

// Define cache entry type for better type safety
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

/**
 * Service for fetching and managing content data
 */
class ContentService {
  private static instance: ContentService;
  private mockData: {
    content: ContentItem[];
    categories: Category[];
  };
  private cache: Map<string, CacheEntry> = new Map();
  private cacheExpiryTime = 1000 * 60 * 30; // 30 minutes

  private constructor() {
    this.mockData = {
      content: [],
      categories: []
    };
    this.initializeMockData();
  }

  /**
   * Get singleton instance of ContentService
   */
  public static getInstance(): ContentService {
    if (!ContentService.instance) {
      ContentService.instance = new ContentService();
    }
    return ContentService.instance;
  }

  /**
   * Initialize mock data for development
   */
  private initializeMockData(): void {
    // Generate mock content data
    const mockMovies = Array.from({ length: 20 }, (_, i) => this.createMockMovie(i));
    const mockSeries = Array.from({ length: 10 }, (_, i) => this.createMockSeries(i));
    const mockDocumentaries = Array.from({ length: 8 }, (_, i) => this.createMockDocumentary(i));
    const mockLive = Array.from({ length: 5 }, (_, i) => this.createMockLiveContent(i));
    
    this.mockData.content = [
      ...mockMovies,
      ...mockSeries,
      ...mockDocumentaries,
      ...mockLive
    ];

    // Generate mock categories
    this.mockData.categories = [
      {
        id: 'category-1',
        name: 'Trending Now',
        description: 'Popular content that everyone is watching',
        contentIds: this.getRandomContentIds(10)
      },
      {
        id: 'category-2',
        name: 'New Releases',
        description: 'The latest movies and shows',
        contentIds: this.getRandomContentIds(8)
      },
      {
        id: 'category-3',
        name: 'Action & Adventure',
        description: 'Exciting action-packed entertainment',
        contentIds: this.mockData.content
          .filter(item => item.genres.includes('Action') || item.genres.includes('Adventure'))
          .map(item => item.id)
      },
      {
        id: 'category-4',
        name: 'Documentaries',
        description: 'Real stories and fascinating facts',
        contentIds: this.mockData.content
          .filter(item => item.type === 'documentary')
          .map(item => item.id)
      },
      {
        id: 'category-5',
        name: 'Comedy',
        description: 'Laugh out loud with these comedies',
        contentIds: this.mockData.content
          .filter(item => item.genres.includes('Comedy'))
          .map(item => item.id)
      }
    ];
  }

  /**
   * Create a mock movie
   */
  private createMockMovie(index: number): ContentItem {
    const genres = this.getRandomGenres();
    return {
      id: `movie-${index}`,
      title: `Mock Movie ${index}`,
      description: `This is a mock movie description for Movie ${index}. It features exciting storylines and amazing performances.`,
      posterImage: `https://picsum.photos/seed/movie${index}/300/450`,
      backdropImage: `https://picsum.photos/seed/backdrop${index}/1920/1080`,
      releaseYear: 2020 + Math.floor(Math.random() * 4),
      ageRating: this.getRandomAgeRating(),
      duration: 90 + Math.floor(Math.random() * 60), // 90-150 minutes
      genres,
      tags: [...genres, 'new', index % 2 === 0 ? 'trending' : 'recommended'],
      type: 'movie',
      trailerUrl: 'https://example.com/trailers/mock-trailer.mp4',
      streamUrl: 'https://example.com/streams/mock-stream.m3u8'
    };
  }

  /**
   * Create a mock series
   */
  private createMockSeries(index: number): SeriesContent {
    const genres = this.getRandomGenres();
    const seasonsCount = 1 + Math.floor(Math.random() * 5); // 1-5 seasons
    
    return {
      id: `series-${index}`,
      title: `Mock Series ${index}`,
      description: `This is a mock series description for Series ${index}. Follow the characters through multiple exciting seasons.`,
      posterImage: `https://picsum.photos/seed/series${index}/300/450`,
      backdropImage: `https://picsum.photos/seed/seriesbd${index}/1920/1080`,
      releaseYear: 2018 + Math.floor(Math.random() * 6),
      ageRating: this.getRandomAgeRating(),
      duration: seasonsCount * 8 * 45, // Rough total duration
      genres,
      tags: [...genres, index % 3 === 0 ? 'trending' : 'popular'],
      type: 'series',
      trailerUrl: 'https://example.com/trailers/mock-series-trailer.mp4',
      seasons: Array.from({ length: seasonsCount }, (_, i) => ({
        id: `series-${index}-season-${i+1}`,
        seasonNumber: i + 1,
        title: `Season ${i + 1}`,
        episodes: this.createMockEpisodes(index, i + 1, 8 + Math.floor(Math.random() * 5)) // 8-12 episodes per season
      }))
    };
  }

  /**
   * Create mock episodes for a series
   */
  private createMockEpisodes(seriesIndex: number, seasonNumber: number, count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: `series-${seriesIndex}-s${seasonNumber}-e${i+1}`,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      description: `This is episode ${i + 1} of season ${seasonNumber} from Series ${seriesIndex}.`,
      duration: 40 + Math.floor(Math.random() * 20), // 40-60 minutes
      thumbnailImage: `https://picsum.photos/seed/ep${seriesIndex}${seasonNumber}${i}/400/225`,
      streamUrl: 'https://example.com/streams/mock-episode.m3u8'
    }));
  }

  /**
   * Create a mock documentary
   */
  private createMockDocumentary(index: number): ContentItem {
    const docGenres = ['Nature', 'History', 'Science', 'Biography', 'True Crime'];
    const genres = [
      'Documentary', 
      docGenres[Math.floor(Math.random() * docGenres.length)]
    ];
    
    return {
      id: `doc-${index}`,
      title: `Mock Documentary ${index}`,
      description: `An informative documentary about fascinating real-world topics. Learn about amazing facts and stories.`,
      posterImage: `https://picsum.photos/seed/doc${index}/300/450`,
      backdropImage: `https://picsum.photos/seed/docbd${index}/1920/1080`,
      releaseYear: 2019 + Math.floor(Math.random() * 5),
      ageRating: 'PG',
      duration: 60 + Math.floor(Math.random() * 60), // 60-120 minutes
      genres,
      tags: [...genres, 'educational', 'informative'],
      type: 'documentary',
      trailerUrl: 'https://example.com/trailers/mock-doc-trailer.mp4',
      streamUrl: 'https://example.com/streams/mock-doc-stream.m3u8'
    };
  }

  /**
   * Create mock live content
   */
  private createMockLiveContent(index: number): ContentItem {
    const liveTypes = ['Sports', 'News', 'Concert', 'Event', 'Award Show'];
    const liveType = liveTypes[Math.floor(Math.random() * liveTypes.length)];
    
    return {
      id: `live-${index}`,
      title: `Mock ${liveType} Stream ${index}`,
      description: `Watch this exciting live ${liveType.toLowerCase()} event as it happens!`,
      posterImage: `https://picsum.photos/seed/live${index}/300/450`,
      backdropImage: `https://picsum.photos/seed/livebd${index}/1920/1080`,
      releaseYear: new Date().getFullYear(),
      ageRating: 'TV-PG',
      duration: 120, // 2 hours (placeholder for live content)
      genres: [liveType],
      tags: ['live', 'streaming', liveType.toLowerCase()],
      type: 'live',
      streamUrl: 'https://example.com/streams/mock-live-stream.m3u8'
    };
  }

  /**
   * Get random genres for mock content
   */
  private getRandomGenres(): string[] {
    const allGenres = [
      'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
      'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
    ];
    
    const count = 1 + Math.floor(Math.random() * 3); // 1-3 genres
    const genres: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const genre = allGenres[Math.floor(Math.random() * allGenres.length)];
      if (!genres.includes(genre)) {
        genres.push(genre);
      }
    }
    
    return genres;
  }

  /**
   * Get random age rating
   */
  private getRandomAgeRating(): string {
    const ratings = ['G', 'PG', 'PG-13', 'R', 'TV-Y', 'TV-PG', 'TV-14', 'TV-MA'];
    return ratings[Math.floor(Math.random() * ratings.length)];
  }

  /**
   * Get random content IDs for mocking categories
   */
  private getRandomContentIds(count: number): string[] {
    const contentIds = [...this.mockData.content.map(item => item.id)];
    const result: string[] = [];
    
    for (let i = 0; i < Math.min(count, contentIds.length); i++) {
      const randomIndex = Math.floor(Math.random() * contentIds.length);
      const id = contentIds[randomIndex];
      result.push(id);
      contentIds.splice(randomIndex, 1); // Remove to avoid duplicates
    }
    
    return result;
  }

  /**
   * Get all content
   */
  public async getAllContent(): Promise<ContentItem[]> {
    const cacheKey = 'all-content';
    
    if (this.hasValidCache(cacheKey)) {
      const cachedData = this.getFromCache<ContentItem[]>(cacheKey);
      if (cachedData) return cachedData;
    }
    
    // Simulate API delay
    await this.delay(300);
    
    this.setCache(cacheKey, this.mockData.content);
    return [...this.mockData.content];
  }

  /**
   * Get content by ID
   */
  public async getContentById(id: string): Promise<ContentItem | null> {
    const cacheKey = `content-${id}`;
    
    if (this.hasValidCache(cacheKey)) {
      return this.getFromCache<ContentItem | null>(cacheKey);
    }
    
    await this.delay(200);
    const content = this.mockData.content.find(item => item.id === id) || null;
    this.setCache(cacheKey, content);
    return content;
  }

  /**
   * Get all categories
   */
  public async getCategories(): Promise<Category[]> {
    const cacheKey = 'all-categories';
    
    if (this.hasValidCache(cacheKey)) {
      const cachedData = this.getFromCache<Category[]>(cacheKey);
      if (cachedData) return cachedData;
    }
    
    await this.delay(200);
    this.setCache(cacheKey, this.mockData.categories);
    return this.mockData.categories;
  }

  /**
   * Get content items for a specific category
   */
  public async getCategoryContent(categoryId: string): Promise<ContentItem[]> {
    const cacheKey = `category-content-${categoryId}`;
    
    if (this.hasValidCache(cacheKey)) {
      const cachedData = this.getFromCache<ContentItem[]>(cacheKey);
      if (cachedData) return cachedData;
    }
    
    await this.delay(250);
    
    const category = this.mockData.categories.find(cat => cat.id === categoryId);
    if (!category) return [];
    
    const contentItems = category.contentIds
      .map(id => this.mockData.content.find(item => item.id === id))
      .filter(item => item !== undefined) as ContentItem[];
    
    this.setCache(cacheKey, contentItems);
    return contentItems;
  }

  /**
   * Search content based on query string
   */
  public async searchContent(query: string): Promise<ContentItem[]> {
    if (!query.trim()) return [];
    
    const cacheKey = `search-${query}`;
    
    if (this.hasValidCache(cacheKey)) {
      const cachedData = this.getFromCache<ContentItem[]>(cacheKey);
      if (cachedData) return cachedData;
    }
    
    await this.delay(400);
    
    const searchTerms = query.toLowerCase().split(' ');
    const results = this.mockData.content.filter(item => {
      const searchableText = `${item.title} ${item.description} ${item.genres.join(' ')} ${item.tags.join(' ')}`.toLowerCase();
      return searchTerms.some(term => searchableText.includes(term));
    });
    
    this.setCache(cacheKey, results);
    return results;
  }

  /**
   * Filter content based on criteria
   */
  public async filterContent(filter: ContentFilter): Promise<ContentItem[]> {
    const cacheKey = `filter-${JSON.stringify(filter)}`;
    
    if (this.hasValidCache(cacheKey)) {
      const cachedData = this.getFromCache<ContentItem[]>(cacheKey);
      if (cachedData) return cachedData;
    }
    
    await this.delay(350);
    
    let filtered = [...this.mockData.content];
    
    // Apply filters
    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      filtered = filtered.filter(item => types.includes(item.type));
    }
    
    if (filter.genres && filter.genres.length > 0) {
      filtered = filtered.filter(item => 
        filter.genres!.some(genre => item.genres.includes(genre))
      );
    }
    
    if (filter.ageRating && filter.ageRating.length > 0) {
      filtered = filtered.filter(item => 
        filter.ageRating!.includes(item.ageRating)
      );
    }
    
    if (filter.year) {
      if (Array.isArray(filter.year)) {
        const [minYear, maxYear] = filter.year;
        filtered = filtered.filter(item => 
          item.releaseYear >= minYear && item.releaseYear <= maxYear
        );
      } else {
        filtered = filtered.filter(item => item.releaseYear === filter.year);
      }
    }
    
    if (filter.duration) {
      const [minDuration, maxDuration] = filter.duration;
      filtered = filtered.filter(item => 
        item.duration >= minDuration && item.duration <= maxDuration
      );
    }
    
    if (filter.searchQuery) {
      const searchResults = await this.searchContent(filter.searchQuery);
      const searchIds = new Set(searchResults.map(item => item.id));
      filtered = filtered.filter(item => searchIds.has(item.id));
    }
    
    this.setCache(cacheKey, filtered);
    return filtered;
  }

  /**
   * Sort content based on criteria
   */
  public sortContent(content: ContentItem[], sortOption: ContentSortOption): ContentItem[] {
    const { field, direction } = sortOption;
    
    return [...content].sort((a, b) => {
      let comparison = 0;
      
      switch (field) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'releaseYear':
          comparison = a.releaseYear - b.releaseYear;
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        default:
          comparison = 0;
      }
      
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Save watch progress
   */
  public async saveWatchProgress(progress: WatchProgress): Promise<void> {
    // This would typically save to a backend API
    // For now, we just simulate a delay and log
    await this.delay(200);
    console.log('Saved watch progress:', progress);
    
    // Clear related caches
    this.clearCacheByPrefix(`content-${progress.contentId}`);
    this.clearCacheByPrefix('recently-watched');
  }

  /**
   * Get watch progress for content
   */
  public async getWatchProgress(contentId: string, episodeId?: string): Promise<WatchProgress | null> {
    const cacheKey = `progress-${contentId}${episodeId ? `-${episodeId}` : ''}`;
    
    if (this.hasValidCache(cacheKey)) {
      return this.getFromCache<WatchProgress | null>(cacheKey);
    }
    
    await this.delay(150);
    
    // Mock implementation - in a real app, this would fetch from localStorage or API
    // For demonstration, we return mock progress for some items
    const shouldHaveProgress = (parseInt(contentId.split('-')[1], 10) || 0) % 3 === 0;
    
    if (!shouldHaveProgress) return null;
    
    const progress: WatchProgress = {
      contentId,
      episodeId,
      position: Math.floor(Math.random() * 1800), // Random position up to 30 minutes
      duration: 3600, // 1 hour
      percentage: 0, // Will be calculated
      lastWatched: new Date().toISOString(),
      completed: false
    };
    
    // Calculate percentage
    progress.percentage = Math.round((progress.position / progress.duration) * 100);
    progress.completed = progress.percentage > 90;
    
    this.setCache(cacheKey, progress);
    return progress;
  }

  /**
   * Get recently watched content
   */
  public async getRecentlyWatched(limit: number = 10): Promise<ContentItem[]> {
    const cacheKey = `recently-watched-${limit}`;
    
    if (this.hasValidCache(cacheKey)) {
      const cachedData = this.getFromCache<ContentItem[]>(cacheKey);
      if (cachedData) return cachedData;
    }
    
    await this.delay(250);
    
    // Mock implementation - return random subset of content
    const recentlyWatched = this.getRandomContentIds(limit)
      .map(id => this.mockData.content.find(item => item.id === id))
      .filter(item => item !== undefined) as ContentItem[];
    
    this.setCache(cacheKey, recentlyWatched);
    return recentlyWatched;
  }

  /**
   * Utility to delay async operations (simulates network request)
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cache management methods
   */
  private setCache(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private hasValidCache(key: string): boolean {
    const cacheEntry = this.cache.get(key);
    if (!cacheEntry) return false;
    
    const { timestamp } = cacheEntry;
    return (Date.now() - timestamp) < this.cacheExpiryTime;
  }

  private getFromCache<T>(key: string): T | null {
    if (!this.hasValidCache(key)) return null;
    const cacheEntry = this.cache.get(key);
    return cacheEntry ? cacheEntry.data as T : null;
  }

  private clearCacheByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached data
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

export default ContentService; 