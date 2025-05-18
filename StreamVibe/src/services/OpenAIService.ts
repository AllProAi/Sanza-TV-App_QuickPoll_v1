/**
 * Service for integrating with OpenAI API
 * Handles API requests, caching, and error handling
 */

class OpenAIService {
  private static instance: OpenAIService;
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1';
  private defaultModel = 'gpt-4o-mini';
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private cacheExpiryTime = 1000 * 60 * 30; // 30 minutes

  private constructor() {
    // Try to load API key from environment variables
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
  }

  /**
   * Get singleton instance of OpenAIService
   */
  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * Check if API key is set
   */
  public hasApiKey(): boolean {
    return !!this.apiKey;
  }

  /**
   * Set API key manually
   */
  public setApiKey(key: string): void {
    this.apiKey = key;
  }

  /**
   * Generate chat completion with caching
   */
  public async generateChatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
      useCache?: boolean;
      cacheKey?: string;
    } = {}
  ): Promise<string> {
    const {
      model = this.defaultModel,
      temperature = 0.7,
      max_tokens = 500,
      useCache = true,
      cacheKey
    } = options;

    // Check for API key
    if (!this.apiKey) {
      return this.getFallbackResponse('No API key available');
    }

    // Generate cache key if not provided but cache is enabled
    const actualCacheKey = cacheKey || (useCache ? this.createCacheKey(messages, model, temperature, max_tokens) : null);

    // Return from cache if available and cache is enabled
    if (useCache && actualCacheKey && this.hasValidCache(actualCacheKey)) {
      const cachedData = this.getFromCache<string>(actualCacheKey);
      if (cachedData) return cachedData;
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const resultText = data.choices[0]?.message?.content || '';
      
      // Store in cache if enabled
      if (useCache && actualCacheKey) {
        this.setCache(actualCacheKey, resultText);
      }
      
      return resultText;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      return this.getFallbackResponse(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Create a deterministic cache key from request parameters
   */
  private createCacheKey(
    messages: Array<{ role: string; content: string }>,
    model: string, 
    temperature: number,
    maxTokens: number
  ): string {
    // Create a simple hash of the messages
    const messagesStr = JSON.stringify(messages);
    let hash = 0;
    for (let i = 0; i < messagesStr.length; i++) {
      const char = messagesStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    
    return `chat_${model}_${temperature}_${maxTokens}_${hash}`;
  }

  /**
   * Check if cache entry is valid and not expired
   */
  private hasValidCache(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return (Date.now() - entry.timestamp) < this.cacheExpiryTime;
  }

  /**
   * Get data from cache
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    return entry ? entry.data as T : null;
  }

  /**
   * Store data in cache
   */
  private setCache(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear all cache entries
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get a fallback response when API is unavailable
   */
  private getFallbackResponse(reason: string): string {
    console.warn(`Using fallback response due to: ${reason}`);
    
    const fallbackResponses = [
      "Based on what you've watched, you might enjoy similar content in our library.",
      "Our recommendation system is currently offline, but we have many great titles for you to explore.",
      "Try checking out our 'Trending Now' section for popular content.",
      "You might enjoy exploring some of our curated collections while our recommendations system is updating."
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}

export default OpenAIService; 