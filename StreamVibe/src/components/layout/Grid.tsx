import React from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';

// Grid Container
interface ContainerProps {
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

const StyledContainer = styled.div<{ fullWidth?: boolean }>`
  width: ${props => props.fullWidth ? '100%' : '1824px'};
  max-width: 1824px;
  margin: 0 auto;
  padding: ${props => props.fullWidth ? '0' : '0 48px'};
  box-sizing: border-box;
  
  /* TV safe zone awareness */
  @media (max-width: 1920px) {
    padding: ${props => props.fullWidth ? '0' : '0 48px'};
  }
`;

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  fullWidth = false,
  className
}) => (
  <StyledContainer fullWidth={fullWidth} className={className}>
    {children}
  </StyledContainer>
);

// Grid Row
interface RowProps {
  children: ReactNode;
  spacing?: number;
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  className?: string;
}

const StyledRow = styled.div<{ spacing?: number; alignItems?: string; justifyContent?: string }>`
  display: flex;
  flex-wrap: wrap;
  margin: 0 -${props => (props.spacing || 12)}px;
  align-items: ${props => props.alignItems || 'flex-start'};
  justify-content: ${props => props.justifyContent || 'flex-start'};
`;

export const Row: React.FC<RowProps> = ({ 
  children, 
  spacing = 12,
  alignItems = 'flex-start',
  justifyContent = 'flex-start',
  className
}) => (
  <StyledRow 
    spacing={spacing} 
    alignItems={alignItems} 
    justifyContent={justifyContent}
    className={className}
  >
    {children}
  </StyledRow>
);

// Grid Column
interface ColProps {
  children: ReactNode;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  spacing?: number;
  className?: string;
}

const StyledCol = styled.div<{ 
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  spacing?: number;
}>`
  box-sizing: border-box;
  padding: 0 ${props => (props.spacing || 12)}px;
  flex: 0 0 ${props => (props.xs ? (props.xs / 12 * 100) : 100)}%;
  max-width: ${props => (props.xs ? (props.xs / 12 * 100) : 100)}%;
  
  @media (min-width: 640px) {
    flex: 0 0 ${props => (props.sm ? (props.sm / 12 * 100) : (props.xs ? (props.xs / 12 * 100) : 100))}%;
    max-width: ${props => (props.sm ? (props.sm / 12 * 100) : (props.xs ? (props.xs / 12 * 100) : 100))}%;
  }
  
  @media (min-width: 960px) {
    flex: 0 0 ${props => (props.md ? (props.md / 12 * 100) : (props.sm ? (props.sm / 12 * 100) : (props.xs ? (props.xs / 12 * 100) : 100)))}%;
    max-width: ${props => (props.md ? (props.md / 12 * 100) : (props.sm ? (props.sm / 12 * 100) : (props.xs ? (props.xs / 12 * 100) : 100)))}%;
  }
  
  @media (min-width: 1280px) {
    flex: 0 0 ${props => (props.lg ? (props.lg / 12 * 100) : (props.md ? (props.md / 12 * 100) : (props.sm ? (props.sm / 12 * 100) : (props.xs ? (props.xs / 12 * 100) : 100))))}%;
    max-width: ${props => (props.lg ? (props.lg / 12 * 100) : (props.md ? (props.md / 12 * 100) : (props.sm ? (props.sm / 12 * 100) : (props.xs ? (props.xs / 12 * 100) : 100))))}%;
  }
`;

export const Col: React.FC<ColProps> = ({ 
  children, 
  xs = 12, 
  sm, 
  md, 
  lg,
  spacing = 12,
  className
}) => (
  <StyledCol 
    xs={xs} 
    sm={sm} 
    md={md} 
    lg={lg} 
    spacing={spacing}
    className={className}
  >
    {children}
  </StyledCol>
);

// Section Component
interface SectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  marginBottom?: number;
  className?: string;
}

const StyledSection = styled.section<{ marginBottom?: number }>`
  margin-bottom: ${props => props.marginBottom || 40}px;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--text-color-primary);
`;

const SectionDescription = styled.p`
  font-size: 18px;
  margin: 0 0 24px 0;
  color: var(--text-color-secondary);
`;

export const Section: React.FC<SectionProps> = ({ 
  children, 
  title, 
  description, 
  marginBottom = 40,
  className
}) => (
  <StyledSection marginBottom={marginBottom} className={className}>
    {title && <SectionTitle>{title}</SectionTitle>}
    {description && <SectionDescription>{description}</SectionDescription>}
    {children}
  </StyledSection>
);

// Aspect Ratio Container
interface AspectRatioProps {
  children: ReactNode;
  ratio?: number;
  className?: string;
}

const StyledAspectRatio = styled.div<{ ratio: number }>`
  position: relative;
  width: 100%;
  padding-top: ${props => (1 / props.ratio) * 100}%;
  
  > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const AspectRatio: React.FC<AspectRatioProps> = ({ 
  children, 
  ratio = 16/9,
  className
}) => (
  <StyledAspectRatio ratio={ratio} className={className}>
    {children}
  </StyledAspectRatio>
); 