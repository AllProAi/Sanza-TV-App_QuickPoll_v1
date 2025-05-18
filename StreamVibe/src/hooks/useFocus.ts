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
  const registeredRef = useRef(false);
  
  // Keep the ID stable across renders to prevent unnecessary re-registrations
  const idRef = useRef<string>(providedId || `focusable-${Math.random().toString(36).substring(2, 9)}`);
  const id = idRef.current;
  
  const { registerFocusable, unregisterFocusable, setFocus, currentFocus } = useNavigation();
  
  // Register the element and clean up on unmount
  useEffect(() => {
    let registrationTimeout: number | null = null;
    let unregistrationTimeout: number | null = null;
    
    // Only register when we have a valid element
    if (elementRef.current && !registeredRef.current) {
      // Debounce registration to prevent unnecessary registrations/unregistrations
      registrationTimeout = window.setTimeout(() => {
        console.log(`Registering focusable element: ${id}`);
        registerFocusable(id, elementRef.current!, neighbors);
        registeredRef.current = true;
      }, 50); // Short delay to let the DOM stabilize
    }
    
    // Cleanup function
    return () => {
      // Cancel any pending registration
      if (registrationTimeout) {
        clearTimeout(registrationTimeout);
      }
      
      // Cancel any pending unregistration
      if (unregistrationTimeout) {
        clearTimeout(unregistrationTimeout);
      }
      
      // Debounce unregistration to prevent flickering during re-renders
      if (registeredRef.current) {
        unregistrationTimeout = window.setTimeout(() => {
          console.log(`Unregistering focusable element: ${id}`);
          unregisterFocusable(id);
          registeredRef.current = false;
        }, 100);
      }
    };
  }, [id, neighbors, registerFocusable, unregisterFocusable]);
  
  // Handle initialFocus only once when the component mounts
  useEffect(() => {
    if (initialFocus && elementRef.current) {
      console.log(`Setting initial focus to: ${id}`);
      // Use RAF + setTimeout to ensure DOM is fully ready
      requestAnimationFrame(() => {
        setTimeout(() => {
          setFocus(id);
        }, 50);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array, only run on mount
  
  // Handle focus changes from the navigation system
  useEffect(() => {
    const isFocusedNow = currentFocus === id;
    
    if (isFocusedNow !== isFocused) {
      setIsFocused(isFocusedNow);
      
      if (isFocusedNow) {
        // Element gained focus
        console.log(`Element gained focus: ${id}`);
        if (onFocus) {
          // Use requestAnimationFrame to ensure DOM updates complete
          requestAnimationFrame(() => {
            onFocus();
          });
        }
      } else if (!isFocusedNow && isFocused) {
        // Element lost focus
        console.log(`Element lost focus: ${id}`);
        if (onBlur) {
          requestAnimationFrame(() => {
            onBlur();
          });
        }
      }
    }
  }, [currentFocus, id, isFocused, onBlur, onFocus]);
  
  // Method to manually set focus to this element
  const focus = useCallback(() => {
    console.log(`Manual focus triggered for: ${id}`);
    if (elementRef.current) {
      setFocus(id);
    } else {
      console.warn(`Cannot focus element ${id} - no DOM element available`);
    }
  }, [id, setFocus]);

  // Ref callback to set the element ref
  const ref = useCallback((element: HTMLElement | null) => {
    if (element !== elementRef.current) {
      elementRef.current = element;
      
      // If we have a new element and initialFocus is true, set focus
      if (element && initialFocus) {
        console.log(`Setting focus on mount to: ${id}`);
        // Use setTimeout to ensure the element is fully mounted and in the DOM
        setTimeout(() => {
          setFocus(id);
        }, 100);
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