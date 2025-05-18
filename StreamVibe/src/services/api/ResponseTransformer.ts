import type { ContentItem, Category, SeriesContent } from '../../types/Content';

// Define additional types to replace 'any'
interface ContentRecord {
  [key: string]: unknown;
}

interface ContentWithPopularity extends ContentItem {
  popularity?: number;
}

interface ContentWithReleaseDate extends ContentItem {
  releaseDate?: string;
}

interface ContentWithRecommendationScore extends ContentItem {
  recommendationScore?: string;
}

/**
 * Metadata enrichment options
 */
interface EnrichmentOptions {
  addPopularity?: boolean;
  addReleaseDate?: boolean;
  addRecommendationScore?: boolean;
}

/**
 * Rating source data
 */
interface ExternalRating {
  source: string;
  score: number;
  maxScore: number;
  url?: string;
}

/**
 * Response Transformer for API data normalization
 */
export class ResponseTransformer {
  private static instance: ResponseTransformer;

  private constructor() {}

  /**
   * Get singleton instance of ResponseTransformer
   */
  public static getInstance(): ResponseTransformer {
    if (!ResponseTransformer.instance) {
      ResponseTransformer.instance = new ResponseTransformer();
    }
    return ResponseTransformer.instance;
  }

  /**
   * Normalize a single content item
   */
  public normalizeContentItem(item: ContentItem | ContentRecord): ContentItem {
    // If it's already the right type, just return it
    if (this.isValidContentItem(item)) {
      return item;
    }

    // Otherwise, try to normalize it
    const base: ContentItem = {
      id: this.extractString(item, 'id') || `content-${Date.now()}`,
      title: this.extractString(item, 'title') || 'Unknown Title',
      description: this.extractString(item, 'description') || 'No description available',
      posterImage: this.extractString(item, 'posterImage', 'poster', 'image', 'poster_path') || 'https://picsum.photos/300/450',
      backdropImage: this.extractString(item, 'backdropImage', 'backdrop', 'backdrop_path') || 'https://picsum.photos/1920/1080',
      releaseYear: this.extractNumber(item, 'releaseYear', 'year', 'release_date'),
      ageRating: this.extractString(item, 'ageRating', 'rating', 'content_rating') || 'PG',
      duration: this.extractNumber(item, 'duration', 'runtime', 'length'),
      genres: this.extractArray(item, 'genres', 'genre'),
      tags: this.extractArray(item, 'tags', 'keywords'),
      type: this.determineContentType(item),
      trailerUrl: this.extractString(item, 'trailerUrl', 'trailer'),
      streamUrl: this.extractString(item, 'streamUrl', 'stream')
    };

    // Handle series-specific fields if this is a series
    if (base.type === 'series' && 'seasons' in item) {
      const seriesItem = base as SeriesContent;
      seriesItem.seasons = this.normalizeSeasons(item.seasons as ContentRecord[]);
      return seriesItem;
    }

    return base;
  }

  /**
   * Normalize an array of content items
   */
  public normalizeContentList(items: Array<ContentItem | ContentRecord>): ContentItem[] {
    return items.map(item => this.normalizeContentItem(item));
  }

  /**
   * Normalize categories
   */
  public normalizeCategories(categories: Array<Category | ContentRecord>): Category[] {
    return categories.map(category => ({
      id: this.extractString(category as unknown as ContentRecord, 'id') || `category-${Date.now()}`,
      name: this.extractString(category as unknown as ContentRecord, 'name', 'title') || 'Unknown Category',
      description: this.extractString(category as unknown as ContentRecord, 'description', 'overview'),
      contentIds: this.extractArray(category as unknown as ContentRecord, 'contentIds', 'content', 'items')
    }));
  }

  /**
   * Enrich content items with additional metadata
   */
  public enrichContent(
    content: ContentItem, 
    options: EnrichmentOptions = {}
  ): ContentItem | ContentWithPopularity | ContentWithReleaseDate | ContentWithRecommendationScore {
    const enriched = { ...content };
    
    // Add popularity score if requested (random for demo)
    if (options.addPopularity) {
      (enriched as ContentWithPopularity).popularity = Math.floor(Math.random() * 100);
    }
    
    // Add detailed release date if requested
    if (options.addReleaseDate) {
      const year = content.releaseYear || new Date().getFullYear();
      const month = Math.floor(Math.random() * 12);
      const day = Math.floor(Math.random() * 28) + 1;
      (enriched as ContentWithReleaseDate).releaseDate = new Date(year, month, day).toISOString();
    }
    
    // Add recommendation score if requested
    if (options.addRecommendationScore) {
      (enriched as ContentWithRecommendationScore).recommendationScore = (Math.random() * 5).toFixed(1);
    }
    
    return enriched;
  }

