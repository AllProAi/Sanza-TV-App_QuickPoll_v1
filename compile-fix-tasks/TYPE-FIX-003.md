# TYPE-FIX-003: Component Prop Type Errors

## Task Overview
**Task ID**: TYPE-FIX-003  
**Priority**: Critical  
**Estimated Completion Time**: 1 hour  
**Related Task Files**: TASK-020-024, TASK-037-040

## Task Description
Fix TypeScript errors related to component props, particularly in the PlayerControls component and other UI components where required props are missing or incorrectly typed.

## Error Patterns
```
error TS2741: Property 'id' is missing in type but required in type 'ButtonProps'
error TS2339: Property 'togglePlay' does not exist on type
```

## Files Requiring Fixes

### Button Props Issues
- **src/components/player/PlayerControls.tsx**
```
error TS2741: Property 'id' is missing in type '{ children: string; variant: "icon"; size: "small"; onClick: (() => void) | undefined; }' but required in type 'ButtonProps'
```
Multiple instances of this error for Button components in PlayerControls.tsx

### Player Controls Props Issues
- **src/components/player/PlayerControls.tsx**
```
error TS2339: Property 'togglePlay' does not exist on type
error TS2339: Property 'seekTo' does not exist on type
error TS2339: Property 'togglePlayerMute' does not exist on type
error TS2339: Property 'togglePlayerFullscreen' does not exist on type
error TS2339: Property 'setPlayerQuality' does not exist on type
```

### Navigation Component Issues
- **src/components/navigation/NavigationGroup.tsx**
```
error TS2769: No overload matches this call. Object literal may only specify known properties, and 'neighbors' does not exist in type
```

### Keyboard Manager Issues
- **src/components/navigation/NavigationDebugger.tsx**
```
error TS2554: Expected 1 arguments, but got 0.
```

## Implementation Guidelines

1. Fix Button component usage
   - Add required 'id' prop to all Button components or make it optional in the ButtonProps interface

2. Fix PlayerControls component props
   - Ensure all required props are properly destructured from the hook
   - Verify that the hook is returning all the necessary properties

3. Fix NavigationGroup component props
   - Update cloneElement to only pass valid props to children
   - Define proper interfaces for component props

4. Fix keyboardManager usage
   - Provide required argument to isKeyPressed method

## Fix Examples

### Button Props Fix
```typescript
// In src/components/ui/Button.tsx
// Make id optional in ButtonProps
export interface ButtonProps {
  id?: string; // Make optional
  // ...other props
}

// OR in src/components/player/PlayerControls.tsx
// Add id to Button components
<Button
  id="play-button" // Add unique ID
  variant="icon"
  size="small"
  onClick={onBack}
>
  {/* Button content */}
</Button>
```

### PlayerControls Props Fix
```typescript
// In src/components/player/PlayerControls.tsx
// Ensure all required props are destructured
const {
  playerState,
  controlsState,
  showControls,
  hideControls,
  togglePlay, // Add if missing
  seekTo, // Add if missing
  togglePlayerMute, // Add if missing
  togglePlayerFullscreen, // Add if missing
  setPlayerQuality, // Add if missing
  // ...other props
} = usePlayback();
```

### NavigationGroup Fix
```typescript
// In src/components/navigation/NavigationGroup.tsx
// Use interface for allowed props and filter out invalid ones
interface NavigationChildProps {
  // ...valid props
}

// Filter out invalid props like 'neighbors'
const childProps: NavigationChildProps = {
  // Only include valid props here
};

return cloneElement(child, childProps);
```

### KeyboardManager Fix
```typescript
// In src/components/navigation/NavigationDebugger.tsx
// Provide required argument
className={`key ${keyboardManager.isKeyPressed('Enter') ? 'pressed' : ''}`}
```

## Testing Approach
1. Run TypeScript compiler after fixing each component
2. Test affected components to ensure they still function correctly
3. Verify that props are correctly passed and typed

## Success Criteria
- All component prop type errors are resolved
- Components render and function correctly
- TypeScript compiler runs without prop-related errors 