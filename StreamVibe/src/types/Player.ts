/**
 * Player and playback data models for StreamVibe TV App
 */

export interface PlayerState {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'ended' | 'error';
  contentId: string | null;
  episodeId: string | null;
  currentTime: number; // in seconds
  duration: number; // in seconds
  buffered: number; // in seconds
  volume: number; // 0-1
  muted: boolean;
  playbackRate: number; // 0.5-2.0
  fullscreen: boolean;
  quality: 'auto' | '480p' | '720p' | '1080p' | '4k';
  audioTrack: AudioTrack | null;
  subtitleTrack: SubtitleTrack | null;
  error: PlayerError | null;
}

export interface PlayerControlsState {
  visible: boolean;
  timeoutId: number | null;
  seekbarHover: boolean;
  seekPreviewTime: number | null;
  volumeControlVisible: boolean;
  settingsMenuVisible: boolean;
  currentSettingsMenu: SettingsMenuType | null;
}

export type SettingsMenuType = 'main' | 'quality' | 'audio' | 'subtitles' | 'playbackSpeed';

export interface AudioTrack {
  id: string;
  language: string;
  label: string;
  default: boolean;
}

export interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  default: boolean;
}

export interface PlayerError {
  code: string;
  message: string;
  fatal: boolean;
}

// Define possible data types for playback events
export type PlaybackEventData = 
  | PlayerState 
  | PlayerError 
  | { contentId: string; episodeId?: string | null }
  | { quality: PlayerState['quality'] }
  | { audioTrack: AudioTrack }
  | { subtitleTrack: SubtitleTrack }
  | Record<string, unknown>;

export interface PlaybackEvent {
  type: PlaybackEventType;
  timestamp: number;
  data?: PlaybackEventData;
}

export type PlaybackEventType = 
  | 'play'
  | 'pause'
  | 'seeked'
  | 'timeupdate'
  | 'ended'
  | 'volumechange'
  | 'error'
  | 'qualitychange'
  | 'fullscreenchange'
  | 'audiotrackswitched'
  | 'subtitletrackswitched'
  | 'bufferingstart'
  | 'bufferingend';

export interface PlaybackSession {
  id: string;
  contentId: string;
  episodeId?: string;
  startTime: string; // ISO date string
  endTime?: string; // ISO date string
  duration: number; // in seconds
  watchTime: number; // in seconds
  completionPercentage: number; // 0-100
  deviceInfo: {
    id: string;
    type: string;
    name: string;
    os: string;
  };
}

export interface StreamSource {
  url: string;
  type: 'hls' | 'dash' | 'mp4';
  drm?: {
    type: 'widevine' | 'playready' | 'fairplay';
    licenseUrl: string;
    headers?: Record<string, string>;
  };
  qualities: StreamQuality[];
}

export interface StreamQuality {
  label: string; // '480p', '720p', etc.
  width: number;
  height: number;
  bitrate: number;
} 