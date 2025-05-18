import type { ContentItem, Category, SeriesContent } from '../../types/Content';

/**
 * Mock content data for the StreamVibe TV App
 * This simulates data that would come from a real API
 */

// Mock movie content
const mockMovies: ContentItem[] = [
  {
    id: 'movie-1',
    title: 'The Last Adventure',
    description: 'A thrilling journey through uncharted territories as explorers discover a hidden world with unexpected dangers and wonders.',
    posterImage: 'https://picsum.photos/seed/movie1/300/450',
    backdropImage: 'https://picsum.photos/seed/movie1bg/1920/1080',
    releaseYear: 2023,
    ageRating: 'PG-13',
    duration: 125,
    genres: ['Adventure', 'Action', 'Fantasy'],
    tags: ['epic', 'journey', 'discovery'],
    type: 'movie',
    trailerUrl: 'https://example.com/trailers/last-adventure.mp4',
    streamUrl: 'https://example.com/streams/last-adventure.m3u8'
  },
  {
    id: 'movie-2',
    title: 'Midnight Mystery',
    description: 'A detective must solve a puzzling case before dawn in this noir thriller that will keep you guessing until the very end.',
    posterImage: 'https://picsum.photos/seed/movie2/300/450',
    backdropImage: 'https://picsum.photos/seed/movie2bg/1920/1080',
    releaseYear: 2022,
    ageRating: 'R',
    duration: 110,
    genres: ['Mystery', 'Thriller', 'Crime'],
    tags: ['detective', 'noir', 'suspense'],
    type: 'movie',
    trailerUrl: 'https://example.com/trailers/midnight-mystery.mp4',
    streamUrl: 'https://example.com/streams/midnight-mystery.m3u8'
  },
  {
    id: 'movie-3',
    title: 'Love in Paris',
    description: 'Two strangers meet by chance in the city of lights and embark on a whirlwind romance that will change their lives forever.',
    posterImage: 'https://picsum.photos/seed/movie3/300/450',
    backdropImage: 'https://picsum.photos/seed/movie3bg/1920/1080',
    releaseYear: 2021,
    ageRating: 'PG-13',
    duration: 105,
    genres: ['Romance', 'Drama'],
    tags: ['paris', 'love', 'romance'],
    type: 'movie',
    trailerUrl: 'https://example.com/trailers/love-paris.mp4',
    streamUrl: 'https://example.com/streams/love-paris.m3u8'
  },
  {
    id: 'movie-4',
    title: 'Cosmic Odyssey',
    description: 'A journey through space and time as humanity attempts to find a new home among the stars.',
    posterImage: 'https://picsum.photos/seed/movie4/300/450',
    backdropImage: 'https://picsum.photos/seed/movie4bg/1920/1080',
    releaseYear: 2023,
    ageRating: 'PG-13',
    duration: 145,
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    tags: ['space', 'future', 'epic'],
    type: 'movie',
    trailerUrl: 'https://example.com/trailers/cosmic-odyssey.mp4',
    streamUrl: 'https://example.com/streams/cosmic-odyssey.m3u8'
  },
  {
    id: 'movie-5',
    title: 'The Haunting',
    description: 'A family moves into an old mansion only to discover they are not alone in this terrifying supernatural thriller.',
    posterImage: 'https://picsum.photos/seed/movie5/300/450',
    backdropImage: 'https://picsum.photos/seed/movie5bg/1920/1080',
    releaseYear: 2022,
    ageRating: 'R',
    duration: 98,
    genres: ['Horror', 'Thriller', 'Supernatural'],
    tags: ['haunted', 'scary', 'ghosts'],
    type: 'movie',
    trailerUrl: 'https://example.com/trailers/haunting.mp4',
    streamUrl: 'https://example.com/streams/haunting.m3u8'
  }
];

