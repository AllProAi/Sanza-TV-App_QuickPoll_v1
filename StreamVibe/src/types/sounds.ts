// Different types of UI sounds
export const SoundType = {
  NAVIGATION: 'navigation',
  SELECT: 'select',
  BACK: 'back',
  ERROR: 'error',
  SUCCESS: 'success',
  HOVER: 'hover',
  AMBIENT: 'ambient',
} as const;

export type SoundType = typeof SoundType[keyof typeof SoundType];

// Interface for sound options
export interface SoundOptions {
  volume?: number;
  loop?: boolean;
  rate?: number;
} 