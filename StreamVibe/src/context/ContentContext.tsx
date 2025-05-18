import React, { createContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define content-related types
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  thumbnailUrl: string;
  type: 'movie' | 'show' | 'live';
  genre: string[];
  releaseYear?: number;
  duration?: number;
  rating?: number;
  isFavorite: boolean;
  progress?: number;
}

export interface Category {
  id: string;
  name: string;
  items: string[]; // References to content item IDs
}

export interface ContentState {
  items: Record<string, ContentItem>;
  categories: Record<string, Category>;
  featuredContent: string[];
  recentlyWatched: string[];
  favorites: string[];
  isLoading: boolean;
  error: string | null;
}

// Define action types
type ContentAction =
  | { type: 'FETCH_CONTENT_START' }
  | { type: 'FETCH_CONTENT_SUCCESS'; payload: { items: Record<string, ContentItem>, categories: Record<string, Category> } }
  | { type: 'FETCH_CONTENT_ERROR'; payload: string }
  | { type: 'ADD_TO_FAVORITES'; payload: string }
  | { type: 'REMOVE_FROM_FAVORITES'; payload: string }
  | { type: 'UPDATE_PROGRESS'; payload: { id: string; progress: number } }
  | { type: 'ADD_TO_RECENTLY_WATCHED'; payload: string }
  | { type: 'SET_FEATURED_CONTENT'; payload: string[] };

// Define initial state
const initialState: ContentState = {
  items: {},
  categories: {},
  featuredContent: [],
  recentlyWatched: [],
  favorites: [],
  isLoading: false,
  error: null,
};

// Create context
interface ContentContextType {
  state: ContentState;
  dispatch: React.Dispatch<ContentAction>;
  fetchContent: () => Promise<void>;
  toggleFavorite: (contentId: string) => void;
  updateProgress: (contentId: string, progress: number) => void;
  markAsWatched: (contentId: string) => void;
}

const ContentContext = createContext<ContentContextType>({
  state: initialState,
  dispatch: () => null,
  fetchContent: async () => {},
  toggleFavorite: () => {},
  updateProgress: () => {},
  markAsWatched: () => {},
});

// Create reducer
const contentReducer = (state: ContentState, action: ContentAction): ContentState => {
  switch (action.type) {
    case 'FETCH_CONTENT_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'FETCH_CONTENT_SUCCESS':
      return {
        ...state,
        items: action.payload.items,
        categories: action.payload.categories,
        isLoading: false,
      };
    case 'FETCH_CONTENT_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'ADD_TO_FAVORITES': {
      const updatedItems = { ...state.items };
      if (updatedItems[action.payload]) {
        updatedItems[action.payload] = {
          ...updatedItems[action.payload],
          isFavorite: true,
        };
      }
      return {
        ...state,
        items: updatedItems,
        favorites: [...state.favorites, action.payload],
      };
    }
    case 'REMOVE_FROM_FAVORITES': {
      const updatedItems = { ...state.items };
      if (updatedItems[action.payload]) {
        updatedItems[action.payload] = {
          ...updatedItems[action.payload],
          isFavorite: false,
        };
      }
      return {
        ...state,
        items: updatedItems,
        favorites: state.favorites.filter(id => id !== action.payload),
      };
    }
    case 'UPDATE_PROGRESS': {
      const { id, progress } = action.payload;
      const updatedItems = { ...state.items };
      if (updatedItems[id]) {
        updatedItems[id] = {
          ...updatedItems[id],
          progress,
        };
      }
      return {
        ...state,
        items: updatedItems,
      };
    }
    case 'ADD_TO_RECENTLY_WATCHED': {
      const recentlyWatched = [
        action.payload,
        ...state.recentlyWatched.filter(id => id !== action.payload),
      ].slice(0, 20); // Limit to 20 items
      
      return {
        ...state,
        recentlyWatched,
      };
    }
    case 'SET_FEATURED_CONTENT':
      return {
        ...state,
        featuredContent: action.payload,
      };
    default:
      return state;
  }
};

// Create provider
interface ContentProviderProps {
  children: ReactNode;
}

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(contentReducer, initialState, () => {
    // Load persisted favorites and recently watched from localStorage
    const persistedData = localStorage.getItem('contentState');
    if (persistedData) {
      const parsedData = JSON.parse(persistedData);
      return {
        ...initialState,
        favorites: parsedData.favorites || [],
        recentlyWatched: parsedData.recentlyWatched || [],
      };
    }
    return initialState;
  });

  // Example function to fetch content (would connect to an API in a real app)
  const fetchContent = React.useCallback(async () => {
    dispatch({ type: 'FETCH_CONTENT_START' });
    try {
      // Simulate API call with timeout
      // In a real application, this would be a fetch request to your API
      const mockFetch = new Promise<{ items: Record<string, ContentItem>, categories: Record<string, Category> }>(resolve => {
        setTimeout(() => {
          // Mock data structure
          resolve({
            items: {
              // Mock items would go here
            },
            categories: {
              // Mock categories would go here
            }
          });
        }, 1000);
      });

      const data = await mockFetch;
      dispatch({ type: 'FETCH_CONTENT_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_CONTENT_ERROR', payload: (error as Error).message });
    }
  }, []);

  // Toggle favorite status for a content item
  const toggleFavorite = React.useCallback((contentId: string) => {
    if (state.favorites.includes(contentId)) {
      dispatch({ type: 'REMOVE_FROM_FAVORITES', payload: contentId });
    } else {
      dispatch({ type: 'ADD_TO_FAVORITES', payload: contentId });
    }
  }, [state.favorites]);

  // Update progress for a content item
  const updateProgress = React.useCallback((contentId: string, progress: number) => {
    dispatch({ type: 'UPDATE_PROGRESS', payload: { id: contentId, progress } });
    dispatch({ type: 'ADD_TO_RECENTLY_WATCHED', payload: contentId });
  }, []);

  // Mark content as watched (add to recently watched)
  const markAsWatched = React.useCallback((contentId: string) => {
    dispatch({ type: 'ADD_TO_RECENTLY_WATCHED', payload: contentId });
  }, []);

  // Persist favorites and recently watched to localStorage
  useEffect(() => {
    localStorage.setItem('contentState', JSON.stringify({
      favorites: state.favorites,
      recentlyWatched: state.recentlyWatched,
    }));
  }, [state.favorites, state.recentlyWatched]);

  // Context value
  const contextValue: ContentContextType = {
    state,
    dispatch,
    fetchContent,
    toggleFavorite,
    updateProgress,
    markAsWatched,
  };

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  );
};

export default ContentContext; 