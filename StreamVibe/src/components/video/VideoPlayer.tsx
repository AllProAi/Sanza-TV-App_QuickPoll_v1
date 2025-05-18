import React, { useState, useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import FocusableItem from '../ui/FocusableItem';
import Button from '../ui/Button';
import useNavigation from '../../hooks/useNavigation';

interface VideoPlayerProps {
  id: string;
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  controls?: boolean;
  groupId?: string;
  onEnded?: () => void;
  onBack?: () => void;
  className?: string;
}

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: #000;
  border-radius: 12px;
  aspect-ratio: 16/9;
`;

const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const VideoOverlay = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 30%,
                              rgba(0, 0, 0, 0) 70%, rgba(0, 0, 0, 0.8) 100%);
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const VideoControls = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
`;

const VideoHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
`;

const VideoTitle = styled.h3`
  margin: 0;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
`;

const ProgressBarContainer = styled.div`
  flex: 1;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
`;

const ProgressBar = styled.div<{ width: number }>`
  height: 100%;
  width: ${props => props.width}%;
  background-color: var(--primary-color);
  border-radius: 4px;
  transition: width 0.1s linear;
`;

const ProgressKnob = styled.div<{ position: number; focused: boolean }>`
  position: absolute;
  left: ${props => props.position}%;
  top: 50%;
  transform: translate(-50%, -50%) scale(${props => props.focused ? 1.5 : 1});
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--primary-color);
  box-shadow: ${props => props.focused ? '0 0 0 3px rgba(187, 134, 252, 0.3)' : 'none'};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  z-index: 1;
`;

const TimeDisplay = styled.div`
  color: #fff;
  font-size: 14px;
  font-family: monospace;
  white-space: nowrap;
  margin: 0 8px;
`;

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  id,
  src,
  poster,
  title,
  autoPlay = false,
  controls = true,
  groupId = 'video-player',
  onEnded,
  onBack,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const { registerGroup } = useNavigation();
  
  // Wrap controlIds in useMemo to prevent recreation on every render
  const controlIds = useMemo(() => ({
    back: `${id}-back`,
    rewind: `${id}-rewind`,
    playPause: `${id}-play-pause`,
    forward: `${id}-forward`,
    progress: `${id}-progress`,
    volume: `${id}-volume`,
    fullscreen: `${id}-fullscreen`
  }), [id]);
  
  // Register controls as a navigation group
  useEffect(() => {
    const ids = Object.values(controlIds);
    registerGroup(groupId, ids);
  }, [groupId, registerGroup, controlIds]);
  
  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleDurationChange = () => {
      setDuration(video.duration);
    };
    
    const handleEnded = () => {
      setPlaying(false);
      setShowControls(true);
      if (onEnded) onEnded();
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onEnded]);
  
  // Handle controls visibility timeout
  useEffect(() => {
    if (playing && showControls) {
      if (controlsTimeout) clearTimeout(controlsTimeout);
      
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      
      setControlsTimeout(timeout);
    }
    
    return () => {
      if (controlsTimeout) clearTimeout(controlsTimeout);
    };
  }, [playing, showControls, controlsTimeout]);
  
  // Control playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (playing) {
      video.play().catch(() => {
        // Handle autoplay restrictions
        setPlaying(false);
      });
    } else {
      video.pause();
    }
  }, [playing]);
  
  const resetControlsTimeout = () => {
    if (controlsTimeout) clearTimeout(controlsTimeout);
    
    setShowControls(true);
    
    if (playing) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      
      setControlsTimeout(timeout);
    }
  };
  
  const handlePlayPause = () => {
    setPlaying(!playing);
    resetControlsTimeout();
  };
  
  const handleRewind = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
      setCurrentTime(videoRef.current.currentTime);
    }
    resetControlsTimeout();
  };
  
  const handleForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
      setCurrentTime(videoRef.current.currentTime);
    }
    resetControlsTimeout();
  };
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
      setCurrentTime(videoRef.current.currentTime);
    }
    resetControlsTimeout();
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    resetControlsTimeout();
  };
  
  return (
    <VideoContainer ref={containerRef} className={className}>
      <StyledVideo
        ref={videoRef}
        src={src}
        poster={poster}
        onClick={handlePlayPause}
        onMouseMove={resetControlsTimeout}
      />
      
      {controls && (
        <VideoOverlay visible={showControls}>
          <VideoHeader>
            <FocusableItem
              id={controlIds.back}
              groupId={groupId}
              onClick={onBack}
              neighbors={{
                down: controlIds.playPause
              }}
            >
              <Button
                id={`${id}-back-btn`}
                variant="icon"
                size="small"
                onClick={onBack}
              >
                ← Back
              </Button>
            </FocusableItem>
            
            {title && <VideoTitle>{title}</VideoTitle>}
          </VideoHeader>
          
          <VideoControls>
            <FocusableItem
              id={controlIds.rewind}
              groupId={groupId}
              onClick={handleRewind}
              neighbors={{
                up: controlIds.back,
                right: controlIds.playPause
              }}
            >
              <Button
                id={`${id}-rewind-btn`}
                variant="icon"
                onClick={handleRewind}
                aria-label="Rewind 10 seconds"
              >
                ⏪
              </Button>
            </FocusableItem>
            
            <FocusableItem
              id={controlIds.playPause}
              groupId={groupId}
              onClick={handlePlayPause}
              neighbors={{
                up: controlIds.back,
                left: controlIds.rewind,
                right: controlIds.forward
              }}
            >
              <Button
                id={`${id}-play-pause-btn`}
                variant="icon"
                onClick={handlePlayPause}
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? "⏸️" : "▶️"}
              </Button>
            </FocusableItem>
            
            <FocusableItem
              id={controlIds.forward}
              groupId={groupId}
              onClick={handleForward}
              neighbors={{
                up: controlIds.back,
                left: controlIds.playPause,
                right: controlIds.progress
              }}
            >
              <Button
                id={`${id}-forward-btn`}
                variant="icon"
                onClick={handleForward}
                aria-label="Forward 10 seconds"
              >
                ⏩
              </Button>
            </FocusableItem>
            
            <FocusableItem
              id={controlIds.progress}
              groupId={groupId}
              neighbors={{
                up: controlIds.back,
                left: controlIds.forward,
                right: controlIds.fullscreen
              }}
              onClick={handleProgressClick}
            >
              <ProgressBarContainer ref={progressRef} onClick={handleProgressClick}>
                <ProgressBar width={(currentTime / duration) * 100} />
                <ProgressKnob 
                  position={(currentTime / duration) * 100} 
                  focused={false}
                />
              </ProgressBarContainer>
            </FocusableItem>
            
            <TimeDisplay>{formatTime(currentTime)} / {formatTime(duration)}</TimeDisplay>
            
            <FocusableItem
              id={controlIds.fullscreen}
              groupId={groupId}
              onClick={toggleFullscreen}
              neighbors={{
                up: controlIds.back,
                left: controlIds.progress
              }}
            >
              <Button
                id={`${id}-fullscreen-btn`}
                variant="icon"
                onClick={toggleFullscreen}
                aria-label="Toggle fullscreen"
              >
                ⛶
              </Button>
            </FocusableItem>
          </VideoControls>
        </VideoOverlay>
      )}
    </VideoContainer>
  );
};

export default VideoPlayer; 