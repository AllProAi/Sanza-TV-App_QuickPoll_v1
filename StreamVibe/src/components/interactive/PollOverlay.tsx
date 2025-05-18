import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Transition } from '../animations/Transitions';
import { TransitionType } from '../../types/animations';
import FocusableItem from '../ui/FocusableItem';
import type { PollData } from '../../services/InteractiveService';

interface PollOverlayProps {
  poll: PollData;
  visible: boolean;
  onClose: () => void;
  onVote: (pollId: string, optionId: string) => void;
  userVote?: string;
  groupId?: string;
}

const PollOverlayContainer = styled.div`
  position: absolute;
  bottom: 100px;
  right: 40px;
  width: 360px;
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

const PollTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16px;
`;

const PollOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
`;

const PollOption = styled.div<{ selected?: boolean; hasVotes?: number }>`
  position: relative;
  padding: 12px;
  background: ${props => props.selected ? 'rgba(187, 134, 252, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.selected ? 'rgba(187, 134, 252, 0.3)' : 'rgba(255, 255, 255, 0.15)'};
  }
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.hasVotes ? `${props.hasVotes}%` : '0%'};
    background: rgba(187, 134, 252, 0.2);
    border-radius: 8px;
    z-index: -1;
    transition: width 1s ease-out;
  }
`;

const OptionText = styled.div`
  font-size: 16px;
  color: #fff;
`;

const ResultsText = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
`;

const PollFooter = styled.div`
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

const PollOverlay: React.FC<PollOverlayProps> = ({
  poll,
  visible,
  onClose,
  onVote,
  userVote,
  groupId = 'poll-overlay'
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(userVote || null);
  const [showResults, setShowResults] = useState<boolean>(!!userVote);
  const [focusedOptionId, setFocusedOptionId] = useState<string | null>(null);
  
  // Reset selected option when poll changes
  useEffect(() => {
    setSelectedOption(userVote || null);
    setShowResults(!!userVote);
  }, [poll.id, userVote]);
  
  // Calculate percentages for results
  const calculatePercentage = (optionId: string): number => {
    if (!poll.results || !showResults) return 0;
    
    // Calculate total votes
    const totalVotes = Object.values(poll.results).reduce((sum, count) => sum + count, 0);
    if (totalVotes === 0) return 0;
    
    // Calculate percentage for this option
    const optionVotes = poll.results[optionId] || 0;
    return Math.round((optionVotes / totalVotes) * 100);
  };
  
  // Generate option IDs for focus management
  const getOptionId = (index: number) => `${groupId}-option-${index}`;
  const closeButtonId = `${groupId}-close`;
  
  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    if (!userVote) {
      setSelectedOption(optionId);
      // Auto-submit vote
      onVote(poll.id, optionId);
      setShowResults(true);
    }
  };
  
  return (
    <Transition
      show={visible}
      type={TransitionType.SLIDE_LEFT}
      duration={300}
    >
      <PollOverlayContainer>
        <PollTitle>{poll.question}</PollTitle>
        
        <PollOptions>
          {poll.options.map((option, index) => (
            <FocusableItem
              key={option.id}
              id={getOptionId(index)}
              groupId={groupId}
              neighbors={{
                up: index > 0 ? getOptionId(index - 1) : undefined,
                down: index < poll.options.length - 1 ? getOptionId(index + 1) : closeButtonId,
              }}
              onFocus={() => setFocusedOptionId(option.id)}
              onBlur={() => setFocusedOptionId(null)}
              onClick={() => handleOptionSelect(option.id)}
            >
              <PollOption 
                selected={selectedOption === option.id || focusedOptionId === option.id}
                hasVotes={calculatePercentage(option.id)}
              >
                <OptionText>{option.text}</OptionText>
                {showResults && (
                  <ResultsText>{calculatePercentage(option.id)}%</ResultsText>
                )}
              </PollOption>
            </FocusableItem>
          ))}
        </PollOptions>
        
        <PollFooter>
          <StatusText>
            {userVote 
              ? 'Thanks for voting!'
              : 'Select an option to vote'}
          </StatusText>
          
          <FocusableItem
            id={closeButtonId}
            groupId={groupId}
            neighbors={{
              up: getOptionId(poll.options.length - 1),
            }}
            onClick={onClose}
          >
            <CloseButton>Close</CloseButton>
          </FocusableItem>
        </PollFooter>
      </PollOverlayContainer>
    </Transition>
  );
};

export default PollOverlay; 