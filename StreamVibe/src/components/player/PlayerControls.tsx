import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import FocusableItem from '../ui/FocusableItem';
import Button from '../ui/Button';
import { usePlayback } from '../../hooks/usePlayback';
import { formatTime } from '../../utils/formatters';
import type { PlayerState } from '../../types/Player';

interface PlayerControlsProps {
  id: string;
  visible: boolean;
  onBack?: () => void;
  onQualityChange?: (quality: string) => void;
  title?: string;
  groupId?: string;
}

const ControlsContainer = styled.div<{ visible: boolean }>`
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
  z-index: 10;
  pointer-events: ${props => props.visible ? 'auto' : 'none'};
`;

const ControlsHeader = styled.div`
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

const ControlsFooter = styled.div`
  padding: 16px;
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
`;

const ProgressBarContainer = styled.div`
  flex: 1;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
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

const PlayerControls: React.FC<PlayerControlsProps> = ({
  id,
  visible,
  onBack,
  onQualityChange,
  title,
  groupId = 'player-controls',
}) => {
  const {
    playerState,
    togglePlay,
    seekTo,
    togglePlayerMute,
    togglePlayerFullscreen,
    setPlayerQuality,
  } = usePlayback();
  
  const [progressFocused, setProgressFocused] = useState(false);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);
  
  // Control IDs for focus navigation
  const controlIds = {
    back: `${id}-back`,
    rewind: `${id}-rewind`,
    playPause: `${id}-play-pause`,
    forward: `${id}-forward`,
    progress: `${id}-progress`,
    volume: `${id}-volume`,
    quality: `${id}-quality`,
    fullscreen: `${id}-fullscreen`,
  };
  
  // Progress percentage calculation
  const progressPercentage = playerState.duration > 0
    ? (playerState.currentTime / playerState.duration) * 100
    : 0;
  
  // Handle progress bar click
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * playerState.duration;
    seekTo(newTime);
  }, [playerState.duration, seekTo]);
  
  // Handle progress bar key navigation
  const handleProgressKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!progressFocused) return;
    
    let newTime = playerState.currentTime;
    const step = playerState.duration / 100; // 1% step
    
    if (e.key === 'ArrowRight') {
      newTime = Math.min(playerState.duration, playerState.currentTime + step);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      newTime = Math.max(0, playerState.currentTime - step);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (seekPreview !== null) {
        newTime = seekPreview;
        setSeekPreview(null);
      }
      e.preventDefault();
    }
    
    if (newTime !== playerState.currentTime) {
      seekTo(newTime);
    }
  }, [progressFocused, playerState.currentTime, playerState.duration, seekPreview, seekTo]);
  
  // Handle quality change
  const handleQualityChange = useCallback((quality: PlayerState['quality']) => {
    setPlayerQuality(quality);
    if (onQualityChange) {
      onQualityChange(quality);
    }
  }, [setPlayerQuality, onQualityChange]);
  
  return (
    <ControlsContainer visible={visible}>
      <ControlsHeader>
        <FocusableItem
          id={controlIds.back}
          groupId={groupId}
          onClick={onBack}
          neighbors={{
            down: controlIds.playPause,
          }}
        >
          <Button variant="icon" size="small" onClick={onBack} id={`${controlIds.back}-btn`}>
            ← Back
          </Button>
        </FocusableItem>
        
        {title && <VideoTitle>{title}</VideoTitle>}
      </ControlsHeader>
      
      <ControlsFooter>
        <ControlRow>
          <FocusableItem
            id={controlIds.rewind}
            groupId={groupId}
            onClick={() => seekTo(Math.max(0, playerState.currentTime - 10))}
            neighbors={{
              up: controlIds.back,
              right: controlIds.playPause,
            }}
          >
            <Button 
              variant="icon" 
              onClick={() => seekTo(Math.max(0, playerState.currentTime - 10))}
              aria-label="Rewind 10 seconds"
              id={`${controlIds.rewind}-btn`}
            >
              ⏪
            </Button>
          </FocusableItem>
          
          <FocusableItem
            id={controlIds.playPause}
            groupId={groupId}
            onClick={togglePlay}
            neighbors={{
              up: controlIds.back,
              left: controlIds.rewind,
              right: controlIds.forward,
            }}
          >
            <Button 
              variant="icon" 
              onClick={togglePlay}
              aria-label={playerState.status === 'playing' ? "Pause" : "Play"}
              id={`${controlIds.playPause}-btn`}
            >
              {playerState.status === 'playing' ? "⏸️" : "▶️"}
            </Button>
          </FocusableItem>
          
          <FocusableItem
            id={controlIds.forward}
            groupId={groupId}
            onClick={() => seekTo(Math.min(playerState.duration, playerState.currentTime + 10))}
            neighbors={{
              up: controlIds.back,
              left: controlIds.playPause,
              right: controlIds.progress,
            }}
          >
            <Button 
              variant="icon" 
              onClick={() => seekTo(Math.min(playerState.duration, playerState.currentTime + 10))}
              aria-label="Forward 10 seconds"
              id={`${controlIds.forward}-btn`}
            >
              ⏩
            </Button>
          </FocusableItem>
        </ControlRow>
        
        <ControlRow>
          <TimeDisplay>
            {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
          </TimeDisplay>
          
          <FocusableItem
            id={controlIds.progress}
            groupId={groupId}
            onClick={handleProgressClick}
            onFocus={() => setProgressFocused(true)}
            onBlur={() => setProgressFocused(false)}
            onKeyDown={handleProgressKeyDown}
            neighbors={{
              up: controlIds.forward,
              left: controlIds.forward,
              right: controlIds.volume,
            }}
          >
            <ProgressBarContainer onClick={handleProgressClick}>
              <ProgressBar width={progressPercentage} />
              <ProgressKnob 
                position={progressPercentage} 
                focused={progressFocused}
              />
            </ProgressBarContainer>
          </FocusableItem>
          
          <FocusableItem
            id={controlIds.volume}
            groupId={groupId}
            onClick={togglePlayerMute}
            neighbors={{
              up: controlIds.back,
              left: controlIds.progress,
              right: controlIds.quality,
            }}
          >
            <Button 
              variant="icon" 
              onClick={togglePlayerMute}
              aria-label={playerState.muted ? "Unmute" : "Mute"}
              id={`${controlIds.volume}-btn`}
            >
              {playerState.muted ? "🔇" : "🔊"}
            </Button>
          </FocusableItem>
          
          <FocusableItem
            id={controlIds.quality}
            groupId={groupId}
            onClick={() => handleQualityChange('auto')}
            neighbors={{
              up: controlIds.back,
              left: controlIds.volume,
              right: controlIds.fullscreen,
            }}
          >
            <Button 
              variant="icon" 
              onClick={() => handleQualityChange('auto')}
              aria-label="Quality settings"
              id={`${controlIds.quality}-btn`}
            >
              ⚙️
            </Button>
          </FocusableItem>
          
          <FocusableItem
            id={controlIds.fullscreen}
            groupId={groupId}
            onClick={togglePlayerFullscreen}
            neighbors={{
              up: controlIds.back,
              left: controlIds.quality,
            }}
          >
            <Button 
              variant="icon" 
              onClick={togglePlayerFullscreen}
              aria-label={playerState.fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              id={`${controlIds.fullscreen}-btn`}
            >
              {playerState.fullscreen ? "⤓" : "⤢"}
            </Button>
          </FocusableItem>
        </ControlRow>
      </ControlsFooter>
    </ControlsContainer>
  );
};

export default PlayerControls; 