import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';

interface FocusHistory {
  route: string;
  focusId: string;
}

interface FocusGroup {
  id: string;
  elements: string[];
  currentFocus: string | null;
}

interface NavigationContextType {
  currentFocus: string | null;
  setFocus: (id: string) => void;
  moveFocus: (direction: 'up' | 'down' | 'left' | 'right') => void;
  registerFocusable: (id: string, element: HTMLElement, neighbors?: {
    up?: string;
    down?: string;
    left?: string;
    right?: string;
  }) => void;
  unregisterFocusable: (id: string) => void;
  goBack: () => void;
  navigateToLastFocus: (route: string) => boolean;
  registerGroup: (groupId: string, elementIds: string[]) => void;
  unregisterGroup: (groupId: string) => void;
  setGroupFocus: (groupId: string, elementId: string) => void;
  focusGroup: (groupId: string) => void;
  trapFocus: (elementId: string) => void;
  releaseFocus: () => void;
  history: FocusHistory[];
}

interface FocusableElement {
  element: HTMLElement;
  neighbors: {
    up?: string;
    down?: string;
    left?: string;
    right?: string;
  };
  groupId?: string;
}

const NavigationContext = createContext<NavigationContextType>({
  currentFocus: null,
  setFocus: () => {},
  moveFocus: () => {},
  registerFocusable: () => {},
  unregisterFocusable: () => {},
  goBack: () => {},
  navigateToLastFocus: () => false,
  registerGroup: () => {},
  unregisterGroup: () => {},
  setGroupFocus: () => {},
  focusGroup: () => {},
  trapFocus: () => {},
  releaseFocus: () => {},
  history: [],
});

interface NavigationProviderProps {
  children: ReactNode;
  initialFocus?: string;
  maxHistoryLength?: number;
}

