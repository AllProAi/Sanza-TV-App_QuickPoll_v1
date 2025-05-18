/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useReducer, useCallback, useRef, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';

// Define player-related types
export interface PlayerState {
  currentContentId: string | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  buffered: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  quality: 'auto' | '240p' | '360p' | '480p' | '720p' | '1080p' | '4k';
  isLoading: boolean;
  error: string | null;
}

// Define action types
type PlayerAction =
  | { type: 'LOAD_CONTENT'; payload: string }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SEEK'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'UPDATE_TIME'; payload: number }
  | { type: 'UPDATE_BUFFER'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'MUTE' }
  | { type: 'UNMUTE' }
  | { type: 'SET_PLAYBACK_RATE'; payload: number }
  | { type: 'ENTER_FULLSCREEN' }
  | { type: 'EXIT_FULLSCREEN' }
  | { type: 'SET_QUALITY'; payload: PlayerState['quality'] }
  | { type: 'LOADING_START' }
  | { type: 'LOADING_END' }
  | { type: 'ERROR'; payload: string }
  | { type: 'RESET' };

// Define initial state
const initialState: PlayerState = {
  currentContentId: null,
  isPlaying: false,
  duration: 0,
  currentTime: 0,
  buffered: 0,
  volume: 1,
  isMuted: false,
  playbackRate: 1,
  isFullscreen: false,
  quality: 'auto',
  isLoading: false,
  error: null
};

// Create context
interface PlayerContextType {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
  playerRef: React.RefObject<HTMLVideoElement | null>;
  loadContent: (contentId: string) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  toggleFullscreen: () => void;
  setQuality: (quality: PlayerState['quality']) => void;
}

const PlayerContext = createContext<PlayerContextType>({
  state: initialState,
  dispatch: () => null,
  playerRef: { current: null },
  loadContent: () => {},
  play: () => {},
  pause: () => {},
  togglePlay: () => {},
  seek: () => {},
  skipForward: () => {},
  skipBackward: () => {},
  setVolume: () => {},
  toggleMute: () => {},
  setPlaybackRate: () => {},
  toggleFullscreen: () => {},
  setQuality: () => {}
});

