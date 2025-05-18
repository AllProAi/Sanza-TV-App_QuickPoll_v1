import { useCallback, useState, useEffect } from 'react';
import PlaybackService from '../services/PlaybackService';
import type { PlayerState, PlaybackEventType, StreamSource } from '../types/Player';
import type { WatchProgress } from '../types/Content';

/**
 * Custom hook for accessing player state and controls
 */
export const usePlayback = () => {
  const playbackService = PlaybackService.getInstance();
  const [playerState, setPlayerState] = useState<PlayerState>(playbackService.getPlayerState());
  const [controlsState] = useState({
    visible: false,
    timeoutId: null as number | null,
    seekbarHover: false,
    seekPreviewTime: null as number | null,
    volumeControlVisible: false,
    settingsMenuVisible: false,
    currentSettingsMenu: null as string | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update player state when it changes in service
  useEffect(() => {
    const handlePlayerStateChange = () => {
      setPlayerState(playbackService.getPlayerState());
    };

    // Listen for player state changes
    playbackService.addEventListener('timeupdate', handlePlayerStateChange);
    playbackService.addEventListener('play', handlePlayerStateChange);
    playbackService.addEventListener('pause', handlePlayerStateChange);
    playbackService.addEventListener('seeked', handlePlayerStateChange);
    playbackService.addEventListener('volumechange', handlePlayerStateChange);
    playbackService.addEventListener('error', (event: unknown) => {
      handlePlayerStateChange();
      const errorEvent = event as Record<string, unknown>;
      setError(errorEvent.data && typeof errorEvent.data === 'object' && 'message' in errorEvent.data 
        ? String(errorEvent.data.message) 
        : 'An error occurred during playback');
    });

    return () => {
      // Clean up event listeners
      playbackService.removeEventListener('timeupdate', handlePlayerStateChange);
      playbackService.removeEventListener('play', handlePlayerStateChange);
      playbackService.removeEventListener('pause', handlePlayerStateChange);
      playbackService.removeEventListener('seeked', handlePlayerStateChange);
      playbackService.removeEventListener('volumechange', handlePlayerStateChange);
      playbackService.removeEventListener('error', handlePlayerStateChange);
    };
  }, [playbackService]);

  /**
   * Load and prepare content for playback
   */
  const loadMedia = useCallback(
    async (contentId: string, source: StreamSource, episodeId?: string, startPosition?: number): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await playbackService.loadContent(contentId, source, episodeId, startPosition);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    }, 
    [playbackService]
  );

  /**
   * Play content
   */
  const playMedia = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      return await playbackService.play();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to play content';
      setError(errorMessage);
      return false;
    }
  }, [playbackService]);

  /**
   * Pause content
   */
  const pauseMedia = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      return await playbackService.pause();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause content';
      setError(errorMessage);
      return false;
    }
  }, [playbackService]);

  /**
   * Toggle play/pause state
   */
  const togglePlay = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      return await playbackService.togglePlayPause();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle playback';
      setError(errorMessage);
      return false;
    }
  }, [playbackService]);

  /**
   * Seek to position
   */
  const seekTo = useCallback(async (position: number): Promise<boolean> => {
    setError(null);
    try {
      return await playbackService.seek(position);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to seek';
      setError(errorMessage);
      return false;
    }
  }, [playbackService]);

  /**
   * Set player volume
   */
  const setPlayerVolume = useCallback(async (volume: number): Promise<boolean> => {
    setError(null);
    try {
      return await playbackService.setVolume(volume);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set volume';
      setError(errorMessage);
      return false;
    }
  }, [playbackService]);

  /**
   * Toggle mute state
   */
  const togglePlayerMute = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      return await playbackService.toggleMute();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle mute';
      setError(errorMessage);
      return false;
    }
  }, [playbackService]);

  /**
   * Set playback rate
   */
  const setPlayerSpeed = useCallback(async (rate: number): Promise<boolean> => {
    setError(null);
    try {
      return await playbackService.setPlaybackRate(rate);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set playback rate';
      setError(errorMessage);
      return false;
    }
  }, [playbackService]);

  /**
   * Toggle fullscreen mode
   */
  const togglePlayerFullscreen = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      return await playbackService.toggleFullscreen();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle fullscreen';
      setError(errorMessage);
      return false;
    }
  }, [playbackService]);

  /**
   * Set video quality
   */
  const setPlayerQuality = useCallback(async (quality: PlayerState['quality']): Promise<boolean> => {
    setError(null);
    try {
      return await playbackService.setQuality(quality);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set quality';
      setError(errorMessage);
      return false;
    }
  }, [playbackService]);

  /**
   * Stop playback and reset player
   */
  const stopPlayback = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      await playbackService.stop();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop playback';
      setError(errorMessage);
    }
  }, [playbackService]);

  /**
   * Register event listener
   */
  const on = useCallback((event: PlaybackEventType, callback: (event: unknown) => void): void => {
    playbackService.addEventListener(event, callback);
  }, [playbackService]);

  /**
   * Remove event listener
   */
  const off = useCallback((event: PlaybackEventType, callback: (event: unknown) => void): void => {
    playbackService.removeEventListener(event, callback);
  }, [playbackService]);

  /**
   * Get watch progress for content
   */
  const getWatchProgress = useCallback((contentId: string, episodeId?: string): WatchProgress | null => {
    return playbackService.getWatchProgress(contentId, episodeId);
  }, [playbackService]);

  /**
   * Save watch progress for current content
   */
  const saveWatchProgress = useCallback(() => {
    playbackService.saveWatchProgress();
  }, [playbackService]);

  return {
    // State
    playerState,
    controlsState,
    isLoading,
    error,
    
    // Operations
    loadContent: loadMedia,
    play: playMedia,
    pause: pauseMedia,
    togglePlay,
    seekTo,
    setPlayerVolume,
    togglePlayerMute,
    setPlayerSpeed,
    togglePlayerFullscreen,
    setPlayerQuality,
    stopPlayback,
    on,
    off,
    getWatchProgress,
    saveWatchProgress,
  };
};

export default usePlayback; 