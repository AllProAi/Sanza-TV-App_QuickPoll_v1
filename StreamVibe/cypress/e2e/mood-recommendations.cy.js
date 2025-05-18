describe('Mood-based Recommendations', () => {
  beforeEach(() => {
    // Visit the home page
    cy.visit('/');
    
    // Wait for the app to load
    cy.findByText('StreamVibe', { timeout: 5000 }).should('exist');
  });

  it('should display the mood selector', () => {
    // Find and click on the mood selector button
    cy.findByTestId('mood-selector-button').click();
    
    // Verify the mood selector is displayed
    cy.findByTestId('mood-selector-container').should('be.visible');
    
    // Check if moods are displayed
    cy.findByText('Happy').should('exist');
    cy.findByText('Relaxed').should('exist');
    cy.findByText('Excited').should('exist');
  });

  it('should show recommendations when a mood is selected', () => {
    // Find and click on the mood selector button
    cy.findByTestId('mood-selector-button').click();
    
    // Select a mood
    cy.findByText('Happy').click();
    
    // Verify recommendations are loaded
    cy.findByTestId('mood-recommendations-container').should('be.visible');
    cy.findByText('Happy Recommendations').should('exist');
    
    // Check if content items are displayed
    cy.findAllByTestId('content-card').should('have.length.at.least', 1);
  });

  it('should navigate through mood recommendations with keyboard', () => {
    // Find and click on the mood selector button
    cy.findByTestId('mood-selector-button').click();
    
    // Select a mood
    cy.findByText('Excited').click();
    
    // Verify recommendations are loaded
    cy.findByTestId('mood-recommendations-container').should('be.visible');
    
    // Check if content items are displayed
    cy.findAllByTestId('content-card').should('have.length.at.least', 1);
    
    // Get the first content card and verify it's focusable
    cy.findAllByTestId('content-card').first().focus().should('have.focus');
    
    // Test keyboard navigation (right arrow)
    cy.focused().type('{rightarrow}');
    
    // Verify focus moved to the next item
    cy.findAllByTestId('content-card').eq(1).should('have.focus');
  });
}); 