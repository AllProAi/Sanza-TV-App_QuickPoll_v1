import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import type { ContentItem, Category, ContentFilter } from '../types/Content';
import ContentService from '../services/ContentService';
import ContentCard from '../components/content/ContentCard';
import { PageTransition } from '../components/animations/Transitions';
import { TransitionType } from '../types/animations';
import { useSoundEffects } from '../hooks/useSoundEffects';
import type { SoundType } from '../types/sounds';
import FocusableButton from '../components/ui/FocusableButton';

const PageContainer = styled.div`
  padding: 32px;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 36px;
  margin-bottom: 24px;
  color: var(--text-primary-color);
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 32px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 24px;
`;

const FilterLabel = styled.h3`
  font-size: 16px;
  margin-bottom: 8px;
  color: var(--text-secondary-color);
`;

const FilterButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterChip = styled.div<{ active: boolean }>`
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--surface-color)'};
  color: ${props => props.active ? 'var(--on-primary-color)' : 'var(--text-primary-color)'};
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--surface-hover-color)'};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 24px;
`;

const NoResults = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  text-align: center;
`;

const NoResultsTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 16px;
`;

const NoResultsText = styled.p`
  font-size: 16px;
  color: var(--text-secondary-color);
  margin-bottom: 24px;
`;

const BrowsePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { playSound } = useSoundEffects();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');
  
  const [content, setContent] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<ContentFilter>({});
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  
  // Fetch all content and categories
  useEffect(() => {
    const fetchContentAndCategories = async () => {
      setLoading(true);
      try {
        const contentService = ContentService.getInstance();
        const allCategories = await contentService.getCategories();
        setCategories(allCategories);
        
        let contentItems: ContentItem[] = [];
        
        if (selectedCategory) {
          // Fetch content for the selected category
          const category = allCategories.find(cat => cat.id === selectedCategory);
          if (category) {
            contentItems = await contentService.getCategoryContent(selectedCategory);
          }
        } else {
          // Fetch all content
          contentItems = await contentService.getAllContent();
        }
        
        setContent(contentItems);
        
        // Extract unique genres and content types for filters
        const genres = Array.from(new Set(contentItems.flatMap(item => item.genres)));
        const types = Array.from(new Set(contentItems.map(item => item.type)));
        
        setAvailableGenres(genres);
        setContentTypes(types);
        
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContentAndCategories();
  }, [selectedCategory]);
  
  // Apply filters when they change
  useEffect(() => {
    const applyFilters = async () => {
      if (Object.keys(activeFilters).length === 0) return;
      
      setLoading(true);
      try {
        const contentService = ContentService.getInstance();
        let filteredContent: ContentItem[];
        
        if (selectedCategory) {
          // First get category content, then filter it
          const categoryContent = await contentService.getCategoryContent(selectedCategory);
          filteredContent = await contentService.filterContent({
            ...activeFilters
          });
          
          // Manually filter to intersection of category and filters
          filteredContent = filteredContent.filter(item => 
            categoryContent.some(catItem => catItem.id === item.id));
        } else {
          // Just apply the filters
          filteredContent = await contentService.filterContent(activeFilters);
        }
        
        setContent(filteredContent);
      } catch (error) {
        console.error('Error applying filters:', error);
      } finally {
        setLoading(false);
      }
    };
    
    applyFilters();
  }, [activeFilters, selectedCategory]);
  
  // Update URL when category changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    if (selectedCategory) {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });
    
  }, [selectedCategory, location.pathname, location.search, navigate]);
  
  // Handle category selection
  const handleCategoryChange = (categoryId: string | null) => {
    playSound('select' as SoundType);
    setSelectedCategory(categoryId);
    
    // Reset filters when changing category
    setActiveFilters({});
  };
  
  // Handle filter selection
  const toggleGenreFilter = (genre: string) => {
    playSound('select' as SoundType);
    setActiveFilters(prev => {
      const currentGenres = prev.genres || [];
      
      // Remove genre if already selected, otherwise add it
      if (currentGenres.includes(genre)) {
        return {
          ...prev,
          genres: currentGenres.filter(g => g !== genre)
        };
      } else {
        return {
          ...prev,
          genres: [...currentGenres, genre]
        };
      }
    });
  };
  
  // Handle content type selection
  const toggleTypeFilter = (type: string) => {
    playSound('select' as SoundType);
    setActiveFilters(prev => {
      // Convert type to the valid ContentItem type
      const contentType = type as 'movie' | 'series' | 'documentary' | 'live';
      const currentTypes = prev.type || [];
      const typesArray = Array.isArray(currentTypes) ? currentTypes : [currentTypes];
      
      // Remove type if already selected, otherwise add it
      if (typesArray.includes(contentType)) {
        const newTypes = typesArray.filter(t => t !== contentType) as ('movie' | 'series' | 'documentary' | 'live')[];
        return {
          ...prev,
          type: newTypes.length > 0 ? newTypes : undefined
        };
      } else {
        return {
          ...prev,
          type: [...typesArray, contentType] as ('movie' | 'series' | 'documentary' | 'live')[]
        };
      }
    });
  };
  
  // Clear all filters
  const clearFilters = () => {
    playSound('select' as SoundType);
    setActiveFilters({});
  };
  
  const getCategoryName = () => {
    if (!selectedCategory) return "All Content";
    const category = categories.find(cat => cat.id === selectedCategory);
    return category ? category.name : "Category";
  };
  
  const isGenreActive = (genre: string) => {
    return activeFilters.genres?.includes(genre) || false;
  };
  
  const isTypeActive = (type: string) => {
    if (!activeFilters.type) return false;
    const contentType = type as 'movie' | 'series' | 'documentary' | 'live';
    return Array.isArray(activeFilters.type) 
      ? activeFilters.type.includes(contentType) 
      : activeFilters.type === contentType;
  };
  
  const renderContentCards = () => {
    if (loading) {
      return Array(8).fill(null).map((_, i) => (
        <div key={`skeleton-${i}`}>Loading...</div>
      ));
    }
    
    if (content.length === 0) {
      return (
        <NoResults>
          <NoResultsTitle>No content found</NoResultsTitle>
          <NoResultsText>
            Try adjusting your filters or browse a different category
          </NoResultsText>
          <FocusableButton id="clear-filters" onClick={clearFilters}>
            Clear Filters
          </FocusableButton>
        </NoResults>
      );
    }
    
    return content.map((item, index) => (
      <ContentCard
        key={item.id}
        id={`browse-item-${index}`}
        title={item.title}
        imageUrl={item.posterImage}
        year={item.releaseYear.toString()}
        duration={`${item.duration} min`}
        rating={item.ageRating}
        description={item.description}
        badges={item.genres.slice(0, 2)}
        groupId="browse-content"
      />
    ));
  };
  
  return (
    <PageTransition type={TransitionType.FADE} duration={400}>
      <PageContainer>
        <Title>{getCategoryName()}</Title>
        
        {/* Filters */}
        <FiltersContainer>
          {/* Categories Filter */}
          <FilterGroup>
            <FilterLabel>Categories</FilterLabel>
            <FilterButtonsContainer>
              <FilterChip 
                active={selectedCategory === null} 
                onClick={() => handleCategoryChange(null)}
              >
                All
              </FilterChip>
              {categories.map(category => (
                <FilterChip
                  key={category.id}
                  active={selectedCategory === category.id}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </FilterChip>
              ))}
            </FilterButtonsContainer>
          </FilterGroup>
          
          {/* Genres Filter */}
          <FilterGroup>
            <FilterLabel>Genres</FilterLabel>
            <FilterButtonsContainer>
              {availableGenres.map(genre => (
                <FilterChip
                  key={genre}
                  active={isGenreActive(genre)}
                  onClick={() => toggleGenreFilter(genre)}
                >
                  {genre}
                </FilterChip>
              ))}
            </FilterButtonsContainer>
          </FilterGroup>
          
          {/* Content Type Filter */}
          <FilterGroup>
            <FilterLabel>Type</FilterLabel>
            <FilterButtonsContainer>
              {contentTypes.map(type => (
                <FilterChip
                  key={type}
                  active={isTypeActive(type)}
                  onClick={() => toggleTypeFilter(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </FilterChip>
              ))}
            </FilterButtonsContainer>
          </FilterGroup>
          
          {/* Clear Filters */}
          {Object.keys(activeFilters).length > 0 && (
            <FilterGroup>
              <FilterButtonsContainer>
                <FilterChip
                  active={false}
                  onClick={clearFilters}
                >
                  Clear Filters
                </FilterChip>
              </FilterButtonsContainer>
            </FilterGroup>
          )}
        </FiltersContainer>
        
        {/* Content Grid */}
        <ContentGrid>
          {renderContentCards()}
        </ContentGrid>
      </PageContainer>
    </PageTransition>
  );
};

export default BrowsePage; 