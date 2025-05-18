import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';

/**
 * Custom render function that includes common providers
 * @param {React.ReactElement} ui - The React element to render
 * @param {Object} options - Additional render options
 * @returns {Object} - The rendered component and utility functions
 */
export function renderWithProviders(
  ui: ReactElement, 
  options: RenderOptions = {}
) {
  const Wrapper = ({ children }: { children: ReactNode }) => {
    return (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    );
  };

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}

/**
 * Wait for a specified amount of time
 * @param {number} ms - Time to wait in milliseconds
 * @returns {Promise} - Promise that resolves after the specified time
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock localStorage for testing
 */
export class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};
  readonly length: number = 0;
  
  constructor() {
    this.store = {};
  }

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
  
  key(_index: number): string | null {
    return null;
  }
}

/**
 * Set up localStorage mock for tests
 */
export function setupLocalStorageMock(): LocalStorageMock {
  const localStorageMock = new LocalStorageMock();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
  return localStorageMock;
}

/**
 * Create a mock for the OpenAI service
 */
export function mockOpenAIService() {
  return {
    generateCompletion: jest.fn().mockResolvedValue('Mock AI response'),
    generateTags: jest.fn().mockResolvedValue(['tag1', 'tag2', 'tag3']),
    generateDescription: jest.fn().mockResolvedValue('Mock description'),
    generateRecommendations: jest.fn().mockResolvedValue(['item1', 'item2']),
  };
} 