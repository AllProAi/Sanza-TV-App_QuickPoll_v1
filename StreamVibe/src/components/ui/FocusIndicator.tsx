import React from 'react';
import './FocusIndicator.css';

interface FocusIndicatorProps {
  offset?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  scale?: number;
  transitionDuration?: number;
  color?: string;
  borderRadius?: number;
  borderWidth?: number;
}

const FocusIndicator: React.FC<FocusIndicatorProps> = ({
  offset = { top: -4, right: -4, bottom: -4, left: -4 },
  scale = 1,
  transitionDuration = 150,
  color = '#3f85f4',
  borderRadius = 4,
  borderWidth = 2,
}) => {
  return (
    <div
      className="focus-indicator"
      style={{
        position: 'absolute',
        top: offset.top ?? -4,
        right: offset.right ?? -4,
        bottom: offset.bottom ?? -4,
        left: offset.left ?? -4,
        border: `${borderWidth}px solid ${color}`,
        borderRadius: `${borderRadius}px`,
        boxShadow: `0 0 8px ${color}`,
        transform: `scale(${scale})`,
        transition: `all ${transitionDuration}ms ease-out, opacity 100ms ease-in`,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
};

export default FocusIndicator; 