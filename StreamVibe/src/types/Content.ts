/**
 * Content data models for StreamVibe TV App
 */

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  posterImage: string;
  backdropImage: string;
  releaseYear: number;
  ageRating: string;
  duration: number; // in minutes
  genres: string[];
  tags: string[];
  type: 'movie' | 'series' | 'documentary' | 'live';
  trailerUrl?: string;
  streamUrl?: string;
}

export interface SeriesContent extends ContentItem {
  type: 'series';
  seasons: Season[];
}

export interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  description: string;
  duration: number; // in minutes
  thumbnailImage: string;
  streamUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  contentIds: string[];
}

export interface WatchProgress {
  contentId: string;
  episodeId?: string;
  position: number; // in seconds
  duration: number; // in seconds
  percentage: number; // 0-100
  lastWatched: string; // ISO date string
  completed: boolean;
}

export interface ContentFilter {
  genres?: string[];
  type?: ContentItem['type'] | ContentItem['type'][];
  year?: number | [number, number]; // single year or range
  ageRating?: string[];
  duration?: [number, number]; // range in minutes
  searchQuery?: string;
}

export interface ContentSortOption {
  field: 'title' | 'releaseYear' | 'duration' | 'lastWatched';
  direction: 'asc' | 'desc';
} 