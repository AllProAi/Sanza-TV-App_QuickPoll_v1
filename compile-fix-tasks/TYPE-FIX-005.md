# TYPE-FIX-005: Route Component Type Errors

## Task Overview
**Task ID**: TYPE-FIX-005  
**Priority**: Critical  
**Estimated Completion Time**: 45 minutes  
**Related Task Files**: TASK-029-032

## Task Description
Fix TypeScript errors related to route component types in the navigation routes configuration. These errors occur when lazy-loaded components have incompatible type declarations.

## Error Pattern
```
error TS2322: Type 'LazyExoticComponent<FC<{}>>' is not assignable to type 'LazyExoticComponent<ComponentType<unknown>>'
```

## Files Requiring Fixes

### src/navigation/routes.ts
```
error TS2322: Type 'LazyExoticComponent<FC<{}>>' is not assignable to type 'LazyExoticComponent<ComponentType<unknown>>'
component: HomePage,
```

Similar errors for multiple route components:
- HomePage
- BrowsePage
- DetailPage
- SearchPage
- ProfilePage
- SettingsPage
- PlayerPage

Also, an error for the ErrorPage import:
```
error TS2322: Type 'Promise<typeof import("path/to/ErrorPage")>' is not assignable to type 'Promise<{ default: ComponentType<any>; }>'
```

## Implementation Guidelines

1. Fix the RouteConfig interface to make it more flexible with component types
   - Update the component type to accept more general React components

2. Fix lazy loaded component imports
   - Ensure all page components have proper default exports
   - Fix ErrorPage import to ensure it has a default export

3. Update component type declarations in page components
   - Make sure page components are exported with the correct type

## Fix Examples

### Fix RouteConfig Interface
```typescript
// In src/navigation/routes.ts
// Before
interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<unknown>>;
  // other properties
}

// After (more flexible approach)
interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  // other properties
}
```

### Fix ErrorPage Default Export
```typescript
// In src/pages/ErrorPage.tsx
// Before (if there's no default export)
export const ErrorPage: React.FC = () => {
  // component code
};

// After
const ErrorPage: React.FC = () => {
  // component code
};

export default ErrorPage;
```

### Fix Component Types in Routes
```typescript
// In src/navigation/routes.ts
// For each page component, ensure it's imported correctly

// Before
const HomePage = lazy(() => import('../pages/HomePage'));

// After (if needed)
const HomePage: React.LazyExoticComponent<React.ComponentType<any>> = 
  lazy(() => import('../pages/HomePage'));
```

## Testing Approach
1. Run TypeScript compiler after fixes
2. Verify that the route-related errors are resolved
3. Test navigation to ensure all routes still function correctly
4. Verify that lazy loading still works as expected

## Success Criteria
- All route component type errors are resolved
- Navigation between routes works correctly
- Lazy loading functions properly
- TypeScript compiler runs without route-related errors 