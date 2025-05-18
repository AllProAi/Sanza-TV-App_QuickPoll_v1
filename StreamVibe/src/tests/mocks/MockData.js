/**
 * Mock data for testing
 */
import type { MockContentItem, MockUserPreference, MockApiResponse, MockOpenAIResponse, MockPlaybackState } from './MockData.d';

// Mock content items
export const mockContentItems: MockContentItem[] = [
  {
    id: 'content-1',
    title: 'The Adventure Begins',
    description: 'An epic journey through uncharted territories.',
    type: 'movie',
    genre: ['adventure', 'fantasy'],
    duration: 7200, // 2 hours in seconds
    releaseYear: 2023,
    rating: 4.8,
    imageUrl: 'mock-image-1.jpg',
    videoUrl: 'mock-video-1.mp4',
    tags: ['epic', 'journey', 'fantasy', 'adventure'],
    cast: [
      { id: 'actor-1', name: 'John Smith', role: 'Hero' },
      { id: 'actor-2', name: 'Jane Doe', role: 'Guide' },
    ],
    director: 'Michael Director',
    mood: ['exciting', 'uplifting'],
  },
  {
    id: 'content-2',
    title: 'Mystery in the Shadows',
    description: 'A detective uncovers a conspiracy in a small town.',
    type: 'series',
    genre: ['mystery', 'thriller'],
    episodes: 8,
    releaseYear: 2022,
    rating: 4.5,
    imageUrl: 'mock-image-2.jpg',
    videoUrl: 'mock-video-2.mp4',
    tags: ['detective', 'mystery', 'conspiracy', 'suspense'],
    cast: [
      { id: 'actor-3', name: 'Robert Detective', role: 'Detective' },
      { id: 'actor-4', name: 'Sarah Witness', role: 'Witness' },
    ],
    director: 'Sarah Director',
    mood: ['tense', 'thoughtful'],
    seasons: [
      { 
        id: 'season-1', 
        title: 'Season 1', 
        episodes: [
          { id: 'ep-1', title: 'The Beginning', duration: 3600 },
          { id: 'ep-2', title: 'The Discovery', duration: 3600 },
        ] 
      },
    ],
  },
  {
    id: 'content-3',
    title: 'Laugh Out Loud',
    description: 'A hilarious comedy about everyday life.',
    type: 'movie',
    genre: ['comedy'],
    duration: 5400, // 1.5 hours in seconds
    releaseYear: 2021,
    rating: 4.2,
    imageUrl: 'mock-image-3.jpg',
    videoUrl: 'mock-video-3.mp4',
    tags: ['comedy', 'funny', 'slice-of-life'],
    cast: [
      { id: 'actor-5', name: 'Funny Guy', role: 'Lead' },
      { id: 'actor-6', name: 'Comic Relief', role: 'Support' },
    ],
    director: 'Comedy Director',
    mood: ['happy', 'lighthearted'],
  },
];

// Mock user preferences
export const mockUserPreferences: MockUserPreference = {
  id: 'user-1',
  name: 'Test User',
  favoriteGenres: ['adventure', 'comedy'],
  watchHistory: [
    { contentId: 'content-1', watchedAt: '2023-05-10T10:30:00Z', progress: 0.7 },
    { contentId: 'content-3', watchedAt: '2023-05-12T15:45:00Z', progress: 1.0 },
  ],
  watchlist: ['content-2'],
  preferences: {
    subtitles: true,
    language: 'en',
    maturityLevel: 'adult',
    displayMode: 'dark',
  },
  activity: {
    lastActive: '2023-05-15T09:20:00Z',
    totalWatchTime: 25200, // 7 hours in seconds
    favoriteTimeOfDay: 'evening',
  },
  moodPreferences: {
    happy: ['comedy', 'family'],
    relaxed: ['documentary', 'drama'],
    excited: ['action', 'adventure'],
    thoughtful: ['mystery', 'sci-fi'],
  },
};

