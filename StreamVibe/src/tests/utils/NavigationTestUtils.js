import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';

/**
 * Navigation key codes
 */
export const NavigationKeys = {
  UP: '{ArrowUp}',
  DOWN: '{ArrowDown}',
  LEFT: '{ArrowLeft}',
  RIGHT: '{ArrowRight}',
  ENTER: '{Enter}',
  BACK: '{Escape}',
  TAB: '{Tab}',
  HOME: '{Home}',
  END: '{End}',
};

/**
 * Simulates a remote control navigation action
 * @param {Object} user - UserEvent instance from @testing-library/user-event
 * @param {string} key - Navigation key from NavigationKeys
 * @param {number} times - Number of times to press the key (default: 1)
 */
export async function navigateWithRemote(user, key, times = 1) {
  for (let i = 0; i < times; i++) {
    await user.keyboard(key);
    // Small delay to simulate real user interaction
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

/**
 * Gets all focusable elements within a container
 * @param {HTMLElement} container - The container to search within
 * @returns {Array} - Array of focusable elements
 */
export function getFocusableElements(container) {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]',
    '[role="link"]',
    '[role="tab"]',
    '[role="menuitem"]',
  ].join(',');

  return Array.from(container.querySelectorAll(selector));
}

/**
 * Verifies that focus is trapped within a container
 * @param {Object} user - UserEvent instance from @testing-library/user-event
 * @param {HTMLElement} container - The container where focus should be trapped
 */
export async function verifyFocusTrap(user, container) {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) {
    throw new Error('No focusable elements found in container');
  }

  // Focus the first element
  focusableElements[0].focus();
  
  // Tab through all elements
  for (let i = 0; i < focusableElements.length; i++) {
    expect(document.activeElement).toBe(focusableElements[i]);
    await user.tab();
  }
  
  // After tabbing through all elements, focus should cycle back to the first element
  expect(document.activeElement).toBe(focusableElements[0]);
}

/**
 * Simulates a navigation path through a series of elements
 * @param {Object} user - UserEvent instance from @testing-library/user-event
 * @param {Array} path - Array of selectors or test IDs to navigate through
 * @param {string} direction - Navigation direction (RIGHT, DOWN, etc.)
 */
export async function navigateThroughPath(user, path, direction) {
  for (const selector of path) {
    let element;
    try {
      element = screen.getByTestId(selector);
    } catch (e) {
      element = screen.getByText(selector);
    }
    
    element.focus();
    expect(document.activeElement).toBe(element);
    await navigateWithRemote(user, NavigationKeys[direction]);
  }
}

/**
 * Validates a navigation flow based on user interactions
 * @param {Object} user - UserEvent instance from @testing-library/user-event
 * @param {Array} steps - Array of objects with key and expectedFocusSelector
 */
export async function validateNavigationFlow(user, steps) {
  for (const { key, expectedFocusSelector } of steps) {
    await navigateWithRemote(user, NavigationKeys[key]);
    
    let focusedElement;
    try {
      focusedElement = screen.getByTestId(expectedFocusSelector);
    } catch (e) {
      focusedElement = screen.getByText(expectedFocusSelector);
    }
    
    expect(document.activeElement).toBe(focusedElement);
  }
}

/**
 * Simulates focus management in a grid-like component
 * @param {Object} user - UserEvent instance from @testing-library/user-event
 * @param {HTMLElement} grid - The grid container element
 * @param {number} rows - Number of rows in the grid
 * @param {number} cols - Number of columns in the grid
 */
export async function testGridNavigation(user, grid, rows, cols) {
  const cells = within(grid).getAllByRole('gridcell');
  expect(cells.length).toBe(rows * cols);
  
  // Start with the first cell focused
  cells[0].focus();
  expect(document.activeElement).toBe(cells[0]);
  
  // Test row navigation
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols - 1; col++) {
      const currentIndex = row * cols + col;
      const nextIndex = currentIndex + 1;
      
      await navigateWithRemote(user, NavigationKeys.RIGHT);
      expect(document.activeElement).toBe(cells[nextIndex]);
    }
    
    // Navigate down to the next row (if not the last row)
    if (row < rows - 1) {
      await navigateWithRemote(user, NavigationKeys.DOWN);
      expect(document.activeElement).toBe(cells[(row + 1) * cols]);
    }
  }
} 