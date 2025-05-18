import React from 'react';
import styled, { keyframes } from 'styled-components';

// Define shimmer animation
const shimmerAnimation = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Base skeleton component with shimmer effect
const SkeletonBase = styled.div<{
  width?: string;
  height?: string;
  borderRadius?: string;
  margin?: string;
}>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '16px'};
  border-radius: ${props => props.borderRadius || '4px'};
  margin: ${props => props.margin || '0'};
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.05) 25%, 
    rgba(255, 255, 255, 0.1) 37%, 
    rgba(255, 255, 255, 0.05) 63%
  );
  background-size: 400% 100%;
  animation: ${shimmerAnimation} 1.4s infinite;
`;

// Specialized skeleton types
const CardSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 320px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
  padding: 12px;
`;

const CardImageSkeleton = styled(SkeletonBase)`
  height: 180px;
  width: 100%;
  margin-bottom: 16px;
`;

const CardTitleSkeleton = styled(SkeletonBase)`
  height: 24px;
  width: 80%;
  margin-bottom: 12px;
`;

const CardTextSkeleton = styled(SkeletonBase)`
  height: 16px;
  width: 100%;
  margin-bottom: 8px;
`;

const CircleSkeleton = styled(SkeletonBase)`
  border-radius: 50%;
`;

// Props interface
interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'avatar' | 'banner' | 'custom';
  count?: number;
  width?: string;
  height?: string;
  borderRadius?: string;
  margin?: string;
  className?: string;
}

// Skeleton loader component
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'text',
  count = 1,
  width,
  height,
  borderRadius,
  margin,
  className,
}) => {
  // Create array based on count
  const elements = Array.from({ length: count }, (_, index) => index);
  
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return elements.map(index => (
          <CardSkeleton key={index} className={className}>
            <CardImageSkeleton />
            <CardTitleSkeleton />
            <CardTextSkeleton />
            <CardTextSkeleton width="60%" />
          </CardSkeleton>
        ));
        
      case 'avatar':
        return elements.map(index => (
          <CircleSkeleton 
            key={index}
            width={width || '48px'} 
            height={height || '48px'} 
            margin={margin}
            className={className}
          />
        ));
        
      case 'banner':
        return elements.map(index => (
          <SkeletonBase 
            key={index}
            width={width || '100%'} 
            height={height || '200px'} 
            borderRadius={borderRadius || '8px'} 
            margin={margin}
            className={className}
          />
        ));
        
      case 'text':
      default:
        return elements.map(index => (
          <SkeletonBase 
            key={index}
            width={width} 
            height={height} 
            borderRadius={borderRadius} 
            margin={margin}
            className={className}
          />
        ));
    }
  };
  
  return <>{renderSkeleton()}</>;
};

export default SkeletonLoader; 