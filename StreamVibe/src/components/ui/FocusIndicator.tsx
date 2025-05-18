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
  offset = { top: -6, right: -6, bottom: -6, left: -6 },
  scale = 1.05,
  transitionDuration = 150,
  color = '#4caf50',
  borderRadius = 6,
  borderWidth = 3,
}) => {
  return (
    <div
      className="focus-indicator"
      style={{
        position: 'absolute',
        top: offset.top ?? -6,
        right: offset.right ?? -6,
        bottom: offset.bottom ?? -6,
        left: offset.left ?? -6,
        border: `${borderWidth}px solid ${color}`,
        borderRadius: `${borderRadius}px`,
        boxShadow: `0 0 10px ${color}, 0 0 15px ${color}`,
        transform: `scale(${scale})`,
        transition: `all ${transitionDuration}ms ease-out, opacity 100ms ease-in`,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    />
  );
};

export default FocusIndicator; 