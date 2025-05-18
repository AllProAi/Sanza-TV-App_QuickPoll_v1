import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { ContentItem, ContentFilter } from '../../types/Content';
import ContentService from '../../services/ContentService';
import Carousel from './Carousel';
import ContentCard from './ContentCard';
import { Transition } from '../animations/Transitions';
import { TransitionType } from '../../types/animations';

const SectionContainer = styled.div`
  margin-bottom: 40px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary-color);
`;

const ViewAllButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 16px;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LoadingPlaceholder = styled.div`
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary-color);
`;

interface ContentSectionProps {
  title: string;
  categoryId?: string;
  contentFilter?: ContentFilter;
  maxItems?: number;
  onViewAllClick?: () => void;
}

const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  categoryId,
  contentFilter,
  maxItems = 10,
  onViewAllClick
}) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionId = `section-${title.toLowerCase().replace(/\s+/g, '-')}`;

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const contentService = ContentService.getInstance();
        let items: ContentItem[] = [];
        
        if (categoryId) {
          // Fetch content by category
          items = await contentService.getCategoryContent(categoryId);
        } else if (contentFilter) {
          // Fetch filtered content
          items = await contentService.filterContent(contentFilter);
        } else {
          // Fetch all content
          items = await contentService.getAllContent();
        }
        
        // Limit the number of items if maxItems is specified
        setContent(items.slice(0, maxItems));
      } catch (err) {
        console.error('Error fetching content for section:', title, err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [categoryId, contentFilter, maxItems, title]);

  // Render content cards for carousel
  const renderContentCards = () => {
    return content.map((item, index) => (
      <ContentCard 
        key={item.id} 
        id={`${sectionId}-item-${index}`}
        title={item.title}
        imageUrl={item.posterImage}
        year={item.releaseYear.toString()}
        duration={`${item.duration} min`}
        rating={item.ageRating}
        description={item.description}
        badges={item.genres.slice(0, 2)}
        groupId={sectionId}
      />
    ));
  };

  return (
    <SectionContainer>
      <SectionHeader>
        <SectionTitle>{title}</SectionTitle>
        {onViewAllClick && (
          <ViewAllButton onClick={onViewAllClick}>
            View All
          </ViewAllButton>
        )}
      </SectionHeader>
      
      <Transition
        show={!loading}
        type={TransitionType.FADE}
        duration={400}
      >
        {loading ? (
          <LoadingPlaceholder>Loading content...</LoadingPlaceholder>
        ) : error ? (
          <LoadingPlaceholder>{error}</LoadingPlaceholder>
        ) : content.length === 0 ? (
          <LoadingPlaceholder>No content available</LoadingPlaceholder>
        ) : (
          <Carousel
            groupId={sectionId}
            loading={loading}
          >
            {renderContentCards()}
          </Carousel>
        )}
      </Transition>
    </SectionContainer>
  );
};

export default ContentSection; 