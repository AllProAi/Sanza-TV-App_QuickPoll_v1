import type { User, UserProfile, UserPreferences } from '../types/User';
import type { UserPreferenceData } from '../types/Recommendation';
import ContentService from './ContentService';
import type { ContentItem } from '../types/Content';

/**
 * Service for managing user preferences with localStorage persistence
 */
class PreferencesService {
  private static instance: PreferencesService;
  private storageKeyPrefix = 'streamvibe_';
  private defaultProfile: UserProfile;
  private defaultPreferences: UserPreferences;
  private contentService: ContentService;

  private constructor() {
    // Initialize default preferences
    this.defaultPreferences = {
      // Appearance
      theme: 'system',
      uiScale: 1,
      accentColor: '#FF5500',
      
      // Playback
      autoplay: true,
      autoplayNextEpisode: true,
      skipIntro: true,
      defaultAudioLanguage: 'en',
      defaultSubtitleLanguage: null,
      alwaysShowSubtitles: false,
      playbackSpeed: 1.0,
      videoQuality: 'auto',
      
      // Notifications
      newContentNotifications: true,
      watchlistUpdates: true,
      recommendationNotifications: false,
      
      // Privacy
      shareWatchHistory: true,
      useRecommendationEngine: true,
      
      // Accessibility
      highContrast: false,
      reducedMotion: false,
      enableVoiceControl: false,
      closedCaptioning: false,
      
      // Developer
      debugMode: false
    };

    // Initialize default profile
    this.defaultProfile = {
      id: 'default',
      name: 'Default Profile',
      avatarUrl: 'https://picsum.photos/200',
      isKidsProfile: false,
      preferences: this.defaultPreferences,
      favoriteContentIds: [],
      watchlist: [],
      recentlyWatched: []
    };

    // Get content service instance
    this.contentService = ContentService.getInstance();
  }

  /**
   * Get singleton instance of PreferencesService
   */
  public static getInstance(): PreferencesService {
    if (!PreferencesService.instance) {
      PreferencesService.instance = new PreferencesService();
    }
    return PreferencesService.instance;
  }

  /**
   * Initialize user data with default values if not exists
   */
  public initializeUser(): User {
    const existingUser = this.getUser();
    
    if (existingUser) {
      return existingUser;
    }
    
    // Create new user with default profile
    const newUser: User = {
      id: `user_${Date.now()}`,
      username: 'User',
      email: 'user@example.com',
      profiles: [this.defaultProfile],
      activeProfileId: this.defaultProfile.id,
      subscription: {
        tier: 'standard',
        startDate: new Date().toISOString(),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        status: 'active'
      }
    };
    
    this.saveUser(newUser);
    return newUser;
  }

  /**
   * Get user data from localStorage
   */
  public getUser(): User | null {
    const userData = localStorage.getItem(`${this.storageKeyPrefix}user`);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  }

