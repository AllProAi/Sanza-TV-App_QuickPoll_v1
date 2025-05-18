/**
 * User and preferences data models for StreamVibe TV App
 */

export interface User {
  id: string;
  username: string;
  email: string;
  profiles: UserProfile[];
  activeProfileId: string;
  subscription: Subscription;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
  isKidsProfile: boolean;
  preferences: UserPreferences;
  favoriteContentIds: string[];
  watchlist: string[];
  recentlyWatched: RecentlyWatchedItem[];
}

export interface RecentlyWatchedItem {
  contentId: string;
  episodeId?: string;
  timestamp: string; // ISO date string
}

export interface UserPreferences {
  // Appearance
  theme: 'system' | 'light' | 'dark';
  uiScale: number; // 0.8-1.2
  accentColor: string;
  
  // Playback
  autoplay: boolean;
  autoplayNextEpisode: boolean;
  skipIntro: boolean;
  defaultAudioLanguage: string;
  defaultSubtitleLanguage: string | null;
  alwaysShowSubtitles: boolean;
  playbackSpeed: number; // 0.5-2.0
  videoQuality: 'auto' | '480p' | '720p' | '1080p' | '4k';
  
  // Notifications
  newContentNotifications: boolean;
  watchlistUpdates: boolean;
  recommendationNotifications: boolean;
  
  // Privacy
  shareWatchHistory: boolean;
  useRecommendationEngine: boolean;
  
  // Accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  enableVoiceControl: boolean;
  closedCaptioning: boolean;
  
  // Developer
  debugMode: boolean;
}

export interface Subscription {
  tier: 'free' | 'standard' | 'premium';
  startDate: string; // ISO date string
  renewalDate: string; // ISO date string
  paymentMethod?: PaymentMethod;
  status: 'active' | 'pending' | 'canceled' | 'expired';
}

export interface PaymentMethod {
  id: string;
  type: 'credit' | 'paypal' | 'other';
  lastFour?: string;
  expiryDate?: string;
} 