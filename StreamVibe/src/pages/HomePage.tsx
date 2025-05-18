import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ContentService from '../services/ContentService';
import type { Category } from '../types/Content';
import FeaturedContent from '../components/content/FeaturedContent';
import ContentSection from '../components/content/ContentSection';
import ContinueWatchingSection from '../components/content/ContinueWatchingSection';
import { PageTransition } from '../components/animations/Transitions';
import { TransitionType } from '../types/animations';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 24px;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;
  margin-top: 24px;
`;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const contentService = ContentService.getInstance();
        const fetchedCategories = await contentService.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getRecommendedFilter = () => {
    return {
      // This would normally be based on user preferences
      // For now, we're just returning a sample filter
      genres: ['Action', 'Adventure']
    };
  };

  const handleViewAllClick = (categoryId: string) => {
    navigate(`/browse?category=${categoryId}`);
  };

  return (
    <PageTransition type={TransitionType.FADE} duration={400}>
      <HomeContainer>
        {/* Featured Content Carousel */}
        <FeaturedContent autoRotateInterval={10000} maxItems={5} />

        {/* Main Content Sections */}
        <ContentContainer>
          {/* Continue Watching Section */}
          <ContinueWatchingSection 
            maxItems={10}
            onViewAllClick={() => navigate('/browse?section=continue-watching')}
          />

          {/* Category-based Sections */}
          {!loading &&
            categories.map((category) => (
              <ContentSection
                key={category.id}
                title={category.name}
                categoryId={category.id}
                maxItems={10}
                onViewAllClick={() => handleViewAllClick(category.id)}
              />
            ))}

          {/* Recommended For You Section */}
          <ContentSection
            title="Recommended For You"
            contentFilter={getRecommendedFilter()}
            maxItems={10}
            onViewAllClick={() => navigate('/browse?section=recommended')}
          />
        </ContentContainer>
      </HomeContainer>
    </PageTransition>
  );
};

export default HomePage; 