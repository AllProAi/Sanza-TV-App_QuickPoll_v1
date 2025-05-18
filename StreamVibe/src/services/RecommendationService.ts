import type { ContentItem } from '../types/Content';
import type { 
  RecommendationRequest, 
  RecommendationResponse, 
  ContentRecommendation,
  AIPrompt,
  SurpriseRecommendationOptions
} from '../types/Recommendation';
import OpenAIService from './OpenAIService';
import ContentService from './ContentService';
import PreferencesService from './PreferencesService';

// UUID generation function
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Service for generating AI-powered content recommendations
 */
class RecommendationService {
  private static instance: RecommendationService;
  private openaiService: OpenAIService;
  private contentService: ContentService;
  private preferencesService: PreferencesService;
  private surpriseHistory: Set<string> = new Set();
  private localStorageKey = 'streamvibe_surprise_history';

  private constructor() {
    this.openaiService = OpenAIService.getInstance();
    this.contentService = ContentService.getInstance();
    this.preferencesService = PreferencesService.getInstance();
    this.loadSurpriseHistory();
  }

  /**
   * Get singleton instance of RecommendationService
   */
  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  /**
   * Generate recommendations based on request parameters
   */
  public async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    const requestId = generateUUID();
    
    try {
      // Get all content to match with recommendations
      const allContent = await this.contentService.getAllContent();
      
      let recommendations: ContentRecommendation[] = [];
      let source: 'ai' | 'fallback' | 'hybrid' = 'ai';
      
      // Check if OpenAI API is available
      if (this.openaiService.hasApiKey()) {
        // Generate prompt based on request type
        const prompt = await this.generatePrompt(request);
        
        // Call OpenAI API
        const response = await this.openaiService.generateChatCompletion(
          [
            { role: 'system', content: prompt.systemPrompt },
            { role: 'user', content: prompt.userPrompt }
          ],
          {
            temperature: 0.7,
            max_tokens: 1000,
            cacheKey: `recommendation_${request.contextType}_${request.contextValue || 'general'}_${request.profileId}`
          }
        );
        
        // Parse AI response
        recommendations = this.parseAIResponse(response, allContent);
      }
      
      // If AI failed or returned no recommendations, use fallback
      if (recommendations.length === 0) {
        recommendations = await this.generateFallbackRecommendations(request);
        source = this.openaiService.hasApiKey() ? 'hybrid' : 'fallback';
      }
      
      // Limit results if specified
      if (request.limit && request.limit > 0) {
        recommendations = recommendations.slice(0, request.limit);
      }
      
      return {
        recommendations,
        requestId,
        timestamp: new Date().toISOString(),
        source
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      
      // Return fallback recommendations on error
      const fallbackRecommendations = await this.generateFallbackRecommendations(request);
      
      return {
        recommendations: fallbackRecommendations,
        requestId,
        timestamp: new Date().toISOString(),
        source: 'fallback'
      };
    }
  }

  /**
   * Generate surprise recommendations
   */
  public async getSurpriseRecommendations(
    options: SurpriseRecommendationOptions = {}
  ): Promise<RecommendationResponse> {
    const surpriseRequest: RecommendationRequest = {
      userId: this.preferencesService.getUser()?.id || '',
      profileId: this.preferencesService.getActiveProfile()?.id || '',
      contextType: 'surprise',
      contextValue: options.mood || undefined,
      limit: 5,
      includeReasoning: true
    };
    
    // Get random selection of content excluding watch history
    const allContent = await this.contentService.getAllContent();
    const profile = this.preferencesService.getActiveProfile();
    
    // Filter out content already in surprise history
    let availableContent = allContent.filter(content => 
      !this.surpriseHistory.has(content.id)
    );
    
    // Filter out watch history if requested
    if (options.excludeWatchHistory && profile) {
      const watchedIds = new Set(profile.recentlyWatched.map(item => item.contentId));
      availableContent = availableContent.filter(content => !watchedIds.has(content.id));
    }
    
    // Use AI for mood-based or genre-blending recommendations if available
    if ((options.moodBased || options.genreBlending) && this.openaiService.hasApiKey()) {
      return this.getRecommendations(surpriseRequest);
    } else {
      // Fallback to random selection with novelty scoring
      const recommendations = this.generateSurpriseRecommendations(
        availableContent, 
        options.noveltyLevel || 5
      );
      
      // Update surprise history
      recommendations.forEach(rec => {
        this.surpriseHistory.add(rec.contentId);
      });
      this.saveSurpriseHistory();
      
      return {
        recommendations,
        requestId: generateUUID(),
        timestamp: new Date().toISOString(),
        source: 'fallback'
      };
    }
  }

