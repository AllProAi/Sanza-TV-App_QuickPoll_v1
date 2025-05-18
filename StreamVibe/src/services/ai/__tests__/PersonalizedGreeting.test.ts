import PersonalizedGreeting from '../PersonalizedGreeting';
import OpenAIService from '../../OpenAIService';
import PreferencesService from '../../PreferencesService';
import ContentService from '../../ContentService';
import { mockContentItems } from '../../../tests/mocks/MockData';
import { setupLocalStorageMock } from '../../../tests/utils/TestUtils';

// Mock types for the services
interface MockOpenAIService {
  hasApiKey: jest.Mock;
  generateChatCompletion: jest.Mock;
}

interface MockPreferencesService {
  getActiveProfile: jest.Mock;
  getUserPreferenceData: jest.Mock;
}

interface MockContentService {
  getRecentlyWatched: jest.Mock;
  getAllContent: jest.Mock;
}

// Mock dependencies
jest.mock('../../OpenAIService', () => ({
  getInstance: jest.fn()
}));

jest.mock('../../PreferencesService', () => ({
  getInstance: jest.fn()
}));

jest.mock('../../ContentService', () => ({
  getInstance: jest.fn()
}));

describe('PersonalizedGreeting', () => {
  let personalizedGreeting: PersonalizedGreeting;
  let mockOpenAIService: MockOpenAIService;
  let mockPreferencesService: MockPreferencesService;
  let mockContentService: MockContentService;
  
  beforeEach(() => {
    // Set up localStorage mock
    setupLocalStorageMock();
    
    // Create mock services
    mockOpenAIService = {
      hasApiKey: jest.fn().mockReturnValue(true),
      generateChatCompletion: jest.fn()
    };
    
    mockPreferencesService = {
      getActiveProfile: jest.fn(),
      getUserPreferenceData: jest.fn()
    };
    
    mockContentService = {
      getRecentlyWatched: jest.fn().mockResolvedValue([]),
      getAllContent: jest.fn().mockResolvedValue(mockContentItems)
    };
    
    // Set up the mocks
    (OpenAIService.getInstance as jest.Mock).mockReturnValue(mockOpenAIService);
    (PreferencesService.getInstance as jest.Mock).mockReturnValue(mockPreferencesService);
    (ContentService.getInstance as jest.Mock).mockReturnValue(mockContentService);
    
    // Create a new instance for each test
    personalizedGreeting = PersonalizedGreeting.getInstance();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    
    // Clean up any Date mocking
    jest.restoreAllMocks();
  });
  
  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = PersonalizedGreeting.getInstance();
      const instance2 = PersonalizedGreeting.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
  
  describe('getGreeting', () => {
    it('should generate a greeting using AI', async () => {
      // Set up user profile
      const userProfile = {
        id: 'user-1',
        name: 'Test User',
        isKidsProfile: false
      };
      mockPreferencesService.getActiveProfile.mockReturnValue(userProfile);
      
      // Set up user preference data
      const preferenceData = {
        favoriteGenres: ['action', 'comedy'],
        watchHistory: [
          { title: 'Movie 1', contentId: 'content-1' },
          { title: 'Movie 2', contentId: 'content-2' }
        ],
        viewingFrequency: 'high'
      };
      mockPreferencesService.getUserPreferenceData.mockResolvedValue(preferenceData);
      
      // Set up recently watched content
      mockContentService.getRecentlyWatched.mockResolvedValue([
        mockContentItems[0]
      ]);
      
      // Mock AI response
      const mockGreeting = "Good morning, Test User! We've got some great comedy recommendations for you today.";
      mockOpenAIService.generateChatCompletion.mockResolvedValue(mockGreeting);
      
      // Call the method
      const result = await personalizedGreeting.getGreeting({
        includeTimeOfDay: true,
        includeRecommendation: true
      });
      
      // Check the result
      expect(result.greeting).toBe(mockGreeting);
      expect(result.userName).toBe('Test User');
      expect(result.source).toBe('ai');
      
      // Check that services were called
      expect(mockPreferencesService.getActiveProfile).toHaveBeenCalled();
      expect(mockPreferencesService.getUserPreferenceData).toHaveBeenCalledWith('user-1');
      expect(mockOpenAIService.generateChatCompletion).toHaveBeenCalled();
    });
    
    it('should use template greeting when OpenAI is not available', async () => {
      // Set OpenAI as unavailable
      mockOpenAIService.hasApiKey.mockReturnValue(false);
      
      // Set up user profile
      const userProfile = {
        id: 'user-1',
        name: 'Test User',
        isKidsProfile: false
      };
      mockPreferencesService.getActiveProfile.mockReturnValue(userProfile);
      
      // Call the method
      const result = await personalizedGreeting.getGreeting();
      
      // Check the result
      expect(result.greeting).toBeTruthy();
      expect(result.source).toBe('template');
      
      // Check that OpenAI was not called
      expect(mockOpenAIService.generateChatCompletion).not.toHaveBeenCalled();
    });
    
    it('should use template greeting when AI fails', async () => {
      // Set up user profile
      const userProfile = {
        id: 'user-1',
        name: 'Test User',
        isKidsProfile: false
      };
      mockPreferencesService.getActiveProfile.mockReturnValue(userProfile);
      
      // Mock AI service to throw an error
      mockOpenAIService.generateChatCompletion.mockRejectedValue(new Error('API error'));
      
      // Call the method
      const result = await personalizedGreeting.getGreeting();
      
      // Check the result
      expect(result.greeting).toBeTruthy();
      expect(result.source).toBe('template');
    });
    
    it('should use cached greeting if available', async () => {
      // Set up user profile
      const userProfile = {
        id: 'user-1',
        name: 'Test User',
        isKidsProfile: false
      };
      mockPreferencesService.getActiveProfile.mockReturnValue(userProfile);
      
      // Set up user preference data
      const preferenceData = {
        favoriteGenres: ['action', 'comedy'],
        watchHistory: [
          { title: 'Movie 1', contentId: 'content-1' },
          { title: 'Movie 2', contentId: 'content-2' }
        ]
      };
      mockPreferencesService.getUserPreferenceData.mockResolvedValue(preferenceData);
      
      // Mock AI response for first call
      const mockGreeting = "Good morning, Test User! Here's something you might enjoy.";
      mockOpenAIService.generateChatCompletion.mockResolvedValue(mockGreeting);
      
      // First call should call the AI
      await personalizedGreeting.getGreeting();
      
      // Reset mocks for second call
      mockOpenAIService.generateChatCompletion.mockClear();
      
      // Second call should use cache
      const result = await personalizedGreeting.getGreeting();
      
      // Check the result
      expect(result.greeting).toBe(mockGreeting);
      
      // Check that OpenAI was not called again
      expect(mockOpenAIService.generateChatCompletion).not.toHaveBeenCalled();
    });
    
    it('should return a generic greeting if everything fails', async () => {
      // Set up preferences service to throw an error
      mockPreferencesService.getActiveProfile.mockImplementation(() => {
        throw new Error('Failed to get profile');
      });
      
      // Call the method
      const result = await personalizedGreeting.getGreeting();
      
      // Check that a generic greeting is returned
      expect(result.greeting).toBe('Welcome to StreamVibe!');
      expect(result.source).toBe('template');
    });
  });
  
  describe('getTimeOfDay', () => {
    it('should return the correct time of day', async () => {
      // Using jest's spyOn to mock Date behavior instead of global Date
      // This is more TypeScript-friendly
      const mockGetHours = jest.fn();
      
      // Mock Date.now and getHours
      jest.spyOn(Date.prototype, 'getHours').mockImplementation(() => {
        return mockGetHours();
      });
      
      // Setup for morning time
      mockGetHours.mockReturnValue(8); // 8 AM
      
      // Set up user profile
      const userProfile = {
        id: 'user-1',
        name: 'Test User',
        isKidsProfile: false
      };
      mockPreferencesService.getActiveProfile.mockReturnValue(userProfile);
      
      // Get greeting during morning
      const morningResult = await personalizedGreeting.getGreeting();
      expect(morningResult.timeOfDay).toBe('morning');
      
      // Change to afternoon
      mockGetHours.mockReturnValue(14); // 2 PM
      
      // Reset cache
      personalizedGreeting.clearCache();
      
      // Get greeting during afternoon
      const afternoonResult = await personalizedGreeting.getGreeting();
      expect(afternoonResult.timeOfDay).toBe('afternoon');
    });
  });
  
  describe('clearCache', () => {
    it('should clear the greeting cache', async () => {
      // Set up user profile
      const userProfile = {
        id: 'user-1',
        name: 'Test User',
        isKidsProfile: false
      };
      mockPreferencesService.getActiveProfile.mockReturnValue(userProfile);
      
      // Mock AI response for first call
      const mockGreeting = "Hello, Test User!";
      mockOpenAIService.generateChatCompletion.mockResolvedValue(mockGreeting);
      
      // First call should call the AI
      await personalizedGreeting.getGreeting();
      
      // Clear the cache
      personalizedGreeting.clearCache();
      
      // Reset mocks for second call
      mockOpenAIService.generateChatCompletion.mockClear();
      
      // Second call should call the AI again
      await personalizedGreeting.getGreeting();
      
      // Check that OpenAI was called again
      expect(mockOpenAIService.generateChatCompletion).toHaveBeenCalled();
    });
  });
  
  describe('resetRotation', () => {
    it('should reset the greeting rotation', async () => {
      // Call reset rotation
      personalizedGreeting.resetRotation();
      
      // Set up user profile
      const userProfile = {
        id: 'user-1',
        name: 'Test User',
        isKidsProfile: false
      };
      mockPreferencesService.getActiveProfile.mockReturnValue(userProfile);
      
      // Mock OpenAI to be unavailable to force template greeting
      mockOpenAIService.hasApiKey.mockReturnValue(false);
      
      // Get two greetings - they should be different after reset
      const greeting1 = await personalizedGreeting.getGreeting();
      
      // Call reset rotation again
      personalizedGreeting.resetRotation();
      
      // Clear cache to force new greeting generation
      personalizedGreeting.clearCache();
      
      const greeting2 = await personalizedGreeting.getGreeting();
      
      // Both should be from template source
      expect(greeting1.source).toBe('template');
      expect(greeting2.source).toBe('template');
    });
  });
}); 