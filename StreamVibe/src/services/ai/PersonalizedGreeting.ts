/**
 * Personalized greeting service
 * Generates time-aware and user-specific greetings
 */

import OpenAIService from '../OpenAIService';
import PreferencesService from '../PreferencesService';
import ContentService from '../ContentService';
import type { ContentItem } from '../../types/Content';
import type { UserProfile } from '../../types/User';
export type { UserPreferenceData } from '../../types/Recommendation';

export interface GreetingOptions {
  includeTimeOfDay?: boolean;
  includeRecommendation?: boolean;
  includeRecentlyWatched?: boolean;
  includeUpcoming?: boolean;
  languageStyle?: 'formal' | 'casual' | 'friendly' | 'enthusiastic';
}

export interface GreetingResult {
  greeting: string;
  timeOfDay?: string;
  userName?: string;
  contentSuggestion?: ContentItem | null;
  generatedTimestamp: string;
  source: 'ai' | 'template';
}

class PersonalizedGreeting {
  private static instance: PersonalizedGreeting;
  private openAIService: OpenAIService;
  private preferencesService: PreferencesService;
  private contentService: ContentService;
  private greetingCache: Map<string, { greeting: GreetingResult; expires: number }> = new Map();
  private greetingRotation: Record<string, number> = {}; // Use Record type instead of string[]
  private readonly GREETING_CACHE_DURATION = 1000 * 60 * 60; // 1 hour
  private readonly MAX_GREETING_CACHE = 10;
  
  private constructor() {
    this.openAIService = OpenAIService.getInstance();
    this.preferencesService = PreferencesService.getInstance();
    this.contentService = ContentService.getInstance();
    this.loadGreetingRotation();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PersonalizedGreeting {
    if (!PersonalizedGreeting.instance) {
      PersonalizedGreeting.instance = new PersonalizedGreeting();
    }
    return PersonalizedGreeting.instance;
  }

  /**
   * Generate a personalized greeting
   */
  public async getGreeting(options: GreetingOptions = {}): Promise<GreetingResult> {
    try {
      const profile = this.preferencesService.getActiveProfile();
      if (!profile) {
        throw new Error('No active profile found');
      }

      const timeOfDay = this.getTimeOfDay();
      const cacheKey = this.generateCacheKey(profile.id, timeOfDay, options);
      
      // Check if we have a cached greeting
      const cachedGreeting = this.greetingCache.get(cacheKey);
      if (cachedGreeting && cachedGreeting.expires > Date.now()) {
        return cachedGreeting.greeting;
      }
      
      // Try to use AI for greeting generation
      if (this.openAIService.hasApiKey()) {
        try {
          const aiGreeting = await this.generateAIGreeting(profile, timeOfDay, options);
          
          // Cache the greeting
          this.cacheGreeting(cacheKey, aiGreeting);
          
          return aiGreeting;
        } catch (error) {
          console.error('Error generating AI greeting:', error);
          // Fall through to template-based generation
        }
      }
      
      // Use template-based greeting as fallback
      const templateGreeting = await this.generateTemplateGreeting(profile, timeOfDay, options);
      
      // Cache the greeting
      this.cacheGreeting(cacheKey, templateGreeting);
      
      return templateGreeting;
    } catch (error) {
      console.error('Error in greeting service:', error);
      // Return a generic greeting if everything fails
      return {
        greeting: 'Welcome to StreamVibe!',
        generatedTimestamp: new Date().toISOString(),
        source: 'template'
      };
    }
  }

  /**
   * Generate AI-powered personalized greeting
   */
  private async generateAIGreeting(
    profile: UserProfile,
    timeOfDay: string,
    options: GreetingOptions
  ): Promise<GreetingResult> {
    // Get user preference data for more personalized greeting
    const userPreferenceData = await this.preferencesService.getUserPreferenceData(profile.id);
    
    // Get content suggestion based on user preferences
    let contentSuggestion: ContentItem | null = null;
    if (options.includeRecommendation) {
      const recentlyWatched = await this.contentService.getRecentlyWatched(5);
      if (recentlyWatched.length > 0) {
        // Get a content item similar to recently watched
        const allContent = await this.contentService.getAllContent();
        const filteredContent = allContent.filter(content => 
          !recentlyWatched.some(watched => watched.id === content.id)
        );
        
        if (filteredContent.length > 0) {
          contentSuggestion = filteredContent[Math.floor(Math.random() * filteredContent.length)];
        }
      }
    }
    
    // Format the user data for the AI
    const promptData = {
      userName: profile.name,
      timeOfDay,
      isKidsProfile: profile.isKidsProfile,
      favoriteGenres: userPreferenceData.favoriteGenres || [],
      recentlyWatched: userPreferenceData.watchHistory?.slice(0, 3).map(item => {
        // Create a label from the contentId since we don't have titles in the watchHistory
        return `Content ${item.contentId}`;
      }) || [],
      viewingFrequency: 'moderate', // Use a default value since it's not in the type
      languageStyle: options.languageStyle || 'friendly',
      includeContentSuggestion: !!contentSuggestion,
      contentSuggestion: contentSuggestion ? {
        title: contentSuggestion.title,
        type: contentSuggestion.type,
        genres: contentSuggestion.genres
      } : null
    };
    
    // Create system prompt
    const systemPrompt = `
      You are a friendly, personalized streaming service assistant.
      Generate a personalized greeting for the user based on the provided information.
      
      Use the following style guidelines:
      - Keep it brief and conversational (max 2 sentences)
      - Match the specified language style (formal, casual, friendly, enthusiastic)
      - For kids profiles, use simpler language and more upbeat tone
      - Include time of day greeting if specified
      - Mention content suggestion if provided
      - Do not include emojis or special formatting
      
      Return ONLY the greeting text, with no additional explanations or formatting.
    `;
    
    // Create user prompt with data
    const userPrompt = JSON.stringify(promptData);
    
    // Call OpenAI API
    const response = await this.openAIService.generateChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      {
        temperature: 0.7,
        max_tokens: 150,
        useCache: true,
        cacheKey: `greeting_${profile.id}_${timeOfDay}_${options.languageStyle || 'default'}`
      }
    );
    
    return {
      greeting: response.trim(),
      timeOfDay,
      userName: profile.name,
      contentSuggestion,
      generatedTimestamp: new Date().toISOString(),
      source: 'ai'
    };
  }

