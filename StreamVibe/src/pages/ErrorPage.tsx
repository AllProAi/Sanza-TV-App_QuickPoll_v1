import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { PageTransition } from '../components/animations/Transitions';
import { TransitionType } from '../types/animations';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  height: 80vh;
  text-align: center;
`;

const ErrorCode = styled.h1`
  font-size: 6rem;
  margin-bottom: 0;
  color: var(--color-primary);
`;

const ErrorTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 24px;
`;

const ErrorMessage = styled.p`
  font-size: 1.2rem;
  max-width: 600px;
  margin-bottom: 32px;
`;

const BackButton = styled(Link)`
  background-color: var(--color-primary);
  color: var(--color-white);
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--color-primary-dark);
    transform: translateY(-2px);
  }
`;

const ErrorPage: React.FC = () => {
  return (
    <PageTransition type={TransitionType.FADE} duration={400}>
      <ErrorContainer>
        <ErrorCode>404</ErrorCode>
        <ErrorTitle>Page Not Found</ErrorTitle>
        <ErrorMessage>
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </ErrorMessage>
        <BackButton to="/">Back to Home</BackButton>
      </ErrorContainer>
    </PageTransition>
  );
};

export default ErrorPage; 