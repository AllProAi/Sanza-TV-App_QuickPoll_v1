import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import FocusableItem from '../ui/FocusableItem';
import { AspectRatio } from '../layout/Grid';

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Base Card Component
interface CardBaseProps {
  focused?: boolean;
  variant?: 'poster' | 'landscape' | 'featured' | 'small';
}

const CardBase = styled.div<CardBaseProps>`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${fadeIn} 0.5s ease forwards;
  background-color: var(--card-background);
  
  ${props => props.focused && css`
    transform: scale(1.05);
    box-shadow: 0 0 0 2px var(--primary-color), 0 8px 20px rgba(0, 0, 0, 0.3);
    z-index: 2;
  `}
  
  ${props => props.variant === 'poster' && css`
    // Aspect ratio container will handle dimensions
  `}
  
  ${props => props.variant === 'landscape' && css`
    // Aspect ratio container will handle dimensions
  `}
  
  ${props => props.variant === 'featured' && css`
    // Aspect ratio container will handle dimensions
  `}
  
  ${props => props.variant === 'small' && css`
    // Aspect ratio container will handle dimensions
  `}
`;

// Card Image
const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
`;

// Card Overlay
const CardOverlay = styled.div<{ focused?: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 100%);
  transition: opacity 0.3s ease, height 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  opacity: ${props => props.focused ? 1 : 0.7};
  height: ${props => props.focused ? '70%' : '40%'};
`;

// Card Title
const CardTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Card Info
const CardInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
`;

// Card Info Item
const CardInfoItem = styled.span`
  margin-right: 12px;
  display: flex;
  align-items: center;
  
  &:last-child {
    margin-right: 0;
  }
`;

// Card Description
const CardDescription = styled.p<{ focused?: boolean }>`
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.focused ? 3 : 0};
  -webkit-box-orient: vertical;
  max-height: ${props => props.focused ? '4em' : '0'};
  transition: max-height 0.3s ease, opacity 0.3s ease;
  opacity: ${props => props.focused ? 1 : 0};
`;

// Badge Component
const Badge = styled.span`
  display: inline-block;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  background-color: var(--primary-color);
  border-radius: 4px;
  margin-right: 8px;
`;

// Progress bar
const ProgressBarContainer = styled.div`
  width: 100%;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.2);
  position: absolute;
  bottom: 0;
  left: 0;
`;

const ProgressBar = styled.div<{ progress: number }>`
  height: 100%;
  width: ${props => props.progress}%;
  background-color: var(--primary-color);
`;

// Action buttons
const CardActions = styled.div<{ focused?: boolean }>`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  opacity: ${props => props.focused ? 1 : 0};
  transition: opacity 0.3s ease;
  pointer-events: ${props => props.focused ? 'auto' : 'none'};
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: #fff;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  &:first-child {
    background-color: var(--primary-color);
    
    &:hover {
      background-color: var(--primary-color-hover);
    }
  }
`;

// Skeleton Loader
const SkeletonBase = styled.div`
  border-radius: 8px;
  background: linear-gradient(90deg, 
    var(--skeleton-start) 0%, 
    var(--skeleton-end) 50%, 
    var(--skeleton-start) 100%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite linear;
`;

const SkeletonTitle = styled(SkeletonBase)`
  height: 18px;
  width: 80%;
  margin-bottom: 8px;
`;

const SkeletonInfo = styled(SkeletonBase)`
  height: 14px;
  width: 60%;
  margin-bottom: 8px;
`;

const SkeletonContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
`;

// Content Card Props
export interface ContentCardProps {
  id: string;
  title: string;
  imageUrl: string;
  year?: string;
  duration?: string;
  rating?: string;
  description?: string;
  progress?: number;
  badges?: string[];
  variant?: 'poster' | 'landscape' | 'featured' | 'small';
  groupId?: string;
  isNew?: boolean;
  onClick?: () => void;
  onPlayClick?: () => void;
  onSaveClick?: () => void;
}

// Skeleton Card Props
interface SkeletonCardProps {
  variant?: 'poster' | 'landscape' | 'featured' | 'small';
}

// Aspect ratios for different variants
const getAspectRatio = (variant: string = 'poster') => {
  switch (variant) {
    case 'poster':
      return 2/3;  // 2:3 ratio for poster
    case 'landscape':
      return 16/9; // 16:9 ratio for landscape
    case 'featured':
      return 16/9; // 16:9 ratio for featured
    case 'small':
      return 1;    // 1:1 ratio for small
    default:
      return 2/3;
  }
};

// Skeleton Card Component
export const SkeletonCard: React.FC<SkeletonCardProps> = ({ variant = 'poster' }) => {
  return (
    <AspectRatio ratio={getAspectRatio(variant)}>
      <CardBase variant={variant}>
        <SkeletonBase style={{ width: '100%', height: '100%' }} />
        <SkeletonContent>
          <SkeletonTitle />
          <SkeletonInfo />
        </SkeletonContent>
      </CardBase>
    </AspectRatio>
  );
};

// Content Card Component
const ContentCard: React.FC<ContentCardProps> = ({
  id,
  title,
  imageUrl,
  year,
  duration,
  rating,
  description,
  progress,
  badges,
  variant = 'poster',
  groupId = 'content-grid',
  isNew = false,
  onClick,
  onPlayClick,
  onSaveClick
}) => {
  const handleCardClick = () => {
    if (onClick) onClick();
  };
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayClick) onPlayClick();
  };
  
  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSaveClick) onSaveClick();
  };
  
  return (
    <FocusableItem
      id={`content-${id}`}
      groupId={groupId}
      onClick={handleCardClick}
    >
      <AspectRatio ratio={getAspectRatio(variant)}>
        <CardBase variant={variant}>
          <CardImage src={imageUrl} alt={title} />
          
          <CardOverlay>
            <CardTitle>{title}</CardTitle>
            
            <CardInfo>
              {year && <CardInfoItem>{year}</CardInfoItem>}
              {duration && <CardInfoItem>{duration}</CardInfoItem>}
              {rating && <CardInfoItem>{rating}</CardInfoItem>}
            </CardInfo>
            
            {badges && badges.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                {badges.map((badge, index) => (
                  <Badge key={index}>{badge}</Badge>
                ))}
                {isNew && <Badge style={{ backgroundColor: '#E50914' }}>NEW</Badge>}
              </div>
            )}
            
            <CardDescription>{description}</CardDescription>
            
            <CardActions>
              <ActionButton onClick={handlePlayClick}>
                Play
              </ActionButton>
              <ActionButton onClick={handleSaveClick}>
                My List
              </ActionButton>
            </CardActions>
          </CardOverlay>
          
          {progress !== undefined && progress > 0 && (
            <ProgressBarContainer>
              <ProgressBar progress={progress} />
            </ProgressBarContainer>
          )}
        </CardBase>
      </AspectRatio>
    </FocusableItem>
  );
};

export default ContentCard; 