// Mock series content
const mockSeries: SeriesContent[] = [
  {
    id: 'series-1',
    title: 'Dark Secrets',
    description: 'In a small town where everyone has something to hide, a detective uncovers a web of secrets that could destroy everything.',
    posterImage: 'https://picsum.photos/seed/series1/300/450',
    backdropImage: 'https://picsum.photos/seed/series1bg/1920/1080',
    releaseYear: 2021,
    ageRating: 'TV-MA',
    duration: 480, // Total minutes across all episodes
    genres: ['Drama', 'Mystery', 'Crime'],
    tags: ['detective', 'smalltown', 'secrets'],
    type: 'series',
    trailerUrl: 'https://example.com/trailers/dark-secrets.mp4',
    seasons: [
      {
        id: 'series-1-season-1',
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'series-1-s1-e1',
            episodeNumber: 1,
            title: 'The Beginning',
            description: 'Detective Sarah Miller arrives in town to investigate a suspicious death.',
            duration: 48,
            thumbnailImage: 'https://picsum.photos/seed/s1e1/400/225',
            streamUrl: 'https://example.com/streams/dark-secrets-s1e1.m3u8'
          },
          {
            id: 'series-1-s1-e2',
            episodeNumber: 2,
            title: 'Revelations',
            description: 'Secrets start to emerge as Sarah digs deeper into the town\'s history.',
            duration: 52,
            thumbnailImage: 'https://picsum.photos/seed/s1e2/400/225',
            streamUrl: 'https://example.com/streams/dark-secrets-s1e2.m3u8'
          },
          {
            id: 'series-1-s1-e3',
            episodeNumber: 3,
            title: 'The Truth',
            description: 'A shocking discovery changes everything about the investigation.',
            duration: 55,
            thumbnailImage: 'https://picsum.photos/seed/s1e3/400/225',
            streamUrl: 'https://example.com/streams/dark-secrets-s1e3.m3u8'
          }
        ]
      },
      {
        id: 'series-1-season-2',
        seasonNumber: 2,
        title: 'Season 2',
        episodes: [
          {
            id: 'series-1-s2-e1',
            episodeNumber: 1,
            title: 'New Case',
            description: 'One year later, Sarah returns to investigate another mysterious death.',
            duration: 50,
            thumbnailImage: 'https://picsum.photos/seed/s2e1/400/225',
            streamUrl: 'https://example.com/streams/dark-secrets-s2e1.m3u8'
          },
          {
            id: 'series-1-s2-e2',
            episodeNumber: 2,
            title: 'Connections',
            description: 'Sarah begins to see connections between the new case and her previous investigation.',
            duration: 48,
            thumbnailImage: 'https://picsum.photos/seed/s2e2/400/225',
            streamUrl: 'https://example.com/streams/dark-secrets-s2e2.m3u8'
          }
        ]
      }
    ]
  },
  {
    id: 'series-2',
    title: 'Future World',
    description: 'In a distant future, humanity has evolved beyond recognition, exploring new frontiers of technology and consciousness.',
    posterImage: 'https://picsum.photos/seed/series2/300/450',
    backdropImage: 'https://picsum.photos/seed/series2bg/1920/1080',
    releaseYear: 2023,
    ageRating: 'TV-14',
    duration: 320, // Total minutes across all episodes
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    tags: ['future', 'technology', 'evolution'],
    type: 'series',
    trailerUrl: 'https://example.com/trailers/future-world.mp4',
    seasons: [
      {
        id: 'series-2-season-1',
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          {
            id: 'series-2-s1-e1',
            episodeNumber: 1,
            title: 'New Dawn',
            description: 'The dawn of a new era for humanity as technological singularity approaches.',
            duration: 52,
            thumbnailImage: 'https://picsum.photos/seed/fw1/400/225',
            streamUrl: 'https://example.com/streams/future-world-s1e1.m3u8'
          },
          {
            id: 'series-2-s1-e2',
            episodeNumber: 2,
            title: 'Evolution',
            description: 'Humans begin to merge with technology in unexpected ways.',
            duration: 48,
            thumbnailImage: 'https://picsum.photos/seed/fw2/400/225',
            streamUrl: 'https://example.com/streams/future-world-s1e2.m3u8'
          },
          {
            id: 'series-2-s1-e3',
            episodeNumber: 3,
            title: 'The Beyond',
            description: 'The first explorers venture into digital consciousness.',
            duration: 50,
            thumbnailImage: 'https://picsum.photos/seed/fw3/400/225',
            streamUrl: 'https://example.com/streams/future-world-s1e3.m3u8'
          }
        ]
      }
    ]
  }
];

