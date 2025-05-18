import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { Transition } from '../animations/Transitions';
import { TransitionType } from '../../types/animations';
import FocusableItem from '../ui/FocusableItem';
import type { InfoCardData } from '../../services/InteractiveService';

interface InfoCardProps {
  card: InfoCardData;
  visible: boolean;
  onClose: () => void;
  onLinkClick?: (url: string) => void;
  groupId?: string;
}

type PositionProps = {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

const InfoCardContainer = styled.div<PositionProps>`
  position: absolute;
  ${props => {
    switch (props.position) {
      case 'top-left':
        return css`
          top: 80px;
          left: 40px;
        `;
      case 'top-right':
        return css`
          top: 80px;
          right: 40px;
        `;
      case 'bottom-left':
        return css`
          bottom: 100px;
          left: 40px;
        `;
      case 'bottom-right':
      default:
        return css`
          bottom: 100px;
          right: 40px;
        `;
    }
  }}
  width: 300px;
  background: rgba(20, 20, 30, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 100;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const InfoCardContent = styled.div<{ expanded: boolean }>`
  padding: ${props => props.expanded ? '20px' : '16px'};
  display: flex;
  flex-direction: column;
`;

const InfoCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const InfoCardTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  margin: 0;
  
  &:hover {
    color: #fff;
  }
`;

const InfoCardImage = styled.img`
  width: 100%;
  max-height: 160px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const InfoCardDescription = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16px;
  line-height: 1.4;
`;

const InfoCardLink = styled.a`
  display: inline-block;
  background: rgba(187, 134, 252, 0.2);
  color: #BB86FC;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  margin-top: auto;
  text-align: center;
  transition: background 0.2s ease;
  
  &:hover, &:focus {
    background: rgba(187, 134, 252, 0.3);
  }
`;

const ExpandCollapseButton = styled.button<{ isExpanded: boolean }>`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  padding: 8px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  
  &:hover {
    color: #fff;
  }
  
  &::after {
    content: "";
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid currentColor;
    margin-left: 5px;
    transform: ${props => props.isExpanded ? 'rotate(180deg)' : 'rotate(0)'};
    transition: transform 0.2s ease;
  }
`;

const InfoCardCollapsed = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
`;

const InfoCardPreview = styled.div`
  display: flex;
  align-items: center;
`;

const InfoCardIcon = styled.div`
  width: 32px;
  height: 32px;
  background: rgba(187, 134, 252, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #BB86FC;
  font-size: 18px;
`;

const InfoCardPreviewText = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoCardPreviewTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
`;

const InfoCardPreviewHint = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
`;

const InfoCard: React.FC<InfoCardProps> = ({
  card,
  visible,
  onClose,
  onLinkClick,
  groupId = 'info-card'
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  
  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (card.linkUrl && onLinkClick) {
      onLinkClick(card.linkUrl);
    }
  };
  
  const expandButtonId = `${groupId}-expand`;
  const closeButtonId = `${groupId}-close`;
  const linkButtonId = `${groupId}-link`;
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  return (
    <Transition
      show={visible}
      type={TransitionType.FADE}
      duration={300}
    >
      <InfoCardContainer position={card.position}>
        {!expanded ? (
          <InfoCardCollapsed>
            <InfoCardPreview>
              <InfoCardIcon>
                i
              </InfoCardIcon>
              <InfoCardPreviewText>
                <InfoCardPreviewTitle>{card.title}</InfoCardPreviewTitle>
                <InfoCardPreviewHint>Select to view details</InfoCardPreviewHint>
              </InfoCardPreviewText>
            </InfoCardPreview>
            
            <FocusableItem
              id={expandButtonId}
              groupId={groupId}
              onClick={toggleExpanded}
            >
              <ExpandCollapseButton 
                isExpanded={false}
                aria-expanded="false"
              >
                Details
              </ExpandCollapseButton>
            </FocusableItem>
          </InfoCardCollapsed>
        ) : (
          <InfoCardContent expanded={expanded}>
            <InfoCardHeader>
              <InfoCardTitle>{card.title}</InfoCardTitle>
              <FocusableItem
                id={closeButtonId}
                groupId={groupId}
                neighbors={{
                  down: card.linkUrl ? linkButtonId : expandButtonId,
                }}
                onClick={onClose}
              >
                <CloseButton>×</CloseButton>
              </FocusableItem>
            </InfoCardHeader>
            
            {card.imageUrl && <InfoCardImage src={card.imageUrl} alt={card.title} />}
            
            <InfoCardDescription>{card.description}</InfoCardDescription>
            
            {card.linkUrl && (
              <FocusableItem
                id={linkButtonId}
                groupId={groupId}
                neighbors={{
                  up: closeButtonId,
                  down: expandButtonId,
                }}
                onClick={handleLinkClick}
              >
                <InfoCardLink href={card.linkUrl}>
                  {card.linkText || 'Learn More'}
                </InfoCardLink>
              </FocusableItem>
            )}
            
            <FocusableItem
              id={expandButtonId}
              groupId={groupId}
              neighbors={{
                up: card.linkUrl ? linkButtonId : closeButtonId,
              }}
              onClick={toggleExpanded}
            >
              <ExpandCollapseButton 
                isExpanded={true}
                aria-expanded="true"
              >
                Collapse
              </ExpandCollapseButton>
            </FocusableItem>
          </InfoCardContent>
        )}
      </InfoCardContainer>
    </Transition>
  );
};

export default InfoCard; 