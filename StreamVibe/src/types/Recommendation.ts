/**
 * Types for AI recommendation system
 */

export interface RecommendationRequest {
  userId: string;
  profileId: string;
  contextType: 'general' | 'genre' | 'content' | 'mood' | 'surprise';
  contextValue?: string; // Genre name, content ID, or mood descriptor
  limit?: number;
  includeReasoning?: boolean;
}

export interface RecommendationResponse {
  recommendations: ContentRecommendation[];
  requestId: string;
  timestamp: string;
  source: 'ai' | 'fallback' | 'hybrid';
}

export interface ContentRecommendation {
  contentId: string;
  score: number; // 0-100, confidence/relevance score
  reasoning?: string; // Natural language explanation
  category?: string; // Optional categorization
  tags?: string[]; // Associated tags
}

// Raw format as received from OpenAI API response
export interface ContentRecommendationRaw {
  contentId: string;
  score: string | number;
  reasoning?: string;
  category?: string;
  tags?: string[];
}

export interface AIPrompt {
  systemPrompt: string;
  userPrompt: string;
  contextData?: Record<string, unknown>;
}

export interface UserPreferenceData {
  favoriteGenres: Array<{genre: string; weight: number}>;
  dislikedGenres: string[];
  favoriteActors: string[];
  viewingPatterns: {
    preferredLength?: 'short' | 'medium' | 'long';
    preferredReleaseEra?: 'classic' | 'recent' | 'new';
    preferredPacing?: 'slow' | 'moderate' | 'fast';
    preferredTone?: 'light' | 'balanced' | 'dark';
    preferredRating?: string[];
    preferredLanguages?: string[];
  };
  watchHistory: Array<{
    contentId: string;
    watchedAt: string;
    percentComplete: number;
    rewatched: boolean;
  }>;
}

export interface SurpriseRecommendationOptions {
  moodBased?: boolean;
  mood?: string;
  genreBlending?: boolean;
  excludeWatchHistory?: boolean;
  noveltyLevel?: number; // 1-10, how "surprising" the recommendation should be
} 