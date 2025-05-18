/**
 * Type declarations for MockData.js
 */

// Content types
export interface MockContentItem {
  id: string;
  title: string;
  description: string;
  type: 'movie' | 'series';
  genre: string[];
  releaseYear: number;
  rating: number;
  imageUrl: string;
  videoUrl: string;
  tags: string[];
  cast: Array<{ id: string; name: string; role: string }>;
  director: string;
  mood: string[];
  duration?: number; // for movies
  episodes?: number; // for series
  seasons?: Array<{
    id: string;
    title: string;
    episodes: Array<{
      id: string;
      title: string;
      duration: number;
    }>;
  }>;
}

// User preferences
export interface MockUserPreference {
  id: string;
  name: string;
  favoriteGenres: string[];
  watchHistory: Array<{
    contentId: string;
    watchedAt: string;
    progress: number;
  }>;
  watchlist: string[];
  preferences: {
    subtitles: boolean;
    language: string;
    maturityLevel: string;
    displayMode: string;
  };
  activity: {
    lastActive: string;
    totalWatchTime: number;
    favoriteTimeOfDay: string;
  };
  moodPreferences: Record<string, string[]>;
}

// API responses
export interface MockApiResponse {
  status: number;
  data?: any;
  error?: string;
}

export interface MockOpenAIResponse {
  choices?: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

// Playback states
export interface MockPlaybackState {
  contentId: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  quality: string;
  playbackRate: number;
  isBuffering?: boolean;
  error?: string;
}

// Exported mock data
export const mockContentItems: MockContentItem[];
export const mockUserPreferences: MockUserPreference;
export const mockApiResponses: {
  getContent: {
    success: MockApiResponse;
    error: MockApiResponse;
    empty: MockApiResponse;
  };
  getContentDetail: {
    success: MockApiResponse;
    notFound: MockApiResponse;
    error: MockApiResponse;
  };
  getUserPreferences: {
    success: MockApiResponse;
    notFound: MockApiResponse;
    error: MockApiResponse;
  };
  getRecommendations: {
    success: MockApiResponse;
    empty: MockApiResponse;
    error: MockApiResponse;
  };
};

export const mockOpenAIResponses: {
  completion: {
    success: MockOpenAIResponse;
    error: MockOpenAIResponse;
  };
  tagging: {
    success: MockOpenAIResponse;
    error: MockOpenAIResponse;
  };
};

export const mockPlaybackStates: {
  playing: MockPlaybackState;
  paused: MockPlaybackState;
  buffering: MockPlaybackState;
  error: MockPlaybackState;
}; 