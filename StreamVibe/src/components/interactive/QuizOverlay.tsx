import React, { useState } from 'react';
import styled from 'styled-components';
import { Transition } from '../animations/Transitions';
import { TransitionType } from '../../types/animations';
import FocusableItem from '../ui/FocusableItem';
import type { QuizData } from '../../services/InteractiveService';

interface QuizOverlayProps {
  quiz: QuizData;
  visible: boolean;
  onClose: () => void;
  onAnswer: (quizId: string, optionId: string) => void;
  userAnswer?: string;
  groupId?: string;
}

const QuizOverlayContainer = styled.div`
  position: absolute;
  bottom: 100px;
  right: 40px;
  width: 400px;
  background: rgba(20, 20, 30, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 100;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const QuizTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16px;
`;

const QuizOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
`;

const QuizOption = styled.div<{ 
  selected?: boolean; 
  isCorrect?: boolean;
  isIncorrect?: boolean;
  revealed?: boolean;
}>`
  position: relative;
  padding: 12px;
  background: ${props => {
    if (props.revealed) {
      if (props.isCorrect) return 'rgba(75, 210, 143, 0.3)';
      if (props.isIncorrect) return 'rgba(255, 87, 87, 0.3)';
    }
    return props.selected ? 'rgba(187, 134, 252, 0.3)' : 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => {
      if (props.revealed) {
        if (props.isCorrect) return 'rgba(75, 210, 143, 0.3)';
        if (props.isIncorrect) return 'rgba(255, 87, 87, 0.3)';
      }
      return props.selected ? 'rgba(187, 134, 252, 0.3)' : 'rgba(255, 255, 255, 0.15)';
    }};
  }
`;

const OptionText = styled.div`
  font-size: 16px;
  color: #fff;
`;

const ExplanationText = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  padding: 12px;
  background: rgba(75, 210, 143, 0.1);
  border-radius: 8px;
  margin-bottom: 16px;
  border-left: 3px solid rgba(75, 210, 143, 0.7);
`;

const ScoreText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  text-align: center;
  margin-bottom: 12px;
`;

const QuizFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const StatusText = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const QuizOverlay: React.FC<QuizOverlayProps> = ({
  quiz,
  visible,
  onClose,
  onAnswer,
  userAnswer,
  groupId = 'quiz-overlay'
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(userAnswer || null);
  const [showResults, setShowResults] = useState<boolean>(!!userAnswer);
  const [focusedOptionId, setFocusedOptionId] = useState<string | null>(null);
  
  // Generate option IDs for focus management
  const getOptionId = (index: number) => `${groupId}-option-${index}`;
  const closeButtonId = `${groupId}-close`;
  
  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    if (!userAnswer) {
      setSelectedOption(optionId);
      // Auto-submit answer
      onAnswer(quiz.id, optionId);
      setShowResults(true);
    }
  };
  
  return (
    <Transition
      show={visible}
      type={TransitionType.SLIDE_LEFT}
      duration={300}
    >
      <QuizOverlayContainer>
        <QuizTitle>{quiz.question}</QuizTitle>
        
        <QuizOptions>
          {quiz.options.map((option, index) => (
            <FocusableItem
              key={option.id}
              id={getOptionId(index)}
              groupId={groupId}
              neighbors={{
                up: index > 0 ? getOptionId(index - 1) : undefined,
                down: index < quiz.options.length - 1 ? getOptionId(index + 1) : closeButtonId,
              }}
              onFocus={() => setFocusedOptionId(option.id)}
              onBlur={() => setFocusedOptionId(null)}
              onClick={() => handleOptionSelect(option.id)}
            >
              <QuizOption 
                selected={selectedOption === option.id || focusedOptionId === option.id}
                isCorrect={showResults && option.id === quiz.correctOptionId}
                isIncorrect={showResults && selectedOption === option.id && option.id !== quiz.correctOptionId}
                revealed={showResults}
              >
                <OptionText>{option.text}</OptionText>
              </QuizOption>
            </FocusableItem>
          ))}
        </QuizOptions>
        
        {showResults && quiz.explanation && (
          <ExplanationText>{quiz.explanation}</ExplanationText>
        )}
        
        {showResults && (
          <ScoreText>
            {selectedOption === quiz.correctOptionId 
              ? `Correct! (+${quiz.points} points)` 
              : 'Incorrect. Try again next time!'}
          </ScoreText>
        )}
        
        <QuizFooter>
          <StatusText>
            {userAnswer 
              ? 'Quiz completed!'
              : 'Select your answer'}
          </StatusText>
          
          <FocusableItem
            id={closeButtonId}
            groupId={groupId}
            neighbors={{
              up: getOptionId(quiz.options.length - 1),
            }}
            onClick={onClose}
          >
            <CloseButton>Close</CloseButton>
          </FocusableItem>
        </QuizFooter>
      </QuizOverlayContainer>
    </Transition>
  );
};

export default QuizOverlay; 