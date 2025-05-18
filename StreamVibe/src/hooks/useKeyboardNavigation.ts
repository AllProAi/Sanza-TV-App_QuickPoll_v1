import { useEffect, useCallback, useRef } from 'react';

type KeyCombo = string | string[];
type KeyHandler = (event: KeyboardEvent) => void;

interface KeyboardShortcut {
  key: KeyCombo;
  handler: KeyHandler;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  context?: string;
}

interface UseKeyboardNavigationOptions {
  global?: boolean;
  context?: string;
  element?: HTMLElement | null;
}

/**
 * Hook for managing keyboard shortcuts and navigation
 */
export const useKeyboardNavigation = (
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardNavigationOptions = {}
) => {
  const { global = false, context = 'default', element = null } = options;
  
  // Use a ref to keep track of the latest shortcuts without triggering effect re-runs
  const shortcutsRef = useRef<KeyboardShortcut[]>(shortcuts);
  shortcutsRef.current = shortcuts;
  
  // Use a ref to keep track of the latest context without triggering effect re-runs
  const contextRef = useRef<string>(context);
  contextRef.current = context;
  
  // Normalize key combinations for comparison
  const normalizeKey = useCallback((key: string): string => {
    const parts = key.toLowerCase().split('+').map(k => k.trim());
    return [...new Set(parts)].sort().join('+');
  }, []);
  
  // Check if a keyboard event matches a key combo
  const matchesKeyCombo = useCallback((event: KeyboardEvent, combo: KeyCombo): boolean => {
    // Handle array of key combos (any match counts)
    if (Array.isArray(combo)) {
      return combo.some(c => matchesKeyCombo(event, c));
    }
    
    const normalizedCombo = normalizeKey(combo);
    
    // Build the actual pressed key combination
    const pressed: string[] = [];
    if (event.ctrlKey) pressed.push('ctrl');
    if (event.altKey) pressed.push('alt');
    if (event.shiftKey) pressed.push('shift');
    if (event.metaKey) pressed.push('meta');
    
    // Add the main key if it's not a modifier
    const key = event.key.toLowerCase();
    if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
      pressed.push(key);
    }
    
    const normalizedPressed = normalizeKey(pressed.join('+'));
    return normalizedCombo === normalizedPressed;
  }, [normalizeKey]);
  
  // The main keyboard event handler
  const handleKeyDown = useCallback((event: Event) => {
    const keyEvent = event as KeyboardEvent;
    for (const shortcut of shortcutsRef.current) {
      // Skip shortcuts for other contexts
      if (shortcut.context && shortcut.context !== contextRef.current) {
        continue;
      }
      
      if (matchesKeyCombo(keyEvent, shortcut.key)) {
        if (shortcut.preventDefault) {
          keyEvent.preventDefault();
        }
        if (shortcut.stopPropagation) {
          keyEvent.stopPropagation();
        }
        shortcut.handler(keyEvent);
        return;
      }
    }
  }, [matchesKeyCombo]);
  
  useEffect(() => {
    // Determine which element to attach the listener to
    const target = global ? window : element || window;
    
    target.addEventListener('keydown', handleKeyDown);
    return () => {
      target.removeEventListener('keydown', handleKeyDown);
    };
  }, [element, global, handleKeyDown]);
  
  // Expose a method to check if a key is currently being pressed
  const isKeyPressed = useCallback((key: string): boolean => {
    // This would need to maintain state of pressed keys
    // For simplicity, we're returning false here
    // Return false for any key
    return key ? false : false;
  }, []);
  
  return {
    isKeyPressed,
  };
}; 