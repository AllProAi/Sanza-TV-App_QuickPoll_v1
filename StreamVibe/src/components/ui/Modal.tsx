import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { css, keyframes } from 'styled-components';
import FocusableItem from './FocusableItem';
import { useNavigation } from '../../hooks/useNavigation';

// Keyframe animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// Modal Backdrop
const Backdrop = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.visible ? 1 : 0};
  pointer-events: ${props => props.visible ? 'auto' : 'none'};
  transition: opacity 0.3s ease;
  animation: ${props => props.visible ? css`${fadeIn} 0.3s ease forwards` : 'none'};
`;

// Modal Variants
type ModalVariant = 'default' | 'info' | 'error' | 'confirmation';

// Modal Container
const ModalContainer = styled.div<{ 
  visible: boolean; 
  variant: ModalVariant;
  width?: string;
}>`
  background-color: var(--background-color-secondary);
  border-radius: 12px;
  padding: 32px;
  max-width: ${props => props.width || '500px'};
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1001;
  opacity: ${props => props.visible ? 1 : 0};
  transform: ${props => props.visible ? 'scale(1)' : 'scale(0.9)'};
  transition: opacity 0.3s ease, transform 0.3s ease;
  animation: ${props => props.visible ? css`${scaleIn} 0.3s ease forwards` : 'none'};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  
  ${props => props.variant === 'info' && css`
    border-top: 4px solid var(--info-color);
  `}
  
  ${props => props.variant === 'error' && css`
    border-top: 4px solid var(--error-color);
  `}
  
  ${props => props.variant === 'confirmation' && css`
    border-top: 4px solid var(--warning-color);
  `}
`;

// Modal Header
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

// Modal Title
const ModalTitle = styled.h2<{ variant: ModalVariant }>`
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: var(--text-color-primary);
  
  ${props => props.variant === 'info' && css`
    color: var(--info-color);
  `}
  
  ${props => props.variant === 'error' && css`
    color: var(--error-color);
  `}
  
  ${props => props.variant === 'confirmation' && css`
    color: var(--warning-color);
  `}
`;

// Close Button
const CloseButton = styled.button<{ focused?: boolean }>`
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-color-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  ${props => props.focused && css`
    background-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 2px var(--primary-color);
  `}
`;

// Modal Content
const ModalContent = styled.div`
  margin-bottom: 24px;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-color-secondary);
`;

// Modal Footer
const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
`;

// Modal Button
const ModalButton = styled.button<{ 
  primary?: boolean; 
  danger?: boolean;
  focused?: boolean;
}>`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  ${props => props.primary && css`
    background-color: var(--primary-color);
    color: #fff;
    
    &:hover {
      background-color: var(--primary-color-hover);
    }
  `}
  
  ${props => props.danger && css`
    background-color: var(--error-color);
    color: #fff;
    
    &:hover {
      background-color: var(--error-color-hover, darkred);
    }
  `}
  
  ${props => !props.primary && !props.danger && css`
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--text-color-primary);
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  `}
  
  ${props => props.focused && css`
    box-shadow: 0 0 0 2px var(--primary-color);
    transform: scale(1.05);
  `}
`;

// Props type for Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  variant?: ModalVariant;
  width?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  dangerAction?: {
    label: string;
    onClick: () => void;
  };
  closeOnBackdropClick?: boolean;
}

// Props type for Overlay
interface OverlayProps {
  isOpen: boolean;
  onClose?: () => void;
  type: 'info' | 'error' | 'success' | 'loading';
  message: string;
  autoHideDuration?: number;
}

