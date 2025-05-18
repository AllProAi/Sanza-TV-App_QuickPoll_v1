import { useState, useEffect, useCallback } from 'react';
import InteractiveService from '../services/InteractiveService';
import type { 
  PollData, 
  QuizData, 
  InfoCardData, 
  ReactionData, 
  InteractiveEventData,
  ReactionAddedData 
} from '../services/InteractiveService';

/**
 * Hook for managing interactive video elements
 */
export const useInteractiveVideo = (contentId: string) => {
  const interactiveService = InteractiveService.getInstance();
  
  // States for active interactive elements
  const [activePoll, setActivePoll] = useState<PollData | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [activeInfoCard, setActiveInfoCard] = useState<InfoCardData | null>(null);
  const [showReactions, setShowReactions] = useState<boolean>(false);
  const [reactions, setReactions] = useState<ReactionData[]>([]);
  const [quizScore, setQuizScore] = useState<number>(0);
  
  // User interactions
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<string, string>>({});
  
  // Initialize interactive service
  useEffect(() => {
    // Initialize interactive service
    interactiveService.initialize(contentId);
    
    // Register event listeners
    interactiveService.on('poll-show', (data: InteractiveEventData) => {
      if (data && 'question' in data && 'options' in data) {
        setActivePoll(data as PollData);
      }
    });
    
    interactiveService.on('poll-hide', () => {
      setActivePoll(null);
    });
    
    interactiveService.on('quiz-show', (data: InteractiveEventData) => {
      if (data && 'question' in data && 'correctOptionId' in data) {
        setActiveQuiz(data as QuizData);
      }
    });
    
    interactiveService.on('quiz-hide', () => {
      setActiveQuiz(null);
    });
    
    interactiveService.on('info-card-show', (data: InteractiveEventData) => {
      if (data && 'title' in data && 'description' in data) {
        setActiveInfoCard(data as InfoCardData);
      }
    });
    
    interactiveService.on('info-card-hide', () => {
      setActiveInfoCard(null);
    });
    
    interactiveService.on('reaction-show', () => {
      setShowReactions(true);
    });
    
    interactiveService.on('reaction-hide', () => {
      setShowReactions(false);
    });
    
    // Listen for reaction updates
    interactiveService.on('reaction-added', (data: InteractiveEventData) => {
      if (data && 'reaction' in data) {
        const reactionData = data as ReactionAddedData;
        setReactions(prevReactions => {
          const updatedReactions = [...prevReactions];
          const index = updatedReactions.findIndex(r => r.id === reactionData.reaction.id);
          if (index !== -1) {
            updatedReactions[index] = reactionData.reaction;
          }
          return updatedReactions;
        });
      }
    });
    
    // Clean up interactive service when unmounting
    return () => {
      interactiveService.cleanup();
    };
  }, [contentId, interactiveService]);
  
  // Update quiz score from interactive service
  useEffect(() => {
    const updateQuizScore = () => {
      setQuizScore(interactiveService.getQuizScore());
    };
    
    // Update initial score
    updateQuizScore();
    
    // Update score when a quiz is answered
    interactiveService.on('quiz-answered', updateQuizScore);
    
    return () => {
      interactiveService.off('quiz-answered', updateQuizScore);
    };
  }, [interactiveService]);
  
  // Handle poll vote
  const handlePollVote = useCallback((pollId: string, optionId: string) => {
    interactiveService.submitPollVote(pollId, optionId);
    setUserVotes(prev => ({
      ...prev,
      [pollId]: optionId
    }));
  }, [interactiveService]);
  
  // Handle quiz answer
  const handleQuizAnswer = useCallback((quizId: string, optionId: string) => {
    interactiveService.submitQuizAnswer(quizId, optionId);
    setUserQuizAnswers(prev => ({
      ...prev,
      [quizId]: optionId
    }));
  }, [interactiveService]);
  
  // Handle reaction selection
  const handleReactionSelect = useCallback((reactionId: string) => {
    interactiveService.addReaction(contentId, reactionId);
    // Auto-hide reactions after selecting one
    setTimeout(() => {
      interactiveService.hideReactions();
    }, 2000);
  }, [contentId, interactiveService]);
  
  // Show reactions menu
  const showReactionsMenu = useCallback(() => {
    interactiveService.showReactions();
  }, [interactiveService]);
  
  // Hide interactive elements
  const hideActivePoll = useCallback(() => {
    if (activePoll) {
      interactiveService.off('poll-hide', () => setActivePoll(null));
      setActivePoll(null);
    }
  }, [activePoll, interactiveService]);
  
  const hideActiveQuiz = useCallback(() => {
    if (activeQuiz) {
      interactiveService.off('quiz-hide', () => setActiveQuiz(null));
      setActiveQuiz(null);
    }
  }, [activeQuiz, interactiveService]);
  
  const hideActiveInfoCard = useCallback(() => {
    if (activeInfoCard) {
      interactiveService.off('info-card-hide', () => setActiveInfoCard(null));
      setActiveInfoCard(null);
    }
  }, [activeInfoCard, interactiveService]);
  
  const hideReactionsMenu = useCallback(() => {
    interactiveService.hideReactions();
  }, [interactiveService]);
  
  // Expand/collapse info card
  const toggleInfoCardExpanded = useCallback((cardId: string, expanded: boolean) => {
    interactiveService.toggleInfoCardExpanded(cardId, expanded);
  }, [interactiveService]);
  
  return {
    // Interactive elements
    activePoll,
    activeQuiz,
    activeInfoCard,
    showReactions,
    reactions,
    quizScore,
    
    // User interactions
    userVotes,
    userQuizAnswers,
    
    // Actions
    handlePollVote,
    handleQuizAnswer,
    handleReactionSelect,
    showReactionsMenu,
    hideActivePoll,
    hideActiveQuiz,
    hideActiveInfoCard,
    hideReactionsMenu,
    toggleInfoCardExpanded,
  };
}; 