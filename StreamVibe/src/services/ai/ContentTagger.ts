/**
 * AI-powered content tagging service
 * Provides automatic tag generation and content classification
 */

import OpenAIService from '../OpenAIService';
import ContentService from '../ContentService';
import type { ContentItem } from '../../types/Content';

// Tag types
export type ContentTag = {
  id: string;
  name: string;
  type: 'genre' | 'theme' | 'mood' | 'feature' | 'attribute';
  confidence: number; // 0-1
};

// Tag response type 
export type TaggingResponse = {
  contentId: string;
  tags: ContentTag[];
  generatedTimestamp: string;
  success: boolean;
};

class ContentTagger {
  private static instance: ContentTagger;
  private openAIService: OpenAIService;
  private contentService: ContentService;
  private cache: Map<string, TaggingResponse> = new Map();
  private readonly CACHE_KEY_PREFIX = 'content_tags_';
  
  private constructor() {
    this.openAIService = OpenAIService.getInstance();
    this.contentService = ContentService.getInstance();
    this.loadTagsFromStorage();
  }

  /**
   * Get singleton instance of ContentTagger
   */
  public static getInstance(): ContentTagger {
    if (!ContentTagger.instance) {
      ContentTagger.instance = new ContentTagger();
    }
    return ContentTagger.instance;
  }

