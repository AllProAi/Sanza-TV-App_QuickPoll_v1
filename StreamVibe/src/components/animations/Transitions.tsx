import React from 'react';
import type { PropsWithChildren } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import styled from 'styled-components';
import { TransitionType } from '../../types/animations';

// Styled components for animations
const AnimatedContainer = styled(animated.div)`
  width: 100%;
  height: 100%;
`;

interface TransitionProps {
  show?: boolean;
  type?: TransitionType;
  duration?: number;
  delay?: number;
  onRest?: () => void;
  className?: string;
}

// Move transition types to separate file to avoid react-refresh/only-export-components warning
export const Transition: React.FC<PropsWithChildren<TransitionProps>> = ({
  children,
  show = true,
  type = TransitionType.FADE,
  duration = 300,
  delay = 0,
  onRest,
  className,
}) => {
  // Configure animation based on transition type
  const animationConfig = {
    config: { ...config.gentle, duration },
    delay,
    onRest,
  };

  // Use separate springs for different properties to avoid conditional hook calls
  const fadeProps = useSpring({
    opacity: show ? 1 : 0,
    ...animationConfig,
  });

  const slideUpProps = useSpring({
    transform: show && type === TransitionType.SLIDE_UP ? 'translateY(0%)' : 'translateY(5%)',
    ...animationConfig,
  });

  const slideDownProps = useSpring({
    transform: show && type === TransitionType.SLIDE_DOWN ? 'translateY(0%)' : 'translateY(-5%)',
    ...animationConfig,
  });

  const slideLeftProps = useSpring({
    transform: show && type === TransitionType.SLIDE_LEFT ? 'translateX(0%)' : 'translateX(5%)',
    ...animationConfig,
  });

  const slideRightProps = useSpring({
    transform: show && type === TransitionType.SLIDE_RIGHT ? 'translateX(0%)' : 'translateX(-5%)',
    ...animationConfig,
  });

  const zoomProps = useSpring({
    transform: show && type === TransitionType.ZOOM ? 'scale(1)' : 'scale(0.95)',
    ...animationConfig,
  });

  // Select the appropriate animation props based on the type
  let animationProps;
  switch (type) {
    case TransitionType.FADE:
      animationProps = fadeProps;
      break;
    case TransitionType.SLIDE_UP:
      animationProps = { ...fadeProps, ...slideUpProps };
      break;
    case TransitionType.SLIDE_DOWN:
      animationProps = { ...fadeProps, ...slideDownProps };
      break;
    case TransitionType.SLIDE_LEFT:
      animationProps = { ...fadeProps, ...slideLeftProps };
      break;
    case TransitionType.SLIDE_RIGHT:
      animationProps = { ...fadeProps, ...slideRightProps };
      break;
    case TransitionType.ZOOM:
      animationProps = { ...fadeProps, ...zoomProps };
      break;
    case TransitionType.NONE:
    default:
      animationProps = { opacity: 1 };
      break;
  }

  return (
    <AnimatedContainer style={animationProps} className={className}>
      {children}
    </AnimatedContainer>
  );
};

// Page transition component specifically for route transitions
export const PageTransition: React.FC<PropsWithChildren<TransitionProps>> = (props) => {
  return (
    <Transition 
      type={TransitionType.FADE} 
      duration={400} 
      {...props}
    />
  );
};

// Focus transition for highlighting focused elements
export const FocusTransition: React.FC<PropsWithChildren<{ isFocused: boolean } & TransitionProps>> = ({
  isFocused,
  children,
  ...rest
}) => {
  return (
    <Transition
      show={isFocused}
      type={TransitionType.ZOOM}
      duration={200}
      {...rest}
    >
      {children}
    </Transition>
  );
};

// Component enter/exit animation
export const ComponentTransition = styled(Transition)`
  display: ${props => (props.show ? 'block' : 'none')};
`;

// Export all transition types
export default {
  Transition,
  PageTransition,
  FocusTransition,
  ComponentTransition,
  TransitionType,
}; 