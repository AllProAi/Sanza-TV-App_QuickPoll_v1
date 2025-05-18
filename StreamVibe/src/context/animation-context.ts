import { createContext } from 'react';
import { config } from '@react-spring/web';

// Define types
export interface AnimationDurations {
  short: number;
  medium: number;
  long: number;
}

// Define a union type for the config object
export type AnimationConfig = typeof config.default | typeof config.gentle;

export interface AnimationContextType {
  isAnimationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  animationConfig: AnimationConfig;
  animationDuration: AnimationDurations;
}

// Create default context
const defaultContext: AnimationContextType = {
  isAnimationsEnabled: true,
  setAnimationsEnabled: () => {},
  animationConfig: config.default,
  animationDuration: {
    short: 150,
    medium: 300,
    long: 500,
  },
};

// Create the context
export const AnimationContext = createContext<AnimationContextType>(defaultContext); 