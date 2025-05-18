import { useCallback, useState, useEffect } from 'react';
import PreferencesService from '../services/PreferencesService';
import type { User, UserProfile, UserPreferences, RecentlyWatchedItem } from '../types/User';

/**
 * Custom hook for accessing user preferences and operations
 */
export const usePreferences = () => {
  const preferencesService = PreferencesService.getInstance();
  const [user, setUser] = useState<User | null>(null);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<RecentlyWatchedItem[]>([]);
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize user data
   */
  const initialize = useCallback((): User => {
    try {
      const initializedUser = preferencesService.initializeUser();
      setUser(initializedUser);
      return initializedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize user';
      setError(errorMessage);
      throw err;
    }
  }, [preferencesService]);

  // Initialize user data on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Keep active profile and preferences in sync with user
  useEffect(() => {
    if (user) {
      const profile = preferencesService.getActiveProfile();
      setActiveProfile(profile);
      setPreferences(profile?.preferences || null);
      setFavorites(profile?.favoriteContentIds || []);
      setWatchlist(profile?.watchlist || []);
      setRecentlyWatched(profile?.recentlyWatched || []);
    }
  }, [user, preferencesService]);

  /**
   * Update specific preferences
   */
  const updatePrefs = useCallback((prefs: Partial<UserPreferences>): UserPreferences => {
    try {
      const updatedPreferences = preferencesService.updatePreferences(prefs);
      setPreferences(updatedPreferences);
      return updatedPreferences;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(errorMessage);
      throw err;
    }
  }, [preferencesService]);

  /**
   * Reset preferences to default values
   */
  const resetPrefs = useCallback((): UserPreferences => {
    try {
      const defaultPreferences = preferencesService.resetPreferences();
      setPreferences(defaultPreferences);
      return defaultPreferences;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset preferences';
      setError(errorMessage);
      throw err;
    }
  }, [preferencesService]);

  /**
   * Get active user profile
   */
  const getProfile = useCallback((): UserProfile | null => {
    return preferencesService.getActiveProfile();
  }, [preferencesService]);

  /**
   * Switch to different profile
   */
  const switchToProfile = useCallback((profileId: string): UserProfile | null => {
    try {
      const profile = preferencesService.switchProfile(profileId);
      if (profile) {
        setActiveProfile(profile);
        setPreferences(profile.preferences);
        setFavorites(profile.favoriteContentIds);
        setWatchlist(profile.watchlist);
        setRecentlyWatched(profile.recentlyWatched);
      }
      return profile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch profile';
      setError(errorMessage);
      return null;
    }
  }, [preferencesService]);

  /**
   * Create a new profile
   */
  const createNewProfile = useCallback((name: string, isKidsProfile?: boolean): UserProfile => {
    try {
      const newProfile = preferencesService.createProfile(name, isKidsProfile);
      setActiveProfile(newProfile);
      setPreferences(newProfile.preferences);
      setFavorites([]);
      setWatchlist([]);
      setRecentlyWatched([]);
      setUser(preferencesService.getUser()); // Update user with new profile
      return newProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
      setError(errorMessage);
      throw err;
    }
  }, [preferencesService]);

  /**
   * Delete a profile
   */
  const deleteUserProfile = useCallback((profileId: string): boolean => {
    try {
      const result = preferencesService.deleteProfile(profileId);
      if (result) {
        // Refresh user state to get updated profile list and active profile
        setUser(preferencesService.getUser());
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete profile';
      setError(errorMessage);
      return false;
    }
  }, [preferencesService]);

  /**
   * Add content to favorites
   */
  const addFavorite = useCallback((contentId: string): string[] => {
    try {
      const updatedFavorites = preferencesService.addToFavorites(contentId);
      setFavorites(updatedFavorites);
      return updatedFavorites;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to favorites';
      setError(errorMessage);
      return favorites;
    }
  }, [preferencesService, favorites]);

  /**
   * Remove content from favorites
   */
  const removeFavorite = useCallback((contentId: string): string[] => {
    try {
      const updatedFavorites = preferencesService.removeFromFavorites(contentId);
      setFavorites(updatedFavorites);
      return updatedFavorites;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove from favorites';
      setError(errorMessage);
      return favorites;
    }
  }, [preferencesService, favorites]);

  /**
   * Check if content is in favorites
   */
  const isFavorite = useCallback((contentId: string): boolean => {
    return preferencesService.isInFavorites(contentId);
  }, [preferencesService]);

  /**
   * Add content to watchlist
   */
  const addToWatch = useCallback((contentId: string): string[] => {
    try {
      const updatedWatchlist = preferencesService.addToWatchlist(contentId);
      setWatchlist(updatedWatchlist);
      return updatedWatchlist;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to watchlist';
      setError(errorMessage);
      return watchlist;
    }
  }, [preferencesService, watchlist]);

  /**
   * Remove content from watchlist
   */
  const removeFromWatch = useCallback((contentId: string): string[] => {
    try {
      const updatedWatchlist = preferencesService.removeFromWatchlist(contentId);
      setWatchlist(updatedWatchlist);
      return updatedWatchlist;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove from watchlist';
      setError(errorMessage);
      return watchlist;
    }
  }, [preferencesService, watchlist]);

  /**
   * Check if content is in watchlist
   */
  const isInWatch = useCallback((contentId: string): boolean => {
    return preferencesService.isInWatchlist(contentId);
  }, [preferencesService]);

  /**
   * Add content to recently watched
   */
  const addRecent = useCallback((contentId: string, episodeId?: string): void => {
    try {
      preferencesService.addToRecentlyWatched(contentId, episodeId);
      // Update local state with the latest data
      const profile = preferencesService.getActiveProfile();
      if (profile) {
        setRecentlyWatched(profile.recentlyWatched);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to recently watched';
      setError(errorMessage);
    }
  }, [preferencesService]);

  /**
   * Clear all user data
   */
  const clearData = useCallback((): void => {
    try {
      preferencesService.clearAllData();
      setUser(null);
      setActiveProfile(null);
      setPreferences(null);
      setFavorites([]);
      setWatchlist([]);
      setRecentlyWatched([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear data';
      setError(errorMessage);
    }
  }, [preferencesService]);

  /**
   * Migrate preferences for app updates
   */
  const migrate = useCallback((): void => {
    try {
      preferencesService.migratePreferences();
      // Refresh state after migration
      setUser(preferencesService.getUser());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to migrate preferences';
      setError(errorMessage);
    }
  }, [preferencesService]);

  return {
    // State
    user,
    activeProfile,
    preferences,
    favorites,
    watchlist,
    recentlyWatched,
    isLoading,
    error,
    
    // Operations
    initialize,
    updatePreferences: updatePrefs,
    resetPreferences: resetPrefs,
    getActiveProfile: getProfile,
    switchProfile: switchToProfile,
    createProfile: createNewProfile,
    deleteProfile: deleteUserProfile,
    addToFavorites: addFavorite,
    removeFromFavorites: removeFavorite,
    isInFavorites: isFavorite,
    addToWatchlist: addToWatch,
    removeFromWatchlist: removeFromWatch,
    isInWatchlist: isInWatch,
    addToRecentlyWatched: addRecent,
    clearAllData: clearData,
    migratePreferences: migrate
  };
};

export default usePreferences; 