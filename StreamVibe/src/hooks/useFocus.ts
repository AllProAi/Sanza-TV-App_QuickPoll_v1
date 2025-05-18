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
  const idRef = useRef<string>(providedId || `focusable-${Math.random().toString(36).substring(2, 9)}`);
  const id = idRef.current;
  
  const { registerFocusable, unregisterFocusable, setFocus, currentFocus } = useNavigation();
  
  // Register this element with the navigation system
  useEffect(() => {
    if (elementRef.current) {
      registerFocusable(id, elementRef.current, neighbors);
    }
    
    return () => {
      unregisterFocusable(id);
    };
  }, [id, registerFocusable, unregisterFocusable, neighbors]);
  
  // Handle initialFocus
  useEffect(() => {
    if (initialFocus && elementRef.current) {
      setFocus(id);
    }
  }, [initialFocus, id, setFocus]);
  
  // Handle focus changes from the navigation system
  useEffect(() => {
    const isFocusedNow = currentFocus === id;
    setIsFocused(isFocusedNow);
    
    if (isFocusedNow && onFocus) {
      onFocus();
    } else if (!isFocusedNow && isFocused && onBlur) {
      onBlur();
    }
  }, [currentFocus, id, isFocused, onBlur, onFocus]);
  
  // Update neighbors when they change
  useEffect(() => {
    if (elementRef.current) {
      registerFocusable(id, elementRef.current, neighbors);
    }
  }, [registerFocusable, id, neighbors]);
  
  // Method to manually set focus to this element
  const focus = useCallback(() => {
    setFocus(id);
  }, [id, setFocus]);

  // Ref callback to set the element ref
  const ref = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
    if (element && initialFocus) {
      setFocus(id);
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