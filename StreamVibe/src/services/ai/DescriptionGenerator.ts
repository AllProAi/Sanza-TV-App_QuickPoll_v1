/**
 * AI-powered description generator service
 * Creates enhanced content descriptions based on context and user preferences
 */

import OpenAIService from '../OpenAIService';
import ContentService from '../ContentService';
import PreferencesService from '../PreferencesService';
import type { ContentItem } from '../../types/Content';

export interface DescriptionOptions {
  length?: 'short' | 'medium' | 'long';
  tone?: 'neutral' | 'enthusiastic' | 'critical' | 'humorous';
  emphasizeGenres?: string[];
  highlightFeatures?: boolean;
  personalize?: boolean;
  includeContext?: boolean;
}

export interface GeneratedDescription {
  contentId: string;
  originalDescription: string;
  enhancedDescription: string;
  options: DescriptionOptions;
  generatedTimestamp: string;
  expiryTimestamp: string;
  source: 'ai' | 'template';
}

class DescriptionGenerator {
  private static instance: DescriptionGenerator;
  private openAIService: OpenAIService;
  private contentService: ContentService;
  private preferencesService: PreferencesService;
  private descriptionCache: Map<string, GeneratedDescription> = new Map();
  private readonly CACHE_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  private constructor() {
    this.openAIService = OpenAIService.getInstance();
    this.contentService = ContentService.getInstance();
    this.preferencesService = PreferencesService.getInstance();
    this.loadDescriptionsFromStorage();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DescriptionGenerator {
    if (!DescriptionGenerator.instance) {
      DescriptionGenerator.instance = new DescriptionGenerator();
    }
    return DescriptionGenerator.instance;
  }

  /**
   * Generate enhanced description for content
   */
  public async generateDescription(
    contentId: string,
    options: DescriptionOptions = {}
  ): Promise<GeneratedDescription> {
    try {
      const cacheKey = this.generateCacheKey(contentId, options);
      
      // Check cache first
      const cachedDescription = this.descriptionCache.get(cacheKey);
      if (cachedDescription && new Date(cachedDescription.expiryTimestamp) > new Date()) {
        return cachedDescription;
      }
      
      // Get content details
      const content = await this.contentService.getContentById(contentId);
      if (!content) {
        throw new Error(`Content with ID ${contentId} not found`);
      }
      
      let enhancedDescription: string;
      let source: 'ai' | 'template';
      
      // Try to use AI for generation
      if (this.openAIService.hasApiKey()) {
        try {
          enhancedDescription = await this.generateAIDescription(content, options);
          source = 'ai';
        } catch (error) {
          console.error('Error generating AI description:', error);
          // Fall back to template-based generation
          enhancedDescription = this.generateTemplateDescription(content, options);
          source = 'template';
        }
      } else {
        // Use template-based generation as fallback
        enhancedDescription = this.generateTemplateDescription(content, options);
        source = 'template';
      }
      
      const generatedDescription: GeneratedDescription = {
        contentId,
        originalDescription: content.description,
        enhancedDescription,
        options,
        generatedTimestamp: new Date().toISOString(),
        expiryTimestamp: new Date(Date.now() + this.CACHE_EXPIRY_TIME).toISOString(),
        source
      };
      
      // Cache the result
      this.descriptionCache.set(cacheKey, generatedDescription);
      this.saveDescriptionsToStorage();
      
      return generatedDescription;
    } catch (error) {
      console.error('Error in description generation:', error);
      // Return original description if everything fails
      const content = await this.contentService.getContentById(contentId);
      return {
        contentId,
        originalDescription: content?.description || '',
        enhancedDescription: content?.description || '',
        options,
        generatedTimestamp: new Date().toISOString(),
        expiryTimestamp: new Date(Date.now() + this.CACHE_EXPIRY_TIME).toISOString(),
        source: 'template'
      };
    }
  }

  /**
   * Generate AI-powered enhanced description
   */
  private async generateAIDescription(
    content: ContentItem,
    options: DescriptionOptions
  ): Promise<string> {
    // Default options
    const {
      length = 'medium',
      tone = 'neutral',
      emphasizeGenres = [],
      highlightFeatures = true,
      personalize = true,
      includeContext = true
    } = options;
    
    // Get user profile for personalization if needed
    let userPreferences = null;
    if (personalize) {
      const profile = this.preferencesService.getActiveProfile();
      if (profile) {
        userPreferences = await this.preferencesService.getUserPreferenceData(profile.id);
      }
    }
    
    // Create system prompt
    const systemPrompt = `
      You are an expert content writer for a streaming platform.
      Your task is to create an enhanced description for the content based on the provided details.
      
      Follow these guidelines:
      - Length: ${this.getLengthGuideline(length)}
      - Tone: ${this.getToneGuideline(tone)}
      ${emphasizeGenres.length > 0 ? `- Emphasize these genres: ${emphasizeGenres.join(', ')}` : ''}
      ${highlightFeatures ? '- Highlight key features like notable actors, directors, or awards' : ''}
      ${includeContext ? '- Include relevant cultural or historical context if applicable' : ''}
      ${personalize && userPreferences ? '- Personalize based on user preferences provided' : ''}
      
      Do not:
      - Include any spoilers about the plot
      - Use phrases like "This description is about..." or "This is a..."
      - Add any rating elements unless explicitly provided
      - Include any formatting or HTML tags
      
      Write in an engaging, conversational style that would make someone want to watch this content.
      Return ONLY the description text without additional formatting or explanations.
    `;
    
    // Create user prompt with content details
    const contentDetails = {
      title: content.title,
      type: content.type,
      originalDescription: content.description,
      genres: content.genres,
      releaseYear: content.releaseYear,
      ageRating: content.ageRating,
      duration: content.duration,
      userPreferences: userPreferences ? {
        favoriteGenres: userPreferences.favoriteGenres,
        viewingPatterns: userPreferences.viewingPatterns,
      } : null
    };
    
    // Call OpenAI API
    const response = await this.openAIService.generateChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(contentDetails) }
      ],
      {
        temperature: 0.7,
        max_tokens: this.getMaxTokensByLength(length),
        cacheKey: `description_${content.id}_${length}_${tone}`
      }
    );
    
    return response.trim();
  }

  /**
   * Generate template-based description as fallback
   */
  private generateTemplateDescription(
    content: ContentItem,
    options: DescriptionOptions
  ): string {
    const { length = 'medium' } = options;
    
    // Start with original description
    let enhancedDescription = content.description;
    
    // Add genre information if not already present
    const genrePhrase = `This ${content.type} features ${content.genres.join(', ')} elements.`;
    if (!enhancedDescription.includes(content.genres[0])) {
      enhancedDescription += ` ${genrePhrase}`;
    }
    
    // Add year information if not already present
    if (!enhancedDescription.includes(content.releaseYear.toString())) {
      enhancedDescription += ` Released in ${content.releaseYear}.`;
    }
    
    // For longer descriptions, add more details
    if (length === 'long' || length === 'medium') {
      if (content.type === 'movie') {
        enhancedDescription += ` With a runtime of ${content.duration} minutes, this ${content.ageRating} rated film promises an engaging viewing experience.`;
      } else if (content.type === 'series') {
        enhancedDescription += ` This ${content.ageRating} rated series offers hours of captivating content across multiple episodes.`;
      }
    }
    
    return enhancedDescription;
  }

  /**
   * Get length guideline based on option
   */
  private getLengthGuideline(length: 'short' | 'medium' | 'long'): string {
    switch (length) {
      case 'short':
        return 'Keep it concise (1-2 sentences, around 25-40 words)';
      case 'long':
        return 'Provide a detailed description (4-6 sentences, around 100-150 words)';
      case 'medium':
      default:
        return 'Aim for a moderate length (2-4 sentences, around 50-80 words)';
    }
  }

  /**
   * Get tone guideline based on option
   */
  private getToneGuideline(tone: 'neutral' | 'enthusiastic' | 'critical' | 'humorous'): string {
    switch (tone) {
      case 'enthusiastic':
        return 'Write with enthusiasm and excitement about the content';
      case 'critical':
        return 'Provide a balanced perspective highlighting both strengths and potential weaknesses';
      case 'humorous':
        return 'Include light humor and a playful tone where appropriate';
      case 'neutral':
      default:
        return 'Maintain a balanced, informative tone';
    }
  }

  /**
   * Get max tokens based on description length
   */
  private getMaxTokensByLength(length: 'short' | 'medium' | 'long'): number {
    switch (length) {
      case 'short':
        return 100;
      case 'long':
        return 300;
      case 'medium':
      default:
        return 200;
    }
  }

  /**
   * Generate cache key based on content ID and options
   */
  private generateCacheKey(contentId: string, options: DescriptionOptions): string {
    const optionsStr = JSON.stringify(options);
    return `description_${contentId}_${optionsStr}`;
  }

  /**
   * Load descriptions from localStorage
   */
  private loadDescriptionsFromStorage(): void {
    try {
      const storedDescriptions = localStorage.getItem('streamvibe_enhanced_descriptions');
      if (storedDescriptions) {
        const parsedDescriptions: Record<string, GeneratedDescription> = JSON.parse(storedDescriptions);
        
        // Only load non-expired descriptions
        const now = new Date();
        Object.entries(parsedDescriptions).forEach(([key, description]) => {
          if (new Date(description.expiryTimestamp) > now) {
            this.descriptionCache.set(key, description);
          }
        });
        
        console.log(`Loaded ${this.descriptionCache.size} cached descriptions`);
      }
    } catch (error) {
      console.error('Error loading descriptions from storage:', error);
    }
  }

  /**
   * Save descriptions to localStorage
   */
  private saveDescriptionsToStorage(): void {
    try {
      const descriptionsObject: Record<string, GeneratedDescription> = {};
      this.descriptionCache.forEach((value, key) => {
        descriptionsObject[key] = value;
      });
      localStorage.setItem('streamvibe_enhanced_descriptions', JSON.stringify(descriptionsObject));
    } catch (error) {
      console.error('Error saving descriptions to storage:', error);
    }
  }

  /**
   * Clear description cache
   */
  public clearCache(): void {
    this.descriptionCache.clear();
    localStorage.removeItem('streamvibe_enhanced_descriptions');
  }
  
  /**
   * Remove expired entries from cache
   */
  public cleanupExpiredEntries(): void {
    const now = new Date();
    const expiredKeys: string[] = [];
    
    this.descriptionCache.forEach((description, key) => {
      if (new Date(description.expiryTimestamp) <= now) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => {
      this.descriptionCache.delete(key);
    });
    
    if (expiredKeys.length > 0) {
      this.saveDescriptionsToStorage();
      console.log(`Removed ${expiredKeys.length} expired descriptions from cache`);
    }
  }
}

export default DescriptionGenerator; 