import React, { useRef, useEffect } from 'react';
import type { InputHTMLAttributes } from 'react';
import styled from 'styled-components';
import useNavigation from '../../hooks/useNavigation';

interface FocusableInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  neighbors?: {
    up?: string;
    down?: string;
    left?: string;
    right?: string;
  };
}

const StyledInput = styled.input<{ isFocused: boolean }>`
  width: 100%;
  padding: 16px;
  background-color: var(--surface-color);
  color: var(--text-primary-color);
  border: 2px solid ${props => props.isFocused ? 'var(--primary-color)' : 'transparent'};
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  box-shadow: ${props => props.isFocused ? '0 0 0 2px rgba(187, 134, 252, 0.3)' : 'none'};
  outline: none;
  
  &:hover {
    background-color: var(--surface-hover-color);
  }
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
  }
  
  &::placeholder {
    color: var(--text-secondary-color);
  }
`;

const FocusableInput: React.FC<FocusableInputProps> = ({
  id,
  neighbors,
  ...inputProps
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { registerFocusable, unregisterFocusable, currentFocus } = useNavigation();
  const isFocused = currentFocus === id;

  useEffect(() => {
    if (inputRef.current) {
      registerFocusable(id, inputRef.current, neighbors);
    }

    return () => {
      unregisterFocusable(id);
    };
  }, [id, registerFocusable, unregisterFocusable, neighbors]);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <StyledInput
      ref={inputRef}
      id={id}
      isFocused={isFocused}
      {...inputProps}
    />
  );
};

export default FocusableInput; 