  /**
   * Generate template-based greeting as fallback
   */
  private async generateTemplateGreeting(
    profile: UserProfile,
    timeOfDay: string,
    options: GreetingOptions
  ): Promise<GreetingResult> {
    // Basic time-specific greeting templates
    const timeGreetings: Record<string, string[]> = {
      morning: [
        'Good morning',
        'Rise and shine',
        'Morning',
        'Hello and good morning'
      ],
      afternoon: [
        'Good afternoon',
        'Hello',
        'Hi there',
        'Greetings'
      ],
      evening: [
        'Good evening',
        'Evening',
        'Hello'
      ],
      night: [
        'Good night',
        'Still up?',
        'Late night viewing'
      ]
    };

    // Additional greeting templates
    const personalTemplates = [
      `Welcome back, ${profile.name}!`,
      `Hello, ${profile.name}!`,
      `Nice to see you again, ${profile.name}!`,
      `Welcome to StreamVibe, ${profile.name}!`
    ];

    // Get potential content suggestion
    let contentSuggestion: ContentItem | null = null;
    let contentPhrase = '';
    
    if (options.includeRecommendation) {
      try {
        const recentlyWatched = await this.contentService.getRecentlyWatched(3);
        const allContent = await this.contentService.getAllContent();
        
        if (recentlyWatched.length > 0 && allContent.length > 0) {
          // Filter out recently watched items
          const filteredContent = allContent.filter(content => 
            !recentlyWatched.some(watched => watched.id === content.id)
          );
          
          if (filteredContent.length > 0) {
            contentSuggestion = filteredContent[Math.floor(Math.random() * filteredContent.length)];
            contentPhrase = ` How about watching ${contentSuggestion.title}?`;
          }
        }
      } catch (error) {
        console.error('Error getting content suggestion:', error);
      }
    }
    
    // Choose base greeting - rotate through the options
    let greeting = '';
    
    if (options.includeTimeOfDay && timeGreetings[timeOfDay]) {
      // Use time-based greeting
      const timeGreeting = this.getRotatedItem(timeGreetings[timeOfDay], `${profile.id}_time`);
      greeting = `${timeGreeting}, ${profile.name}!`;
    } else {
      // Use personal greeting
      greeting = this.getRotatedItem(personalTemplates, `${profile.id}_personal`);
    }
    
    // Add content suggestion if available
    if (contentSuggestion && contentPhrase) {
      greeting += contentPhrase;
    }
    
    return {
      greeting,
      timeOfDay,
      userName: profile.name,
      contentSuggestion,
      generatedTimestamp: new Date().toISOString(),
      source: 'template'
    };
  }

