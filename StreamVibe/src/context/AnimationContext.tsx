import React, { useState, useEffect, type ReactNode } from 'react';
import { config } from '@react-spring/web';
import { AnimationContext, type AnimationContextType } from './animation-context';

// Provider component
interface AnimationProviderProps {
  children: ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  // Get initial state from localStorage
  const getInitialState = (): boolean => {
    try {
      const saved = localStorage.getItem('streamvibe-animations-enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  };

  const [isAnimationsEnabled, setAnimationsEnabled] = useState<boolean>(getInitialState);

  // Save preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('streamvibe-animations-enabled', JSON.stringify(isAnimationsEnabled));
    } catch (error) {
      console.error('Error saving animation preference:', error);
    }
  }, [isAnimationsEnabled]);

  // Create context value
  const value: AnimationContextType = {
    isAnimationsEnabled,
    setAnimationsEnabled,
    animationConfig: isAnimationsEnabled ? config.gentle : config.default,
    animationDuration: {
      short: isAnimationsEnabled ? 150 : 0,
      medium: isAnimationsEnabled ? 300 : 0,
      long: isAnimationsEnabled ? 500 : 0,
    },
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}; 