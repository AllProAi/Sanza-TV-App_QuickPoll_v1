import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import useNavigation from '../../hooks/useNavigation';
import Button from '../ui/Button';
import { SkeletonCard } from './ContentCard';

// Types
interface CarouselProps {
  title?: string;
  children: React.ReactNode;
  slidesToShow?: number;
  slidesToScroll?: number;
  autoplay?: boolean;
  autoplaySpeed?: number;
  showArrows?: boolean;
  showIndicators?: boolean;
  groupId: string;
  className?: string;
  loadingPlaceholders?: number;
  loading?: boolean;
  cardVariant?: 'poster' | 'landscape' | 'featured' | 'small';
}

// Styled Components
const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 40px;
`;

const CarouselTitle = styled.h2`
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--on-background-color);
`;

const CarouselTrackContainer = styled.div`
  position: relative;
  overflow: hidden;
  margin: 0 -10px;
  padding: 10px;
`;

const CarouselTrack = styled.div<{ transform: string; transition: string }>`
  display: flex;
  will-change: transform;
  transform: ${props => props.transform};
  transition: ${props => props.transition};
`;

const CarouselItem = styled.div<{ width: number }>`
  flex: 0 0 ${props => props.width}%;
  max-width: ${props => props.width}%;
  padding: 0 10px;
  box-sizing: border-box;
`;

const CarouselArrow = styled(Button)<{ direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${props => props.direction === 'left' ? 'left: -20px;' : 'right: -20px;'}
  transform: translateY(-50%);
  z-index: 10;
  opacity: 0.8;
  transition: opacity 0.3s ease;
  padding: 10px;
  border-radius: 50%;
  
  &:hover {
    opacity: 1;
  }
`;

const CarouselIndicators = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;
  gap: 6px;
`;

const Indicator = styled.button<{ $active: boolean }>`
  width: ${props => props.$active ? '12px' : '8px'};
  height: 8px;
  border-radius: 4px;
  background-color: ${props => props.$active ? 'var(--primary-color)' : 'var(--surface-color)'};
  border: none;
  padding: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.$active ? 'var(--primary-color)' : 'var(--surface-hover-color)'};
  }
`;

const Carousel: React.FC<CarouselProps> = ({
  title,
  children,
  slidesToShow = 4,
  slidesToScroll = 1,
  autoplay = false,
  autoplaySpeed = 5000,
  showArrows = true,
  showIndicators = true,
  groupId,
  className,
  loadingPlaceholders = 4,
  loading = false,
  cardVariant = 'poster',
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transition, setTransition] = useState('transform 0.5s ease');
  const totalItems = React.Children.count(children);
  const totalSlides = Math.ceil(totalItems / slidesToShow);
  const itemWidth = 100 / slidesToShow;
  const trackRef = useRef<HTMLDivElement>(null);
  const { registerGroup } = useNavigation();
  
  // Define nextSlide with useCallback to avoid dependency issues
  const nextSlide = useCallback(() => {
    setTransition('transform 0.5s ease');
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setCurrentSlide(0);
    }
  }, [currentSlide, totalSlides]);
  
  // Register carousel navigation group
  useEffect(() => {
    if (!loading && totalItems > 0) {
      const itemIds = React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return `${groupId}-item-${index}`;
        }
        return null;
      })?.filter(Boolean) as string[];
      
      if (itemIds?.length) {
        registerGroup(groupId, itemIds);
      }
    }
  }, [children, groupId, registerGroup, loading, totalItems]);
  
  // Handle autoplay
  useEffect(() => {
    if (autoplay && !loading && totalSlides > 1) {
      const interval = setInterval(() => {
        nextSlide();
      }, autoplaySpeed);
      
      return () => clearInterval(interval);
    }
  }, [autoplay, autoplaySpeed, currentSlide, totalSlides, loading, nextSlide]);
  
  const prevSlide = () => {
    setTransition('transform 0.5s ease');
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else {
      setCurrentSlide(totalSlides - 1);
    }
  };
  
  const goToSlide = (index: number) => {
    setTransition('transform 0.5s ease');
    setCurrentSlide(index);
  };
  
  const getTrackTransform = () => {
    const translate = -(currentSlide * slidesToScroll * itemWidth);
    return `translateX(${translate}%)`;
  };
  
  // Render carousel items with lazy loading
  const renderItems = () => {
    if (loading) {
      // Return loading placeholders
      return Array.from({ length: loadingPlaceholders }).map((_, index) => (
        <CarouselItem key={`placeholder-${index}`} width={itemWidth}>
          <SkeletonCard variant={cardVariant} />
        </CarouselItem>
      ));
    }
    
    return React.Children.map(children, (child, index) => {
      if (React.isValidElement(child)) {
        // We create a new item wrapper and pass the child directly
        return (
          <CarouselItem key={`item-${index}`} width={itemWidth}>
            {child}
          </CarouselItem>
        );
      }
      
      return (
        <CarouselItem key={`item-${index}`} width={itemWidth}>
          {child}
        </CarouselItem>
      );
    });
  };
  
  return (
    <CarouselContainer className={className}>
      {title && <CarouselTitle>{title}</CarouselTitle>}
      
      <CarouselTrackContainer>
        <CarouselTrack
          ref={trackRef}
          transform={getTrackTransform()}
          transition={transition}
        >
          {renderItems()}
        </CarouselTrack>
        
        {showArrows && !loading && totalSlides > 1 && (
          <>
            <CarouselArrow
              id={`${groupId}-prev`}
              direction="left"
              variant="icon"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              ←
            </CarouselArrow>
            
            <CarouselArrow
              id={`${groupId}-next`}
              direction="right"
              variant="icon"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              →
            </CarouselArrow>
          </>
        )}
      </CarouselTrackContainer>
      
      {showIndicators && !loading && totalSlides > 1 && (
        <CarouselIndicators>
          {Array.from({ length: totalSlides }).map((_, index) => (
            <Indicator
              key={index}
              $active={index === currentSlide}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentSlide ? 'true' : 'false'}
            />
          ))}
        </CarouselIndicators>
      )}
    </CarouselContainer>
  );
};

export default Carousel; 