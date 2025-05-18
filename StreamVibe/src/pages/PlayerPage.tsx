import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ContentService from '../services/ContentService';
import PlayerControls from '../components/player/PlayerControls';
import { usePlayback } from '../hooks/usePlayback';
import { useInteractiveVideo } from '../hooks/useInteractiveVideo';
import { Transition } from '../components/animations/Transitions';
import { TransitionType } from '../types/animations';
import useSoundEffects from '../hooks/useSoundEffects';
import { PollOverlay, QuizOverlay, InfoCard, ReactionSelector } from '../components/interactive';
import { AVAILABLE_REACTIONS } from '../services/InteractiveService';
import type { ContentItem, Episode, SeriesContent } from '../types/Content';
import type { StreamSource } from '../types/Player';
import type { ReactionData } from '../services/InteractiveService';
import { SoundType } from '../types/sounds';

const PlayerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  z-index: 100;
`;

const VideoWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ErrorMessage = styled.div`
  color: #fff;
  text-align: center;
  padding: 20px;
  
  h3 {
    margin-bottom: 16px;
    color: #f44336;
  }
  
  p {
    margin-bottom: 16px;
  }
  
  button {
    padding: 8px 16px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background-color: var(--primary-dark-color);
    }
  }
`;

const LoadingMessage = styled.div`
  color: #fff;
  text-align: center;
  padding: 20px;
  
  h3 {
    margin-bottom: 16px;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    margin: 16px auto;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: var(--primary-color);
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Quick poll access button
const QuickReactionButton = styled.button`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(30, 30, 40, 0.7);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  cursor: pointer;
  opacity: 0.7;
  z-index: 90;
  transition: opacity 0.2s ease, transform 0.2s ease;
  
  &:hover {
    opacity: 1;
    transform: translateY(-50%) scale(1.1);
  }
`;

// Quiz score display
const QuizScoreDisplay = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(30, 30, 40, 0.7);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  z-index: 90;
  
  &::before {
    content: "🎯";
    margin-right: 8px;
    font-size: 16px;
  }
`;

const PlayerPage: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const soundEffects = useSoundEffects();
  
  const episodeId = searchParams.get('episode');
  const startPosition = searchParams.get('position');
  
  // Back button handler (define before use)
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  
  const playback = usePlayback();
  const { 
    playerState, 
    error, 
    loadContent, 
    saveWatchProgress 
  } = playback;
  
  const {
    activePoll,
    activeQuiz,
    activeInfoCard,
    showReactions,
    quizScore,
    userVotes,
    userQuizAnswers,
    handlePollVote,
    handleQuizAnswer,
    handleReactionSelect,
    showReactionsMenu,
    hideActivePoll,
    hideActiveQuiz,
    hideActiveInfoCard,
    hideReactionsMenu,
  } = useInteractiveVideo(contentId || '');
  
  const [content, setContent] = useState<ContentItem | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<number | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [availableReactions] = useState<ReactionData[]>(
    AVAILABLE_REACTIONS.map(r => ({ ...r, count: 0 }))
  );
  
  // Initialize player with content
  useEffect(() => {
    const initializePlayer = async () => {
      try {
        if (!contentId) return;
        
        // Fetch content details
        const contentService = ContentService.getInstance();
        const contentItem = await contentService.getContentById(contentId);
        setContent(contentItem);
        
        // If episode ID is specified, find that episode
        let currentEpisode: Episode | null = null;
        if (episodeId && contentItem && contentItem.type === 'series') {
          const seriesContent = contentItem as SeriesContent; // Type assertion
          for (const season of seriesContent.seasons) {
            const foundEpisode = season.episodes.find((ep: Episode) => ep.id === episodeId);
            if (foundEpisode) {
              currentEpisode = foundEpisode;
              setEpisode(foundEpisode);
              break;
            }
          }
        }
        
        // Create stream source
        const streamUrl = currentEpisode ? currentEpisode.streamUrl : contentItem?.streamUrl;
        
        if (!streamUrl) {
          throw new Error('Stream URL not found for the selected content');
        }
        
        const source: StreamSource = {
          url: streamUrl,
          type: streamUrl.includes('.m3u8') ? 'hls' : 'mp4',
          qualities: [
            { label: '480p', width: 854, height: 480, bitrate: 1500000 },
            { label: '720p', width: 1280, height: 720, bitrate: 3000000 },
            { label: '1080p', width: 1920, height: 1080, bitrate: 6000000 }
          ]
        };
        
        // Load content in player
        await loadContent(contentId, source, episodeId || undefined, startPosition ? parseInt(startPosition) : undefined);
        
        // Start playback
        await playback.play();
        setInitialLoad(false);
        
        // Play sound effect
        soundEffects.playSound(SoundType.SUCCESS);
      } catch (err) {
        console.error('Failed to initialize player:', err);
        setInitialLoad(false);
      }
    };
    
    initializePlayer();
    
    // Clean up - save progress when leaving
    return () => {
      saveWatchProgress();
    };
  }, [contentId, episodeId, startPosition, loadContent, playback, soundEffects, saveWatchProgress]);
  
  // Hide controls after a delay
  useEffect(() => {
    // Only start timer if playing
    if (playerState.status === 'playing' && controlsVisible) {
      // Clear existing timeout
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      
      // Set new timeout
      const timeout = window.setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
      
      setControlsTimeout(timeout);
    }
    
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsVisible, playerState.status, controlsTimeout]);
  
  // Handle key events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show controls on any key press
      setControlsVisible(true);
      
      // Handle specific key presses
      switch (e.key) {
        case ' ':
        case 'k':
          playback.togglePlay();
          e.preventDefault();
          break;
        case 'f':
          playback.togglePlayerFullscreen();
          e.preventDefault();
          break;
        case 'Escape':
          if (playerState.fullscreen) {
            playback.togglePlayerFullscreen();
            e.preventDefault();
          } else if (activePoll) {
            hideActivePoll();
            e.preventDefault();
          } else if (activeQuiz) {
            hideActiveQuiz();
            e.preventDefault();
          } else if (activeInfoCard) {
            hideActiveInfoCard();
            e.preventDefault();
          } else if (showReactions) {
            hideReactionsMenu();
            e.preventDefault();
          } else {
            handleBack();
          }
          break;
        case 'r':
          // Quick reactions access
          showReactionsMenu();
          e.preventDefault();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playback, playerState.fullscreen, showReactionsMenu, 
      activePoll, activeQuiz, activeInfoCard, showReactions,
      hideActivePoll, hideActiveQuiz, hideActiveInfoCard, hideReactionsMenu, handleBack]);
  
  // Handle mouse movement to show controls
  const handleMouseMove = () => {
    setControlsVisible(true);
  };
  
  // Get title for player
  const getVideoTitle = () => {
    if (!content) return '';
    
    if (episode) {
      return `${content.title} - ${episode.title}`;
    }
    
    return content.title;
  };
  
  // Handle link clicks in info cards
  const handleInfoCardLinkClick = (url: string) => {
    console.log('Info card link clicked:', url);
    // This would open in a new tab or handle in-app navigation
    window.open(url, '_blank');
  };
  
  return (
    <PlayerContainer onMouseMove={handleMouseMove}>
      <VideoWrapper>
        {initialLoad && (
          <LoadingMessage>
            <h3>Loading video...</h3>
            <div className="spinner" />
          </LoadingMessage>
        )}
        
        {error && !initialLoad && (
          <ErrorMessage>
            <h3>Error Playing Video</h3>
            <p>{error}</p>
            <button onClick={handleBack}>Go Back</button>
          </ErrorMessage>
        )}
        
        {/* Video player is rendered by the Senza SDK */}
        {/* The PlaybackService connects to the native player */}
      </VideoWrapper>
      
      {/* Player controls */}
      <PlayerControls 
        id="main-player-controls"
        visible={controlsVisible} 
        onBack={handleBack}
        title={getVideoTitle()}
      />
      
      {/* Interactive overlay elements */}
      {activePoll && (
        <PollOverlay
          poll={activePoll}
          visible={!!activePoll}
          onClose={hideActivePoll}
          onVote={handlePollVote}
          userVote={userVotes[activePoll.id]}
        />
      )}
      
      {activeQuiz && (
        <QuizOverlay
          quiz={activeQuiz}
          visible={!!activeQuiz}
          onClose={hideActiveQuiz}
          onAnswer={handleQuizAnswer}
          userAnswer={userQuizAnswers[activeQuiz.id]}
        />
      )}
      
      {activeInfoCard && (
        <InfoCard
          card={activeInfoCard}
          visible={!!activeInfoCard}
          onClose={hideActiveInfoCard}
          onLinkClick={handleInfoCardLinkClick}
        />
      )}
      
      {/* Reactions */}
      <Transition
        show={!controlsVisible && playerState.status === 'playing'}
        type={TransitionType.FADE}
        duration={300}
      >
        <QuickReactionButton onClick={showReactionsMenu}>
          😀
        </QuickReactionButton>
      </Transition>
      
      <ReactionSelector
        reactions={availableReactions}
        visible={showReactions}
        onClose={hideReactionsMenu}
        onReactionSelect={handleReactionSelect}
      />
      
      {/* Quiz score */}
      {quizScore > 0 && (
        <QuizScoreDisplay>
          {quizScore} points
        </QuizScoreDisplay>
      )}
    </PlayerContainer>
  );
};

export default PlayerPage; 