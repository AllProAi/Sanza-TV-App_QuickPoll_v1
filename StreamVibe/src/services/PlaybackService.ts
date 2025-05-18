import type { PlayerState, PlaybackEvent, PlaybackEventType, StreamSource, PlayerError, PlaybackSession } from '../types/Player';
import type { WatchProgress } from '../types/Content';

// Define callback type for player events
type PlaybackEventCallback = (event: PlaybackEvent) => void;

// Define types for remote player integration
interface RemotePlayerInterface {
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  buffered?: {
    end: (index: number) => number;
  };
  play: () => Promise<void>;
  pause: () => Promise<void>;
  load: (source: { src: string; type: string; drm?: Record<string, unknown> }) => Promise<void>;
  unload: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setMuted: (muted: boolean) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
  requestFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  setQuality: (quality: string) => Promise<void>;
  addEventListener: (event: string, listener: () => void) => void;
  removeEventListener: (event: string, listener: () => void) => void;
  // Add other methods as needed
}

/**
 * Service for managing video playback state
 */
class PlaybackService {
  private static instance: PlaybackService;
  private playerState: PlayerState;
  private listeners: Map<PlaybackEventType, PlaybackEventCallback[]> = new Map();
  private storageKeyPrefix = 'streamvibe_playback_';
  private currentSession: PlaybackSession | null = null;
  private playbackInterval: number | null = null;
  private remotePlayer: RemotePlayerInterface | null = null; // Will be initialized with Senza SDK

  private constructor() {
    // Initialize default player state
    this.playerState = {
      status: 'idle',
      contentId: null,
      episodeId: null,
      currentTime: 0,
      duration: 0,
      buffered: 0,
      volume: 1,
      muted: false,
      playbackRate: 1.0,
      fullscreen: false,
      quality: 'auto',
      audioTrack: null,
      subtitleTrack: null,
      error: null
    };
  }

  /**
   * Get singleton instance of PlaybackService
   */
  public static getInstance(): PlaybackService {
    if (!PlaybackService.instance) {
      PlaybackService.instance = new PlaybackService();
    }
    return PlaybackService.instance;
  }

  /**
   * Initialize Senza remote player
   */
  public initializeRemotePlayer(senzaSDK: { remotePlayer: RemotePlayerInterface }): void {
    try {
      this.remotePlayer = senzaSDK.remotePlayer;
      
      // Add event listeners to remote player
      if (this.remotePlayer) {
        this.remotePlayer.addEventListener('play', () => this.handleRemotePlayerEvent('play'));
        this.remotePlayer.addEventListener('pause', () => this.handleRemotePlayerEvent('pause'));
        this.remotePlayer.addEventListener('timeupdate', () => this.handleRemotePlayerEvent('timeupdate'));
        this.remotePlayer.addEventListener('ended', () => this.handleRemotePlayerEvent('ended'));
        this.remotePlayer.addEventListener('error', () => this.handleRemotePlayerError({
          code: 'PLAYER_ERROR',
          message: 'An error occurred in the player',
          fatal: false
        }));
        this.remotePlayer.addEventListener('volumechange', () => this.handleRemotePlayerEvent('volumechange'));
        this.remotePlayer.addEventListener('waiting', () => this.handleRemotePlayerEvent('bufferingstart'));
        this.remotePlayer.addEventListener('canplay', () => this.handleRemotePlayerEvent('bufferingend'));
      }
      
      console.log('Remote player initialized successfully');
    } catch (error) {
      console.error('Failed to initialize remote player:', error);
    }
  }

  /**
   * Handle events from remote player
   */
  private handleRemotePlayerEvent(type: PlaybackEventType): void {
    if (!this.remotePlayer) return;
    
    // Update player state based on event type
    switch (type) {
      case 'play':
        this.playerState.status = 'playing';
        break;
      case 'pause':
        this.playerState.status = 'paused';
        break;
      case 'timeupdate':
        this.playerState.currentTime = this.remotePlayer.currentTime;
        this.playerState.buffered = this.remotePlayer.buffered?.end(0) || 0;
        // Save progress every 30 seconds
        if (Math.floor(this.playerState.currentTime) % 30 === 0) {
          this.saveWatchProgress();
        }
        break;
      case 'ended':
        this.playerState.status = 'ended';
        this.completeCurrentSession();
        break;
      case 'bufferingstart':
        this.playerState.status = 'buffering';
        break;
      case 'bufferingend':
        this.playerState.status = this.playerState.status === 'buffering' 
          ? 'playing' 
          : this.playerState.status;
        break;
      case 'volumechange':
        this.playerState.volume = this.remotePlayer.volume;
        this.playerState.muted = this.remotePlayer.muted;
        break;
    }
    
    // Dispatch event to listeners
    this.dispatchEvent({
      type,
      timestamp: Date.now(),
      data: { ...this.playerState }
    });
  }

