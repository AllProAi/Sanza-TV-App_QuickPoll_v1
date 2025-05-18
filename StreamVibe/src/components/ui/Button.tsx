import React from 'react';
import styled, { css } from 'styled-components';
import FocusableButton from './FocusableButton';

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'icon' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  id: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  neighbors?: {
    up?: string;
    down?: string;
    left?: string;
    right?: string;
  };
}

// Enhanced Button styling
const StyledButton = styled(FocusableButton)<{
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth?: boolean;
  hasStartIcon?: boolean;
  hasEndIcon?: boolean;
  $disabled?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  border-radius: 6px;
  font-weight: 500;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  
  /* Size styles */
  ${props => {
    switch (props.size) {
      case 'small':
        return css`
          padding: 8px 12px;
          font-size: 14px;
        `;
      case 'large':
        return css`
          padding: 16px 32px;
          font-size: 18px;
        `;
      case 'medium':
      default:
        return css`
          padding: 12px 20px;
          font-size: 16px;
        `;
    }
  }}
  
  /* Variant styles */
  ${props => {
    switch (props.variant) {
      case 'secondary':
        return css`
          background-color: var(--surface-color);
          color: var(--on-surface-color);
          border: 1px solid var(--border-color);
          
          &:hover:not(:disabled) {
            background-color: var(--surface-hover-color);
          }
        `;
      case 'text':
        return css`
          background-color: transparent;
          color: var(--primary-color);
          padding-left: 8px;
          padding-right: 8px;
          
          &:hover:not(:disabled) {
            background-color: rgba(187, 134, 252, 0.1);
            text-decoration: underline;
          }
        `;
      case 'icon':
        return css`
          background-color: transparent;
          color: var(--on-surface-color);
          padding: ${props.size === 'small' ? '6px' : props.size === 'medium' ? '10px' : '14px'};
          border-radius: 50%;
          
          &:hover:not(:disabled) {
            background-color: var(--surface-hover-color);
          }
        `;
      case 'danger':
        return css`
          background-color: var(--error-color, #f44336);
          color: white;
          
          &:hover:not(:disabled) {
            background-color: var(--error-color-hover, #d32f2f);
          }
        `;
      case 'primary':
      default:
        return css`
          background-color: var(--primary-color);
          color: var(--on-primary-color);
          
          &:hover:not(:disabled) {
            background-color: var(--primary-color-hover);
          }
        `;
    }
  }}
`;

// Button Group Component
const ButtonGroupContainer = styled.div<{
  gap?: number;
  vertical?: boolean;
}>`
  display: flex;
  flex-direction: ${props => props.vertical ? 'column' : 'row'};
  gap: ${props => props.gap || 8}px;
  align-items: ${props => props.vertical ? 'stretch' : 'center'};
`;

export interface ButtonGroupProps {
  children: React.ReactNode;
  gap?: number;
  vertical?: boolean;
  groupId: string;
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ 
  children, 
  gap,
  vertical = false,
  groupId,
  className
}) => {
  return (
    <ButtonGroupContainer 
      gap={gap} 
      vertical={vertical}
      className={className}
      data-group-id={groupId}
    >
      {children}
    </ButtonGroupContainer>
  );
};

const Button: React.FC<ButtonProps> = ({
  id,
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  startIcon,
  endIcon,
  fullWidth = false,
  className,
  neighbors
}) => {
  return (
    <StyledButton
      id={id}
      onClick={disabled ? undefined : onClick}
      className={className}
      neighbors={neighbors}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      hasStartIcon={!!startIcon}
      hasEndIcon={!!endIcon}
      $disabled={disabled}
    >
      {startIcon && <span className="button-start-icon">{startIcon}</span>}
      {children}
      {endIcon && <span className="button-end-icon">{endIcon}</span>}
    </StyledButton>
  );
};

export default Button; 