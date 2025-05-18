import { useRef, useEffect, useState, useCallback } from 'react';
import useNavigation from './useNavigation';

interface UseFocusOptions {
  id?: string;
  initialFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  neighbors?: {
    up?: string;
    down?: string;
    left?: string;
    right?: string;
  };
}

/**
 * Hook for managing focus on TV-optimized UI elements
 */
export const useFocus = ({
  id: providedId,
  initialFocus = false,
  onFocus,
  onBlur,
  neighbors = {},
}: UseFocusOptions = {}) => {
  const elementRef = useRef<HTMLElement | null>(null);
  const [isFocused, setIsFocused] = useState(initialFocus);
  // Keep the ID stable across renders to prevent unnecessary re-registrations
  const idRef = useRef<string>(providedId || `focusable-${Math.random().toString(36).substring(2, 9)}`);
  const id = idRef.current;
  
  const { registerFocusable, unregisterFocusable, setFocus, currentFocus } = useNavigation();
  
  // Only register once when the element is available
  // Combined the registration and neighbor updates into a single effect
  useEffect(() => {
    if (elementRef.current) {
      registerFocusable(id, elementRef.current, neighbors);
    }
    
    return () => {
      unregisterFocusable(id);
    };
  }, [id, neighbors]); // Removed registerFocusable and unregisterFocusable from dependency array
  
  // Handle initialFocus only once when the component mounts
  useEffect(() => {
    if (initialFocus && elementRef.current) {
      // Use setTimeout to break potential render cycles
      const timeoutId = setTimeout(() => {
        setFocus(id);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, []); // Empty dependency array, only run on mount
  
  // Handle focus changes from the navigation system
  useEffect(() => {
    const isFocusedNow = currentFocus === id;
    
    if (isFocusedNow !== isFocused) {
      setIsFocused(isFocusedNow);
      
      // Use setTimeout to prevent potential cascading effects
      if (isFocusedNow && onFocus) {
        setTimeout(() => onFocus(), 0);
      } else if (!isFocusedNow && isFocused && onBlur) {
        setTimeout(() => onBlur(), 0);
      }
    }
  }, [currentFocus, id, isFocused]); // Removed onBlur and onFocus from dependency array
  
  // Removed the duplicate effect for neighbors since it's now combined with the registration effect above
  
  // Method to manually set focus to this element
  const focus = useCallback(() => {
    // Use setTimeout to break potential render cycles
    setTimeout(() => {
      setFocus(id);
    }, 0);
  }, [id, setFocus]);

  // Ref callback to set the element ref
  const ref = useCallback((element: HTMLElement | null) => {
    if (element !== elementRef.current) {
      elementRef.current = element;
      
      if (element && initialFocus) {
        // Use setTimeout to break potential render cycles
        setTimeout(() => {
          setFocus(id);
        }, 0);
      }
    }
  }, [id, initialFocus, setFocus]);
  
  return {
    ref,
    isFocused,
    focus,
    id,
    tabIndex: 0, // Make sure element is focusable
  };
}; 