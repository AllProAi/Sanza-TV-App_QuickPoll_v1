import React, { useEffect, useRef, Children, cloneElement, isValidElement, useState } from 'react';
import type { ReactElement } from 'react';
import { useNavigation } from '../../hooks/useNavigation';

// Interface for the expected props of children
interface FocusableChildProps {
  id: string;
  neighbors?: {
    up?: string;
    down?: string;
    left?: string;
    right?: string;
  };
  groupId?: string;
  initialFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

// Interface for props that we can safely pass to any React element
interface CloneElementProps {
  neighbors?: {
    up?: string;
    down?: string;
    left?: string;
    right?: string;
  };
  groupId?: string;
  initialFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

interface NavigationGroupProps {
  id: string;
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical' | 'grid';
  wrapNavigation?: boolean;
  columns?: number;
  initialFocusIndex?: number;
  onFocus?: (elementId: string, index: number) => void;
  onBlur?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const NavigationGroup: React.FC<NavigationGroupProps> = ({
  id,
  children,
  direction = 'vertical',
  wrapNavigation = false,
  columns = 3,
  initialFocusIndex = 0,
  onFocus,
  onBlur,
  className,
  style,
}) => {
  const { registerGroup, unregisterGroup } = useNavigation();
  const childrenArray = Children.toArray(children).filter(isValidElement);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const focusableIds = useRef<string[]>([]);
  
  // Process children to extract IDs and create navigation connections
  useEffect(() => {
    const childIds: string[] = [];
    const validChildren = childrenArray.filter(isValidElement);
    
    validChildren.forEach((child) => {
      // Safely access props with type assertion
      const props = (child as ReactElement).props as FocusableChildProps;
      if (props.id) {
        childIds.push(props.id);
      }
    });
    
    focusableIds.current = childIds;
    
    if (childIds.length > 0) {
      registerGroup(id, childIds);
    }
    
    return () => {
      unregisterGroup(id);
    };
  }, [id, registerGroup, unregisterGroup, childrenArray]);
  
  // Generate neighbor relationships based on direction and wrap settings
  const getNeighbors = (index: number, totalChildren: number) => {
    if (totalChildren <= 1) return {};
    
    let up: string | undefined;
    let down: string | undefined;
    let left: string | undefined;
    let right: string | undefined;
    
    if (direction === 'horizontal') {
      // Horizontal: left/right navigation
      left = index > 0 ? focusableIds.current[index - 1] : 
        (wrapNavigation ? focusableIds.current[totalChildren - 1] : undefined);
        
      right = index < totalChildren - 1 ? focusableIds.current[index + 1] : 
        (wrapNavigation ? focusableIds.current[0] : undefined);
    }
    else if (direction === 'vertical') {
      // Vertical: up/down navigation
      up = index > 0 ? focusableIds.current[index - 1] : 
        (wrapNavigation ? focusableIds.current[totalChildren - 1] : undefined);
        
      down = index < totalChildren - 1 ? focusableIds.current[index + 1] : 
        (wrapNavigation ? focusableIds.current[0] : undefined);
    }
    else if (direction === 'grid') {
      // Grid: up/down/left/right navigation
      const row = Math.floor(index / columns);
      const col = index % columns;
      
      // Up neighbor
      const upIndex = index - columns;
      if (upIndex >= 0) {
        up = focusableIds.current[upIndex];
      } else if (wrapNavigation) {
        // Wrap to bottom row
        const lastRowStart = Math.floor((totalChildren - 1) / columns) * columns;
        const sameColInLastRow = lastRowStart + col;
        up = sameColInLastRow < totalChildren ? 
          focusableIds.current[sameColInLastRow] : 
          focusableIds.current[totalChildren - 1];
      }
      
      // Down neighbor
      const downIndex = index + columns;
      if (downIndex < totalChildren) {
        down = focusableIds.current[downIndex];
      } else if (wrapNavigation) {
        // Wrap to top row
        const sameColInFirstRow = col;
        down = focusableIds.current[sameColInFirstRow];
      }
      
      // Left neighbor
      if (col > 0) {
        left = focusableIds.current[index - 1];
      } else if (wrapNavigation) {
        // Wrap to end of row
        const lastColInSameRow = (row + 1) * columns - 1;
        left = focusableIds.current[Math.min(lastColInSameRow, totalChildren - 1)];
      }
      
      // Right neighbor
      if (col < columns - 1 && index + 1 < totalChildren) {
        right = focusableIds.current[index + 1];
      } else if (wrapNavigation) {
        // Wrap to start of row
        const firstColInSameRow = row * columns;
        right = focusableIds.current[firstColInSameRow];
      }
    }
    
    return { up, down, left, right };
  };
  
  // Clone and enhance children with calculated neighbors
  const enhancedChildren = childrenArray.map((child, index) => {
    if (!isValidElement(child)) return child;
    
    const neighbors = getNeighbors(index, childrenArray.length);
    
    // Safely access props with type assertion
    const childElement = child as ReactElement;
    const childProps = childElement.props as FocusableChildProps;
    
    // Create props object explicitly typed as React attributes
    const elementProps: CloneElementProps = {
      neighbors,
      groupId: id,
      initialFocus: index === initialFocusIndex,
      onFocus: () => {
        setFocusedIndex(index);
        if (onFocus && childProps.id) onFocus(childProps.id, index);
      },
      onBlur: () => {
        if (focusedIndex === index) {
          setFocusedIndex(null);
          if (onBlur) onBlur();
        }
      },
    };
    
    // Use type assertion to help TypeScript understand this is valid
    return cloneElement(childElement, elementProps as React.JSX.IntrinsicAttributes);
  });
  
  return (
    <div 
      className={`navigation-group ${className || ''}`} 
      style={{
        display: direction === 'grid' ? 'grid' : 'flex',
        gridTemplateColumns: direction === 'grid' ? `repeat(${columns}, 1fr)` : undefined,
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        ...style,
      }}
      data-group-id={id}
      data-navigation-direction={direction}
    >
      {enhancedChildren}
    </div>
  );
};

export default NavigationGroup; 