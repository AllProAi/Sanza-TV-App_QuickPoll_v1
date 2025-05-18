import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MoodRecommender, { MOOD_CATEGORIES } from '../../services/ai/MoodRecommender';
import type { MoodCategory } from '../../services/ai/MoodRecommender';

// Let's check the FocusableItem component to see what props it accepts
// For now, let's create a simple focusable div as a placeholder
const FocusableButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
}> = ({ children, onClick }) => {
  return (
    <div 
      tabIndex={0} 
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
};

interface MoodSelectorProps {
  onMoodSelect: (moodId: string) => void;
  initialMood?: string;
  className?: string;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ 
  onMoodSelect, 
  initialMood,
  className 
}) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(initialMood || null);
  const [moods] = useState<MoodCategory[]>(MOOD_CATEGORIES);
  const [recentMoods, setRecentMoods] = useState<string[]>([]);
  
  // Get mood history on mount
  useEffect(() => {
    const moodRecommender = MoodRecommender.getInstance();
    const history = moodRecommender.getMoodHistory();
    
    // Extract unique moods from history (in order)
    const uniqueMoods: string[] = [];
    history.forEach(item => {
      if (!uniqueMoods.includes(item.mood)) {
        uniqueMoods.push(item.mood);
      }
    });
    
    setRecentMoods(uniqueMoods.slice(0, 3));
  }, []);
  
  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    onMoodSelect(moodId);
  };
  
  return (
    <MoodSelectorContainer className={className}>
      <SectionTitle>How are you feeling today?</SectionTitle>
      
      {recentMoods.length > 0 && (
        <RecentMoodsSection>
          <SubTitle>Recently Selected</SubTitle>
          <MoodGrid cols={3}>
            {recentMoods.map(moodId => {
              const mood = moods.find(m => m.id === moodId);
              if (!mood) return null;
              
              return (
                <FocusableButton
                  key={mood.id}
                  onClick={() => handleMoodSelect(mood.id)}
                >
                  <MoodItem
                    selected={selectedMood === mood.id}
                    color={mood.color}
                    onClick={() => handleMoodSelect(mood.id)}
                  >
                    {mood.name}
                  </MoodItem>
                </FocusableButton>
              );
            })}
          </MoodGrid>
        </RecentMoodsSection>
      )}
      
      <AllMoodsSection>
        <SubTitle>All Moods</SubTitle>
        <MoodGrid cols={4}>
          {moods.map(mood => (
            <FocusableButton
              key={mood.id}
              onClick={() => handleMoodSelect(mood.id)}
            >
              <MoodItem
                selected={selectedMood === mood.id}
                color={mood.color}
                onClick={() => handleMoodSelect(mood.id)}
                title={mood.description}
              >
                {mood.name}
              </MoodItem>
            </FocusableButton>
          ))}
        </MoodGrid>
      </AllMoodsSection>
    </MoodSelectorContainer>
  );
};

const MoodSelectorContainer = styled.div`
  padding: 20px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.7);
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  margin-bottom: 24px;
  text-align: center;
  color: #ffffff;
`;

const SubTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 16px;
  color: #cccccc;
`;

const RecentMoodsSection = styled.div`
  margin-bottom: 32px;
`;

const AllMoodsSection = styled.div`
  margin-bottom: 16px;
`;

interface MoodGridProps {
  cols: number;
}

const MoodGrid = styled.div<MoodGridProps>`
  display: grid;
  grid-template-columns: repeat(${props => props.cols}, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

interface MoodItemProps {
  selected: boolean;
  color?: string;
}

const MoodItem = styled.button<MoodItemProps>`
  background-color: ${props => props.color ? `${props.color}20` : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${props => props.selected ? (props.color || 'white') : 'transparent'};
  border-radius: 8px;
  color: ${props => props.color || 'white'};
  cursor: pointer;
  font-size: 18px;
  font-weight: ${props => props.selected ? 'bold' : 'normal'};
  padding: 16px;
  text-align: center;
  transition: all 0.2s ease;
  width: 100%;
  
  &:hover, &:focus {
    background-color: ${props => props.color ? `${props.color}40` : 'rgba(255, 255, 255, 0.2)'};
    transform: scale(1.05);
  }
  
  &:focus-visible {
    outline: 2px solid white;
  }
`;

export default MoodSelector; 