import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSpring, animated } from '@react-spring/web';
import { useAnimation } from '../../hooks/useAnimation';
import { BackgroundType } from '../../types/animations';

// Props for the dynamic background component
interface DynamicBackgroundProps {
  type?: BackgroundType;
  color?: string;
  secondaryColor?: string;
  imageSrc?: string;
  children?: React.ReactNode;
  className?: string;
  intensity?: number; // 0-100 controls effect intensity
}

// Container for the background with positioned elements
const BackgroundContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

// Animated div for transitions
const AnimatedBackground = styled(animated.div)<{
  $type: BackgroundType;
  $color: string;
  $secondaryColor: string;
  $intensity: number;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  
  ${props => props.$type === BackgroundType.GRADIENT && `
    background: linear-gradient(
      135deg, 
      ${props.$color} 0%, 
      ${props.$secondaryColor || 'rgba(0, 0, 0, 0.8)'} 100%
    );
  `}
  
  ${props => props.$type === BackgroundType.COLOR && `
    background-color: ${props.$color};
  `}
  
  ${props => props.$type === BackgroundType.BLUR && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: ${props.$color};
      opacity: ${props.$intensity / 100};
      backdrop-filter: blur(${props.$intensity / 4}px);
    }
  `}
`;

// Image layer for parallax and blur effects
const BackgroundImage = styled(animated.div)<{ $src: string }>`
  position: absolute;
  top: -10%;
  left: -10%;
  right: -10%;
  bottom: -10%;
  background-image: url(${props => props.$src});
  background-size: cover;
  background-position: center;
  filter: brightness(0.7);
  z-index: -2;
`;

// Content container
const ContentContainer = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
`;

// Component implementation
export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  type = BackgroundType.GRADIENT,
  color = '#121212',
  secondaryColor = '#000000',
  imageSrc,
  children,
  className,
  intensity = 50,
}) => {
  const { isAnimationsEnabled, animationDuration } = useAnimation();
  const [currentColor, setCurrentColor] = useState(color);
  const [currentSecondaryColor, setCurrentSecondaryColor] = useState(secondaryColor);
  
  // Update colors with a delay to create smooth transitions
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentColor(color);
      setCurrentSecondaryColor(secondaryColor);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [color, secondaryColor]);
  
  // Animate background properties
  const backgroundProps = useSpring({
    backgroundColor: type === BackgroundType.COLOR ? currentColor : 'transparent',
    config: { duration: isAnimationsEnabled ? animationDuration.medium : 0 },
  });
  
  // Animate image properties for parallax effect
  const imageProps = useSpring({
    transform: type === BackgroundType.PARALLAX ? 'translateY(-5%)' : 'translateY(0)',
    config: { duration: isAnimationsEnabled ? animationDuration.long : 0 },
  });
  
  // Handle mouse movement for parallax effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isAnimationsEnabled || type !== BackgroundType.PARALLAX) return;
    
    const { clientX, clientY } = e;
    const moveX = (clientX / window.innerWidth - 0.5) * 5;
    const moveY = (clientY / window.innerHeight - 0.5) * 5;
    
    // Update parallax effect based on mouse position
    imageProps.transform.set(`translate(${moveX}%, ${moveY}%)`);
  };
  
  return (
    <BackgroundContainer 
      className={className}
      onMouseMove={type === BackgroundType.PARALLAX ? handleMouseMove : undefined}
    >
      <AnimatedBackground
        style={backgroundProps}
        $type={type}
        $color={currentColor}
        $secondaryColor={currentSecondaryColor}
        $intensity={intensity}
      />
      
      {imageSrc && (type === BackgroundType.BLUR || type === BackgroundType.PARALLAX) && (
        <BackgroundImage 
          style={imageProps} 
          $src={imageSrc} 
        />
      )}
      
      <ContentContainer>{children}</ContentContainer>
    </BackgroundContainer>
  );
};

export default DynamicBackground; 