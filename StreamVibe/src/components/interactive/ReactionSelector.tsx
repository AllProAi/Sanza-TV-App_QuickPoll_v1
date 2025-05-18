import React, { useState } from 'react';
import styled from 'styled-components';
import { Transition } from '../animations/Transitions';
import { TransitionType } from '../../types/animations';
import FocusableItem from '../ui/FocusableItem';
import type { ReactionData } from '../../services/InteractiveService';

interface ReactionSelectorProps {
  reactions: ReactionData[];
  visible: boolean;
  onClose: () => void;
  onReactionSelect: (reactionId: string) => void;
  groupId?: string;
}

const ReactionSelectorContainer = styled.div`
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(20, 20, 30, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 100;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ReactionTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
  text-align: center;
`;

const ReactionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const ReactionItem = styled.div<{ focused?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: ${props => props.focused ? 'rgba(187, 134, 252, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(187, 134, 252, 0.2);
  }
`;

const EmojiWrapper = styled.div`
  font-size: 24px;
  margin-bottom: 4px;
`;

const EmojiLabel = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
`;

const ReactionCount = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 4px;
  align-self: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ReactionSelector: React.FC<ReactionSelectorProps> = ({
  reactions,
  visible,
  onClose,
  onReactionSelect,
  groupId = 'reaction-selector'
}) => {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  
  // Generate reaction IDs for focus management
  const getReactionItemId = (index: number) => `${groupId}-reaction-${index}`;
  const closeButtonId = `${groupId}-close`;
  
  // Handle reaction selection
  const handleReactionSelect = (reactionId: string) => {
    onReactionSelect(reactionId);
  };
  
  return (
    <Transition
      show={visible}
      type={TransitionType.SLIDE_UP}
      duration={300}
    >
      <ReactionSelectorContainer>
        <ReactionTitle>Add your reaction</ReactionTitle>
        
        <ReactionGrid>
          {reactions.map((reaction, index) => (
            <FocusableItem
              key={reaction.id}
              id={getReactionItemId(index)}
              groupId={groupId}
              neighbors={{
                up: index < 4 ? undefined : getReactionItemId(index - 4),
                right: (index + 1) % 4 === 0 ? undefined : getReactionItemId(index + 1),
                down: index >= reactions.length - 4 ? closeButtonId : getReactionItemId(index + 4),
                left: index % 4 === 0 ? undefined : getReactionItemId(index - 1),
              }}
              onFocus={() => setFocusedId(reaction.id)}
              onBlur={() => setFocusedId(null)}
              onClick={() => handleReactionSelect(reaction.id)}
            >
              <ReactionItem focused={focusedId === reaction.id}>
                <EmojiWrapper>{reaction.emoji}</EmojiWrapper>
                <EmojiLabel>{reaction.label}</EmojiLabel>
                <ReactionCount>{reaction.count}</ReactionCount>
              </ReactionItem>
            </FocusableItem>
          ))}
        </ReactionGrid>
        
        <FocusableItem
          id={closeButtonId}
          groupId={groupId}
          neighbors={{
            up: getReactionItemId(reactions.length - Math.min(reactions.length, 4)),
          }}
          onClick={onClose}
        >
          <CloseButton>Close</CloseButton>
        </FocusableItem>
      </ReactionSelectorContainer>
    </Transition>
  );
};

export default ReactionSelector; 