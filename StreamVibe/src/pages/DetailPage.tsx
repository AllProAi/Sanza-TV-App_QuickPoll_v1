import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 2rem;
  background-color: #121212;
  color: #ffffff;
  min-height: 100vh;
`;

const BackButton = styled.button`
  background-color: transparent;
  color: #ffffff;
  border: 1px solid #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
  cursor: pointer;
  &:hover, &:focus {
    background-color: rgba(255, 255, 255, 0.1);
    outline: 3px solid #fff;
  }
`;

const Hero = styled.div`
  width: 100%;
  height: 400px;
  background-color: #333;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const Metadata = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  color: #ccc;
`;

const Description = styled.p`
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 800px;
`;

const Button = styled.button`
  background-color: #E50914;
  color: #ffffff;
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1.2rem;
  margin-right: 1rem;
  cursor: pointer;
  &:hover, &:focus {
    background-color: #F40612;
    outline: 3px solid #fff;
  }
`;

const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <PageContainer>
      <BackButton onClick={handleBack}>← Back</BackButton>
      <Hero>Content ID: {id}</Hero>
      <Title>Content Title</Title>
      <Metadata>
        <span>2023</span>
        <span>•</span>
        <span>TV-MA</span>
        <span>•</span>
        <span>1h 23m</span>
      </Metadata>
      <Description>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, 
        nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl 
        nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl 
        aliquam nisl, eget ultricies nisl nisl eget nisl.
      </Description>
      <Button autoFocus>Play</Button>
      <Button>Add to Watchlist</Button>
    </PageContainer>
  );
};

export default DetailPage; 