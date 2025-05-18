import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useAnimation } from '../../../hooks/useAnimation';
import { LoadingIndicatorType, LoadingIndicatorSize } from '../../../types/animations';

// Props interface
interface LoadingIndicatorProps {
  type?: LoadingIndicatorType;
  size?: LoadingIndicatorSize;
  color?: string;
  progress?: number; // For progress type (0-100)
  message?: string;
  className?: string;
}

// Keyframes for spinner animation
const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Keyframes for dots animation
const dotsAnimation = keyframes`
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
`;

// Styled components for different loaders
const StyledSpinner = styled.div<{ size: LoadingIndicatorSize; color: string }>`
  border-radius: 50%;
  width: ${props => props.size === LoadingIndicatorSize.SMALL ? '24px' : 
    props.size === LoadingIndicatorSize.MEDIUM ? '48px' : '72px'};
  height: ${props => props.size === LoadingIndicatorSize.SMALL ? '24px' : 
    props.size === LoadingIndicatorSize.MEDIUM ? '48px' : '72px'};
  border: ${props => props.size === LoadingIndicatorSize.SMALL ? '3px' : 
    props.size === LoadingIndicatorSize.MEDIUM ? '5px' : '7px'} solid rgba(255, 255, 255, 0.1);
  border-top-color: ${props => props.color};
  animation: ${spinAnimation} 1s infinite linear;
`;

const DotContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const Dot = styled.div<{ size: LoadingIndicatorSize; color: string; index: number }>`
  width: ${props => props.size === LoadingIndicatorSize.SMALL ? '8px' : 
    props.size === LoadingIndicatorSize.MEDIUM ? '12px' : '16px'};
  height: ${props => props.size === LoadingIndicatorSize.SMALL ? '8px' : 
    props.size === LoadingIndicatorSize.MEDIUM ? '12px' : '16px'};
  background-color: ${props => props.color};
  border-radius: 50%;
  animation: ${dotsAnimation} 1.4s infinite ease-in-out;
  animation-delay: ${props => props.index * 0.16}s;
`;

const ProgressContainer = styled.div<{ $sizeValue: LoadingIndicatorSize }>`
  width: 100%;
  height: ${props => props.$sizeValue === LoadingIndicatorSize.SMALL ? '4px' : 
    props.$sizeValue === LoadingIndicatorSize.MEDIUM ? '8px' : '12px'};
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ progress: number; color: string }>`
  height: 100%;
  width: ${props => `${props.progress}%`};
  background-color: ${props => props.color};
  transition: width 0.3s ease;
`;

const LoaderMessage = styled.div`
  margin-top: 16px;
  color: #FFFFFF;
  font-size: 16px;
  text-align: center;
`;

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// Main loading indicator component
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  type = LoadingIndicatorType.SPINNER,
  size = LoadingIndicatorSize.MEDIUM,
  color = '#E50914',
  progress = 0,
  message,
  className,
}) => {
  const { isAnimationsEnabled } = useAnimation();
  
  // Render different types of loaders
  const renderLoader = () => {
    if (!isAnimationsEnabled && type !== LoadingIndicatorType.PROGRESS) {
      // Simplified loader when animations are disabled
      return <StyledSpinner size={size} color={color} />;
    }
    
    switch (type) {
      case LoadingIndicatorType.SPINNER:
        return <StyledSpinner size={size} color={color} />;
      
      case LoadingIndicatorType.DOTS:
        return (
          <DotContainer>
            {[0, 1, 2].map(i => (
              <Dot key={i} size={size} color={color} index={i} />
            ))}
          </DotContainer>
        );
      
      case LoadingIndicatorType.PROGRESS:
        return (
          <ProgressContainer $sizeValue={size}>
            <ProgressBar progress={progress} color={color} />
          </ProgressContainer>
        );
        
      default:
        return <StyledSpinner size={size} color={color} />;
    }
  };
  
  return (
    <LoaderContainer className={className}>
      {renderLoader()}
      {message && <LoaderMessage>{message}</LoaderMessage>}
    </LoaderContainer>
  );
};

export default LoadingIndicator; 