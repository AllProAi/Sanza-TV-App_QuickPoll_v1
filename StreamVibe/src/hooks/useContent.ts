import { useCallback, useState } from 'react';
import ContentService from '../services/ContentService';
import type { ContentItem, Category, ContentFilter, ContentSortOption, WatchProgress } from '../types/Content';

/**
 * Custom hook for accessing content data and operations
 */
export const useContent = () => {
  const contentService = ContentService.getInstance();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all available content
   */
  const getAllContent = useCallback(async (): Promise<ContentItem[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await contentService.getAllContent();
      setContentItems(items);
      return items;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [contentService]);

  /**
   * Get all categories
   */
  const getCategories = useCallback(async (): Promise<Category[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const categories = await contentService.getCategories();
      setCategories(categories);
      return categories;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [contentService]);

  /**
   * Get content items for a specific category
   */
  const getCategoryContent = useCallback(async (categoryId: string): Promise<ContentItem[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await contentService.getCategoryContent(categoryId);
      return items;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load category content';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [contentService]);

  /**
   * Search for content by query string
   */
  const search = useCallback(async (query: string): Promise<ContentItem[]> => {
    setIsLoading(true);
    setError(null);
    try {
      return await contentService.searchContent(query);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search content';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [contentService]);

  /**
   * Filter content by various criteria
   */
  const filter = useCallback(async (filter: ContentFilter): Promise<ContentItem[]> => {
    setIsLoading(true);
    setError(null);
    try {
      return await contentService.filterContent(filter);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to filter content';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [contentService]);

  /**
   * Sort content by specified criteria
   */
  const sort = useCallback((content: ContentItem[], sortOption: ContentSortOption): ContentItem[] => {
    return contentService.sortContent(content, sortOption);
  }, [contentService]);

  /**
   * Get content by ID
   */
  const getContent = useCallback(async (id: string): Promise<ContentItem | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await contentService.getContentById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get content';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contentService]);

  /**
   * Get watch progress for a content item
   */
  const getProgress = useCallback(async (contentId: string, episodeId?: string): Promise<WatchProgress | null> => {
    try {
      return await contentService.getWatchProgress(contentId, episodeId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get watch progress';
      setError(errorMessage);
      return null;
    }
  }, [contentService]);

  /**
   * Save watch progress for a content item
   */
  const saveProgress = useCallback(async (progress: WatchProgress): Promise<void> => {
    try {
      await contentService.saveWatchProgress(progress);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save watch progress';
      setError(errorMessage);
    }
  }, [contentService]);

  /**
   * Get recently watched content
   */
  const getRecentlyWatched = useCallback(async (limit?: number): Promise<ContentItem[]> => {
    setIsLoading(true);
    setError(null);
    try {
      return await contentService.getRecentlyWatched(limit);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get recently watched';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [contentService]);

  /**
   * Clear content cache
   */
  const clearCache = useCallback((): void => {
    contentService.clearCache();
  }, [contentService]);

  return {
    // State
    contentItems,
    categories,
    isLoading,
    error,
    
    // Operations
    getAllContent,
    getCategories,
    getCategoryContent,
    search,
    filter,
    sort,
    getContent,
    getProgress,
    saveProgress,
    getRecentlyWatched,
    clearCache
  };
};

export default useContent; 