import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import type { ContentItem } from '../../types/Content';
import { Transition } from '../animations/Transitions';
import { TransitionType } from '../../types/animations';
import FocusableButton from '../ui/FocusableButton';
import ContentService from '../../services/ContentService';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import type { SoundType } from '../../types/sounds';

const FeaturedContainer = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 32px;
`;

const BackgroundImage = styled.div<{ image: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${props => `url(${props.image})`};
  background-size: cover;
  background-position: center;
  filter: brightness(0.5);
  transition: all 0.3s ease;
`;

const GradientOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70%;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0) 100%);
`;

const ContentInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 32px;
  color: white;
  z-index: 2;
`;

const Title = styled.h1`
  font-size: 48px;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
`;

const Description = styled.p`
  font-size: 20px;
  margin-bottom: 16px;
  max-width: 60%;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
`;

const MetaData = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
`;

const MetaItem = styled.span`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
`;

const CarouselIndicators = styled.div`
  position: absolute;
  bottom: 16px;
  right: 32px;
  display: flex;
  gap: 8px;
`;

const Indicator = styled.div<{ active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  cursor: pointer;
  transition: all 0.3s ease;
`;

interface FeaturedContentProps {
  autoRotateInterval?: number; // in milliseconds
  maxItems?: number;
}

const FeaturedContent: React.FC<FeaturedContentProps> = ({
  autoRotateInterval = 8000,
  maxItems = 5
}) => {
  const [featuredItems, setFeaturedItems] = useState<ContentItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { playSound } = useSoundEffects();

  // Fetch featured content
  useEffect(() => {
    const fetchFeaturedContent = async () => {
      const contentService = ContentService.getInstance();
      const categories = await contentService.getCategories();
      
      // Find trending category or use first category
      const trendingCategory = categories.find(cat => cat.name.includes('Trending')) || categories[0];
      
      if (trendingCategory) {
        const content = await contentService.getCategoryContent(trendingCategory.id);
        // Take only the first maxItems
        setFeaturedItems(content.slice(0, maxItems));
      }
    };
    
    fetchFeaturedContent();
  }, [maxItems]);

  // Define nextItem callback
  const nextItem = useCallback(() => {
    if (featuredItems.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentIndex(prev => (prev + 1) % featuredItems.length);
    playSound('navigate' as SoundType);
  }, [featuredItems.length, playSound]);

  // Auto-rotate carousel
  useEffect(() => {
    if (featuredItems.length <= 1) return;
    
    const interval = setInterval(() => {
      if (!isTransitioning) {
        nextItem();
      }
    }, autoRotateInterval);
    
    return () => clearInterval(interval);
  }, [autoRotateInterval, currentIndex, featuredItems.length, isTransitioning, nextItem]);

  const handleIndicatorClick = (index: number) => {
    if (index === currentIndex) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    playSound('select' as SoundType);
  };

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
  };

  if (featuredItems.length === 0) {
    return null;
  }

  const currentItem = featuredItems[currentIndex];
  
  // Calculate button neighbors for navigation
  const playButtonId = `featured-play-${currentIndex}`;
  const detailsButtonId = `featured-details-${currentIndex}`;
  
  // Build button navigation structure
  const getButtonNeighbors = (isPlayButton: boolean) => {
    return {
      left: isPlayButton ? undefined : playButtonId,
      right: isPlayButton ? detailsButtonId : undefined,
    };
  };

  return (
    <FeaturedContainer>
      <Transition 
        show={true} 
        type={TransitionType.FADE}
        duration={1000}
        onRest={handleTransitionEnd}
      >
        <BackgroundImage image={currentItem.backdropImage} />
        <GradientOverlay />
        <ContentInfo>
          <Title>{currentItem.title}</Title>
          <Description>{currentItem.description}</Description>
          <MetaData>
            <MetaItem>{currentItem.releaseYear}</MetaItem>
            <MetaItem>{currentItem.ageRating}</MetaItem>
            <MetaItem>{currentItem.duration} min</MetaItem>
            <MetaItem>{currentItem.genres.join(', ')}</MetaItem>
          </MetaData>
          <ButtonGroup>
            <FocusableButton 
              id={playButtonId}
              neighbors={getButtonNeighbors(true)}
            >
              Play Now
            </FocusableButton>
            <FocusableButton 
              id={detailsButtonId}
              neighbors={getButtonNeighbors(false)}
            >
              More Details
            </FocusableButton>
          </ButtonGroup>
        </ContentInfo>
        <CarouselIndicators>
          {featuredItems.map((_, index) => (
            <Indicator 
              key={index} 
              active={index === currentIndex} 
              onClick={() => handleIndicatorClick(index)}
            />
          ))}
        </CarouselIndicators>
      </Transition>
    </FeaturedContainer>
  );
};

export default FeaturedContent; 