// Create reducer
const playerReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case 'LOAD_CONTENT':
      return {
        ...initialState,
        currentContentId: action.payload,
        isLoading: true
      };
    case 'PLAY':
      return {
        ...state,
        isPlaying: true
      };
    case 'PAUSE':
      return {
        ...state,
        isPlaying: false
      };
    case 'SEEK':
      return {
        ...state,
        currentTime: action.payload
      };
    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload
      };
    case 'UPDATE_TIME':
      return {
        ...state,
        currentTime: action.payload
      };
    case 'UPDATE_BUFFER':
      return {
        ...state,
        buffered: action.payload
      };
    case 'SET_VOLUME':
      return {
        ...state,
        volume: action.payload,
        isMuted: action.payload === 0
      };
    case 'MUTE':
      return {
        ...state,
        isMuted: true
      };
    case 'UNMUTE':
      return {
        ...state,
        isMuted: false
      };
    case 'SET_PLAYBACK_RATE':
      return {
        ...state,
        playbackRate: action.payload
      };
    case 'ENTER_FULLSCREEN':
      return {
        ...state,
        isFullscreen: true
      };
    case 'EXIT_FULLSCREEN':
      return {
        ...state,
        isFullscreen: false
      };
    case 'SET_QUALITY':
      return {
        ...state,
        quality: action.payload
      };
    case 'LOADING_START':
      return {
        ...state,
        isLoading: true
      };
    case 'LOADING_END':
      return {
        ...state,
        isLoading: false
      };
    case 'ERROR':
      return {
        ...state,
        error: action.payload,
        isPlaying: false,
        isLoading: false
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

// Create provider
interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const playerRef = useRef<HTMLVideoElement>(null);
  
  // Load content
  const loadContent = useCallback((contentId: string) => {
    dispatch({ type: 'LOAD_CONTENT', payload: contentId });
  }, []);
  
  // Play video
  const play = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.play()
        .then(() => dispatch({ type: 'PLAY' }))
        .catch(error => dispatch({ type: 'ERROR', payload: error.message }));
    }
  }, []);
  
  // Pause video
  const pause = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pause();
      dispatch({ type: 'PAUSE' });
    }
  }, []);
  
  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);
  
  // Seek to time
  const seek = useCallback((time: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = Math.max(0, Math.min(time, state.duration));
      dispatch({ type: 'SEEK', payload: playerRef.current.currentTime });
    }
  }, [state.duration]);
  
  // Skip forward
  const skipForward = useCallback((seconds = 10) => {
    seek(state.currentTime + seconds);
  }, [state.currentTime, seek]);
  
  // Skip backward
  const skipBackward = useCallback((seconds = 10) => {
    seek(state.currentTime - seconds);
  }, [state.currentTime, seek]);
  
  // Set volume
  const setVolume = useCallback((volume: number) => {
    if (playerRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      playerRef.current.volume = clampedVolume;
      dispatch({ type: 'SET_VOLUME', payload: clampedVolume });
    }
  }, []);
  
  // Toggle mute
  const toggleMute = useCallback(() => {
    if (playerRef.current) {
      if (state.isMuted) {
        playerRef.current.muted = false;
        dispatch({ type: 'UNMUTE' });
      } else {
        playerRef.current.muted = true;
        dispatch({ type: 'MUTE' });
      }
    }
  }, [state.isMuted]);
  
  // Set playback rate
  const setPlaybackRate = useCallback((rate: number) => {
    if (playerRef.current) {
      playerRef.current.playbackRate = rate;
      dispatch({ type: 'SET_PLAYBACK_RATE', payload: rate });
    }
  }, []);
  
  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    const videoElement = playerRef.current;
    if (!videoElement) return;
    
    if (!state.isFullscreen) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen()
          .then(() => dispatch({ type: 'ENTER_FULLSCREEN' }))
          .catch(error => console.error('Failed to enter fullscreen:', error));
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => dispatch({ type: 'EXIT_FULLSCREEN' }))
          .catch(error => console.error('Failed to exit fullscreen:', error));
      }
    }
  }, [state.isFullscreen]);
  
  // Set quality
  const setQuality = useCallback((quality: PlayerState['quality']) => {
    dispatch({ type: 'SET_QUALITY', payload: quality });
    // In a real implementation, you would adjust the video source or use an API
    // to change the quality of the stream
  }, []);
  
  // Set up event listeners for the video element
  useEffect(() => {
    const video = playerRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      dispatch({ type: 'UPDATE_TIME', payload: video.currentTime });
    };
    
    const handleDurationChange = () => {
      dispatch({ type: 'SET_DURATION', payload: video.duration });
    };
    
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        dispatch({ 
          type: 'UPDATE_BUFFER', 
          payload: video.buffered.end(video.buffered.length - 1) 
        });
      }
    };
    
    const handlePlay = () => {
      dispatch({ type: 'PLAY' });
    };
    
    const handlePause = () => {
      dispatch({ type: 'PAUSE' });
    };
    
    const handleVolumeChange = () => {
      dispatch({ type: 'SET_VOLUME', payload: video.volume });
      if (video.muted) {
        dispatch({ type: 'MUTE' });
      } else {
        dispatch({ type: 'UNMUTE' });
      }
    };
    
    const handleError = () => {
      dispatch({ 
        type: 'ERROR', 
        payload: 'An error occurred while playing the video' 
      });
    };
    
    const handleLoadStart = () => {
      dispatch({ type: 'LOADING_START' });
    };
    
    const handleCanPlay = () => {
      dispatch({ type: 'LOADING_END' });
    };
    
    const handleFullscreenChange = () => {
      if (document.fullscreenElement === video) {
        dispatch({ type: 'ENTER_FULLSCREEN' });
      } else {
        dispatch({ type: 'EXIT_FULLSCREEN' });
      }
    };
    
    // Add event listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Cleanup
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Save playback progress to localStorage when progress changes
  useEffect(() => {
    if (state.currentContentId && state.currentTime > 0) {
      const progressData = JSON.parse(localStorage.getItem('videoProgress') || '{}');
      progressData[state.currentContentId] = state.currentTime;
      localStorage.setItem('videoProgress', JSON.stringify(progressData));
    }
  }, [state.currentContentId, state.currentTime]);
  
  // Load saved progress when content changes
  useEffect(() => {
    if (state.currentContentId) {
      const progressData = JSON.parse(localStorage.getItem('videoProgress') || '{}');
      const savedProgress = progressData[state.currentContentId];
      if (savedProgress && playerRef.current) {
        playerRef.current.currentTime = savedProgress;
        dispatch({ type: 'UPDATE_TIME', payload: savedProgress });
      }
    }
  }, [state.currentContentId]);
  
  // Context value
  const contextValue: PlayerContextType = {
    state,
    dispatch,
    playerRef,
    loadContent,
    play,
    pause,
    togglePlay,
    seek,
    skipForward,
    skipBackward,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleFullscreen,
    setQuality
  };
  
  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};
export const usePlayerContext = () => useContext(PlayerContext);
export default PlayerContext; 
