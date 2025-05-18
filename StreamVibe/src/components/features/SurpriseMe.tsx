import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RecommendationService from '../../services/RecommendationService';
import ContentService from '../../services/ContentService';
import PreferencesService from '../../services/PreferencesService';
import type { RecommendationResponse, SurpriseRecommendationOptions } from '../../types/Recommendation';
import type { ContentItem } from '../../types/Content';
import RecommendationCarousel from '../recommendations/RecommendationCarousel';
import styles from './SurpriseMe.module.css';

interface MoodOption {
  name: string;
  icon: string;
  description: string;
}

const moodOptions: MoodOption[] = [
  { name: 'cheerful', icon: '😊', description: 'Light and uplifting content' },
  { name: 'relaxed', icon: '😌', description: 'Calm and soothing viewing' },
  { name: 'excited', icon: '🤩', description: 'Thrilling and adventurous' },
  { name: 'thoughtful', icon: '🤔', description: 'Thought-provoking and deep' },
  { name: 'nostalgic', icon: '🌟', description: 'Classic favorites' }
];

const SurpriseMe: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [featuredContent, setFeaturedContent] = useState<ContentItem | null>(null);
  const [noveltyLevel, setNoveltyLevel] = useState(5);
  const navigate = useNavigate();
  
  const recommendationService = RecommendationService.getInstance();
  const contentService = ContentService.getInstance();
  const preferencesService = PreferencesService.getInstance();
  
  const generateSurpriseRecommendations = useCallback(async () => {
    setLoading(true);
    
    try {
      const options: SurpriseRecommendationOptions = {
        moodBased: !!selectedMood,
        mood: selectedMood || undefined,
        genreBlending: true,
        excludeWatchHistory: true,
        noveltyLevel: noveltyLevel
      };
      
      const response = await recommendationService.getSurpriseRecommendations(options);
      setRecommendations(response);
    } catch (error) {
      console.error('Error getting surprise recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMood, noveltyLevel, recommendationService]);
  
  // Load surprise recommendations
  useEffect(() => {
    if (selectedMood) {
      generateSurpriseRecommendations();
    }
  }, [selectedMood, generateSurpriseRecommendations]);
  
  // Select a random featured content from recommendations when they change
  useEffect(() => {
    if (recommendations && recommendations.recommendations.length > 0) {
      const randomIndex = Math.floor(Math.random() * recommendations.recommendations.length);
      const randomRecommendation = recommendations.recommendations[randomIndex];
      
      const loadFeaturedContent = async () => {
        try {
          const content = await contentService.getContentById(randomRecommendation.contentId);
          if (content) {
            setFeaturedContent(content);
          }
        } catch (error) {
          console.error('Error loading featured content:', error);
        }
      };
      
      loadFeaturedContent();
    }
  }, [recommendations, contentService]);
  
  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
  };
  
  const handleNoveltyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoveltyLevel(parseInt(e.target.value));
  };
  
  const handleReset = () => {
    setSelectedMood(null);
    setRecommendations(null);
    setFeaturedContent(null);
  };
  
  const handlePlayNow = () => {
    if (featuredContent) {
      navigate(`/content/${featuredContent.id}/play`);
    }
  };
  
  const handleFeedback = (liked: boolean) => {
    if (featuredContent) {
      preferencesService.recordRecommendationFeedback(
        featuredContent.id,
        liked,
        'surprise'
      );
      
      // Generate new recommendations
      generateSurpriseRecommendations();
    }
  };
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Surprise Me</h1>
      
      {!selectedMood ? (
        <div className={styles.moodSelector}>
          <h2 className={styles.subtitle}>What kind of mood are you in?</h2>
          <div className={styles.moodOptions}>
            {moodOptions.map(mood => (
              <button
                key={mood.name}
                className={styles.moodOption}
                onClick={() => handleMoodSelect(mood.name)}
              >
                <span className={styles.moodIcon}>{mood.icon}</span>
                <span className={styles.moodName}>{mood.name}</span>
                <span className={styles.moodDescription}>{mood.description}</span>
              </button>
            ))}
          </div>
          <button 
            className={styles.moodOption}
            onClick={() => handleMoodSelect('random')}
          >
            <span className={styles.moodIcon}>🎲</span>
            <span className={styles.moodName}>Surprise Me</span>
            <span className={styles.moodDescription}>Completely random selection</span>
          </button>
          
          <div className={styles.noveltyContainer}>
            <h3>Surprise Level</h3>
            <div className={styles.sliderContainer}>
              <span>Familiar</span>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={noveltyLevel} 
                onChange={handleNoveltyChange} 
                className={styles.slider}
                aria-label="Adjust surprise level"
              />
              <span>Unexpected</span>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.recommendationsContainer}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <span>Finding something surprising for you...</span>
            </div>
          ) : (
            <>
              {featuredContent && (
                <div className={styles.featuredContent}>
                  <div 
                    className={styles.backdrop} 
                    style={{ backgroundImage: `url(${featuredContent.backdropImage})` }}
                  >
                    <div className={styles.featuredInfo}>
                      <h2 className={styles.featuredTitle}>{featuredContent.title}</h2>
                      <div className={styles.featuredMeta}>
                        <span>{featuredContent.releaseYear}</span>
                        <span className={styles.divider}>|</span>
                        <span>{featuredContent.ageRating}</span>
                        <span className={styles.divider}>|</span>
                        <span>{featuredContent.duration} min</span>
                      </div>
                      <p className={styles.featuredDescription}>{featuredContent.description}</p>
                      <div className={styles.tags}>
                        {featuredContent.genres.map(genre => (
                          <span key={genre} className={styles.tag}>{genre}</span>
                        ))}
                      </div>
                      <div className={styles.actions}>
                        <button 
                          className={styles.playButton}
                          onClick={handlePlayNow}
                        >
                          Play Now
                        </button>
                        <div className={styles.feedbackButtons}>
                          <button 
                            className={styles.feedbackButton} 
                            onClick={() => handleFeedback(true)}
                            aria-label="I like this"
                          >
                            👍
                          </button>
                          <button 
                            className={styles.feedbackButton} 
                            onClick={() => handleFeedback(false)}
                            aria-label="Not for me"
                          >
                            👎
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {recommendations && recommendations.recommendations.length > 0 && (
                <RecommendationCarousel
                  recommendations={recommendations.recommendations}
                  title="More Surprising Picks"
                  showReasons={true}
                />
              )}
              
              <button 
                className={styles.resetButton}
                onClick={handleReset}
              >
                Try a Different Mood
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SurpriseMe; 