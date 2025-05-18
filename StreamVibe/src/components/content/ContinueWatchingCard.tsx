import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import FocusableItem from '../ui/FocusableItem';
import type { WatchProgress } from '../../types/Content';
import { formatTime } from '../../utils/formatters';

interface ContinueWatchingCardProps {
  id: string;
  contentId: string;
  episodeId?: string;
  title: string;
  imageUrl: string;
  progress: WatchProgress;
  groupId: string;
  neighbors?: {
    up?: string;
    right?: string;
    down?: string;
    left?: string;
  };
}

const CardContainer = styled.div<{ focused: boolean }>`
  position: relative;
  width: 240px;
  height: 180px;
  overflow: hidden;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.3s;
  cursor: pointer;
  border: 2px solid ${props => props.focused ? 'var(--primary-color)' : 'transparent'};
  box-shadow: ${props => props.focused ? '0 0 20px rgba(187, 134, 252, 0.5)' : 'none'};
  transform: ${props => props.focused ? 'scale(1.05)' : 'scale(1)'};
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s;
`;

const CardInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 100%);
  color: white;
`;

const CardTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const TimeInfo = styled.span`
  font-size: 12px;
  color: #ccc;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ width: number }>`
  height: 100%;
  width: ${props => props.width}%;
  background-color: var(--primary-color);
  border-radius: 2px;
`;

const PlayButton = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.3s;
  
  &::before {
    content: '';
    width: 0;
    height: 0;
    border-top: 15px solid transparent;
    border-bottom: 15px solid transparent;
    border-left: 25px solid white;
    margin-left: 5px;
  }
`;

const ContinueWatchingCard: React.FC<ContinueWatchingCardProps> = ({
  id,
  contentId,
  episodeId,
  title,
  imageUrl,
  progress,
  groupId,
  neighbors
}) => {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
  
  const handleClick = useCallback(async () => {
    // Navigate to the content detail page with a start parameter
    // This will open the player with the saved progress position
    if (episodeId) {
      navigate(`/details/${contentId}?episode=${episodeId}&play=true&position=${progress.position}`);
    } else {
      navigate(`/details/${contentId}?play=true&position=${progress.position}`);
    }
  }, [navigate, contentId, episodeId, progress.position]);
  
  return (
    <FocusableItem
      id={id}
      groupId={groupId}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onClick={handleClick}
      neighbors={neighbors}
    >
      <CardContainer focused={focused}>
        <CardImage src={imageUrl} alt={title} />
        <PlayButton visible={focused} />
        <CardInfo>
          <CardTitle>{title}</CardTitle>
          <ProgressInfo>
            <TimeInfo>{formatTime(progress.position)} / {formatTime(progress.duration)}</TimeInfo>
            <TimeInfo>{progress.percentage.toFixed(0)}%</TimeInfo>
          </ProgressInfo>
          <ProgressBarContainer>
            <ProgressBar width={progress.percentage} />
          </ProgressBarContainer>
        </CardInfo>
      </CardContainer>
    </FocusableItem>
  );
};

export default ContinueWatchingCard; 