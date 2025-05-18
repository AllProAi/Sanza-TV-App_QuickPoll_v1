import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import FocusableItem from '../ui/FocusableItem';

interface SearchBarProps {
  id: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  initialValue?: string;
  groupId?: string;
  className?: string;
  neighbors?: {
    up?: string;
    down?: string;
    left?: string;
    right?: string;
  };
}

const SearchContainer = styled.div<{ isFocused: boolean }>`
  position: relative;
  width: 100%;
  max-width: 500px;
  transition: all 0.3s ease;
  transform: ${props => props.isFocused ? 'scale(1.02)' : 'scale(1)'};
`;

const SearchInput = styled.input<{ isFocused: boolean }>`
  width: 100%;
  padding: 12px 20px;
  padding-right: 50px;
  border-radius: 8px;
  border: 2px solid ${props => props.isFocused ? 'var(--primary-color)' : 'var(--border-color)'};
  background-color: var(--surface-color);
  color: var(--on-surface-color);
  font-size: 16px;
  font-family: inherit;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: var(--text-secondary-color);
    opacity: 0.7;
  }
`;

const SearchButton = styled.button<{ isFocused: boolean }>`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background-color: ${props => props.isFocused ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.isFocused ? 'var(--on-primary-color)' : 'var(--on-surface-color)'};
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--primary-color);
    color: var(--on-primary-color);
  }
`;

const SearchIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const SearchBar: React.FC<SearchBarProps> = ({
  id,
  placeholder = 'Search...',
  onSearch,
  initialValue = '',
  groupId,
  className,
  neighbors,
}) => {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleSearch = () => {
    if (onSearch && value.trim()) {
      onSearch(value.trim());
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };
  
  const handleFocus = () => {
    setIsFocused(true);
    // Focus the actual input element after the FocusableItem is focused
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleBlur = () => {
    // Don't set isFocused to false immediately, as we might just be focusing the button
    setTimeout(() => {
      if (document.activeElement !== inputRef.current) {
        setIsFocused(false);
      }
    }, 100);
  };
  
  // Handle virtual keyboard input for TV
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (!isFocused) return;
      
      if (e.key === 'Backspace') {
        setValue(prev => prev.slice(0, -1));
        e.preventDefault();
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setValue(prev => prev + e.key);
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [isFocused]);
  
  return (
    <FocusableItem
      id={id}
      onFocus={handleFocus}
      onBlur={handleBlur}
      groupId={groupId}
      className={className}
      neighbors={neighbors}
    >
      <SearchContainer isFocused={isFocused}>
        <SearchInput
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          isFocused={isFocused}
        />
        <SearchButton
          type="button"
          onClick={handleSearch}
          isFocused={isFocused}
          aria-label="Search"
        >
          <SearchIcon />
        </SearchButton>
      </SearchContainer>
    </FocusableItem>
  );
};

export default SearchBar; 