import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ContentService from '../../services/ContentService';
import Carousel from './Carousel';
import ContinueWatchingCard from './ContinueWatchingCard';
import { Transition } from '../animations/Transitions';
import { TransitionType } from '../../types/animations';
import type { ContentItem, WatchProgress } from '../../types/Content';

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
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary-color);
`;

const EmptyStateMessage = styled.div`
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary-color);
  text-align: center;
  
  p {
    margin: 8px 0;
  }
  
  button {
    margin-top: 16px;
    padding: 8px 16px;
    background-color: var(--primary-color);
    color: var(--text-on-primary-color);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background-color: var(--primary-dark-color);
    }
  }
`;

interface ContinueWatchingItem {
  contentId: string;
  episodeId?: string;
  content: ContentItem;
  progress: WatchProgress;
}

interface ContinueWatchingSectionProps {
  maxItems?: number;
  onViewAllClick?: () => void;
}

const ContinueWatchingSection: React.FC<ContinueWatchingSectionProps> = ({
  maxItems = 10,
  onViewAllClick
}) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionId = 'continue-watching-section';

  const fetchWatchProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the content service
      const contentService = ContentService.getInstance();
      
      // Get all in-progress content from localStorage (via playback service)
      const allProgress = localStorage.getItem('videoProgress');
      if (!allProgress) {
        setItems([]);
        setLoading(false);
        return;
      }
      
      // Parse the progress data
      const progressData = JSON.parse(allProgress) as Record<string, WatchProgress>;
      
      // Filter progress items that are not completed
      const inProgressItems = Object.values(progressData)
        .filter(progress => progress && !progress.completed && progress.percentage < 98);
      
      // Sort by last watched (most recent first)
      inProgressItems.sort((a, b) => {
        return new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime();
      });
      
      // Limit to maxItems
      const limitedItems = inProgressItems.slice(0, maxItems);
      
      // Fetch content details for each progress item
      const continueWatchingItems: ContinueWatchingItem[] = [];
      for (const progress of limitedItems) {
        try {
          const content = await contentService.getContentById(progress.contentId);
          if (content) {
            continueWatchingItems.push({
              contentId: progress.contentId,
              episodeId: progress.episodeId,
              content,
              progress
            });
          }
        } catch (err) {
          console.error(`Failed to fetch content details for ${progress.contentId}`, err);
        }
      }
      
      setItems(continueWatchingItems);
    } catch (err) {
      console.error('Error fetching continue watching items:', err);
      setError('Failed to load continue watching items');
    } finally {
      setLoading(false);
    }
  }, [maxItems]);

  useEffect(() => {
    fetchWatchProgress();
  }, [fetchWatchProgress]);

  const renderContinueWatchingCards = () => {
    return items.map((item, index) => (
      <ContinueWatchingCard
        key={`${item.contentId}-${item.episodeId || 'movie'}`}
        id={`${sectionId}-item-${index}`}
        contentId={item.contentId}
        episodeId={item.episodeId}
        title={item.episodeId ? `${item.content.title} - Episode ${item.episodeId}` : item.content.title}
        imageUrl={item.content.posterImage}
        progress={item.progress}
        groupId={sectionId}
      />
    ));
  };

  const handleBrowseClick = () => {
    navigate('/browse');
  };

  return (
    <SectionContainer>
      <SectionHeader>
        <SectionTitle>Continue Watching</SectionTitle>
        {items.length > 0 && onViewAllClick && (
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
        ) : items.length === 0 ? (
          <EmptyStateMessage>
            <p>You haven't started watching any content yet.</p>
            <p>Browse our library to find something to watch!</p>
            <button onClick={handleBrowseClick}>Browse Content</button>
          </EmptyStateMessage>
        ) : (
          <Carousel
            groupId={sectionId}
            loading={loading}
          >
            {renderContinueWatchingCards()}
          </Carousel>
        )}
      </Transition>
    </SectionContainer>
  );
};

export default ContinueWatchingSection; 