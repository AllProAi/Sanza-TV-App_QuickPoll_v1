import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigation } from '../../hooks/useNavigation';

interface FocusableButtonProps {
  id: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  neighbors?: {
    up?: string;
    down?: string;
    left?: string;
    right?: string;
  };
}

const StyledButton = styled.button<{ isFocused: boolean }>`
  padding: 16px 24px;
  background-color: ${props => props.isFocused ? 'var(--primary-color)' : 'var(--surface-color)'};
  color: var(--on-surface-color);
  border-radius: 4px;
  font-size: 18px;
  transition: all 0.2s ease;
  box-shadow: ${props => props.isFocused ? '0 0 10px rgba(187, 134, 252, 0.5)' : 'none'};
  transform: ${props => props.isFocused ? 'scale(1.05)' : 'scale(1)'};
  
  &:hover, &:focus {
    background-color: var(--primary-color);
    outline: none;
  }
`;

const FocusableButton: React.FC<FocusableButtonProps> = ({
  id,
  children,
  onClick,
  className,
  neighbors
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { registerFocusable, unregisterFocusable, currentFocus } = useNavigation();
  const isFocused = currentFocus === id;

  useEffect(() => {
    if (buttonRef.current) {
      registerFocusable(id, buttonRef.current, neighbors);
    }

    return () => {
      unregisterFocusable(id);
    };
  }, [id, registerFocusable, unregisterFocusable, neighbors]);

  return (
    <StyledButton
      ref={buttonRef}
      id={id}
      onClick={onClick}
      className={className}
      isFocused={isFocused}
      tabIndex={0}
    >
      {children}
    </StyledButton>
  );
};

export default FocusableButton; 