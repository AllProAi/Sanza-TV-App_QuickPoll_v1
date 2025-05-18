/**
 * Mood-based recommendation service
 * Provides content recommendations based on user's current mood
 */

import OpenAIService from '../OpenAIService';
import ContentService from '../ContentService';
import PreferencesService from '../PreferencesService';
import type { ContentItem } from '../../types/Content';

// Mood types and interfaces
export interface MoodCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
}

export interface MoodRecommendation {
  mood: string;
  contentItems: ContentItem[];
  reasoning: string;
  timestamp: string;
  source: 'ai' | 'template';
}

export interface MoodHistory {
  timestamp: string;
  mood: string;
  contentSelected?: string;
}

// Predefined mood categories for UI
export const MOOD_CATEGORIES: MoodCategory[] = [
  {
    id: 'happy',
    name: 'Happy',
    description: 'Uplifting content to match your positive mood',
    color: '#FFD700'
  },
  {
    id: 'relaxed',
    name: 'Relaxed',
    description: 'Calm and soothing content for when you want to unwind',
    color: '#90EE90'
  },
  {
    id: 'excited',
    name: 'Excited',
    description: 'High-energy content for when you\'re feeling adventurous',
    color: '#FF6347'
  },
  {
    id: 'thoughtful',
    name: 'Thoughtful',
    description: 'Thought-provoking content for contemplative moments',
    color: '#87CEEB'
  },
  {
    id: 'melancholy',
    name: 'Melancholy',
    description: 'Content that resonates with a reflective or wistful mood',
    color: '#9370DB'
  },
  {
    id: 'curious',
    name: 'Curious',
    description: 'Fascinating content for an inquisitive state of mind',
    color: '#FFA500'
  },
  {
    id: 'tired',
    name: 'Tired',
    description: 'Easy-to-watch content that doesn\'t require much focus',
    color: '#6495ED'
  },
  {
    id: 'bored',
    name: 'Bored',
    description: 'Engaging content to break the monotony',
    color: '#D3D3D3'
  }
];

class MoodRecommender {
  private static instance: MoodRecommender;
  private openAIService: OpenAIService;
  private contentService: ContentService;
  private preferencesService: PreferencesService;
  private moodCache: Map<string, MoodRecommendation> = new Map();
  private moodHistory: MoodHistory[] = [];
  private readonly CACHE_EXPIRY_TIME = 1000 * 60 * 60 * 2; // 2 hours
  private readonly HISTORY_STORAGE_KEY = 'streamvibe_mood_history';
  private readonly MAX_HISTORY_ITEMS = 20;
  
  private constructor() {
    this.openAIService = OpenAIService.getInstance();
    this.contentService = ContentService.getInstance();
    this.preferencesService = PreferencesService.getInstance();
    this.loadMoodHistory();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): MoodRecommender {
    if (!MoodRecommender.instance) {
      MoodRecommender.instance = new MoodRecommender();
    }
    return MoodRecommender.instance;
  }

  /**
   * Get recommendations based on mood
   */
  public async getRecommendationsByMood(
    mood: string,
    limit: number = 5
  ): Promise<MoodRecommendation> {
    try {
      const profile = this.preferencesService.getActiveProfile();
      if (!profile) {
        throw new Error('No active profile found');
      }
      
      const cacheKey = `mood_${mood}_${profile.id}`;
      
      // Check cache first (if not expired)
      const cachedRecommendation = this.moodCache.get(cacheKey);
      const now = Date.now();
      if (cachedRecommendation && now - new Date(cachedRecommendation.timestamp).getTime() < this.CACHE_EXPIRY_TIME) {
        return cachedRecommendation;
      }
      
      // Try to use AI for recommendations
      let recommendations: MoodRecommendation;
      
      if (this.openAIService.hasApiKey()) {
        try {
          recommendations = await this.generateAIMoodRecommendations(mood, profile.id, limit);
        } catch (error) {
          console.error('Error generating AI mood recommendations:', error);
          // Fallback to template-based recommendations
          recommendations = await this.generateTemplateMoodRecommendations(mood, limit);
        }
      } else {
        // Use template-based recommendations as fallback
        recommendations = await this.generateTemplateMoodRecommendations(mood, limit);
      }
      
      // Cache the recommendations
      this.moodCache.set(cacheKey, recommendations);
      
      // Add to mood history
      this.addMoodToHistory(mood);
      
      return recommendations;
    } catch (error) {
      console.error('Error in mood recommendations:', error);
      
      // Return empty recommendation if everything fails
      return {
        mood: mood,
        contentItems: [],
        reasoning: 'Unable to generate recommendations at this time.',
        timestamp: new Date().toISOString(),
        source: 'template'
      };
    }
  }

