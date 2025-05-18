# Known Issues and Fixes

This document tracks console warnings and errors that have been fixed in the StreamVibe TV App.

## Fixed Issues

### 1. Maximum Update Depth Exceeded in NavigationContext and useFocus

**Problem**: Infinite update loops in NavigationContext and useFocus hooks when handling focus changes and component registration.

**Fix**: 
- Added setTimeout when handling click events to break the React render cycle
- Removed focusableElements from dependency arrays in useEffect hooks to prevent re-renders
- Fixed navigateToLastFocus to use setTimeout to break render cycles
- Optimized useFocus hook to prevent duplicate registrations and circular dependencies
- Combined redundant useEffect hooks in useFocus
- Added proper element reference equality checks
- Removed unnecessary dependencies from useEffect dependency arrays

### 2. React Warning About isFocused Prop

**Problem**: React warning about passing non-DOM props (isFocused) to DOM elements.

**Fix**:
- Changed to transient prop syntax with $ prefix ($isFocused) to prevent it from being passed to the DOM
- Updated styled-components to use the transient prop pattern

### 3. Non-Boolean Attribute Warnings

**Problem**: Warnings about passing boolean values to non-boolean DOM attributes in Carousel and FeaturedContent.

**Fix**:
- Changed the `active` prop to `$active` using styled-components transient prop pattern in all components
- Added proper aria attributes for better accessibility

### 4. Senza SDK Initialization Warnings

**Problem**: Console warnings about missing window objects during SDK initialization.

**Fix**:
- Added environment detection and graceful error handling for development mode
- Added specific error catching for known missing objects in development
- Added warning messages instead of errors when running outside of Senza platform

### 5. Missing Required Environment Variables

**Problem**: Warnings about missing required environment variables for API keys.

**Fix**:
- Modified environment validation to handle development vs. production differently
- Added default mock values for API keys in development mode
- Added better error handling to show warnings in development but errors in production

## Performance Improvements

1. **Focus Management Optimization**:
   - Reduced unnecessary component re-renders when focus changes
   - Implemented request animation frame and timeouts to break render cycles
   - Optimized focus registration to happen only when necessary
   - Fixed duplicate element registrations

2. **Component Lifecycle Management**:
   - Improved cleanup functions in useEffect hooks
   - Proper unregistration of focusable elements on component unmount
   - Fixed memory leaks by ensuring proper cleanup

## Development vs. Production Behavior

When running in development mode, the app now:

1. Suppresses errors related to missing Senza platform objects (window.diagnostics, window.cefQuery)
2. Shows warning messages instead of throwing errors
3. Continues initializing even when platform-specific features are unavailable
4. Uses mock API keys for development when real keys aren't provided

In production mode, the app will:

1. Throw proper errors if platform features are missing
2. Require all production-critical environment variables
3. Show error screens to users when critical failures occur

## Other Optimizations

1. Improved focus management in the remote control implementation
2. Better error handling throughout the application
3. Added proper ARIA attributes for accessibility
4. Strengthened component types to prevent DOM attribute warnings 