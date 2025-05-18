// Different transition types
export const TransitionType = {
  FADE: 'fade',
  SLIDE_UP: 'slide-up',
  SLIDE_DOWN: 'slide-down',
  SLIDE_LEFT: 'slide-left',
  SLIDE_RIGHT: 'slide-right',
  ZOOM: 'zoom',
  NONE: 'none',
} as const;

export type TransitionType = typeof TransitionType[keyof typeof TransitionType];

// Loading indicator types
export const LoadingIndicatorType = {
  SPINNER: 'spinner',
  DOTS: 'dots',
  PROGRESS: 'progress',
  SKELETON: 'skeleton',
} as const;

export type LoadingIndicatorType = typeof LoadingIndicatorType[keyof typeof LoadingIndicatorType];

// Loading indicator sizes
export const LoadingIndicatorSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const;

export type LoadingIndicatorSize = typeof LoadingIndicatorSize[keyof typeof LoadingIndicatorSize];

// Background types
export const BackgroundType = {
  GRADIENT: 'gradient',
  BLUR: 'blur',
  COLOR: 'color',
  PARALLAX: 'parallax',
} as const;

export type BackgroundType = typeof BackgroundType[keyof typeof BackgroundType]; 