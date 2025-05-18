# TYPE-FIX-004: Enum Syntax Errors

## Task Overview
**Task ID**: TYPE-FIX-004  
**Priority**: Critical  
**Estimated Completion Time**: 30 minutes  
**Related Task Files**: TASK-015-019, TASK-037-040

## Task Description
Fix TypeScript errors related to enum syntax when 'erasableSyntaxOnly' is enabled in the TypeScript configuration.

## Error Pattern
```
error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
```

## Files Requiring Fixes

### src/services/app-lifecycle.ts
```
error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
export enum AppEventType {
```

### src/services/senza-sdk.ts
```
error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.   
export enum SenzaEventType {
```

### src/types/animations.ts
```
error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
export enum TransitionType {
export enum LoadingIndicatorType {
export enum LoadingIndicatorSize {
export enum BackgroundType {
```

### src/types/sounds.ts
```
error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
export enum SoundType {
```

## Implementation Guidelines

There are two approaches to fix these enum syntax errors:

### Option 1: Change enums to const objects with 'as const'

Replace enum declarations with const objects using the 'as const' assertion to get similar type-safety.

```typescript
// Before
export enum AppEventType {
  INIT = 'init',
  LIFECYCLE = 'lifecycle',
  ERROR = 'error'
}

// After
export const AppEventType = {
  INIT: 'init',
  LIFECYCLE: 'lifecycle',
  ERROR: 'error'
} as const;

export type AppEventType = typeof AppEventType[keyof typeof AppEventType];
```

### Option 2: Update TypeScript Configuration

If possible, update the TypeScript configuration to disable 'erasableSyntaxOnly'.

```json
// In tsconfig.json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": false
  }
}
```

## Fix Examples

### src/services/app-lifecycle.ts
```typescript
// Before
export enum AppEventType {
  INIT = 'init',
  LIFECYCLE = 'lifecycle',
  ERROR = 'error'
}

// After
export const AppEventType = {
  INIT: 'init',
  LIFECYCLE: 'lifecycle',
  ERROR: 'error'
} as const;

export type AppEventType = typeof AppEventType[keyof typeof AppEventType];
```

### src/types/animations.ts
```typescript
// Before
export enum TransitionType {
  FADE = 'fade',
  SLIDE = 'slide',
  ZOOM = 'zoom',
  NONE = 'none'
}

// After
export const TransitionType = {
  FADE: 'fade',
  SLIDE: 'slide',
  ZOOM: 'zoom',
  NONE: 'none'
} as const;

export type TransitionType = typeof TransitionType[keyof typeof TransitionType];
```

## Testing Approach
1. Run TypeScript compiler after fixing each enum
2. Verify that the enum-related errors are resolved
3. Test components and services that use these enums to ensure they still function correctly
4. Check for any usages of enum methods (like `Object.values()` or `Object.keys()`) that might need adjusting

## Success Criteria
- All enum syntax errors are resolved
- Components and services using enums continue to function correctly
- TypeScript compiler runs without enum-related errors 