// Import Testing Library Cypress commands
import '@testing-library/cypress/add-commands';

// Custom command to test keyboard navigation
Cypress.Commands.add('navigateWithArrows', (direction, count = 1) => {
  const arrowKey = `{${direction}arrow}`;
  for (let i = 0; i < count; i++) {
    cy.focused().type(arrowKey);
    // Small delay to allow focus to move
    cy.wait(50);
  }
});

// Custom command to verify focus trap
Cypress.Commands.add('verifyFocusTrap', (containerSelector) => {
  // Get all focusable elements
  cy.get(containerSelector).then($container => {
    const $focusable = $container.find(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"], [role="tab"], [role="menuitem"]'
    );
    
    // No focusable elements means nothing to trap
    if ($focusable.length === 0) {
      throw new Error('No focusable elements found in container');
    }
    
    // Focus the first element
    cy.wrap($focusable.first()).focus();
    
    // Tab through all elements
    const lastIndex = $focusable.length - 1;
    for (let i = 0; i < $focusable.length; i++) {
      cy.focused().should('exist');
      cy.tab();
      
      // If we've tabbed through all elements, focus should cycle back
      if (i === lastIndex) {
        cy.wrap($focusable.first()).should('have.focus');
      }
    }
  });
});

// Custom command to test a grid component with keyboard navigation
Cypress.Commands.add('testGridNavigation', (gridSelector, rows, cols) => {
  cy.get(gridSelector).find('[role="gridcell"]').should('have.length', rows * cols);
  
  // Focus the first cell
  cy.get(gridSelector).find('[role="gridcell"]').first().focus();
  
  // Test horizontal navigation
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols - 1; col++) {
      const currentIndex = row * cols + col;
      const nextIndex = currentIndex + 1;
      
      cy.navigateWithArrows('right');
      cy.get(gridSelector).find('[role="gridcell"]').eq(nextIndex).should('have.focus');
    }
    
    // Navigate down to the next row (if not the last row)
    if (row < rows - 1) {
      cy.navigateWithArrows('down');
      cy.get(gridSelector).find('[role="gridcell"]').eq((row + 1) * cols).should('have.focus');
    }
  }
}); 