import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useFocusable } from '../hooks/useFocusable';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 2rem;
  color: white;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 8rem;
  margin-bottom: 1rem;
  color: #e50914;
`;

const Subtitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 2rem;
`;

const Message = styled.p`
  font-size: 1.5rem;
  margin-bottom: 3rem;
  opacity: 0.8;
`;

const Button = styled.button<{ focused: boolean }>`
  background: ${props => props.focused ? '#e50914' : 'transparent'};
  border: 2px solid #e50914;
  color: white;
  font-size: 1.5rem;
  padding: 1rem 2rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e50914;
  }
`;

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { ref, focused } = useFocusable<HTMLButtonElement>({ defaultFocus: true });
  
  useEffect(() => {
    // Report 404 error to analytics
    console.log('404 page viewed');
  }, []);
  
  const handleReturn = () => {
    navigate('/');
  };
  
  return (
    <NotFoundContainer>
      <Title>404</Title>
      <Subtitle>Page Not Found</Subtitle>
      <Message>
        The page you're looking for isn't available. 
        The link may be broken or the page may have been removed.
      </Message>
      <Button 
        ref={ref}
        focused={focused}
        onClick={handleReturn}
      >
        Return to Home
      </Button>
    </NotFoundContainer>
  );
};

export default NotFound; 