  /**
   * Generate tags for a specific content item
   */
  public async generateTags(contentId: string): Promise<TaggingResponse> {
    try {
      // Check cache first
      const cachedTags = this.cache.get(`${this.CACHE_KEY_PREFIX}${contentId}`);
      if (cachedTags) {
        return cachedTags;
      }

      // Get content details
      const content = await this.contentService.getContentById(contentId);
      if (!content) {
        throw new Error(`Content with id ${contentId} not found`);
      }

      // If OpenAI is not available, use fallback tags
      if (!this.openAIService.hasApiKey()) {
        return this.generateFallbackTags(content);
      }

      // Generate system prompt
      const systemPrompt = `
        You are an expert content analyst for a streaming platform. 
        Analyze the given content details and extract relevant tags in the following categories:
        1. Themes (e.g., 'redemption', 'coming of age', 'revenge')
        2. Mood (e.g., 'uplifting', 'tense', 'melancholic')
        3. Features (e.g., 'strong female lead', 'plot twists', 'ensemble cast')
        4. Attributes (e.g., 'award-winning', 'critically acclaimed', 'cult classic')
        
        Format your response as a JSON array of tag objects, where each object has:
        - name: The tag text
        - type: One of 'theme', 'mood', 'feature', or 'attribute'
        - confidence: A number between 0 and 1 representing your confidence in this tag

        Only include high-confidence tags that are directly supported by the content details.
        Return exactly JSON format without explanations or markdown.
      `;

      // Format content for AI
      const contentDetails = `
        Title: ${content.title}
        Description: ${content.description}
        Type: ${content.type}
        Genres: ${content.genres.join(', ')}
        Release Year: ${content.releaseYear}
        Age Rating: ${content.ageRating}
        Duration: ${content.duration} minutes
      `;

      // Call OpenAI API
      const response = await this.openAIService.generateChatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: contentDetails }
        ],
        {
          temperature: 0.7,
          max_tokens: 800,
          cacheKey: `tag_generation_${contentId}`
        }
      );

      // Parse the response
      const taggingResponse = this.parseAITaggingResponse(response, contentId);
      
      // Store in cache
      this.cache.set(`${this.CACHE_KEY_PREFIX}${contentId}`, taggingResponse);
      this.saveTagsToStorage();
      
      return taggingResponse;
    } catch (error) {
      console.error('Error generating tags:', error);
      // Return fallback on error
      const content = await this.contentService.getContentById(contentId);
      return content ? this.generateFallbackTags(content) : {
        contentId,
        tags: [],
        generatedTimestamp: new Date().toISOString(),
        success: false
      };
    }
  }

  /**
   * Find similarity between content items based on tags
   */
  public async findSimilarContent(contentId: string, limit: number = 5): Promise<ContentItem[]> {
    try {
      // Get tags for the content
      const taggingResponse = await this.generateTags(contentId);
      
      // If tagging failed, use basic similarity
      if (!taggingResponse.success || taggingResponse.tags.length === 0) {
        return this.findBasicSimilarContent(contentId, limit);
      }

      // Get all content
      const allContent = await this.contentService.getAllContent();
      const sourceContent = allContent.find(c => c.id === contentId);
      if (!sourceContent) {
        throw new Error(`Content with id ${contentId} not found`);
      }

      // Calculate similarity scores based on tags
      const scoredContent = await Promise.all(
        allContent
          .filter(c => c.id !== contentId) // Exclude the source content
          .map(async content => {
            const contentTags = await this.generateTags(content.id);
            const similarityScore = this.calculateTagSimilarity(
              taggingResponse.tags,
              contentTags.tags
            );
            
            return {
              content,
              score: similarityScore
            };
          })
      );

      // Sort by similarity score and return top matches
      return scoredContent
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.content);
    } catch (error) {
      console.error('Error finding similar content:', error);
      return this.findBasicSimilarContent(contentId, limit);
    }
  }

  /**
   * Parse AI response into structured tags
   */
  private parseAITaggingResponse(response: string, contentId: string): TaggingResponse {
    try {
      // Extract JSON from response (in case it includes explanation text)
      const jsonMatch = response.match(/\[\s*{.*}\s*\]/s);
      const jsonText = jsonMatch ? jsonMatch[0] : response;
      
      // Parse the JSON
      const rawTags = JSON.parse(jsonText);
      
      // Validate and format tags
      const validTags = rawTags
        .filter((tag: { name?: string; type?: string; confidence?: number }) => 
          tag.name && 
          typeof tag.name === 'string' && 
          tag.type && 
          ['theme', 'mood', 'feature', 'attribute'].includes(tag.type) &&
          typeof tag.confidence === 'number' &&
          tag.confidence >= 0 && 
          tag.confidence <= 1
        )
        .map((tag: { name: string; type: string; confidence: number }) => ({
          id: `${tag.type}_${tag.name.toLowerCase().replace(/\s+/g, '_')}`,
          name: tag.name,
          type: tag.type,
          confidence: tag.confidence
        }));
      
      return {
        contentId,
        tags: validTags,
        generatedTimestamp: new Date().toISOString(),
        success: true
      };
    } catch (error) {
      console.error('Error parsing AI tagging response:', error);
      return {
        contentId,
        tags: [],
        generatedTimestamp: new Date().toISOString(),
        success: false
      };
    }
  }

  /**
   * Generate fallback tags when AI is unavailable
   */
  private generateFallbackTags(content: ContentItem): TaggingResponse {
    const fallbackTags: ContentTag[] = [
      // Convert genres to theme tags
      ...content.genres.map(genre => ({
        id: `theme_${genre.toLowerCase().replace(/\s+/g, '_')}`,
        name: genre,
        type: 'theme' as const,
        confidence: 0.9
      })),
      
      // Add mood based on genre
      ...this.inferMoodFromGenres(content.genres),
      
      // Add attribute tags based on content metadata
      ...(content.releaseYear >= new Date().getFullYear() - 1 ? [{
        id: 'attribute_new_release',
        name: 'New Release',
        type: 'attribute' as const,
        confidence: 0.95
      }] : []),
      
      // Add feature tags based on content type
      ...(content.type === 'series' ? [{
        id: 'feature_multiple_seasons',
        name: 'Multiple Seasons',
        type: 'feature' as const,
        confidence: 0.8
      }] : [])
    ];
    
    return {
      contentId: content.id,
      tags: fallbackTags,
      generatedTimestamp: new Date().toISOString(),
      success: true
    };
  }

  /**
   * Infer mood tags from genres
   */
  private inferMoodFromGenres(genres: string[]): ContentTag[] {
    const moodMap: Record<string, string[]> = {
      'Action': ['exciting', 'intense'],
      'Comedy': ['humorous', 'lighthearted'],
      'Horror': ['scary', 'suspenseful'],
      'Drama': ['emotional', 'serious'],
      'Romance': ['romantic', 'heartwarming'],
      'Documentary': ['informative', 'thought-provoking'],
      'Thriller': ['suspenseful', 'tense'],
      'Sci-Fi': ['imaginative', 'futuristic']
    };
    
    const moodTags: ContentTag[] = [];
    
    genres.forEach(genre => {
      const moods = moodMap[genre] || [];
      moods.forEach(mood => {
        moodTags.push({
          id: `mood_${mood}`,
          name: mood.charAt(0).toUpperCase() + mood.slice(1),
          type: 'mood',
          confidence: 0.7
        });
      });
    });
    
    return moodTags;
  }
  
  /**
   * Calculate similarity score between two sets of tags
   */
  private calculateTagSimilarity(sourceTags: ContentTag[], targetTags: ContentTag[]): number {
    if (sourceTags.length === 0 || targetTags.length === 0) {
      return 0;
    }
    
    // Create maps for faster lookup
    const sourceTagMap = new Map(sourceTags.map(tag => [tag.id, tag]));
    const targetTagMap = new Map(targetTags.map(tag => [tag.id, tag]));
    
    // Find common tags
    let similarityScore = 0;
    
    // Check for exact matches
    sourceTagMap.forEach((sourceTag, tagId) => {
      if (targetTagMap.has(tagId)) {
        const targetTag = targetTagMap.get(tagId)!;
        // Score based on confidence of both tags
        similarityScore += sourceTag.confidence * targetTag.confidence;
      }
    });
    
    // Check for type matches (same type, different tag)
    const sourceTypeGroups: Record<string, ContentTag[]> = {};
    const targetTypeGroups: Record<string, ContentTag[]> = {};
    
    sourceTags.forEach(tag => {
      sourceTypeGroups[tag.type] = sourceTypeGroups[tag.type] || [];
      sourceTypeGroups[tag.type].push(tag);
    });
    
    targetTags.forEach(tag => {
      targetTypeGroups[tag.type] = targetTypeGroups[tag.type] || [];
      targetTypeGroups[tag.type].push(tag);
    });
    
    // Add partial score for having tags of the same type
    Object.keys(sourceTypeGroups).forEach(type => {
      if (targetTypeGroups[type]) {
        // Small bonus for having same types of tags
        similarityScore += 0.1 * Math.min(sourceTypeGroups[type].length, targetTypeGroups[type].length);
      }
    });
    
    return similarityScore;
  }
  
  /**
   * Find similar content using basic metadata when AI tagging fails
   */
  private async findBasicSimilarContent(contentId: string, limit: number): Promise<ContentItem[]> {
    const allContent = await this.contentService.getAllContent();
    const sourceContent = allContent.find(c => c.id === contentId);
    
    if (!sourceContent) {
      return [];
    }
    
    // Simple similarity based on genres and content type
    return allContent
      .filter(c => c.id !== contentId)
      .map(content => {
        let score = 0;
        
        // Same content type
        if (content.type === sourceContent.type) {
          score += 2;
        }
        
        // Matching genres
        const genreOverlap = content.genres.filter(g => 
          sourceContent.genres.includes(g)
        ).length;
        
        score += genreOverlap * 3;
        
        // Similar release year
        const yearDiff = Math.abs(content.releaseYear - sourceContent.releaseYear);
        if (yearDiff <= 5) {
          score += (5 - yearDiff) * 0.5;
        }
        
        return { content, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.content);
  }
  
  /**
   * Load tags from localStorage
   */
  private loadTagsFromStorage(): void {
    try {
      const storedTags = localStorage.getItem('streamvibe_content_tags');
      if (storedTags) {
        const parsedTags: Record<string, TaggingResponse> = JSON.parse(storedTags);
        Object.entries(parsedTags).forEach(([key, value]) => {
          this.cache.set(key, value);
        });
        console.log(`Loaded ${this.cache.size} cached content tags`);
      }
    } catch (error) {
      console.error('Error loading content tags from storage:', error);
    }
  }
  
  /**
   * Save tags to localStorage
   */
  private saveTagsToStorage(): void {
    try {
      const tagsObject: Record<string, TaggingResponse> = {};
      this.cache.forEach((value, key) => {
        tagsObject[key] = value;
      });
      localStorage.setItem('streamvibe_content_tags', JSON.stringify(tagsObject));
    } catch (error) {
      console.error('Error saving content tags to storage:', error);
    }
  }
  
  /**
   * Clear tags cache
   */
  public clearCache(): void {
    this.cache.clear();
    localStorage.removeItem('streamvibe_content_tags');
  }
}

export default ContentTagger; 