  /**
   * Generate surprise recommendations without AI
   */
  private generateSurpriseRecommendations(
    availableContent: ContentItem[], 
    noveltyLevel: number
  ): ContentRecommendation[] {
    const profile = this.preferencesService.getActiveProfile();
    
    if (!profile || availableContent.length === 0) {
      return [];
    }
    
    // Get preferred genres
    const favoriteGenres = new Set(
      profile.favoriteContentIds
        .map(id => availableContent.find(c => c.id === id)?.genres || [])
        .flat()
    );
    
    // Score content for surprise factor
    const scoredContent = availableContent.map(content => {
      // Base score starts at random
      let score = Math.random() * 30; // 0-30 random base
      
      // Add points for matching some preferred genres (slight familiarity)
      const genreOverlap = content.genres.filter(g => favoriteGenres.has(g)).length;
      if (genreOverlap > 0) {
        score += 10 + (5 * genreOverlap);
      }
      
      // Add points based on release year (novelty based on recency)
      const currentYear = new Date().getFullYear();
      const yearDiff = currentYear - content.releaseYear;
      if (yearDiff < 2) {
        score += 20; // Very recent content
      } else if (yearDiff < 5) {
        score += 10; // Recent content
      }
      
      // Add novelty factor based on how different it is from favorites
      const unusualGenres = content.genres.filter(g => !favoriteGenres.has(g)).length;
      score += unusualGenres * noveltyLevel * 2;
      
      return {
        contentId: content.id,
        score: Math.min(Math.round(score), 100),
        reasoning: `A surprising ${content.type} that you might enjoy for something different.`,
        category: 'Surprise'
      };
    });
    
    // Sort by score and take top 5
    return scoredContent
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  /**
   * Generate appropriate prompts based on request type
   */
  private async generatePrompt(request: RecommendationRequest): Promise<AIPrompt> {
    // Get user preference data
    const preferenceData = await this.preferencesService.getUserPreferenceData(request.profileId);
    
    // Get all content
    const allContent = await this.contentService.getAllContent();
    
    // Build the system prompt
    const systemPrompt = `You are an expert content recommendation AI for a streaming platform called StreamVibe. 
Your task is to recommend content based on user preferences and context.

Content Library Information:
${this.formatContentForPrompt(allContent)}

User Profile Information:
${JSON.stringify(preferenceData, null, 2)}

Your recommendations should:
1. Only include content IDs from the content library provided
2. Provide a relevance score from 0-100 for each recommendation
3. Include a brief explanation for why you're recommending each item
4. Return results in JSON format as an array of recommendations`;

    // Build the user prompt based on request type
    let userPrompt = 'Recommend content for me based on my profile.';
    
    switch (request.contextType) {
      case 'general':
        userPrompt = 'Recommend content that matches my preferences.';
        break;
      case 'genre':
        userPrompt = `Recommend content in the "${request.contextValue}" genre that matches my preferences.`;
        break;
      case 'content': {
        const contentItem = allContent.find(item => item.id === request.contextValue);
        if (contentItem) {
          userPrompt = `Recommend content similar to "${contentItem.title}" (ID: ${contentItem.id}) that I might enjoy.`;
        }
        break;
      }
      case 'mood':
        userPrompt = `I'm in a ${request.contextValue} mood. Recommend content that would suit this mood based on my preferences.`;
        break;
      case 'surprise':
        userPrompt = `Surprise me with content recommendations that are different from what I usually watch, but that I might still enjoy. Include content that broadens my horizons while still being somewhat accessible to me.`;
        break;
    }
    
    userPrompt += `\n\nPlease return your response as a JSON array of objects with this format:
[
  {
    "contentId": "id-of-content",
    "score": 95,
    "reasoning": "Brief explanation of why this was recommended",
    "category": "Optional category label"
  }
]`;

    return { systemPrompt, userPrompt };
  }

  /**
   * Format content library for inclusion in the prompt
   */
  private formatContentForPrompt(content: ContentItem[]): string {
    // Create a compact representation of the content library
    return `Content Library (${content.length} items):\n` + 
      content.map(item => {
        return `- ID: ${item.id}, Title: "${item.title}", Type: ${item.type}, Year: ${item.releaseYear}, Genres: [${item.genres.join(', ')}]`;
      }).join('\n');
  }

  /**
   * Parse the response from the AI into recommendations
   */
  private parseAIResponse(response: string, allContent: ContentItem[]): ContentRecommendation[] {
    try {
      // Try to extract JSON from the response (in case AI added additional text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : response;
      
      // Parse the JSON
      const recommendations = JSON.parse(jsonString);
      
      // Validate and clean the recommendations
      return recommendations
        .filter((rec: ContentRecommendation) => {
          // Verify that the contentId exists in our content library
          return rec.contentId && allContent.some(item => item.id === rec.contentId);
        })
        .map((rec: ContentRecommendation) => ({
          contentId: rec.contentId,
          score: typeof rec.score === 'string' ? Math.min(Math.max(0, parseInt(rec.score) || 50), 100) : rec.score,
          reasoning: rec.reasoning || 'Recommended based on your preferences',
          category: rec.category,
          tags: rec.tags || []
        }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }
  }

  /**
   * Generate fallback recommendations when AI is unavailable
   */
  private async generateFallbackRecommendations(request: RecommendationRequest): Promise<ContentRecommendation[]> {
    // Get all content
    const allContent = await this.contentService.getAllContent();
    
    // Get user profile
    const profile = request.profileId
      ? this.preferencesService.getActiveProfile()
      : this.preferencesService.getActiveProfile();
    
    if (!profile) {
      return this.getRandomRecommendations(allContent, 5);
    }
    
    // Get favorite genre counts
    const genreCounts: Record<string, number> = {};
    
    // Process favorites
    profile.favoriteContentIds.forEach(favoriteId => {
      const contentItem = allContent.find(item => item.id === favoriteId);
      if (contentItem) {
        contentItem.genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 2;
        });
      }
    });
    
    // Process watch history
    profile.recentlyWatched.forEach(item => {
      const contentItem = allContent.find(c => c.id === item.contentId);
      if (contentItem) {
        contentItem.genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });

    // Filter content based on request type
    let filteredContent = [...allContent];
    
    switch (request.contextType) {
      case 'genre':
        filteredContent = allContent.filter(item => 
          item.genres.includes(request.contextValue || '')
        );
        break;
      case 'content': {
        const sourceContent = allContent.find(item => item.id === request.contextValue);
        if (sourceContent) {
          filteredContent = allContent.filter(item => 
            item.id !== sourceContent.id && // Exclude the source content
            item.genres.some(genre => sourceContent.genres.includes(genre))
          );
        }
        break;
      }
    }
    
    // Remove already watched/favorited content
    const excludeIds = new Set([
      ...profile.favoriteContentIds,
      ...profile.recentlyWatched.map(item => item.contentId)
    ]);
    
    filteredContent = filteredContent.filter(item => !excludeIds.has(item.id));
    
    // If we don't have enough content after filtering, add some random recommendations
    if (filteredContent.length < 5) {
      return this.getRandomRecommendations(allContent, 5);
    }
    
    // Score content based on genre preferences
    const scoredContent = filteredContent.map(content => {
      let score = 50; // Base score
      
      // Add points for matching preferred genres
      content.genres.forEach(genre => {
        if (genreCounts[genre]) {
          score += genreCounts[genre] * 5;
        }
      });
      
      // Add some randomness
      score += Math.floor(Math.random() * 20);
      
      // Cap at 100
      score = Math.min(score, 100);
      
      return {
        contentId: content.id,
        score,
        reasoning: `Recommended based on your interest in ${content.genres.join(', ')}`,
        category: request.contextType === 'genre' ? request.contextValue : undefined
      };
    });
    
    // Sort by score and limit
    return scoredContent
      .sort((a, b) => b.score - a.score)
      .slice(0, request.limit || 10);
  }

  /**
   * Get random recommendations as a last resort
   */
  private getRandomRecommendations(content: ContentItem[], count: number): ContentRecommendation[] {
    // Shuffle content
    const shuffled = [...content].sort(() => Math.random() - 0.5);
    
    // Take the first `count` items
    return shuffled.slice(0, count).map(item => ({
      contentId: item.id,
      score: 50 + Math.floor(Math.random() * 30), // Random score between 50-80
      reasoning: `A ${item.type} that might interest you`,
      category: 'For You'
    }));
  }

  /**
   * Load surprise history from localStorage
   */
  private loadSurpriseHistory(): void {
    try {
      const history = localStorage.getItem(this.localStorageKey);
      if (history) {
        const historyArray = JSON.parse(history) as string[];
        this.surpriseHistory = new Set(historyArray);
      }
    } catch (error) {
      console.error('Error loading surprise history:', error);
      this.surpriseHistory = new Set();
    }
  }

  /**
   * Save surprise history to localStorage
   */
  private saveSurpriseHistory(): void {
    try {
      // Only keep the 50 most recent items
      const historyArray = Array.from(this.surpriseHistory).slice(-50);
      localStorage.setItem(this.localStorageKey, JSON.stringify(historyArray));
    } catch (error) {
      console.error('Error saving surprise history:', error);
    }
  }

  /**
   * Clear surprise history
   */
  public clearSurpriseHistory(): void {
    this.surpriseHistory.clear();
    localStorage.removeItem(this.localStorageKey);
  }
}

export default RecommendationService; 