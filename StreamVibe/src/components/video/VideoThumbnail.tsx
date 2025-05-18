import React, { useState } from 'react';
import styled from 'styled-components';
import FocusableItem from '../ui/FocusableItem';

interface VideoThumbnailProps {
  id: string;
  title: string;
  imageUrl: string;
  duration?: string;
  progress?: number;
  groupId?: string;
  onClick?: () => void;
  className?: string;
  neighbors?: {
    up?: string;
    down?: string;
    left?: string;
    right?: string;
  };
}

const ThumbnailContainer = styled.div<{ isFocused: boolean }>`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16/9;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform: ${props => props.isFocused ? 'scale(1.05)' : 'scale(1)'};
  box-shadow: ${props => props.isFocused ? '0 0 0 2px var(--primary-color), 0 8px 20px rgba(0, 0, 0, 0.3)' : 'none'};
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
`;

const ThumbnailOverlay = styled.div<{ isFocused: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 60%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
  opacity: ${props => props.isFocused ? 1 : 0.7};
  transition: opacity 0.3s ease;
`;

const ThumbnailTitle = styled.h3`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ThumbnailInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-bottom: 8px;
`;

const PlayIcon = styled.div<{ isFocused: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(${props => props.isFocused ? 1.2 : 1});
  width: 60px;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.isFocused ? 1 : 0.7};
  transition: all 0.3s ease;

  &::before {
    content: "";
    width: 0;
    height: 0;
    border-top: 15px solid transparent;
    border-bottom: 15px solid transparent;
    border-left: 24px solid white;
    margin-left: 5px;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ progress: number }>`
  height: 100%;
  width: ${props => props.progress}%;
  background-color: var(--primary-color);
  border-radius: 2px;
`;

const DurationBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  id,
  title,
  imageUrl,
  duration,
  progress = 0,
  groupId,
  onClick,
  className,
  neighbors,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <FocusableItem 
      id={id}
      groupId={groupId}
      onClick={onClick}
      className={className}
      neighbors={neighbors}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <ThumbnailContainer isFocused={isFocused}>
        <ThumbnailImage src={imageUrl} alt={title} />
        
        <PlayIcon isFocused={isFocused} />
        
        {duration && (
          <DurationBadge>{duration}</DurationBadge>
        )}
        
        <ThumbnailOverlay isFocused={isFocused}>
          <ThumbnailTitle>{title}</ThumbnailTitle>
          
          {progress > 0 && (
            <>
              <ThumbnailInfo>
                <span>{progress}% completed</span>
              </ThumbnailInfo>
              <ProgressBarContainer>
                <ProgressBar progress={progress} />
              </ProgressBarContainer>
            </>
          )}
        </ThumbnailOverlay>
      </ThumbnailContainer>
    </FocusableItem>
  );
};

export default VideoThumbnail; 