  /**
   * Handle errors from remote player
   */
  private handleRemotePlayerError(error: PlayerError): void {
    const playerError: PlayerError = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred during playback',
      fatal: error.fatal || false
    };
    
    this.playerState.status = 'error';
    this.playerState.error = playerError;
    
    this.dispatchEvent({
      type: 'error',
      timestamp: Date.now(),
      data: playerError
    });
    
    // Cancel current session if error is fatal
    if (playerError.fatal && this.currentSession) {
      this.completeCurrentSession();
    }
  }

  /**
   * Load content for playback
   */
  public async loadContent(
    contentId: string, 
    source: StreamSource,
    episodeId?: string, 
    startPosition?: number
  ): Promise<boolean> {
    try {
      // Check if remotePlayer is available
      if (!this.remotePlayer) {
        throw new Error('Remote player not initialized');
      }
      
      // Update player state
      this.playerState.status = 'loading';
      this.playerState.contentId = contentId;
      this.playerState.episodeId = episodeId || null;
      this.playerState.currentTime = 0;
      this.playerState.duration = 0;
      this.playerState.error = null;
      
      // Dispatch loading event
      this.dispatchEvent({
        type: 'bufferingstart',
        timestamp: Date.now(),
        data: { contentId, episodeId }
      });
      
      // Load content in remote player
      await this.remotePlayer.load({
        src: source.url,
        type: source.type,
        drm: source.drm
      });
      
      // Start a new playback session
      this.startPlaybackSession(contentId, episodeId);
      
      // Set initial position if provided
      if (startPosition && startPosition > 0) {
        await this.seek(startPosition);
      }
      
      // Check for saved watch progress if no start position is provided
      if (!startPosition) {
        const savedProgress = this.getWatchProgress(contentId, episodeId);
        if (savedProgress && savedProgress.position > 0) {
          // Only resume if less than 98% complete
          if (savedProgress.percentage < 98) {
            await this.seek(savedProgress.position);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to load content:', error);
      
      this.playerState.status = 'error';
      this.playerState.error = {
        code: 'LOAD_ERROR',
        message: error instanceof Error ? error.message : 'Failed to load content',
        fatal: true
      };
      
      this.dispatchEvent({
        type: 'error',
        timestamp: Date.now(),
        data: this.playerState.error
      });
      
      return false;
    }
  }

  /**
   * Play content
   */
  public async play(): Promise<boolean> {
    try {
      if (!this.remotePlayer) {
        throw new Error('Remote player not initialized');
      }
      
      await this.remotePlayer.play();
      
      // Start tracking playback if not already
      if (!this.playbackInterval) {
        this.startPlaybackInterval();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to play content:', error);
      return false;
    }
  }

  /**
   * Pause content
   */
  public async pause(): Promise<boolean> {
    try {
      if (!this.remotePlayer) {
        throw new Error('Remote player not initialized');
      }
      
      await this.remotePlayer.pause();
      
      // Save watch progress when pausing
      this.saveWatchProgress();
      
      return true;
    } catch (error) {
      console.error('Failed to pause content:', error);
      return false;
    }
  }

  /**
   * Toggle play/pause
   */
  public async togglePlayPause(): Promise<boolean> {
    if (this.playerState.status === 'playing') {
      return this.pause();
    } else {
      return this.play();
    }
  }

  /**
   * Seek to position
   */
  public async seek(position: number): Promise<boolean> {
    try {
      if (!this.remotePlayer) {
        throw new Error('Remote player not initialized');
      }
      
      // Ensure position is within valid range
      const safePosition = Math.max(0, Math.min(position, this.playerState.duration));
      
      await this.remotePlayer.seekTo(safePosition);
      
      // Update player state
      this.playerState.currentTime = safePosition;
      
      // Dispatch seek event
      this.dispatchEvent({
        type: 'seeked',
        timestamp: Date.now(),
        data: { currentTime: safePosition }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to seek:', error);
      return false;
    }
  }

  /**
   * Set volume
   */
  public async setVolume(volume: number): Promise<boolean> {
    try {
      if (!this.remotePlayer) {
        throw new Error('Remote player not initialized');
      }
      
      // Ensure volume is within valid range
      const safeVolume = Math.max(0, Math.min(1, volume));
      
      await this.remotePlayer.setVolume(safeVolume);
      
      // Update player state
      this.playerState.volume = safeVolume;
      
      // Dispatch volume change event
      this.dispatchEvent({
        type: 'volumechange',
        timestamp: Date.now(),
        data: { volume: safeVolume }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to set volume:', error);
      return false;
    }
  }

  /**
   * Toggle mute
   */
  public async toggleMute(): Promise<boolean> {
    try {
      if (!this.remotePlayer) {
        throw new Error('Remote player not initialized');
      }
      
      const newMuteState = !this.playerState.muted;
      
      await this.remotePlayer.setMuted(newMuteState);
      
      // Update player state
      this.playerState.muted = newMuteState;
      
      // Dispatch volume change event
      this.dispatchEvent({
        type: 'volumechange',
        timestamp: Date.now(),
        data: { muted: newMuteState }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      return false;
    }
  }

  /**
   * Set playback rate
   */
  public async setPlaybackRate(rate: number): Promise<boolean> {
    try {
      if (!this.remotePlayer) {
        throw new Error('Remote player not initialized');
      }
      
      // Ensure rate is within valid range
      const safeRate = Math.max(0.25, Math.min(2, rate));
      
      await this.remotePlayer.setPlaybackRate(safeRate);
      
      // Update player state
      this.playerState.playbackRate = safeRate;
      
      return true;
    } catch (error) {
      console.error('Failed to set playback rate:', error);
      return false;
    }
  }

  /**
   * Toggle fullscreen
   */
  public async toggleFullscreen(): Promise<boolean> {
    try {
      if (!this.remotePlayer) {
        throw new Error('Remote player not initialized');
      }
      
      if (!this.playerState.fullscreen) {
        await this.remotePlayer.requestFullscreen();
        this.playerState.fullscreen = true;
      } else {
        await this.remotePlayer.exitFullscreen();
        this.playerState.fullscreen = false;
      }
      
      // Dispatch fullscreen change event
      this.dispatchEvent({
        type: 'fullscreenchange',
        timestamp: Date.now(),
        data: { fullscreen: this.playerState.fullscreen }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error);
      return false;
    }
  }

  /**
   * Set quality
   */
  public async setQuality(quality: PlayerState['quality']): Promise<boolean> {
    try {
      if (!this.remotePlayer) {
        throw new Error('Remote player not initialized');
      }
      
      await this.remotePlayer.setQuality(quality);
      
      // Update player state
      this.playerState.quality = quality;
      
      // Dispatch quality change event
      this.dispatchEvent({
        type: 'qualitychange',
        timestamp: Date.now(),
        data: { quality }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to set quality:', error);
      return false;
    }
  }

  /**
   * Stop playback and unload content
   */
  public async stop(): Promise<void> {
    try {
      if (!this.remotePlayer) {
        throw new Error('Remote player not initialized');
      }
      
      // Save progress before stopping
      this.saveWatchProgress();
      
      // Complete the current session
      if (this.currentSession) {
        this.completeCurrentSession();
      }
      
      // Stop tracking playback
      this.stopPlaybackInterval();
      
      // Unload content from remote player
      await this.remotePlayer.unload();
      
      // Reset player state
      this.playerState = {
        status: 'idle',
        contentId: null,
        episodeId: null,
        currentTime: 0,
        duration: 0,
        buffered: 0,
        volume: this.playerState.volume,
        muted: this.playerState.muted,
        playbackRate: 1.0,
        fullscreen: false,
        quality: 'auto',
        audioTrack: null,
        subtitleTrack: null,
        error: null
      };
      
      // Dispatch event
      this.dispatchEvent({
        type: 'seeked',
        timestamp: Date.now(),
        data: this.playerState
      });
    } catch (error) {
      console.error('Failed to stop playback:', error);
    }
  }

  /**
   * Add event listener
   */
  public addEventListener(type: PlaybackEventType, callback: (event: unknown) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    
    this.listeners.get(type)?.push(callback as PlaybackEventCallback);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(type: PlaybackEventType, callback: (event: unknown) => void): void {
    const callbacks = this.listeners.get(type);
    
    if (callbacks) {
      this.listeners.set(
        type,
        callbacks.filter(cb => cb !== callback)
      );
    }
  }

  /**
   * Dispatch event to listeners
   */
  private dispatchEvent(event: PlaybackEvent): void {
    const callbacks = this.listeners.get(event.type);
    
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in ${event.type} event listener:`, error);
        }
      });
    }
  }

  /**
   * Start a new playback session
   */
  private startPlaybackSession(contentId: string, episodeId?: string): void {
    // Complete any existing session
    if (this.currentSession) {
      this.completeCurrentSession();
    }
    
    // Create a new session
    this.currentSession = {
      id: `session_${Date.now()}`,
      contentId,
      episodeId,
      startTime: new Date().toISOString(),
      duration: 0,
      watchTime: 0,
      completionPercentage: 0,
      deviceInfo: this.getDeviceInfo()
    };
    
    // Start tracking playback
    this.startPlaybackInterval();
  }

  /**
   * Complete the current playback session
   */
  private completeCurrentSession(): void {
    if (!this.currentSession) return;
    
    // Stop tracking playback
    this.stopPlaybackInterval();
    
    // Update session data
    this.currentSession.endTime = new Date().toISOString();
    this.currentSession.duration = this.playerState.duration;
    this.currentSession.watchTime = this.playerState.currentTime;
    this.currentSession.completionPercentage = this.calculateCompletionPercentage();
    
    // Save session to storage
    this.saveSessionToStorage(this.currentSession);
    
    // Save final watch progress
    this.saveWatchProgress();
    
    // Clear current session
    this.currentSession = null;
  }

  /**
   * Start interval to track playback
   */
  private startPlaybackInterval(): void {
    if (this.playbackInterval) {
      this.stopPlaybackInterval();
    }
    
    this.playbackInterval = window.setInterval(() => {
      // Save watch progress periodically
      this.saveWatchProgress();
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop playback tracking interval
   */
  private stopPlaybackInterval(): void {
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
  }

  /**
   * Save current watch progress
   */
  public saveWatchProgress(): void {
    if (!this.playerState.contentId) return;
    
    const progress: WatchProgress = {
      contentId: this.playerState.contentId,
      episodeId: this.playerState.episodeId || undefined,
      position: this.playerState.currentTime,
      duration: this.playerState.duration,
      percentage: this.calculateCompletionPercentage(),
      lastWatched: new Date().toISOString(),
      completed: this.calculateCompletionPercentage() >= 90 // Mark as completed if watched 90% or more
    };
    
    // Save to storage
    this.saveProgressToStorage(progress);
  }

  /**
   * Get watch progress for content
   */
  public getWatchProgress(contentId: string, episodeId?: string): WatchProgress | null {
    try {
      const key = `${this.storageKeyPrefix}progress_${contentId}${episodeId ? '_' + episodeId : ''}`;
      const data = localStorage.getItem(key);
      
      if (data) {
        return JSON.parse(data) as WatchProgress;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get watch progress:', error);
      return null;
    }
  }

  /**
   * Save progress to storage
   */
  private saveProgressToStorage(progress: WatchProgress): void {
    try {
      const key = `${this.storageKeyPrefix}progress_${progress.contentId}${progress.episodeId ? '_' + progress.episodeId : ''}`;
      localStorage.setItem(key, JSON.stringify(progress));
      
      // Also save to the combined videoProgress object for easier retrieval
      const allProgress = JSON.parse(localStorage.getItem('videoProgress') || '{}');
      const progressKey = `${progress.contentId}${progress.episodeId ? '_' + progress.episodeId : ''}`;
      allProgress[progressKey] = progress;
      localStorage.setItem('videoProgress', JSON.stringify(allProgress));
    } catch (error) {
      console.error('Failed to save watch progress:', error);
    }
  }

  /**
   * Save session to storage
   */
  private saveSessionToStorage(session: PlaybackSession): void {
    try {
      // Save individual session
      const sessionKey = `${this.storageKeyPrefix}session_${session.id}`;
      localStorage.setItem(sessionKey, JSON.stringify(session));
      
      // Update sessions list
      const sessionsKey = `${this.storageKeyPrefix}sessions`;
      const sessions = JSON.parse(localStorage.getItem(sessionsKey) || '[]') as string[];
      
      // Add new session ID
      sessions.push(session.id);
      
      // Limit to last 50 sessions
      if (sessions.length > 50) {
        const removedSessions = sessions.splice(0, sessions.length - 50);
        
        // Clean up old sessions
        removedSessions.forEach(id => {
          localStorage.removeItem(`${this.storageKeyPrefix}session_${id}`);
        });
      }
      
      localStorage.setItem(sessionsKey, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save playback session:', error);
    }
  }

  /**
   * Calculate completion percentage
   */
  private calculateCompletionPercentage(): number {
    if (this.playerState.duration <= 0) return 0;
    
    return Math.min(100, Math.round((this.playerState.currentTime / this.playerState.duration) * 100));
  }

  /**
   * Get device info for session tracking
   */
  private getDeviceInfo() {
    return {
      id: 'browser_' + navigator.userAgent.replace(/\D+/g, ''),
      type: this.detectDeviceType(),
      name: navigator.userAgent,
      os: navigator.platform
    };
  }

  /**
   * Detect device type
   */
  private detectDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/ipad|tablet|playbook|silk/.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  /**
   * Get current player state
   */
  public getPlayerState(): PlayerState {
    return { ...this.playerState };
  }
}

export default PlaybackService; 