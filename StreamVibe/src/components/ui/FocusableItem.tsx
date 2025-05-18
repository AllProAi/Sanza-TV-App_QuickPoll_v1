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
          transform: isFocused ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          boxShadow: isFocused ? '0 0 20px rgba(63, 133, 244, 0.6)' : 'none',
          zIndex: isFocused ? 10 : 'auto',
          ...style,
        }}
        tabIndex={disabled ? -1 : tabIndex}
        data-focusable-id={focusId}
        data-focusable={!disabled}
        data-focused={isFocused ? "true" : "false"}
        data-group-id={groupId}
        {...props}
      >
        {children}
        {!noIndicator && isFocused && (
          <FocusIndicator
            offset={indicatorOffset}
            scale={indicatorScale}
            transitionDuration={indicatorTransitionDuration}
            color="#4caf50"
            borderWidth={3}
          />
        )}
      </div>
    );
  }
);

FocusableItem.displayName = 'FocusableItem';

export default FocusableItem; 