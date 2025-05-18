// Import commands.js
import './commands';

// Configure Cypress behavior
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test on uncaught exceptions
  return false;
});

// Mock localStorage for consistent test environment
beforeEach(() => {
  cy.window().then((win) => {
    win.localStorage.clear();
  });
}); 