  /**
   * Get available mood categories
   */
  public getMoodCategories(): MoodCategory[] {
    return MOOD_CATEGORIES;
  }

  /**
   * Get mood history
   */
  public getMoodHistory(): MoodHistory[] {
    return [...this.moodHistory];
  }

  /**
   * Record selected content from mood recommendation
   */
  public recordMoodContentSelection(mood: string, contentId: string): void {
    // Find the most recent entry for this mood and update it
    const index = this.moodHistory.findIndex(entry => entry.mood === mood);
    if (index !== -1) {
      this.moodHistory[index].contentSelected = contentId;
      this.saveMoodHistory();
    }
  }

  /**
   * Generate AI-powered mood recommendations
   */
  private async generateAIMoodRecommendations(
    mood: string,
    profileId: string,
    limit: number
  ): Promise<MoodRecommendation> {
    // Get user preferences to personalize recommendations
    const userPreferenceData = await this.preferencesService.getUserPreferenceData(profileId);
    
    // Get all content
    const allContent = await this.contentService.getAllContent();
    
    // Format user preferences for the AI
    const userContextData = {
      mood: mood,
      favoriteGenres: userPreferenceData.favoriteGenres || [],
      recentlyWatched: userPreferenceData.watchHistory?.slice(0, 5).map(item => ({
        contentId: item.contentId,
        watchedAt: item.watchedAt
      })) || [],
      viewingPatterns: userPreferenceData.viewingPatterns || {}
    };
    
    // Create mood mapping to describe each mood
    const moodDescriptions: Record<string, string> = {
      happy: 'uplifting, positive, joyful, comedic, light-hearted',
      relaxed: 'calming, soothing, slow-paced, gentle, comforting',
      excited: 'thrilling, action-packed, suspenseful, fast-paced, intense',
      thoughtful: 'intelligent, thought-provoking, philosophical, complex, meaningful',
      melancholy: 'emotional, reflective, dramatic, bittersweet, touching',
      curious: 'informative, educational, documentary, intriguing, fascinating',
      tired: 'easy-to-watch, familiar, comforting, simple, predictable',
      bored: 'engaging, entertaining, captivating, unique, surprising'
    };
    
    // Create a condensed content list for the AI
    const contentList = allContent.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      genres: item.genres,
      tags: item.tags || [],
      description: item.description.slice(0, 100) + (item.description.length > 100 ? '...' : '')
    }));
    
    // Generate system prompt
    const systemPrompt = `
      You are an expert mood-based content recommendation system for a streaming platform.
      Your task is to recommend content that matches the user's current mood.
      
      For a user feeling "${mood}" (${moodDescriptions[mood] || mood}), select ${limit} items from 
      the content list that would best match this mood. Consider the user's preferences and history.
      
      Return your response as a JSON object with:
      1. An array of content IDs that match this mood
      2. A brief explanation of why these items are good for this mood (1-2 sentences)
      
      Format:
      {
        "contentIds": ["id1", "id2", "id3"],
        "reasoning": "Brief explanation of why these match the mood"
      }
    `;
    
    // Call OpenAI API
    const response = await this.openAIService.generateChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify({ userContext: userContextData, contentItems: contentList }) }
      ],
      {
        temperature: 0.7,
        max_tokens: 500,
        cacheKey: `mood_recommendations_${mood}_${profileId}`
      }
    );
    
    // Parse the response
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : '{}';
      const parsed = JSON.parse(jsonStr);
      
      const contentIds = parsed.contentIds || [];
      const reasoning = parsed.reasoning || `Content selected to match your ${mood} mood.`;
      
      // Get the full content items
      const contentItems = contentIds
        .map((id: string) => allContent.find(item => item.id === id))
        .filter((item: ContentItem | undefined) => item !== undefined) as ContentItem[];
      
      // If we didn't get enough items, fill with template recommendations
      if (contentItems.length < limit) {
        const templateRecs = await this.generateTemplateMoodRecommendations(mood, limit - contentItems.length);
        contentItems.push(...templateRecs.contentItems);
      }
      
      return {
        mood,
        contentItems: contentItems.slice(0, limit),
        reasoning,
        timestamp: new Date().toISOString(),
        source: 'ai'
      };
    } catch (error) {
      console.error('Error parsing AI mood recommendation response:', error);
      // Fallback to template recommendations
      return this.generateTemplateMoodRecommendations(mood, limit);
    }
  }

  /**
   * Generate template-based mood recommendations as fallback
   */
  private async generateTemplateMoodRecommendations(
    mood: string,
    limit: number
  ): Promise<MoodRecommendation> {
    // Get all content
    const allContent = await this.contentService.getAllContent();
    
    // Mood to genre/tag mapping for fallback
    const moodMappings: Record<string, { genres: string[]; tags: string[] }> = {
      happy: {
        genres: ['Comedy', 'Animation', 'Family'],
        tags: ['funny', 'uplifting', 'lighthearted', 'heartwarming']
      },
      relaxed: {
        genres: ['Documentary', 'Nature'],
        tags: ['calm', 'peaceful', 'soothing', 'gentle']
      },
      excited: {
        genres: ['Action', 'Adventure', 'Thriller'],
        tags: ['action', 'thrilling', 'suspenseful', 'intense']
      },
      thoughtful: {
        genres: ['Drama', 'Biography', 'History'],
        tags: ['thought-provoking', 'deep', 'meaningful', 'reflective']
      },
      melancholy: {
        genres: ['Drama', 'Romance'],
        tags: ['emotional', 'touching', 'poignant', 'bittersweet']
      },
      curious: {
        genres: ['Documentary', 'Science Fiction', 'Mystery'],
        tags: ['educational', 'informative', 'fascinating', 'intriguing']
      },
      tired: {
        genres: ['Comedy', 'Reality', 'Talk Show'],
        tags: ['easy', 'light', 'comforting', 'familiar']
      },
      bored: {
        genres: ['Action', 'Adventure', 'Fantasy'],
        tags: ['entertaining', 'exciting', 'engaging', 'captivating']
      }
    };
    
    // Get matching criteria for the mood
    const criteria = moodMappings[mood] || {
      genres: [], 
      tags: []
    };
    
    // Score content based on how well it matches the mood
    const scoredContent = allContent.map(content => {
      let score = 0;
      
      // Score based on genre match
      const genreMatches = content.genres.filter(genre => 
        criteria.genres.includes(genre)
      ).length;
      score += genreMatches * 3;
      
      // Score based on tag match
      const tagMatches = (content.tags || []).filter(tag => 
        criteria.tags.includes(tag)
      ).length;
      score += tagMatches * 2;
      
      // Add random factor for variety
      score += Math.random() * 2;
      
      return { content, score };
    });
    
    // Sort by score and take the top ones
    const recommendations = scoredContent
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.content);
    
    return {
      mood,
      contentItems: recommendations,
      reasoning: `Content selected to match your ${mood} mood.`,
      timestamp: new Date().toISOString(),
      source: 'template'
    };
  }

  /**
   * Add mood to history
   */
  private addMoodToHistory(mood: string): void {
    // Add mood to history
    this.moodHistory.unshift({
      mood,
      timestamp: new Date().toISOString()
    });
    
    // Trim history if it's too long
    if (this.moodHistory.length > this.MAX_HISTORY_ITEMS) {
      this.moodHistory = this.moodHistory.slice(0, this.MAX_HISTORY_ITEMS);
    }
    
    // Save to localStorage
    this.saveMoodHistory();
  }

  /**
   * Load mood history from localStorage
   */
  private loadMoodHistory(): void {
    try {
      const storedHistory = localStorage.getItem(this.HISTORY_STORAGE_KEY);
      if (storedHistory) {
        this.moodHistory = JSON.parse(storedHistory);
      }
    } catch (error) {
      console.error('Error loading mood history:', error);
      this.moodHistory = [];
    }
  }

  /**
   * Save mood history to localStorage
   */
  private saveMoodHistory(): void {
    try {
      localStorage.setItem(this.HISTORY_STORAGE_KEY, JSON.stringify(this.moodHistory));
    } catch (error) {
      console.error('Error saving mood history:', error);
    }
  }

  /**
   * Clear mood history
   */
  public clearMoodHistory(): void {
    this.moodHistory = [];
    localStorage.removeItem(this.HISTORY_STORAGE_KEY);
  }
  
  /**
   * Clear mood recommendations cache
   */
  public clearCache(): void {
    this.moodCache.clear();
  }
  
  /**
   * Get mood transition suggestions
   * Recommend what to watch next based on transition from current to next mood
   */
  public async getMoodTransition(
    currentMood: string,
    targetMood: string,
    limit: number = 3
  ): Promise<ContentItem[]> {
    try {
      // Get AI recommendations if available
      if (this.openAIService.hasApiKey()) {
        try {
          const allContent = await this.contentService.getAllContent();
          
          // Generate system prompt for mood transition
          const systemPrompt = `
            You are an expert content recommendation system for a streaming platform.
            Your task is to recommend content that helps a user transition from one mood to another.
            
            The user is currently feeling "${currentMood}" and wants to transition to feeling "${targetMood}".
            Select ${limit} items from the content list that would best facilitate this mood transition.
            
            Return your response as a JSON array of content IDs that would help with this transition.
            Format: ["id1", "id2", "id3"]
          `;
          
          // Create condensed content list for the AI
          const contentList = allContent.map(item => ({
            id: item.id,
            title: item.title,
            type: item.type,
            genres: item.genres,
            tags: item.tags || [],
            description: item.description.slice(0, 100) + (item.description.length > 100 ? '...' : '')
          }));
          
          // Call OpenAI API
          const response = await this.openAIService.generateChatCompletion(
            [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: JSON.stringify(contentList) }
            ],
            {
              temperature: 0.7,
              max_tokens: 250,
              cacheKey: `mood_transition_${currentMood}_${targetMood}`
            }
          );
          
          // Parse the response
          try {
            // Extract JSON from the response
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            const jsonStr = jsonMatch ? jsonMatch[0] : '[]';
            const contentIds = JSON.parse(jsonStr);
            
            // Get the full content items
            const contentItems = contentIds
              .map((id: string) => allContent.find(item => item.id === id))
              .filter((item: ContentItem | undefined) => item !== undefined) as ContentItem[];
            
            // If we got enough items, return them
            if (contentItems.length >= limit) {
              return contentItems.slice(0, limit);
            }
          } catch (error) {
            console.error('Error parsing mood transition response:', error);
            // Fall through to fallback
          }
        } catch (error) {
          console.error('Error getting AI mood transition:', error);
          // Fall through to fallback
        }
      }
      
      // Fallback: blend recommendations from both moods
      const currentMoodRecs = await this.generateTemplateMoodRecommendations(currentMood, limit);
      const targetMoodRecs = await this.generateTemplateMoodRecommendations(targetMood, limit);
      
      // Alternate items from both sets
      const combined: ContentItem[] = [];
      for (let i = 0; i < limit; i++) {
        if (i % 2 === 0 && targetMoodRecs.contentItems[i/2]) {
          combined.push(targetMoodRecs.contentItems[i/2]);
        } else if (currentMoodRecs.contentItems[Math.floor(i/2)]) {
          combined.push(currentMoodRecs.contentItems[Math.floor(i/2)]);
        }
      }
      
      return combined.slice(0, limit);
    } catch (error) {
      console.error('Error getting mood transition:', error);
      return [];
    }
  }
}

export default MoodRecommender; 