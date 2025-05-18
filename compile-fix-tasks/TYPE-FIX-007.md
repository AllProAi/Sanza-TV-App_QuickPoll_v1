# TYPE-FIX-007: Test Utility Type Errors

## Task Overview
**Task ID**: TYPE-FIX-007  
**Priority**: Medium  
**Estimated Completion Time**: 45 minutes  
**Related Task Files**: TASK-053-060

## Task Description
Fix TypeScript errors in test utility files, including implicit any types, missing type declarations, and mock implementation issues.

## Error Patterns
```
error TS7006: Parameter implicitly has an 'any' type
error TS7031: Binding element implicitly has an 'any' type
error TS2339: Property does not exist on type
error TS7016: Could not find a declaration file for module
```

## Files Requiring Fixes

### Test Utility Type Issues
- **src/tests/utils/TestUtils.tsx**
```
error TS7006: Parameter 'ui' implicitly has an 'any' type
error TS7031: Binding element 'children' implicitly has an 'any' type
error TS7006: Parameter 'ms' implicitly has an 'any' type
error TS2339: Property 'store' does not exist on type 'LocalStorageMock'
```

### Mock Data Import Issues
- **src/services/ai/__tests__/ContentTagger.test.ts**
- **src/services/ai/__tests__/PersonalizedGreeting.test.ts**
```
error TS7016: Could not find a declaration file for module '../../../tests/mocks/MockData'
```

### Unused Import Issue
- **src/tests/utils/TestUtils.tsx**
```
error TS6133: 'React' is declared but its value is never read
```

## Implementation Guidelines

1. Fix implicit any types in test utilities
   - Add explicit type annotations to parameters
   - Use generic types where appropriate for better type safety

2. Fix LocalStorageMock implementation
   - Add proper type declarations for store property
   - Define proper interface for mock implementation

3. Fix mock data import issues
   - Create TypeScript declaration files for mock data
   - Or convert mock data files to TypeScript

4. Address unused imports
   - Remove unused imports or use them

## Fix Examples

### Test Utility Parameter Types
```typescript
// In src/tests/utils/TestUtils.tsx
// Before
export function renderWithProviders(ui, options = {}) {
  const Wrapper = ({ children }) => {
    // ...
  };
  // ...
}

// After
import type { ReactElement, ReactNode } from 'react';
import type { RenderOptions } from '@testing-library/react';

export function renderWithProviders(
  ui: ReactElement, 
  options: RenderOptions = {}
) {
  const Wrapper = ({ children }: { children: ReactNode }) => {
    // ...
  };
  // ...
}
```

### LocalStorageMock Implementation
```typescript
// In src/tests/utils/TestUtils.tsx
// Before
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  // ...
}

// After
class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};
  readonly length: number = 0;
  key(index: number): string | null { return null; }
  
  clear(): void {
    this.store = {};
  }
  
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  
  removeItem(key: string): void {
    delete this.store[key];
  }
}
```

### MockData Declaration File
```typescript
// Create new file: src/tests/mocks/MockData.d.ts
export interface MockContentItem {
  id: string;
  title: string;
  description: string;
  // Add other required properties
}

export const mockContentItems: MockContentItem[];
// Add other exports
```

## Testing Approach
1. Run TypeScript compiler after fixes
2. Verify that the test utility errors are resolved
3. Run tests to ensure they still pass
4. Check for any regressions in test functionality

## Success Criteria
- All test utility type errors are resolved
- Tests continue to pass with the updated utilities
- TypeScript compiler runs without test-related errors
- Type safety is improved in test code 