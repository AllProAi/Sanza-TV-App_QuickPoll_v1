import ContentTagger from '../ContentTagger';
import OpenAIService from '../../OpenAIService';
import ContentService from '../../ContentService';
import { mockContentItems } from '../../../tests/mocks/MockData';
import { setupLocalStorageMock } from '../../../tests/utils/TestUtils';

// Mock types for the services
interface MockOpenAIService {
  hasApiKey: jest.Mock;
  generateChatCompletion: jest.Mock;
}

interface MockContentService {
  getContentById: jest.Mock;
  getAllContent: jest.Mock;
}

// Mock dependencies
jest.mock('../../OpenAIService', () => ({
  getInstance: jest.fn()
}));

jest.mock('../../ContentService', () => ({
  getInstance: jest.fn()
}));

describe('ContentTagger', () => {
  let contentTagger: ContentTagger;
  let mockOpenAIService: MockOpenAIService;
  let mockContentService: MockContentService;
  
  beforeEach(() => {
    // Set up localStorage mock
    setupLocalStorageMock();
    
    // Create mock services
    mockOpenAIService = {
      hasApiKey: jest.fn().mockReturnValue(true),
      generateChatCompletion: jest.fn()
    };
    
    mockContentService = {
      getContentById: jest.fn(),
      getAllContent: jest.fn().mockResolvedValue(mockContentItems)
    };
    
    // Set up the mocks
    (OpenAIService.getInstance as jest.Mock).mockReturnValue(mockOpenAIService);
    (ContentService.getInstance as jest.Mock).mockReturnValue(mockContentService);
    
    // Create a new instance for each test
    contentTagger = ContentTagger.getInstance();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = ContentTagger.getInstance();
      const instance2 = ContentTagger.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
  
  describe('generateTags', () => {
    it('should generate tags using AI', async () => {
      // Set up content service to return a content item
      const contentItem = mockContentItems[0];
      mockContentService.getContentById.mockResolvedValue(contentItem);
      
      // Mock AI response
      const mockTags = [
        { name: 'epic', type: 'theme', confidence: 0.9 },
        { name: 'uplifting', type: 'mood', confidence: 0.8 },
        { name: 'strong protagonist', type: 'feature', confidence: 0.85 }
      ];
      mockOpenAIService.generateChatCompletion.mockResolvedValue(JSON.stringify(mockTags));
      
      // Call the method
      const result = await contentTagger.generateTags('content-1');
      
      // Check the result
      expect(result.contentId).toBe('content-1');
      expect(result.tags).toHaveLength(3);
      expect(result.success).toBe(true);
      expect(result.tags[0].name).toBe('epic');
      
      // Check that the services were called
      expect(mockContentService.getContentById).toHaveBeenCalledWith('content-1');
      expect(mockOpenAIService.generateChatCompletion).toHaveBeenCalled();
    });
    
    it('should use fallback tags when OpenAI is not available', async () => {
      // Set OpenAI as unavailable
      mockOpenAIService.hasApiKey.mockReturnValue(false);
      
      // Set up content service to return a content item
      const contentItem = mockContentItems[0];
      mockContentService.getContentById.mockResolvedValue(contentItem);
      
      // Call the method
      const result = await contentTagger.generateTags('content-1');
      
      // Check the result
      expect(result.contentId).toBe('content-1');
      expect(result.tags.length).toBeGreaterThan(0);
      expect(result.success).toBe(true);
      
      // Check that OpenAI was not called
      expect(mockOpenAIService.generateChatCompletion).not.toHaveBeenCalled();
    });
    
    it('should handle errors and return fallback tags', async () => {
      // Set up content service to return a content item
      const contentItem = mockContentItems[0];
      mockContentService.getContentById.mockResolvedValue(contentItem);
      
      // Mock AI service to throw an error
      mockOpenAIService.generateChatCompletion.mockRejectedValue(new Error('API error'));
      
      // Call the method
      const result = await contentTagger.generateTags('content-1');
      
      // Check the result
      expect(result.contentId).toBe('content-1');
      expect(result.tags.length).toBeGreaterThan(0);
      expect(result.success).toBe(true); // Fallback tags should still be successful
    });
    
    it('should use cached tags if available', async () => {
      // Set up content service to return a content item
      const contentItem = mockContentItems[0];
      mockContentService.getContentById.mockResolvedValue(contentItem);
      
      // Mock AI response for first call
      const mockTags = [
        { name: 'epic', type: 'theme', confidence: 0.9 },
        { name: 'uplifting', type: 'mood', confidence: 0.8 }
      ];
      mockOpenAIService.generateChatCompletion.mockResolvedValue(JSON.stringify(mockTags));
      
      // First call should call the AI
      await contentTagger.generateTags('content-1');
      
      // Reset mocks for second call
      mockOpenAIService.generateChatCompletion.mockClear();
      
      // Second call should use cache
      const result = await contentTagger.generateTags('content-1');
      
      // Check the result
      expect(result.contentId).toBe('content-1');
      expect(result.tags).toHaveLength(2);
      
      // Check that OpenAI was not called again
      expect(mockOpenAIService.generateChatCompletion).not.toHaveBeenCalled();
    });
  });
  
  describe('findSimilarContent', () => {
    it('should find similar content based on tags', async () => {
      // Set up content service
      mockContentService.getContentById.mockResolvedValue(mockContentItems[0]);
      
      // Mock tag generation to return different tags for each content
      contentTagger.generateTags = jest.fn().mockImplementation((contentId) => {
        if (contentId === 'content-1') {
          return Promise.resolve({
            contentId,
            tags: [
              { id: 'tag1', name: 'adventure', type: 'genre', confidence: 0.9 },
              { id: 'tag2', name: 'epic', type: 'theme', confidence: 0.8 }
            ],
            generatedTimestamp: new Date().toISOString(),
            success: true
          });
        } else if (contentId === 'content-2') {
          return Promise.resolve({
            contentId,
            tags: [
              { id: 'tag3', name: 'mystery', type: 'genre', confidence: 0.9 },
              { id: 'tag4', name: 'suspense', type: 'theme', confidence: 0.8 }
            ],
            generatedTimestamp: new Date().toISOString(),
            success: true
          });
        } else {
          return Promise.resolve({
            contentId,
            tags: [
              { id: 'tag5', name: 'comedy', type: 'genre', confidence: 0.9 },
              { id: 'tag6', name: 'funny', type: 'theme', confidence: 0.8 }
            ],
            generatedTimestamp: new Date().toISOString(),
            success: true
          });
        }
      });
      
      // Call the method
      const result = await contentTagger.findSimilarContent('content-1', 2);
      
      // Check the result
      expect(result).toHaveLength(2);
      expect(result[0].id).not.toBe('content-1'); // Should not include the source content
    });
    
    it('should handle errors and return basic similar content', async () => {
      // Set up content service
      mockContentService.getContentById.mockResolvedValue(mockContentItems[0]);
      
      // Mock tag generation to throw an error
      contentTagger.generateTags = jest.fn().mockRejectedValue(new Error('Tagging error'));
      
      // Call the method
      const result = await contentTagger.findSimilarContent('content-1', 2);
      
      // Check the result
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].id).not.toBe('content-1'); // Should not include the source content
    });
  });
  
  describe('clearCache', () => {
    it('should clear the tag cache', async () => {
      // Set up content service to return a content item
      const contentItem = mockContentItems[0];
      mockContentService.getContentById.mockResolvedValue(contentItem);
      
      // Mock AI response
      const mockTags = [
        { name: 'epic', type: 'theme', confidence: 0.9 },
        { name: 'uplifting', type: 'mood', confidence: 0.8 }
      ];
      mockOpenAIService.generateChatCompletion.mockResolvedValue(JSON.stringify(mockTags));
      
      // First call should call the AI
      await contentTagger.generateTags('content-1');
      
      // Clear the cache
      contentTagger.clearCache();
      
      // Reset mocks for second call
      mockOpenAIService.generateChatCompletion.mockClear();
      
      // Second call should call the AI again
      await contentTagger.generateTags('content-1');
      
      // Check that OpenAI was called again
      expect(mockOpenAIService.generateChatCompletion).toHaveBeenCalled();
    });
  });
}); 