import { mockApiResponses, mockContentItems, mockUserPreferences } from './MockData';

/**
 * Mock API Service for testing
 * This service mimics the behavior of real API calls but returns predefined data
 */
export class MockAPIService {
  constructor(options = {}) {
    this.delay = options.delay || 100; // Simulate network delay
    this.shouldFail = options.shouldFail || false; // Simulate API failure
    this.emptyResponse = options.emptyResponse || false; // Simulate empty responses
  }

  /**
   * Simulates an API response with configurable delay and errors
   * @param {Object} mockResponse - The mock response to return
   * @returns {Promise} - A promise that resolves with the mock response
   */
  async simulateResponse(mockResponse) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    if (this.shouldFail) {
      return Promise.reject(mockResponse.error || { error: 'API Error' });
    }
    
    if (this.emptyResponse) {
      return Promise.resolve(mockResponse.empty || { data: [] });
    }
    
    return Promise.resolve(mockResponse.success);
  }

  /**
   * Get all content items
   * @returns {Promise} - A promise that resolves with content items
   */
  async getContent() {
    return this.simulateResponse(mockApiResponses.getContent);
  }

  /**
   * Get content item by ID
   * @param {string} id - Content ID
   * @returns {Promise} - A promise that resolves with the content item
   */
  async getContentById(id) {
    if (!id) {
      return Promise.reject({ error: 'Content ID is required' });
    }
    
    const item = mockContentItems.find(item => item.id === id);
    if (!item && !this.shouldFail) {
      return Promise.reject({ error: 'Content not found', status: 404 });
    }
    
    return this.simulateResponse(mockApiResponses.getContentDetail);
  }

  /**
   * Get user preferences
   * @param {string} userId - User ID
   * @returns {Promise} - A promise that resolves with user preferences
   */
  async getUserPreferences(userId) {
    if (!userId) {
      return Promise.reject({ error: 'User ID is required' });
    }
    
    return this.simulateResponse(mockApiResponses.getUserPreferences);
  }

  /**
   * Update user preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - Updated preferences
   * @returns {Promise} - A promise that resolves with updated user preferences
   */
  async updateUserPreferences(userId, preferences) {
    if (!userId) {
      return Promise.reject({ error: 'User ID is required' });
    }
    
    if (!preferences) {
      return Promise.reject({ error: 'Preferences are required' });
    }
    
    const updatedPreferences = {
      ...mockUserPreferences,
      ...preferences,
    };
    
    return this.simulateResponse({
      success: {
        status: 200,
        data: updatedPreferences,
      },
      error: mockApiResponses.getUserPreferences.error,
    });
  }

  /**
   * Get recommendations for a user
   * @param {string} userId - User ID
   * @param {Object} options - Recommendation options
   * @returns {Promise} - A promise that resolves with recommendations
   */
  async getRecommendations(userId, options = {}) {
    if (!userId) {
      return Promise.reject({ error: 'User ID is required' });
    }
    
    return this.simulateResponse(mockApiResponses.getRecommendations);
  }

  /**
   * Get mood-based recommendations
   * @param {string} userId - User ID
   * @param {string} mood - Mood ID
   * @returns {Promise} - A promise that resolves with mood-based recommendations
   */
  async getMoodRecommendations(userId, mood) {
    if (!userId) {
      return Promise.reject({ error: 'User ID is required' });
    }
    
    if (!mood) {
      return Promise.reject({ error: 'Mood is required' });
    }
    
    // Filter by mood
    const filteredItems = mockContentItems.filter(item => 
      item.mood && item.mood.includes(mood)
    );
    
    return this.simulateResponse({
      success: {
        status: 200,
        data: filteredItems,
      },
      error: mockApiResponses.getRecommendations.error,
      empty: mockApiResponses.getRecommendations.empty,
    });
  }

  /**
   * Search content
   * @param {string} query - Search query
   * @returns {Promise} - A promise that resolves with search results
   */
  async searchContent(query) {
    if (!query) {
      return Promise.reject({ error: 'Search query is required' });
    }
    
    // Simple search by title or description
    const queryLower = query.toLowerCase();
    const results = mockContentItems.filter(item => 
      item.title.toLowerCase().includes(queryLower) || 
      item.description.toLowerCase().includes(queryLower) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(queryLower)))
    );
    
    return this.simulateResponse({
      success: {
        status: 200,
        data: results,
      },
      error: mockApiResponses.getContent.error,
      empty: {
        status: 200,
        data: [],
      },
    });
  }
} 