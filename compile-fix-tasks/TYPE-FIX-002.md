# TYPE-FIX-002: Context API and Hook Related Errors

## Task Overview
**Task ID**: TYPE-FIX-002  
**Priority**: Critical  
**Estimated Completion Time**: 1 hour  
**Related Task Files**: TASK-033-036, TASK-037-040

## Task Description
Fix TypeScript errors related to Context API usage and custom hooks. These include issues with useNavigation, useAnimation, and usePlayerContext hooks.

## Error Patterns
```
error TS2614: Module has no exported member 'useNavigation'
error TS2339: Property 'isAnimationsEnabled' does not exist on type '{}'
error TS2724: No exported member named 'PlayerContext'
```

## Files Requiring Fixes

### Navigation Context Issues
- **src/components/navigation/NavigationGroup.tsx**
- **src/components/ui/FocusableButton.tsx**
```
error TS2614: Module '"../../context/NavigationContext"' has no exported member 'useNavigation'
```

### Animation Context Issues
- **src/components/layout/DynamicBackground.tsx**
```
error TS2339: Property 'isAnimationsEnabled' does not exist on type '{}'
error TS2339: Property 'animationDuration' does not exist on type '{}'
```
- **src/components/ui/LoadingIndicators/LoadingIndicator.tsx**
```
error TS2339: Property 'isAnimationsEnabled' does not exist on type '{}'
```

### Player Context Issues
- **src/context/usePlayerContext.ts**
```
error TS2724: '"./PlayerContext"' has no exported member named 'PlayerContext'. Did you mean 'usePlayerContext'?
```
- **src/hooks/usePlayerContext.ts**
```
error TS1192: Module has no default export.
```

### Animation Hook Issues
- **src/hooks/useAnimation.ts**
```
error TS2459: Module '"../context/AnimationContext"' declares 'AnimationContext' locally, but it is not exported.
```

## Implementation Guidelines

1. Fix NavigationContext exports
   - Ensure `useNavigation` is properly exported from NavigationContext.tsx

2. Fix AnimationContext types and exports
   - Define proper return type for useAnimation hook
   - Export AnimationContext correctly

3. Fix PlayerContext references
   - Update imports to use the correct exported member

## Fix Examples

### NavigationContext Export Fix
```typescript
// In src/context/NavigationContext.tsx
// Add or correct the export
export const useNavigation = () => useContext(NavigationContext);
```

### useAnimation Type Fix
```typescript
// In src/hooks/useAnimation.ts
// Properly type the hook return value
export const useAnimation = (): AnimationContextType => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};
```

### PlayerContext Fix
```typescript
// In src/hooks/usePlayerContext.ts
// Change the import
import { usePlayerContext } from '../context/PlayerContext';
// Instead of
// import PlayerContext from '../context/PlayerContext';
```

## Testing Approach
1. Run TypeScript compiler after each context fix
2. Test components that use these contexts to ensure they still function correctly
3. Verify that hooks return the expected values

## Success Criteria
- All context and hook related errors are resolved
- Components using these contexts continue to function correctly
- TypeScript compiler runs without context-related errors 