  /**
   * Add external ratings to content item
   */
  public addExternalRatings(content: ContentItem): ContentItem & { ratings: ExternalRating[] } {
    // Generate mock ratings for demo
    const ratings: ExternalRating[] = [
      {
        source: 'IMDb',
        score: 7 + Math.random() * 3,
        maxScore: 10,
        url: `https://www.imdb.com/title/placeholder`
      },
      {
        source: 'Rotten Tomatoes',
        score: 60 + Math.floor(Math.random() * 40),
        maxScore: 100,
        url: `https://www.rottentomatoes.com/m/placeholder`
      },
      {
        source: 'Metacritic',
        score: 60 + Math.floor(Math.random() * 40),
        maxScore: 100,
        url: `https://www.metacritic.com/movie/placeholder`
      }
    ];
    
    return {
      ...content,
      ratings
    };
  }

  /**
   * Filter content items by a search query
   */
  public filterBySearch(content: ContentItem[], query: string): ContentItem[] {
    if (!query) return content;
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return content.filter(item => {
      return (
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery) ||
        item.genres.some(genre => genre.toLowerCase().includes(normalizedQuery)) ||
        item.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
      );
    });
  }

  /**
   * Sort content items by a field
   */
  public sortContent(
    content: ContentItem[], 
    field: string, 
    ascending: boolean = true
  ): ContentItem[] {
    const sortedContent = [...content];
    
    sortedContent.sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;
      let contentA: unknown;
      let contentB: unknown;
      
      // Extract the field values with fallbacks
      switch (field) {
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case 'releaseYear':
          valueA = a.releaseYear || 0;
          valueB = b.releaseYear || 0;
          break;
        case 'duration':
          valueA = a.duration || 0;
          valueB = b.duration || 0;
          break;
        case 'popularity':
          valueA = (a as ContentWithPopularity).popularity || 0;
          valueB = (b as ContentWithPopularity).popularity || 0;
          break;
        default:
          // Try to access the property dynamically
          contentA = a as unknown;
          contentB = b as unknown;
          valueA = ((contentA as ContentRecord)[field] as string | number) || '';
          valueB = ((contentB as ContentRecord)[field] as string | number) || '';
      }
      
      // Perform comparison based on type
      if (typeof valueA === 'string') {
        const result = valueA.localeCompare(valueB as string);
        return ascending ? result : -result;
      } else {
        const result = valueA - (valueB as number);
        return ascending ? result : -result;
      }
    });
    
    return sortedContent;
  }

  /**
   * Group content items by a field
   */
  public groupByField(content: ContentItem[], field: string): Record<string, ContentItem[]> {
    const groups: Record<string, ContentItem[]> = {};
    
    for (const item of content) {
      let value: string;
      let contentItem: unknown;
      let fieldValue: unknown;
      
      // Extract field value
      switch (field) {
        case 'releaseYear':
          value = (item.releaseYear || 0).toString();
          break;
        case 'genre':
          // Handle special case for genres (array)
          for (const genre of item.genres) {
            if (!groups[genre]) {
              groups[genre] = [];
            }
            groups[genre].push(item);
          }
          continue; // Skip the rest of the loop for genre
        case 'type':
          value = item.type;
          break;
        default:
          // Try to access the property dynamically
          contentItem = item as unknown;
          fieldValue = (contentItem as ContentRecord)[field];
          value = fieldValue ? String(fieldValue) : 'unknown';
      }
      
      // Add to group
      if (!groups[value]) {
        groups[value] = [];
      }
      groups[value].push(item);
    }
    
    return groups;
  }

  /**
   * Normalize seasons data for series content
   */
  private normalizeSeasons(seasons: ContentRecord[]): SeriesContent['seasons'] {
    if (!Array.isArray(seasons) || seasons.length === 0) {
      return [];
    }
    
    return seasons.map((season, index) => ({
      id: this.extractString(season, 'id') || `season-${index + 1}`,
      seasonNumber: this.extractNumber(season, 'seasonNumber', 'season_number', 'number') || index + 1,
      title: this.extractString(season, 'title', 'name') || `Season ${index + 1}`,
      description: this.extractString(season, 'description', 'overview', 'summary') || '',
      episodes: this.normalizeEpisodes(
        Array.isArray(season.episodes) ? season.episodes as ContentRecord[] : []
      )
    }));
  }

  /**
   * Normalize episodes data for series content
   */
  private normalizeEpisodes(episodes: ContentRecord[]): SeriesContent['seasons'][0]['episodes'] {
    if (!Array.isArray(episodes) || episodes.length === 0) {
      return [];
    }
    
    return episodes.map((episode, index) => ({
      id: this.extractString(episode, 'id') || `episode-${index + 1}`,
      episodeNumber: this.extractNumber(episode, 'episodeNumber', 'episode_number', 'number') || index + 1,
      title: this.extractString(episode, 'title', 'name') || `Episode ${index + 1}`,
      description: this.extractString(episode, 'description', 'overview', 'summary') || '',
      duration: this.extractNumber(episode, 'duration', 'runtime', 'length') || 30,
      streamUrl: this.extractString(episode, 'streamUrl', 'stream') || '',
      thumbnailImage: this.extractString(episode, 'thumbnailImage', 'thumbnail', 'image') || 'https://picsum.photos/300/169'
    }));
  }

  /**
   * Extract a string from an object with fallback keys
   */
  private extractString(obj: ContentRecord, ...keys: string[]): string | undefined {
    if (!obj) return undefined;
    
    for (const key of keys) {
      const value = obj[key];
      if (typeof value === 'string' && value.trim() !== '') {
        return value;
      }
      // Handle nested objects with dot notation (e.g., "metadata.title")
      if (key.includes('.')) {
        const [parentKey, childKey] = key.split('.', 2);
        const parent = obj[parentKey];
        if (parent && typeof parent === 'object' && childKey in (parent as ContentRecord)) {
          const childValue = (parent as ContentRecord)[childKey];
          if (typeof childValue === 'string' && childValue.trim() !== '') {
            return childValue;
          }
        }
      }
    }
    
    return undefined;
  }

  /**
   * Extract a number from an object with fallback keys
   */
  private extractNumber(obj: ContentRecord, ...keys: string[]): number {
    if (!obj) return 0;
    
    for (const key of keys) {
      const value = obj[key];
      
      if (typeof value === 'number') {
        return value;
      }
      
      if (typeof value === 'string') {
        // Try to extract a year from a date string (e.g., "2023-01-01")
        if (key.includes('date') && value.match(/^\d{4}-\d{2}-\d{2}/)) {
          const year = parseInt(value.substring(0, 4), 10);
          if (!isNaN(year)) {
            return year;
          }
        }
        
        // Try to parse the string as a number
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
      
      // Handle nested objects with dot notation
      if (key.includes('.')) {
        const [parentKey, childKey] = key.split('.', 2);
        const parent = obj[parentKey];
        if (parent && typeof parent === 'object' && childKey in (parent as ContentRecord)) {
          const childValue = (parent as ContentRecord)[childKey];
          if (typeof childValue === 'number') {
            return childValue;
          }
          if (typeof childValue === 'string') {
            const parsed = parseFloat(childValue);
            if (!isNaN(parsed)) {
              return parsed;
            }
          }
        }
      }
    }
    
    return 0;
  }

  /**
   * Extract an array from an object with fallback keys
   */
  private extractArray(obj: ContentRecord, ...keys: string[]): string[] {
    if (!obj) return [];
    
    for (const key of keys) {
      const value = obj[key];
      
      if (Array.isArray(value)) {
        // Handle array of strings
        if (value.every(item => typeof item === 'string')) {
          return value as string[];
        }
        
        // Handle array of objects with a name property
        if (value.every(item => typeof item === 'object' && item !== null)) {
          return value
            .map(item => {
              const record = item as ContentRecord;
              const name = record.name || record.title || record.value;
              return typeof name === 'string' ? name : undefined;
            })
            .filter((name): name is string => typeof name === 'string');
        }
      }
      
      // Handle comma-separated string
      if (typeof value === 'string') {
        return value.split(',').map(item => item.trim()).filter(item => item !== '');
      }
    }
    
    return [];
  }

  /**
   * Determine the content type based on available properties
   */
  private determineContentType(item: ContentRecord): ContentItem['type'] {
    // Check for explicit type
    const type = this.extractString(item, 'type', 'content_type');
    if (type) {
      if (type.includes('movie')) return 'movie';
      if (type.includes('series') || type.includes('tv')) return 'series';
      if (type.includes('documentary')) return 'documentary';
      if (type.includes('live')) return 'live';
    }
    
    // Check for type-specific properties
    if ('seasons' in item || 'episodes' in item) {
      return 'series';
    }
    
    if ('isLive' in item || (typeof item.live === 'boolean' && item.live)) {
      return 'live';
    }
    
    const category = this.extractString(item, 'category', 'categories', 'genre', 'genres');
    if (category) {
      const lowerCategory = category.toLowerCase();
      if (lowerCategory.includes('documentary') || lowerCategory.includes('documental')) {
        return 'documentary';
      }
    }
    
    // Default to movie
    return 'movie';
  }

  /**
   * Check if an item is a valid ContentItem
   */
  private isValidContentItem(item: unknown): item is ContentItem {
    if (!item || typeof item !== 'object') return false;
    
    const requiredProps = ['id', 'title', 'description', 'type'];
    
    for (const prop of requiredProps) {
      if (!(prop in (item as ContentRecord))) {
        return false;
      }
    }
    
    return true;
  }
} 