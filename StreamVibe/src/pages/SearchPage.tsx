import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import type { ContentItem } from '../types/Content';
import ContentService from '../services/ContentService';
import { PageTransition } from '../components/animations/Transitions';
import { TransitionType } from '../types/animations';
import ContentCard from '../components/content/ContentCard';
import { useSoundEffects } from '../hooks/useSoundEffects';
import type { SoundType } from '../types/sounds';
import FocusableInput from '../components/ui/FocusableInput';

const PageContainer = styled.div`
  padding: 32px;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 36px;
  margin-bottom: 24px;
  color: var(--text-primary-color);
`;

const SearchContainer = styled.div`
  margin-bottom: 32px;
  width: 100%;
  max-width: 800px;
`;

const SearchForm = styled.form`
  width: 100%;
  position: relative;
`;

const SearchInputWrapper = styled.div`
  width: 100%;
  position: relative;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary-color);
  cursor: pointer;
  font-size: 20px;
  z-index: 2;
  
  &:hover {
    color: var(--text-primary-color);
  }
`;

const ResultsContainer = styled.div`
  margin-top: 24px;
`;

const ResultCount = styled.div`
  font-size: 18px;
  margin-bottom: 16px;
  color: var(--text-secondary-color);
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 24px;
`;

const NoResults = styled.div`
  margin-top: 48px;
  text-align: center;
  color: var(--text-secondary-color);
`;

const NoResultsTitle = styled.h3`
  font-size: 24px;
  margin-bottom: 16px;
`;

const NoResultsText = styled.p`
  font-size: 16px;
  margin-bottom: 24px;
`;

const SearchSuggestions = styled.div`
  margin-top: 32px;
`;

const SuggestionsTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 16px;
`;

const SuggestionChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
`;

const SuggestionChip = styled.button`
  padding: 8px 16px;
  background-color: var(--surface-color);
  color: var(--text-primary-color);
  border: none;
  border-radius: 24px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--surface-hover-color);
  }
`;

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { playSound } = useSoundEffects();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);
  
  // Popular search suggestions
  const searchSuggestions = [
    'Action', 'Comedy', 'Documentary', 'Drama', 
    'New Releases', 'Popular', 'Kids', 'Sci-Fi'
  ];
  
  // Perform search when query changes from URL
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);
  
  // Update URL when search is performed
  useEffect(() => {
    if (hasSearched) {
      const params = new URLSearchParams(location.search);
      
      if (searchQuery) {
        params.set('q', searchQuery);
      } else {
        params.delete('q');
      }
      
      navigate({
        pathname: location.pathname,
        search: params.toString()
      }, { replace: true });
    }
  }, [searchQuery, hasSearched, location.pathname, location.search, navigate]);
  
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    try {
      const contentService = ContentService.getInstance();
      const results = await contentService.searchContent(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching content:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    playSound('select' as SoundType);
    performSearch(searchQuery);
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    playSound('back' as SoundType);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setHasSearched(true);
    playSound('select' as SoundType);
    performSearch(suggestion);
  };
  
  return (
    <PageTransition type={TransitionType.FADE} duration={400}>
      <PageContainer>
        <Title>Search</Title>
        
        <SearchContainer>
          <SearchForm onSubmit={handleSearch}>
            <SearchInputWrapper>
              <FocusableInput
                id="search-input"
                type="text"
                placeholder="Search for movies, shows, genres..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                autoFocus
                tabIndex={0}
              />
              {searchQuery && (
                <ClearButton 
                  type="button" 
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  ×
                </ClearButton>
              )}
            </SearchInputWrapper>
          </SearchForm>
        </SearchContainer>
        
        {hasSearched && (
          <ResultsContainer>
            {loading ? (
              <ResultCount>Searching...</ResultCount>
            ) : searchResults.length > 0 ? (
              <>
                <ResultCount>
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                </ResultCount>
                <ResultsGrid>
                  {searchResults.map((item, index) => (
                    <ContentCard
                      key={item.id}
                      id={`search-result-${index}`}
                      title={item.title}
                      imageUrl={item.posterImage}
                      year={item.releaseYear.toString()}
                      duration={`${item.duration} min`}
                      rating={item.ageRating}
                      description={item.description}
                      badges={item.genres.slice(0, 2)}
                      groupId="search-results"
                    />
                  ))}
                </ResultsGrid>
              </>
            ) : (
              <NoResults>
                <NoResultsTitle>No results found</NoResultsTitle>
                <NoResultsText>
                  We couldn't find any content matching "{searchQuery}".
                  <br />
                  Try a different search term or browse our categories.
                </NoResultsText>
              </NoResults>
            )}
          </ResultsContainer>
        )}
        
        {(!hasSearched || searchResults.length === 0) && (
          <SearchSuggestions>
            <SuggestionsTitle>Popular Searches</SuggestionsTitle>
            <SuggestionChips>
              {searchSuggestions.map((suggestion) => (
                <SuggestionChip 
                  key={suggestion} 
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </SuggestionChip>
              ))}
            </SuggestionChips>
          </SearchSuggestions>
        )}
      </PageContainer>
    </PageTransition>
  );
};

export default SearchPage; 