// Mock API responses
export const mockApiResponses: MockApiResponse = {
  // Content endpoint responses
  getContent: {
    success: {
      status: 200,
      data: mockContentItems,
    },
    error: {
      status: 500,
      error: 'Internal server error',
    },
    empty: {
      status: 200,
      data: [],
    },
  },
  
  // Content detail endpoint responses
  getContentDetail: {
    success: {
      status: 200,
      data: mockContentItems[0],
    },
    notFound: {
      status: 404,
      error: 'Content not found',
    },
    error: {
      status: 500,
      error: 'Internal server error',
    },
  },
  
  // User preferences endpoint responses
  getUserPreferences: {
    success: {
      status: 200,
      data: mockUserPreferences,
    },
    notFound: {
      status: 404,
      error: 'User not found',
    },
    error: {
      status: 500,
      error: 'Internal server error',
    },
  },
  
  // Recommendations endpoint responses
  getRecommendations: {
    success: {
      status: 200,
      data: [mockContentItems[0], mockContentItems[2]],
    },
    empty: {
      status: 200,
      data: [],
    },
    error: {
      status: 500,
      error: 'Internal server error',
    },
  },
};

// Mock OpenAI API responses
export const mockOpenAIResponses: MockOpenAIResponse = {
  completion: {
    success: {
      choices: [
        {
          message: {
            content: 'This is a mock AI response that could be used for generating content descriptions or personalized messages.',
          },
        },
      ],
    },
    error: {
      error: {
        message: 'The API key provided is invalid or expired.',
      },
    },
  },
  
  tagging: {
    success: {
      choices: [
        {
          message: {
            content: JSON.stringify(['tag1', 'tag2', 'tag3', 'tag4', 'tag5']),
          },
        },
      ],
    },
    error: {
      error: {
        message: 'Rate limit exceeded',
      },
    },
  },
};

// Mock playback states
export const mockPlaybackStates: MockPlaybackState[] = [
  {
    playing: {
      contentId: 'content-1',
      isPlaying: true,
      currentTime: 1200, // 20 minutes in
      duration: 7200,
      volume: 0.8,
      isMuted: false,
      isFullscreen: true,
      quality: '1080p',
      playbackRate: 1.0,
    },
    paused: {
      contentId: 'content-1',
      isPlaying: false,
      currentTime: 1800, // 30 minutes in
      duration: 7200,
      volume: 0.8,
      isMuted: false,
      isFullscreen: true,
      quality: '1080p',
      playbackRate: 1.0,
    },
    buffering: {
      contentId: 'content-1',
      isPlaying: false,
      isBuffering: true,
      currentTime: 2400, // 40 minutes in
      duration: 7200,
      volume: 0.8,
      isMuted: false,
      isFullscreen: true,
      quality: '1080p',
      playbackRate: 1.0,
    },
    error: {
      contentId: 'content-1',
      isPlaying: false,
      error: 'Network error: Unable to load video',
      currentTime: 3000, // 50 minutes in
      duration: 7200,
      volume: 0.8,
      isMuted: false,
      isFullscreen: true,
      quality: '1080p',
      playbackRate: 1.0,
    },
  },
];

// Mock moods data
export const mockMoods = [
  { id: 'happy', name: 'Happy', description: 'Content that will make you smile and laugh', icon: '😊' },
  { id: 'sad', name: 'Sad', description: 'Emotional and touching stories', icon: '😢' },
  { id: 'excited', name: 'Excited', description: 'Thrilling and action-packed adventures', icon: '🤩' },
  { id: 'relaxed', name: 'Relaxed', description: 'Calm and soothing content', icon: '😌' },
  { id: 'scared', name: 'Scared', description: 'Horror and suspense', icon: '😱' },
  { id: 'thoughtful', name: 'Thoughtful', description: 'Thought-provoking and philosophical', icon: '🤔' },
];

// Mock personalized greetings
export const mockGreetings = {
  morning: [
    'Good morning, {name}! Ready for some early viewing?',
    'Rise and shine, {name}! We have new recommendations for you today.',
    'Morning, {name}! How about starting your day with something from your watchlist?',
  ],
  afternoon: [
    'Good afternoon, {name}! Taking a break?',
    'Hello, {name}! We have some great afternoon picks for you.',
    'Afternoon, {name}! Continue watching where you left off?',
  ],
  evening: [
    'Good evening, {name}! Time to unwind?',
    'Evening, {name}! We have perfect content for your night.',
    'Hello, {name}! Ready for your evening entertainment?',
  ],
  night: [
    'Still up, {name}? We have some late-night recommendations.',
    'Night owl, {name}? Discover something new tonight.',
    'Can\'t sleep, {name}? How about something relaxing?',
  ],
}; 