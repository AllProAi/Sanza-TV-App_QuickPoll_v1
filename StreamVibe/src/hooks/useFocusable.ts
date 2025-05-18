import { useRef, useState, useEffect } from 'react';

interface UseFocusableOptions {
  defaultFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onEnter?: () => void;
}

export function useFocusable<T extends HTMLElement>(options: UseFocusableOptions = {}) {
  const ref = useRef<T>(null);
  const [focused, setFocused] = useState(options.defaultFocus || false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleFocus = () => {
      setFocused(true);
      options.onFocus?.();
    };

    const handleBlur = () => {
      setFocused(false);
      options.onBlur?.();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && focused) {
        options.onEnter?.();
        element.click();
      }
    };

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);
    window.addEventListener('keydown', handleKeyDown);

    // Auto-focus if defaultFocus is true
    if (options.defaultFocus && element) {
      element.focus();
    }

    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [options.defaultFocus, options.onFocus, options.onBlur, options.onEnter, focused]);

  return { ref, focused };
}

export default useFocusable; 