// Modal Component
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  variant = 'default',
  width,
  primaryAction,
  secondaryAction,
  dangerAction,
  closeOnBackdropClick = true
}) => {
  const [visible, setVisible] = useState(false);
  const prevFocusRef = useRef<string | null>(null);
  const { currentFocus, setFocus } = useNavigation();
  const modalGroupId = `modal-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Handle visibility state with animation delay
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      // Store the previous focus
      prevFocusRef.current = currentFocus;
    } else {
      setTimeout(() => setVisible(false), 300);
    }
  }, [isOpen, currentFocus]);
  
  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  // Restore focus when modal closes
  useEffect(() => {
    if (!isOpen && prevFocusRef.current) {
      setFocus(prevFocusRef.current);
    }
  }, [isOpen, setFocus]);
  
  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };
  
  if (!isOpen && !visible) return null;
  
  return createPortal(
    <Backdrop visible={visible} onClick={handleBackdropClick}>
      <ModalContainer visible={visible} variant={variant} width={width}>
        <ModalHeader>
          <ModalTitle variant={variant}>{title}</ModalTitle>
          <FocusableItem id={`${modalGroupId}-close`} groupId={modalGroupId} onClick={onClose}>
            <CloseButton>✕</CloseButton>
          </FocusableItem>
        </ModalHeader>
        
        <ModalContent>
          {children}
        </ModalContent>
        
        {(primaryAction || secondaryAction || dangerAction) && (
          <ModalFooter>
            {secondaryAction && (
              <FocusableItem id={`${modalGroupId}-secondary`} groupId={modalGroupId} onClick={secondaryAction.onClick}>
                <ModalButton>
                  {secondaryAction.label}
                </ModalButton>
              </FocusableItem>
            )}
            
            {dangerAction && (
              <FocusableItem id={`${modalGroupId}-danger`} groupId={modalGroupId} onClick={dangerAction.onClick}>
                <ModalButton danger>
                  {dangerAction.label}
                </ModalButton>
              </FocusableItem>
            )}
            
            {primaryAction && (
              <FocusableItem id={`${modalGroupId}-primary`} groupId={modalGroupId} onClick={primaryAction.onClick}>
                <ModalButton primary>
                  {primaryAction.label}
                </ModalButton>
              </FocusableItem>
            )}
          </ModalFooter>
        )}
      </ModalContainer>
    </Backdrop>,
    document.body
  );
};

// Overlay Container
const OverlayContainer = styled.div<{ isOpen: boolean; type: string }>`
  position: fixed;
  bottom: 48px;
  left: 50%;
  transform: translateX(-50%) translateY(${props => props.isOpen ? '0' : '100%'});
  z-index: 1000;
  min-width: 300px;
  max-width: 600px;
  padding: 16px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  animation: ${props => props.isOpen ? css`${fadeIn} 0.3s ease forwards` : 'none'};
  transition: transform 0.3s ease;
  
  ${props => props.type === 'info' && css`
    background-color: var(--info-color);
    color: #fff;
  `}
  
  ${props => props.type === 'error' && css`
    background-color: var(--error-color);
    color: #fff;
  `}
  
  ${props => props.type === 'success' && css`
    background-color: var(--success-color);
    color: #fff;
  `}
  
  ${props => props.type === 'loading' && css`
    background-color: var(--background-color-secondary);
    color: var(--text-color-primary);
  `}
`;

// Loading Spinner
const Spinner = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const LoadingIcon = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${Spinner} 1s linear infinite;
`;

// Message Text
const OverlayMessage = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  flex: 1;
`;

// Overlay Component
const Overlay: React.FC<OverlayProps> = ({
  isOpen,
  onClose,
  type,
  message,
  autoHideDuration = 3000
}) => {
  const [visible, setVisible] = useState(false);
  
  // Handle visibility state with animation delay
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      
      // Auto-hide functionality
      if (type !== 'loading' && autoHideDuration && onClose) {
        const timer = setTimeout(() => {
          onClose();
        }, autoHideDuration);
        
        return () => clearTimeout(timer);
      }
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoHideDuration, onClose, type]);
  
  if (!isOpen && !visible) return null;
  
  const getIcon = () => {
    switch (type) {
      case 'info':
        return 'ℹ';
      case 'error':
        return '⚠';
      case 'success':
        return '✓';
      case 'loading':
        return <LoadingIcon />;
      default:
        return null;
    }
  };
  
  return createPortal(
    <OverlayContainer isOpen={visible} type={type}>
      {getIcon()}
      <OverlayMessage>{message}</OverlayMessage>
    </OverlayContainer>,
    document.body
  );
};

export { Modal, Overlay };
export type { ModalProps, OverlayProps }; 