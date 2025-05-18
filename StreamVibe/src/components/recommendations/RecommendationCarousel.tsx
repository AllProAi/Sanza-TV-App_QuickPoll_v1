import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ContentRecommendation } from '../../types/Recommendation';
import ContentService from '../../services/ContentService';
import type { ContentItem } from '../../types/Content';
import styles from './RecommendationCarousel.module.css';

interface RecommendationCarouselProps {
  recommendations: ContentRecommendation[];
  title: string;
  showReasons?: boolean;
  onSelect?: (contentId: string) => void;
}

const RecommendationCarousel: React.FC<RecommendationCarouselProps> = ({
  recommendations,
  title,
  showReasons = false,
  onSelect
}) => {
  const [contentItems, setContentItems] = useState<(ContentItem | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchContentItems = async () => {
      setLoading(true);
      
      try {
        // Load content items for each recommendation
        const items = await Promise.all(
          recommendations.map(async (rec) => {
            try {
              return await ContentService.getInstance().getContentById(rec.contentId);
            } catch (error) {
              console.error(`Error fetching content ${rec.contentId}:`, error);
              return null;
            }
          })
        );
        
        setContentItems(items);
      } catch (error) {
        console.error('Error loading recommendation content:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (recommendations.length > 0) {
      fetchContentItems();
    } else {
      setContentItems([]);
      setLoading(false);
    }
  }, [recommendations]);
  
  const handleContentSelect = (contentId: string) => {
    if (onSelect) {
      onSelect(contentId);
    } else {
      navigate(`/content/${contentId}`);
    }
  };
  
  if (loading) {
    return (
      <div className={styles.carouselContainer}>
        <h2 className={styles.carouselTitle}>{title}</h2>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <span>Loading recommendations...</span>
        </div>
      </div>
    );
  }
  
  if (contentItems.length === 0) {
    return null;
  }
  
  return (
    <div className={styles.carouselContainer}>
      <h2 className={styles.carouselTitle}>{title}</h2>
      <div className={styles.carousel}>
        {contentItems.map((item, index) => {
          if (!item) return null;
          
          const recommendation = recommendations[index];
          
          return (
            <div 
              key={item.id} 
              className={styles.carouselItem}
              onClick={() => handleContentSelect(item.id)}
              tabIndex={0}
              role="button"
              aria-label={`View ${item.title}`}
            >
              <div className={styles.posterContainer}>
                <img 
                  src={item.posterImage} 
                  alt={item.title} 
                  className={styles.poster}
                  loading="lazy"
                />
                <div className={styles.confidenceScore}>
                  <span>{recommendation.score}%</span>
                </div>
              </div>
              <h3 className={styles.itemTitle}>{item.title}</h3>
              {showReasons && recommendation.reasoning && (
                <div className={styles.reasoning}>
                  {recommendation.reasoning}
                </div>
              )}
              {recommendation.category && (
                <div className={styles.category}>
                  {recommendation.category}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationCarousel; 