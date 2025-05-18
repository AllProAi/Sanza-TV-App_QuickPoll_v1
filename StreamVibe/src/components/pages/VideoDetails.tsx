import React, { useState } from 'react';
import styled from 'styled-components';
import { Container, Section } from '../layout/Grid';
import FocusableItem from '../ui/FocusableItem';
import ContentCard from '../content/ContentCard';

// Hero Banner
const HeroBanner = styled.div`
  width: 100%;
  height: 600px;
  position: relative;
  margin-bottom: 32px;
`;

const BannerImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const BannerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.8) 30%,
    rgba(0, 0, 0, 0.4) 60%,
    rgba(0, 0, 0, 0) 100%
  );
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 16px 0;
  max-width: 60%;
`;

const HeroInfoBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
`;

// Badge
const Badge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background-color: var(--primary-color);
  color: #fff;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  margin-right: 12px;
`;

// Action Buttons
const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
`;

const Button = styled.button<{ primary?: boolean; focused?: boolean }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  background-color: ${props => props.primary 
    ? 'var(--primary-color)' 
    : 'rgba(255, 255, 255, 0.1)'};
  color: #fff;
  
  ${props => props.focused && `
    transform: scale(1.05);
    box-shadow: 0 0 0 2px var(--primary-color);
  `}
`;

// Metadata Section
const MetadataContainer = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 48px;
`;

const DescriptionCol = styled.div`
  flex: 2;
`;

const InfoCol = styled.div`
  flex: 1;
`;

const Description = styled.div`
  color: var(--text-color-secondary);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const InfoContent = styled.div`
  color: var(--text-color-secondary);
  font-size: 16px;
  margin-bottom: 24px;
`;

const InfoTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const InfoRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.td`
  padding: 12px 0;
  color: var(--text-color-primary);
  font-weight: 600;
  width: 40%;
`;

const InfoValue = styled.td`
  padding: 12px 0;
  color: var(--text-color-secondary);
`;

// Expandable Component
const ExpandableContainer = styled.div`
  margin-bottom: 24px;
`;

const ExpandableContent = styled.div<{ expanded: boolean }>`
  max-height: ${props => props.expanded ? '1000px' : '80px'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const ExpandButton = styled.button<{ focused?: boolean }>`
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 500;
  padding: 8px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  ${props => props.focused && `
    text-decoration: underline;
  `}
`;

// Related Content Section
const RelatedSection = styled(Section)`
  margin-top: 48px;
`;

// Related Content Grid
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
`;

interface ExpandableProps {
  children: React.ReactNode;
  maxHeight?: number;
  label?: {
    more: string;
    less: string;
  };
}

const Expandable: React.FC<ExpandableProps> = ({ 
  children, 
  maxHeight = 80, 
  label = { more: 'Show More', less: 'Show Less' }
}) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <ExpandableContainer>
      <ExpandableContent 
        expanded={expanded} 
        style={{ maxHeight: expanded ? '1000px' : `${maxHeight}px` }}
      >
        {children}
      </ExpandableContent>
      
      <FocusableItem
        id="expand-button"
        groupId="details-buttons"
        onClick={() => setExpanded(!expanded)}
      >
        <ExpandButton>
          {expanded ? label.less : label.more}
        </ExpandButton>
      </FocusableItem>
    </ExpandableContainer>
  );
};

interface VideoDetailsProps {
  video: {
    id: string;
    title: string;
    releaseYear: string;
    ageRating: string;
    duration: string;
    genres: string[];
    description: string;
    starring: string[];
    directors: string[];
    creators: string[];
    imageUrl: string;
    bannerUrl: string;
    rating: number;
    progress?: number;
  };
  relatedContent: Array<{
    id: string;
    title: string;
    imageUrl: string;
    year: string;
    rating: string;
  }>;
  onPlay?: () => void;
  onAddToList?: () => void;
}

const VideoDetailsPage: React.FC<VideoDetailsProps> = ({
  video,
  relatedContent,
  onPlay,
  onAddToList
}) => {
  return (
    <div>
      <HeroBanner>
        <BannerImage src={video.bannerUrl || video.imageUrl} alt={video.title} />
        <BannerOverlay>
          <HeroTitle>{video.title}</HeroTitle>
          
          <HeroInfoBar>
            <InfoItem>{video.releaseYear}</InfoItem>
            <InfoItem>•</InfoItem>
            <InfoItem>{video.ageRating}</InfoItem>
            <InfoItem>•</InfoItem>
            <InfoItem>{video.duration}</InfoItem>
            <InfoItem>•</InfoItem>
            <InfoItem>{video.rating}/10</InfoItem>
            
            {video.genres.map((genre, index) => (
              <Badge key={index}>{genre}</Badge>
            ))}
          </HeroInfoBar>
          
          <ActionButtons>
            <FocusableItem
              id="play-button"
              groupId="details-buttons"
              onClick={onPlay}
            >
              <Button primary>
                Play
              </Button>
            </FocusableItem>
            
            <FocusableItem
              id="add-button"
              groupId="details-buttons"
              onClick={onAddToList}
            >
              <Button>
                + My List
              </Button>
            </FocusableItem>
          </ActionButtons>
        </BannerOverlay>
      </HeroBanner>
      
      <Container>
        <MetadataContainer>
          <DescriptionCol>
            <Expandable maxHeight={120}>
              <Description>
                {video.description}
              </Description>
            </Expandable>
          </DescriptionCol>
          
          <InfoCol>
            <InfoContent>
              <InfoTable>
                {video.starring && video.starring.length > 0 && (
                  <InfoRow>
                    <InfoLabel>Starring</InfoLabel>
                    <InfoValue>{video.starring.join(', ')}</InfoValue>
                  </InfoRow>
                )}
                
                {video.directors && video.directors.length > 0 && (
                  <InfoRow>
                    <InfoLabel>Directors</InfoLabel>
                    <InfoValue>{video.directors.join(', ')}</InfoValue>
                  </InfoRow>
                )}
                
                {video.creators && video.creators.length > 0 && (
                  <InfoRow>
                    <InfoLabel>Creators</InfoLabel>
                    <InfoValue>{video.creators.join(', ')}</InfoValue>
                  </InfoRow>
                )}
                
                {video.genres && video.genres.length > 0 && (
                  <InfoRow>
                    <InfoLabel>Genres</InfoLabel>
                    <InfoValue>{video.genres.join(', ')}</InfoValue>
                  </InfoRow>
                )}
              </InfoTable>
            </InfoContent>
          </InfoCol>
        </MetadataContainer>
        
        <RelatedSection title="More Like This">
          <ContentGrid>
            {relatedContent.map(item => (
              <ContentCard
                key={item.id}
                id={item.id}
                title={item.title}
                imageUrl={item.imageUrl}
                year={item.year}
                rating={item.rating}
                variant="poster"
                groupId="related-content"
              />
            ))}
          </ContentGrid>
        </RelatedSection>
      </Container>
    </div>
  );
};

export default VideoDetailsPage; 