  /**
   * Save user data to localStorage
   */
  public saveUser(user: User): void {
    try {
      localStorage.setItem(`${this.storageKeyPrefix}user`, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
    }
  }

  /**
   * Get active user profile
   */
  public getActiveProfile(): UserProfile | null {
    const user = this.getUser();
    if (!user) return null;
    
    return user.profiles.find(profile => profile.id === user.activeProfileId) || null;
  }

  /**
   * Save active profile to user data
   */
  public saveActiveProfile(profile: UserProfile): void {
    const user = this.getUser();
    if (!user) return;
    
    // Find and update the profile
    const profileIndex = user.profiles.findIndex(p => p.id === profile.id);
    
    if (profileIndex >= 0) {
      user.profiles[profileIndex] = profile;
    } else {
      user.profiles.push(profile);
    }
    
    user.activeProfileId = profile.id;
    this.saveUser(user);
  }

  /**
   * Switch active profile
   */
  public switchProfile(profileId: string): UserProfile | null {
    const user = this.getUser();
    if (!user) return null;
    
    const profile = user.profiles.find(p => p.id === profileId);
    if (!profile) return null;
    
    user.activeProfileId = profileId;
    this.saveUser(user);
    
    return profile;
  }

  /**
   * Create a new profile
   */
  public createProfile(name: string, isKidsProfile: boolean = false): UserProfile {
    const user = this.getUser() || this.initializeUser();
    
    const newProfile: UserProfile = {
      id: `profile_${Date.now()}`,
      name,
      avatarUrl: `https://picsum.photos/seed/${Date.now()}/200`,
      isKidsProfile,
      preferences: { ...this.defaultPreferences },
      favoriteContentIds: [],
      watchlist: [],
      recentlyWatched: []
    };
    
    user.profiles.push(newProfile);
    user.activeProfileId = newProfile.id;
    this.saveUser(user);
    
    return newProfile;
  }

  /**
   * Delete a profile
   */
  public deleteProfile(profileId: string): boolean {
    const user = this.getUser();
    if (!user) return false;
    
    // Don't allow deleting the last profile
    if (user.profiles.length <= 1) {
      return false;
    }
    
    const profileIndex = user.profiles.findIndex(p => p.id === profileId);
    if (profileIndex < 0) return false;
    
    user.profiles.splice(profileIndex, 1);
    
    // If active profile was deleted, switch to first available
    if (user.activeProfileId === profileId) {
      user.activeProfileId = user.profiles[0].id;
    }
    
    this.saveUser(user);
    return true;
  }

  /**
   * Get preferences for active profile
   */
  public getPreferences(): UserPreferences {
    const profile = this.getActiveProfile();
    return profile?.preferences || this.defaultPreferences;
  }

  /**
   * Update preferences for active profile
   */
  public updatePreferences(preferences: Partial<UserPreferences>): UserPreferences {
    const profile = this.getActiveProfile();
    if (!profile) return this.defaultPreferences;
    
    // Update only the provided preference fields
    profile.preferences = {
      ...profile.preferences,
      ...preferences
    };
    
    this.saveActiveProfile(profile);
    return profile.preferences;
  }

  /**
   * Reset preferences to default values
   */
  public resetPreferences(): UserPreferences {
    const profile = this.getActiveProfile();
    if (!profile) return this.defaultPreferences;
    
    profile.preferences = { ...this.defaultPreferences };
    this.saveActiveProfile(profile);
    
    return profile.preferences;
  }

  /**
   * Add content to favorites
   */
  public addToFavorites(contentId: string): string[] {
    const profile = this.getActiveProfile();
    if (!profile) return [];
    
    if (!profile.favoriteContentIds.includes(contentId)) {
      profile.favoriteContentIds.push(contentId);
      this.saveActiveProfile(profile);
    }
    
    return profile.favoriteContentIds;
  }

  /**
   * Remove content from favorites
   */
  public removeFromFavorites(contentId: string): string[] {
    const profile = this.getActiveProfile();
    if (!profile) return [];
    
    profile.favoriteContentIds = profile.favoriteContentIds.filter(id => id !== contentId);
    this.saveActiveProfile(profile);
    
    return profile.favoriteContentIds;
  }

  /**
   * Check if content is in favorites
   */
  public isInFavorites(contentId: string): boolean {
    const profile = this.getActiveProfile();
    if (!profile) return false;
    
    return profile.favoriteContentIds.includes(contentId);
  }

  /**
   * Add content to watchlist
   */
  public addToWatchlist(contentId: string): string[] {
    const profile = this.getActiveProfile();
    if (!profile) return [];
    
    if (!profile.watchlist.includes(contentId)) {
      profile.watchlist.push(contentId);
      this.saveActiveProfile(profile);
    }
    
    return profile.watchlist;
  }

  /**
   * Remove content from watchlist
   */
  public removeFromWatchlist(contentId: string): string[] {
    const profile = this.getActiveProfile();
    if (!profile) return [];
    
    profile.watchlist = profile.watchlist.filter(id => id !== contentId);
    this.saveActiveProfile(profile);
    
    return profile.watchlist;
  }

  /**
   * Check if content is in watchlist
   */
  public isInWatchlist(contentId: string): boolean {
    const profile = this.getActiveProfile();
    if (!profile) return false;
    
    return profile.watchlist.includes(contentId);
  }

  /**
   * Add content to recently watched
   */
  public addToRecentlyWatched(contentId: string, episodeId?: string): void {
    const profile = this.getActiveProfile();
    if (!profile) return;
    
    // Remove if already exists (to update timestamp and move to top)
    profile.recentlyWatched = profile.recentlyWatched.filter(
      item => !(item.contentId === contentId && (!episodeId || item.episodeId === episodeId))
    );
    
    // Add to beginning of array
    profile.recentlyWatched.unshift({
      contentId,
      episodeId,
      timestamp: new Date().toISOString()
    });
    
    // Limit to 20 items
    if (profile.recentlyWatched.length > 20) {
      profile.recentlyWatched = profile.recentlyWatched.slice(0, 20);
    }
    
    this.saveActiveProfile(profile);
  }

  /**
   * Clear all user data and reset to defaults
   */
  public clearAllData(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.storageKeyPrefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Migrate preferences if needed (for app updates)
   */
  public migratePreferences(): void {
    // This would handle any migration logic when the app updates
    // and preferences structure changes
    const user = this.getUser();
    if (!user) return;
    
    let needsSave = false;
    
    // Example migration: ensure all profiles have all preference fields
    user.profiles.forEach(profile => {
      const completePrefs = { ...this.defaultPreferences };
      let updated = false;
      
      // Check each default preference exists
      for (const key in completePrefs) {
        if (profile.preferences[key as keyof UserPreferences] === undefined) {
          // Using type assertion to unknown first to avoid type errors
          (profile.preferences as unknown as Record<string, unknown>)[key] = 
            completePrefs[key as keyof UserPreferences];
          updated = true;
        }
      }
      
      if (updated) {
        needsSave = true;
      }
    });
    
    if (needsSave) {
      this.saveUser(user);
    }
  }

  /**
   * Generate preference data for AI recommendations based on user behavior
   */
  public async getUserPreferenceData(profileId?: string): Promise<UserPreferenceData> {
    const profile = profileId
      ? this.getProfileById(profileId)
      : this.getActiveProfile();
      
    if (!profile) {
      return this.getDefaultPreferenceData();
    }
    
    // Get all content for reference
    const allContent = await this.contentService.getAllContent();
    
    // Compile watch history data with percentages
    const watchHistory = await Promise.all(
      profile.recentlyWatched.map(async (item) => {
        const progress = await this.contentService.getWatchProgress(item.contentId, item.episodeId);
        
        return {
          contentId: item.contentId,
          watchedAt: item.timestamp,
          percentComplete: progress?.percentage || 0,
          rewatched: profile.recentlyWatched.filter(
            i => i.contentId === item.contentId && i.episodeId === item.episodeId
          ).length > 1
        };
      })
    );

    // Extract and weigh genre preferences
    const genreCounts: Record<string, number> = {};
    const dislikedGenres = new Set<string>();
    
    // Process favorites and watch history to extract genre preferences
    for (const contentId of profile.favoriteContentIds) {
      const contentItem = allContent.find(item => item.id === contentId);
      if (contentItem) {
        contentItem.genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 2; // Higher weight for favorites
        });
      }
    }
    
    // Process watch history
    for (const item of watchHistory) {
      const contentItem = allContent.find(c => c.id === item.contentId);
      if (!contentItem) continue;
      
      // Add weight based on completion percentage
      const weight = item.percentComplete < 25 ? -0.5 : // Less than 25% - might not like it
                    (item.percentComplete >= 90 ? 1.5 : 1); // Completed - stronger signal
                    
      // Add extra weight for rewatched content
      const rewatch = item.rewatched ? 1 : 0;
      
      contentItem.genres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + weight + rewatch;
        
        // Add to disliked if very low completion and not rewatched
        if (item.percentComplete < 15 && !item.rewatched) {
          dislikedGenres.add(genre);
        }
      });
    }
    
    // Process watchlist items
    for (const contentId of profile.watchlist) {
      const contentItem = allContent.find(item => item.id === contentId);
      if (contentItem) {
        contentItem.genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 0.5; // Lower weight for watchlist
        });
      }
    }
    
    // Sort genres by weight and convert to required format
    const favoriteGenres = Object.entries(genreCounts)
      .filter(([genre, count]) => count > 0 && !dislikedGenres.has(genre))
      .sort((a, b) => b[1] - a[1])
      .map(([genre, weight]) => ({ genre, weight }));
    
    // Determine viewing patterns
    const viewingPatterns = this.analyzeViewingPatterns(watchHistory, allContent);
    
    return {
      favoriteGenres,
      dislikedGenres: Array.from(dislikedGenres),
      favoriteActors: [], // Not tracking actors in our mock data
      viewingPatterns,
      watchHistory
    };
  }

  /**
   * Analyze viewing patterns from watch history
   */
  private analyzeViewingPatterns(
    watchHistory: UserPreferenceData['watchHistory'], 
    allContent: ContentItem[]
  ) {
    if (watchHistory.length === 0) {
      return {};
    }
    
    // Count durations to determine preferred content length
    const durations: number[] = [];
    const ratings = new Set<string>();
    
    for (const item of watchHistory) {
      const content = allContent.find(c => c.id === item.contentId);
      if (!content) continue;
      
      durations.push(content.duration);
      if (content.ageRating) {
        ratings.add(content.ageRating);
      }
    }
    
    // Determine preferred content length
    const averageDuration = durations.reduce((sum, val) => sum + val, 0) / durations.length;
    let preferredLength: 'short' | 'medium' | 'long' = 'medium';
    
    if (averageDuration < 40) {
      preferredLength = 'short';
    } else if (averageDuration > 120) {
      preferredLength = 'long';
    }
    
    // Extract release years to determine preferred era
    const releaseYears = watchHistory
      .map(item => {
        const content = allContent.find(c => c.id === item.contentId);
        return content?.releaseYear;
      })
      .filter(Boolean) as number[];
    
    const currentYear = new Date().getFullYear();
    const averageReleaseYear = releaseYears.reduce((sum, val) => sum + val, 0) / releaseYears.length;
    
    let preferredReleaseEra: 'classic' | 'recent' | 'new' = 'recent';
    
    if (currentYear - averageReleaseYear > 15) {
      preferredReleaseEra = 'classic';
    } else if (currentYear - averageReleaseYear < 3) {
      preferredReleaseEra = 'new';
    }
    
    return {
      preferredLength,
      preferredReleaseEra,
      preferredRating: Array.from(ratings)
    };
  }

  /**
   * Get default preference data for new profiles
   */
  private getDefaultPreferenceData(): UserPreferenceData {
    return {
      favoriteGenres: [],
      dislikedGenres: [],
      favoriteActors: [],
      viewingPatterns: {},
      watchHistory: []
    };
  }

  /**
   * Get a profile by ID
   */
  private getProfileById(profileId: string): UserProfile | null {
    const user = this.getUser();
    if (!user) return null;
    
    return user.profiles.find(p => p.id === profileId) || null;
  }

  /**
   * Record user feedback for content recommendations
   */
  public recordRecommendationFeedback(
    contentId: string, 
    liked: boolean, 
    source: 'recommendation' | 'surprise' = 'recommendation'
  ): void {
    const profile = this.getActiveProfile();
    if (!profile) return;
    
    // Store feedback in localStorage
    const feedbackKey = `${this.storageKeyPrefix}recommendation_feedback`;
    const existingFeedback = JSON.parse(localStorage.getItem(feedbackKey) || '[]');
    
    existingFeedback.push({
      profileId: profile.id,
      contentId,
      liked,
      source,
      timestamp: new Date().toISOString()
    });
    
    // Keep only the most recent 100 feedback items
    const trimmedFeedback = existingFeedback.slice(-100);
    localStorage.setItem(feedbackKey, JSON.stringify(trimmedFeedback));
    
    // Add to favorites or remove based on feedback
    if (liked) {
      this.addToFavorites(contentId);
    }
  }

  /**
   * Reset AI recommendation preferences
   */
  public resetRecommendationPreferences(): void {
    // Clear recommendation feedback
    localStorage.removeItem(`${this.storageKeyPrefix}recommendation_feedback`);
    
    // Clear surprise history
    localStorage.removeItem(`${this.storageKeyPrefix}surprise_history`);
  }
}

export default PreferencesService; 