const NavigationProvider: React.FC<NavigationProviderProps> = ({ 
  children, 
  initialFocus,
  maxHistoryLength = 50,
}) => {
  const [currentFocus, setCurrentFocus] = useState<string | null>(initialFocus || null);
  const [focusableElements, setFocusableElements] = useState<Record<string, FocusableElement>>({});
  const [groups, setGroups] = useState<Record<string, FocusGroup>>({});
  const [history, setHistory] = useState<FocusHistory[]>([]);
  const [focusTrap, setFocusTrap] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  
  // Track current route for focus history
  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', updatePath);
    return () => window.removeEventListener('popstate', updatePath);
  }, []);
  
  // Find the nearest element in a specific direction
  const findNearestElement = useCallback((
    direction: 'up' | 'down' | 'left' | 'right',
    fromId: string
  ): string | null => {
    if (!focusableElements[fromId]) return null;
    
    const fromElement = focusableElements[fromId].element;
    const fromRect = fromElement.getBoundingClientRect();
    
    const candidates = Object.entries(focusableElements)
      .filter(([id]) => id !== fromId)
      .map(([id, value]) => ({
        id,
        element: value.element,
        rect: value.element.getBoundingClientRect(),
      }));
    
    // Filter candidates in the direction we're moving
    const filteredCandidates = candidates.filter(({ rect }) => {
      switch (direction) {
        case 'up': return rect.bottom <= fromRect.top;
        case 'down': return rect.top >= fromRect.bottom;
        case 'left': return rect.right <= fromRect.left;
        case 'right': return rect.left >= fromRect.right;
      }
    });
    
    if (!filteredCandidates.length) return null;
    
    // Calculate distance and find nearest
    const getDistance = (rect: DOMRect) => {
      const hCenter = rect.left + rect.width / 2;
      const vCenter = rect.top + rect.height / 2;
      const fromHCenter = fromRect.left + fromRect.width / 2;
      const fromVCenter = fromRect.top + fromRect.height / 2;
      
      switch (direction) {
        case 'up':
          return Math.sqrt(
            Math.pow(fromVCenter - rect.bottom, 2) + 
            Math.pow(fromHCenter - hCenter, 2)
          );
        case 'down':
          return Math.sqrt(
            Math.pow(rect.top - fromVCenter, 2) + 
            Math.pow(fromHCenter - hCenter, 2)
          );
        case 'left':
          return Math.sqrt(
            Math.pow(fromHCenter - rect.right, 2) + 
            Math.pow(fromVCenter - vCenter, 2)
          );
        case 'right':
          return Math.sqrt(
            Math.pow(rect.left - fromHCenter, 2) + 
            Math.pow(fromVCenter - vCenter, 2)
          );
      }
    };
    
    const sortedCandidates = filteredCandidates.sort((a, b) => 
      getDistance(a.rect) - getDistance(b.rect)
    );
    
    return sortedCandidates[0]?.id || null;
  }, [focusableElements]);
  
  const setFocus = useCallback((id: string) => {
    if (focusableElements[id]) {
      // Use setTimeout to break potential render cycles
      setTimeout(() => {
        try {
          // Focus the element, ensuring it's visible
          focusableElements[id].element.focus();
          
          // Ensure the element is visible in the viewport
          focusableElements[id].element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
          
          // Update the current focus state
          setCurrentFocus(id);
          
          // For debugging - log focus changes
          console.log(`Focus set to: ${id}`);
          
          // Add to history
          setHistory(prev => {
            const newHistory = prev.filter(item => item.route !== currentPath);
            return [{ route: currentPath, focusId: id }, ...newHistory].slice(0, maxHistoryLength);
          });
          
          // If element is part of a group, update group's current focus
          if (focusableElements[id].groupId) {
            const groupId = focusableElements[id].groupId;
            setGroups(prev => ({
              ...prev,
              [groupId!]: {
                ...prev[groupId!],
                currentFocus: id,
              }
            }));
          }
        } catch (error) {
          console.error(`Error setting focus to ${id}:`, error);
        }
      }, 0);
    } else {
      console.warn(`Attempted to focus element ${id} but it's not registered`);
    }
  }, [focusableElements, currentPath, maxHistoryLength]);

  const moveFocus = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!currentFocus || !focusableElements[currentFocus]) return;
    
    // If we're in a focus trap, only navigate within it
    if (focusTrap && currentFocus !== focusTrap) {
      setFocus(focusTrap);
      return;
    }
    
    // First, check explicit neighbor
    const nextFocusId = focusableElements[currentFocus]?.neighbors?.[direction];
    
    if (nextFocusId && focusableElements[nextFocusId]) {
      setFocus(nextFocusId);
      return;
    }
    
    // If no explicit neighbor found, use spatial navigation
    const nearestId = findNearestElement(direction, currentFocus);
    if (nearestId) {
      setFocus(nearestId);
    }
  }, [currentFocus, focusableElements, focusTrap, findNearestElement, setFocus]);

  const registerFocusable = useCallback((
    id: string, 
    element: HTMLElement, 
    neighbors: {
      up?: string;
      down?: string;
      left?: string;
      right?: string;
    } = {}
  ) => {
    setFocusableElements(prev => ({
      ...prev,
      [id]: { element, neighbors }
    }));
  }, []);

  const unregisterFocusable = useCallback((id: string) => {
    setFocusableElements(prev => {
      const newElements = { ...prev };
      delete newElements[id];
      
      // Update any references to this element in neighbors
      Object.keys(newElements).forEach(elemId => {
        const neighbors = newElements[elemId].neighbors;
        if (Object.values(neighbors).includes(id)) {
          const newNeighbors = { ...neighbors };
          (Object.keys(newNeighbors) as Array<keyof typeof newNeighbors>).forEach(dir => {
            if (newNeighbors[dir] === id) {
              delete newNeighbors[dir];
            }
          });
          newElements[elemId].neighbors = newNeighbors;
        }
      });
      
      return newElements;
    });
    
    // If this was the current focus, clear it
    if (currentFocus === id) {
      setCurrentFocus(null);
    }
  }, [currentFocus]);

  // Navigation history management
  const goBack = useCallback(() => {
    if (history.length <= 1) return;
    
    const [current, previousState, ...restHistory] = history;
    if (previousState) {
      // If the previous state is for the current route, just focus
      if (previousState.route === currentPath) {
        setFocus(previousState.focusId);
      } else {
        // Otherwise update history for when we navigate back to that route
        setHistory([current, ...restHistory]);
      }
    }
  }, [history, currentPath, setFocus]);

  const navigateToLastFocus = useCallback((route: string): boolean => {
    const lastFocus = history.find(item => item.route === route);
    if (lastFocus && focusableElements[lastFocus.focusId]) {
      // Use a local reference to avoid closure issues
      const elementId = lastFocus.focusId;
      
      // Use setTimeout to break potential render cycles
      setTimeout(() => {
        // Use a fresh reference to focusableElements inside the callback
        if (focusableElements[elementId]) {
          setFocus(elementId);
        }
      }, 0);
      
      return true;
    }
    return false;
  }, [history, setFocus]); // Removed focusableElements from dependency array

  // Group management
  const registerGroup = useCallback((groupId: string, elementIds: string[]) => {
    // Register group
    setGroups(prev => ({
      ...prev,
      [groupId]: {
        id: groupId,
        elements: elementIds,
        currentFocus: elementIds[0] || null,
      }
    }));
    
    // Update elements to reference their group
    setFocusableElements(prev => {
      const newElements = { ...prev };
      elementIds.forEach(id => {
        if (newElements[id]) {
          newElements[id] = {
            ...newElements[id],
            groupId
          };
        }
      });
      return newElements;
    });
  }, []);

  const unregisterGroup = useCallback((groupId: string) => {
    // Remove group reference from elements
    setFocusableElements(prev => {
      const newElements = { ...prev };
      Object.keys(newElements).forEach(id => {
        if (newElements[id].groupId === groupId) {
          // Extract everything except the groupId
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { groupId: _unused, ...rest } = newElements[id];
          newElements[id] = rest;
        }
      });
      return newElements;
    });
    
    // Remove group
    setGroups(prev => {
      const newGroups = { ...prev };
      delete newGroups[groupId];
      return newGroups;
    });
  }, []);

  const setGroupFocus = useCallback((groupId: string, elementId: string) => {
    if (groups[groupId] && groups[groupId].elements.includes(elementId)) {
      setFocus(elementId);
    }
  }, [groups, setFocus]);

  const focusGroup = useCallback((groupId: string) => {
    if (groups[groupId]) {
      const focusId = groups[groupId].currentFocus || groups[groupId].elements[0];
      if (focusId) {
        setFocus(focusId);
      }
    }
  }, [groups, setFocus]);

  // Focus trapping for modals and popups
  const trapFocus = useCallback((elementId: string) => {
    if (focusableElements[elementId]) {
      setFocusTrap(elementId);
      setFocus(elementId);
    }
  }, [focusableElements, setFocus]);

  const releaseFocus = useCallback(() => {
    setFocusTrap(null);
  }, []);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Log key events for debugging
      console.log('Key pressed:', e.key);
      
      switch (e.key) {
        case 'ArrowUp':
          console.log('Moving focus UP');
          moveFocus('up');
          e.preventDefault();
          break;
        case 'ArrowDown':
          console.log('Moving focus DOWN');
          moveFocus('down');
          e.preventDefault();
          break;
        case 'ArrowLeft':
          console.log('Moving focus LEFT');
          moveFocus('left');
          e.preventDefault();
          break;
        case 'ArrowRight':
          console.log('Moving focus RIGHT');
          moveFocus('right');
          e.preventDefault();
          break;
        case 'Enter': // OK button on remote control
          console.log('Enter/OK pressed on:', currentFocus);
          if (currentFocus && focusableElements[currentFocus]) {
            const element = focusableElements[currentFocus].element;
            // Use setTimeout to break the potential infinite update loop
            setTimeout(() => {
              // First check if it's a link or button
              if (element instanceof HTMLAnchorElement) {
                console.log('Clicking anchor element');
                if (element.href) {
                  // Force navigation to the link destination
                  window.location.href = element.href;
                } else {
                  element.click();
                }
              } else if (element instanceof HTMLButtonElement || 
                         element.hasAttribute('role') && element.getAttribute('role') === 'button') {
                // If it's a button or has role="button", simulate a click event
                console.log('Clicking button element');
                element.click();
                
                // If the button has data-href attribute, use it for navigation
                if (element.dataset.href) {
                  console.log('Navigating to:', element.dataset.href);
                  setTimeout(() => {
                    window.location.href = element.dataset.href!;
                  }, 50);
                }
              } else {
                // For other elements, just simulate a click
                console.log('Clicking generic element');
                element.click();
                
                // Also check for data-href on other elements
                if (element.dataset.href) {
                  console.log('Navigating to:', element.dataset.href);
                  setTimeout(() => {
                    window.location.href = element.dataset.href!;
                  }, 50);
                }
              }
            }, 0);
          } else {
            console.warn('No element focused when Enter was pressed');
          }
          e.preventDefault();
          break;
        case 'Escape': // Back button on remote control
          console.log('Escape/Back pressed');
          goBack();
          e.preventDefault();
          break;
        case 'Home': // Home button on remote control
          console.log('Home pressed');
          // Navigate to home/main screen
          window.location.href = '/';
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveFocus, goBack, currentFocus, focusableElements]); // Added currentFocus and focusableElements to dependency array

  // Set initial focus on mount if not already set
  React.useEffect(() => {
    // If initialFocus is provided, use it
    if (initialFocus && focusableElements[initialFocus]) {
      console.log("Setting initial focus to:", initialFocus);
      setFocus(initialFocus);
    } 
    // Otherwise, find the first focusable element
    else if (!currentFocus && Object.keys(focusableElements).length > 0) {
      const firstFocusable = Object.keys(focusableElements)[0];
      console.log("Setting default focus to first element:", firstFocusable);
      setFocus(firstFocusable);
    }
  }, [initialFocus, focusableElements, setFocus]);

  return (
    <NavigationContext.Provider 
      value={{ 
        currentFocus, 
        setFocus, 
        moveFocus, 
        registerFocusable, 
        unregisterFocusable,
        goBack,
        navigateToLastFocus,
        registerGroup,
        unregisterGroup,
        setGroupFocus,
        focusGroup,
        trapFocus,
        releaseFocus,
        history,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export { NavigationProvider };
export const useNavigation = () => useContext(NavigationContext);
export default NavigationContext; 