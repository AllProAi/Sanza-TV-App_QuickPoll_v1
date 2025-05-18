import { useNavigate, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { useRef, useCallback, useEffect, useState } from 'react';
import senzaSDK, { SenzaEventType } from './senza-sdk';
import type { SenzaEvent, KeyEventData } from './senza-sdk';

// Navigation history item
export interface NavigationHistoryItem {
  path: string;
  state: Record<string, unknown>;
  timestamp: number;
}

// Singleton class to handle navigation history outside of React components
class NavigationHistoryService {
  private history: NavigationHistoryItem[] = [];
  private maxHistoryLength = 50;
  private currentLocation: Location | null = null;

  /**
   * Add location to history
   * @param location Location to add
   * @param state Optional state data
   */
  addToHistory(location: Location, state: Record<string, unknown> | null = null): void {
    this.currentLocation = location;
    
    this.history.unshift({
      path: location.pathname,
      state: state || (location.state as Record<string, unknown>),
      timestamp: Date.now(),
    });
    
    // Trim history if it gets too long
    if (this.history.length > this.maxHistoryLength) {
      this.history = this.history.slice(0, this.maxHistoryLength);
    }
  }

  /**
   * Get navigation history
   * @returns Navigation history
   */
  getHistory(): NavigationHistoryItem[] {
    return [...this.history];
  }

  /**
   * Get current location
   * @returns Current location
   */
  getCurrentLocation(): Location | null {
    return this.currentLocation;
  }

  /**
   * Clear navigation history
   */
  clearHistory(): void {
    this.history = [];
  }
}

// Create singleton instance
export const navigationHistory = new NavigationHistoryService();

/**
 * Hook to use navigation with history tracking
 * @returns Enhanced navigation functions
 */
export function useNavigationWithHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const previousPathRef = useRef<string | null>(null);

  // Track location changes
  useEffect(() => {
    if (location.pathname !== previousPathRef.current) {
      navigationHistory.addToHistory(location);
      previousPathRef.current = location.pathname;
    }
  }, [location]);

  // Enhanced navigation with history tracking
  const navigateTo = useCallback((path: string, state?: Record<string, unknown>) => {
    navigate(path, { state });
  }, [navigate]);

  // Navigate back
  const goBack = useCallback(() => {
    const history = navigationHistory.getHistory();
    if (history.length > 1) {
      // Navigate to previous page
      navigate(-1);
    } else {
      // If no previous page, navigate to home
      navigate('/');
    }
  }, [navigate]);

  // Navigate home
  const goHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return {
    navigate: navigateTo,
    goBack,
    goHome,
    location
  };
}

/**
 * Hook for handling TV remote control navigation
 * @param onArrowKey Optional callback for arrow key events
 * @returns Remote control navigation utilities
 */
export function useRemoteNavigation(onArrowKey?: (key: string) => void) {
  const { goBack, goHome } = useNavigationWithHistory();
  
  // Handle key events
  const handleKeyEvent = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
      case 'Backspace':
        goBack();
        break;
      case 'Home':
        goHome();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        if (onArrowKey) {
          onArrowKey(event.key);
        }
        break;
    }
  }, [goBack, goHome, onArrowKey]);

  // Handle SDK key events
  const handleSDKKeyEvent = useCallback((event: SenzaEvent) => {
    if (event.type === SenzaEventType.KEY_EVENT && event.data) {
      // Safely access key property after type narrowing
      const keyEventData = event.data as KeyEventData;
      if ('key' in keyEventData) {
        const key = keyEventData.key;
        switch (key) {
          case 'Escape':
          case 'Backspace':
            goBack();
            break;
          case 'Home':
            goHome();
            break;
          case 'ArrowUp':
          case 'ArrowDown':
          case 'ArrowLeft':
          case 'ArrowRight':
            if (onArrowKey) {
              onArrowKey(key);
            }
            break;
        }
      }
    }
  }, [goBack, goHome, onArrowKey]);

  // Set up event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyEvent);
    const unsubscribe = senzaSDK.subscribe(handleSDKKeyEvent);
    
    return () => {
      window.removeEventListener('keydown', handleKeyEvent);
      unsubscribe();
    };
  }, [handleKeyEvent, handleSDKKeyEvent]);

  return {
    goBack,
    goHome,
  };
}

/**
 * Hook to lazily load route components
 * @param getComponent Function to load the component 
 * @returns Loaded component or fallback
 */
export interface ModuleWithDefaultExport {
  default: React.ComponentType;
  [key: string]: unknown;
}

export function useLazyRoute(getComponent: () => Promise<ModuleWithDefaultExport | React.ComponentType>) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadComponent = async () => {
      try {
        setLoading(true);
        const module = await getComponent();
        
        // Determine if we have a default export or direct component
        let actualComponent: React.ComponentType;
        if (typeof module === 'object' && 'default' in module) {
          actualComponent = module.default;
        } else {
          actualComponent = module as React.ComponentType;
        }
        
        if (isMounted) {
          setComponent(actualComponent);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load component'));
          setLoading(false);
        }
      }
    };
    
    loadComponent();
    
    return () => {
      isMounted = false;
    };
  }, [getComponent]);

  return { Component, loading, error };
} 