  /**
   * Get time of day (morning, afternoon, evening, night)
   */
  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'morning';
    } else if (hour >= 12 && hour < 17) {
      return 'afternoon';
    } else if (hour >= 17 && hour < 22) {
      return 'evening';
    } else {
      return 'night';
    }
  }
  
  /**
   * Generate cache key based on parameters
   */
  private generateCacheKey(
    profileId: string, 
    timeOfDay: string, 
    options: GreetingOptions
  ): string {
    const optionsStr = JSON.stringify(options);
    return `greeting_${profileId}_${timeOfDay}_${optionsStr}`;
  }
  
  /**
   * Cache a greeting with expiration
   */
  private cacheGreeting(key: string, greeting: GreetingResult): void {
    // Remove oldest entry if cache is full
    if (this.greetingCache.size >= this.MAX_GREETING_CACHE) {
      let oldestKey = '';
      let oldestTime = Infinity;
      
      this.greetingCache.forEach((value, k) => {
        if (value.expires < oldestTime) {
          oldestTime = value.expires;
          oldestKey = k;
        }
      });
      
      if (oldestKey) {
        this.greetingCache.delete(oldestKey);
      }
    }
    
    // Add new entry
    this.greetingCache.set(key, {
      greeting,
      expires: Date.now() + this.GREETING_CACHE_DURATION
    });
  }
  
  /**
   * Get a rotated item from an array to avoid repetition
   */
  private getRotatedItem(items: string[], rotationKey: string = 'default'): string {
    if (!this.greetingRotation[rotationKey]) {
      this.greetingRotation[rotationKey] = 0;
    }
    
    const index = this.greetingRotation[rotationKey] % items.length;
    this.greetingRotation[rotationKey] = (this.greetingRotation[rotationKey] + 1) % items.length;
    
    // Save rotation state
    this.saveGreetingRotation();
    
    return items[index];
  }
  
  /**
   * Save greeting rotation to localStorage
   */
  private saveGreetingRotation(): void {
    try {
      localStorage.setItem('streamvibe_greeting_rotation', JSON.stringify(this.greetingRotation));
    } catch (error) {
      console.error('Error saving greeting rotation:', error);
    }
  }
  
  /**
   * Load greeting rotation from localStorage
   */
  private loadGreetingRotation(): void {
    try {
      const rotation = localStorage.getItem('streamvibe_greeting_rotation');
      if (rotation) {
        this.greetingRotation = JSON.parse(rotation);
      }
    } catch (error) {
      console.error('Error loading greeting rotation:', error);
      this.greetingRotation = {};
    }
  }
  
  /**
   * Clear greeting cache
   */
  public clearCache(): void {
    this.greetingCache.clear();
  }
  
  /**
   * Reset greeting rotation
   */
  public resetRotation(): void {
    this.greetingRotation = {};
    this.saveGreetingRotation();
  }
}

export default PersonalizedGreeting; 