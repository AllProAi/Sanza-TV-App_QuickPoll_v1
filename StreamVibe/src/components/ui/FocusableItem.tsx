import React, { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { useFocus } from '../../hooks/useFocus';
import FocusIndicator from './FocusIndicator';

interface FocusableItemProps extends HTMLAttributes<HTMLDivElement> {
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
  focusClassName?: string;
  groupId?: string;
  noIndicator?: boolean;
  indicatorOffset?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  indicatorScale?: number;
  indicatorTransitionDuration?: number;
  disabled?: boolean;
}

const FocusableItem = forwardRef<HTMLDivElement, FocusableItemProps>(
  (
    {
      id,
      className,
      focusClassName,
      initialFocus,
      onFocus,
      onBlur,
      neighbors,
      groupId,
      children,
      style,
      noIndicator = false,
      indicatorOffset,
      indicatorScale,
      indicatorTransitionDuration,
      disabled = false,
      ...props
    },
    externalRef
  ) => {
    const {
      ref: focusRef,
      isFocused,
      id: focusId,
      tabIndex,
    } = useFocus({
      id,
      initialFocus,
      onFocus,
      onBlur,
      neighbors,
    });

    // Combine external ref with focus ref
    const handleRef = (element: HTMLDivElement | null) => {
      focusRef(element);
      if (typeof externalRef === 'function') {
        externalRef(element);
      } else if (externalRef) {
        (externalRef as React.MutableRefObject<HTMLDivElement | null>).current = element;
      }
    };

    return (
      <div
        ref={handleRef}
        className={`
          focusable-item 
          ${className || ''} 
          ${isFocused ? `focused ${focusClassName || ''}` : ''}
        `}
        style={{
          position: 'relative',
          ...style,
        }}
        tabIndex={disabled ? -1 : tabIndex}
        data-focusable-id={focusId}
        data-focusable={!disabled}
        data-group-id={groupId}
        {...props}
      >
        {children}
        {!noIndicator && isFocused && (
          <FocusIndicator
            offset={indicatorOffset}
            scale={indicatorScale}
            transitionDuration={indicatorTransitionDuration}
          />
        )}
      </div>
    );
  }
);

FocusableItem.displayName = 'FocusableItem';

export default FocusableItem; 