// Mock documentary content
const mockDocumentaries: ContentItem[] = [
  {
    id: 'doc-1',
    title: 'Secrets of the Deep',
    description: 'Explore the mysterious depths of our oceans and discover creatures never before seen by human eyes.',
    posterImage: 'https://picsum.photos/seed/doc1/300/450',
    backdropImage: 'https://picsum.photos/seed/doc1bg/1920/1080',
    releaseYear: 2022,
    ageRating: 'PG',
    duration: 90,
    genres: ['Documentary', 'Nature', 'Science'],
    tags: ['ocean', 'marine', 'exploration'],
    type: 'documentary',
    trailerUrl: 'https://example.com/trailers/secrets-deep.mp4',
    streamUrl: 'https://example.com/streams/secrets-deep.m3u8'
  },
  {
    id: 'doc-2',
    title: 'The Digital Revolution',
    description: 'The story of how computers and the internet transformed our world and reshaped society.',
    posterImage: 'https://picsum.photos/seed/doc2/300/450',
    backdropImage: 'https://picsum.photos/seed/doc2bg/1920/1080',
    releaseYear: 2021,
    ageRating: 'PG',
    duration: 105,
    genres: ['Documentary', 'Technology', 'History'],
    tags: ['computers', 'internet', 'technology'],
    type: 'documentary',
    trailerUrl: 'https://example.com/trailers/digital-revolution.mp4',
    streamUrl: 'https://example.com/streams/digital-revolution.m3u8'
  },
  {
    id: 'doc-3',
    title: 'Ancient Mysteries',
    description: 'Uncover the secrets of ancient civilizations and their mysterious technologies and practices.',
    posterImage: 'https://picsum.photos/seed/doc3/300/450',
    backdropImage: 'https://picsum.photos/seed/doc3bg/1920/1080',
    releaseYear: 2023,
    ageRating: 'PG',
    duration: 95,
    genres: ['Documentary', 'History', 'Archaeology'],
    tags: ['ancient', 'civilizations', 'mysteries'],
    type: 'documentary',
    trailerUrl: 'https://example.com/trailers/ancient-mysteries.mp4',
    streamUrl: 'https://example.com/streams/ancient-mysteries.m3u8'
  }
];

// Mock live content
const mockLive: ContentItem[] = [
  {
    id: 'live-1',
    title: 'Global News Now',
    description: '24/7 coverage of breaking news and events from around the world.',
    posterImage: 'https://picsum.photos/seed/live1/300/450',
    backdropImage: 'https://picsum.photos/seed/live1bg/1920/1080',
    releaseYear: 2023,
    ageRating: 'TV-PG',
    duration: 60, // Placeholder duration for live content
    genres: ['News', 'Current Events'],
    tags: ['live', 'news', 'global'],
    type: 'live',
    streamUrl: 'https://example.com/streams/global-news-live.m3u8'
  },
  {
    id: 'live-2',
    title: 'Sports Central',
    description: 'Live sports coverage from around the globe, featuring the biggest games and events.',
    posterImage: 'https://picsum.photos/seed/live2/300/450',
    backdropImage: 'https://picsum.photos/seed/live2bg/1920/1080',
    releaseYear: 2023,
    ageRating: 'TV-PG',
    duration: 120, // Placeholder duration for live content
    genres: ['Sports', 'Live Events'],
    tags: ['live', 'sports', 'events'],
    type: 'live',
    streamUrl: 'https://example.com/streams/sports-central-live.m3u8'
  }
];

// Combine all content
const allContent: ContentItem[] = [
  ...mockMovies,
  ...mockSeries,
  ...mockDocumentaries,
  ...mockLive
];

// Mock categories
const mockCategories: Category[] = [
  {
    id: 'category-1',
    name: 'Trending Now',
    description: 'The hottest content everyone is watching right now',
    contentIds: ['movie-1', 'series-1', 'movie-4', 'doc-1', 'live-1']
  },
  {
    id: 'category-2',
    name: 'New Releases',
    description: 'The latest content added to our platform',
    contentIds: ['movie-4', 'series-2', 'doc-3', 'live-2']
  },
  {
    id: 'category-3',
    name: 'Sci-Fi & Fantasy',
    description: 'Explore new worlds and fantastic realms',
    contentIds: ['movie-4', 'series-2']
  },
  {
    id: 'category-4',
    name: 'Documentaries',
    description: 'Fascinating real-world stories and explorations',
    contentIds: ['doc-1', 'doc-2', 'doc-3']
  },
  {
    id: 'category-5',
    name: 'Thrillers & Mystery',
    description: 'Edge-of-your-seat suspense and intrigue',
    contentIds: ['movie-2', 'movie-5', 'series-1']
  },
  {
    id: 'category-6',
    name: 'Live Now',
    description: 'Watch events as they happen in real-time',
    contentIds: ['live-1', 'live-2']
  }
];

export default {
  content: allContent,
  categories: mockCategories
}; 