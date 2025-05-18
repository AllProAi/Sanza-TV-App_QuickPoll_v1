// import { EventEmitter } from 'events';
import PlaybackService from './PlaybackService';

// Poll data type
export interface PollData {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId?: string; // For quiz questions
  timeToShow: number; // Time in seconds when the poll should appear
  duration: number; // How long the poll should be displayed for (in seconds)
  results?: Record<string, number>; // Option ID to vote count
}

// Quiz data type
export interface QuizData {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation?: string;
  timeToShow: number;
  duration: number;
  points: number;
}

// Information card data type
export interface InfoCardData {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  timeToShow: number;
  duration: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

// Reaction data type
export interface ReactionData {
  id: string;
  emoji: string;
  label: string;
  count: number;
}

// Available reaction options
export const AVAILABLE_REACTIONS: Omit<ReactionData, 'count'>[] = [
  { id: 'laugh', emoji: '😂', label: 'Laugh' },
  { id: 'wow', emoji: '😮', label: 'Wow' },
  { id: 'heart', emoji: '❤️', label: 'Love' },
  { id: 'sad', emoji: '😢', label: 'Sad' },
  { id: 'angry', emoji: '😡', label: 'Angry' },
  { id: 'fire', emoji: '🔥', label: 'Fire' },
  { id: 'thumbs-up', emoji: '👍', label: 'Thumbs Up' },
  { id: 'thumbs-down', emoji: '👎', label: 'Thumbs Down' },
];

// Interactive event types
export type InteractiveEventType = 
  | 'poll-show'
  | 'poll-hide'
  | 'poll-voted'
  | 'poll-results'
  | 'quiz-show'
  | 'quiz-hide'
  | 'quiz-answered'
  | 'quiz-results'
  | 'info-card-show'
  | 'info-card-hide'
  | 'info-card-expanded'
  | 'reaction-show'
  | 'reaction-hide'
  | 'reaction-added';

// Event payload types
export type PollVoteData = { pollId: string; optionId: string };
export type QuizAnswerData = { 
  quizId: string; 
  optionId: string; 
  isCorrect: boolean;
  correctOptionId: string;
  explanation?: string;
};
export type InfoCardExpandData = { cardId: string; expanded: boolean };
export type ReactionAddedData = { 
  contentId: string; 
  reactionId: string; 
  reaction: ReactionData;
};

// Union type for all event data types
export type InteractiveEventData = 
  | PollData 
  | QuizData 
  | InfoCardData 
  | ReactionData 
  | PollVoteData 
  | QuizAnswerData 
  | InfoCardExpandData 
  | ReactionAddedData 
  | undefined;

// Interactive event data
export interface InteractiveEvent {
  type: InteractiveEventType;
  data?: InteractiveEventData;
}

// Simple event listener type
type EventListener = (data: InteractiveEventData) => void;

/**
 * Service for managing interactive video features
 */
class InteractiveService {
  private static instance: InteractiveService;
  private listeners: Map<InteractiveEventType, EventListener[]>;
  private polls: Map<string, PollData>;
  private quizzes: Map<string, QuizData>;
  private infoCards: Map<string, InfoCardData>;
  private reactions: Map<string, ReactionData[]>;
  private userVotes: Map<string, string>;
  private userQuizAnswers: Map<string, string>;
  private activeInteractiveElements: {
    poll: PollData | null;
    quiz: QuizData | null;
    infoCard: InfoCardData | null;
    showingReactions: boolean;
  };
  private playbackService: PlaybackService;
  private checkInterval: number | null;
  private quizScores: Map<string, number>;

  private constructor() {
    this.listeners = new Map();
    this.polls = new Map();
    this.quizzes = new Map();
    this.infoCards = new Map();
    this.reactions = new Map();
    this.userVotes = new Map();
    this.userQuizAnswers = new Map();
    this.quizScores = new Map();
    this.activeInteractiveElements = {
      poll: null,
      quiz: null,
      infoCard: null,
      showingReactions: false
    };
    this.playbackService = PlaybackService.getInstance();
    this.checkInterval = null;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): InteractiveService {
    if (!InteractiveService.instance) {
      InteractiveService.instance = new InteractiveService();
    }
    return InteractiveService.instance;
  }

  /**
   * Initialize interactive service and start checking for interactive elements
   */
  public initialize(contentId: string): void {
    this.loadInteractiveDataForContent(contentId);
    this.startCheckingForInteractiveElements();
  }

  /**
   * Clear active interactive elements and stop checking
   */
  public cleanup(): void {
    this.hideAllInteractiveElements();
    this.stopCheckingForInteractiveElements();
  }

  /**
   * Load interactive data for a specific content
   */
  private loadInteractiveDataForContent(contentId: string): void {
    // In a real app, this would fetch data from a backend API
    // For this demo, we'll create some mock data
    
    // Reset current data
    this.polls.clear();
    this.quizzes.clear();
    this.infoCards.clear();
    this.reactions.clear();
    
    // Mock polls data
    const mockPolls: PollData[] = [
      {
        id: 'poll-1',
        question: 'Who do you think is the mysterious figure?',
        options: [
          { id: 'option-1', text: 'The butler' },
          { id: 'option-2', text: 'The neighbor' },
          { id: 'option-3', text: 'The old friend' },
          { id: 'option-4', text: 'A new character' }
        ],
        timeToShow: 120, // 2 minutes into the video
        duration: 30,
        results: {}
      },
      {
        id: 'poll-2',
        question: 'What do you think will happen next?',
        options: [
          { id: 'option-1', text: 'A major plot twist' },
          { id: 'option-2', text: 'Character revelation' },
          { id: 'option-3', text: 'Action sequence' },
          { id: 'option-4', text: 'Emotional scene' }
        ],
        timeToShow: 300, // 5 minutes into the video
        duration: 30,
        results: {}
      }
    ];
    
    // Mock quizzes data
    const mockQuizzes: QuizData[] = [
      {
        id: 'quiz-1',
        question: 'What was the name of the main character\'s hometown?',
        options: [
          { id: 'option-1', text: 'Springfield' },
          { id: 'option-2', text: 'Riverdale' },
          { id: 'option-3', text: 'Oakwood' },
          { id: 'option-4', text: 'Mapleville' }
        ],
        correctOptionId: 'option-3',
        explanation: 'Oakwood was mentioned in the opening scene.',
        timeToShow: 180, // 3 minutes into the video
        duration: 20,
        points: 100
      },
      {
        id: 'quiz-2',
        question: 'What was hidden in the secret compartment?',
        options: [
          { id: 'option-1', text: 'A letter' },
          { id: 'option-2', text: 'A key' },
          { id: 'option-3', text: 'A photograph' },
          { id: 'option-4', text: 'A map' }
        ],
        correctOptionId: 'option-2',
        explanation: 'A key was found that opens the mysterious door.',
        timeToShow: 360, // 6 minutes into the video
        duration: 20,
        points: 150
      }
    ];
    
    // Mock info cards data
    const mockInfoCards: InfoCardData[] = [
      {
        id: 'info-1',
        title: 'Fun Fact',
        description: 'This scene was filmed on location in New Zealand.',
        imageUrl: 'https://via.placeholder.com/300x200',
        timeToShow: 60, // 1 minute into the video
        duration: 15,
        position: 'bottom-right'
      },
      {
        id: 'info-2',
        title: 'Behind the Scenes',
        description: 'The actor performed this stunt without a double!',
        imageUrl: 'https://via.placeholder.com/300x200',
        linkUrl: '#',
        linkText: 'Watch Interview',
        timeToShow: 240, // 4 minutes into the video
        duration: 15,
        position: 'top-right'
      }
    ];
    
    // Store the mock data
    mockPolls.forEach(poll => this.polls.set(poll.id, poll));
    mockQuizzes.forEach(quiz => this.quizzes.set(quiz.id, quiz));
    mockInfoCards.forEach(card => this.infoCards.set(card.id, card));
    
    // Initialize reactions with default data
    this.reactions.set(contentId, AVAILABLE_REACTIONS.map(reaction => ({
      ...reaction,
      count: Math.floor(Math.random() * 100) // Random count for demo
    })));
  }

  /**
   * Start checking for interactive elements based on video time
   */
  private startCheckingForInteractiveElements(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = window.setInterval(() => {
      const currentTime = this.playbackService.getPlayerState().currentTime;
      this.checkForInteractiveElementsAtTime(currentTime);
    }, 1000); // Check every second
  }

  /**
   * Stop checking for interactive elements
   */
  private stopCheckingForInteractiveElements(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check if any interactive elements should be shown at current time
   */
  private checkForInteractiveElementsAtTime(currentTime: number): void {
    // Check for polls
    this.polls.forEach(poll => {
      const shouldShow = currentTime >= poll.timeToShow && 
                         currentTime < (poll.timeToShow + poll.duration) &&
                         this.activeInteractiveElements.poll?.id !== poll.id;
      
      if (shouldShow && !this.activeInteractiveElements.poll) {
        this.showPoll(poll);
      }
      
      const shouldHide = this.activeInteractiveElements.poll?.id === poll.id && 
                         currentTime >= (poll.timeToShow + poll.duration);
      
      if (shouldHide) {
        this.hidePoll();
      }
    });
    
    // Check for quizzes
    this.quizzes.forEach(quiz => {
      const shouldShow = currentTime >= quiz.timeToShow && 
                         currentTime < (quiz.timeToShow + quiz.duration) &&
                         this.activeInteractiveElements.quiz?.id !== quiz.id;
      
      if (shouldShow && !this.activeInteractiveElements.quiz) {
        this.showQuiz(quiz);
      }
      
      const shouldHide = this.activeInteractiveElements.quiz?.id === quiz.id && 
                         currentTime >= (quiz.timeToShow + quiz.duration);
      
      if (shouldHide) {
        this.hideQuiz();
      }
    });
    
    // Check for info cards
    this.infoCards.forEach(card => {
      const shouldShow = currentTime >= card.timeToShow && 
                         currentTime < (card.timeToShow + card.duration) &&
                         this.activeInteractiveElements.infoCard?.id !== card.id;
      
      if (shouldShow && !this.activeInteractiveElements.infoCard) {
        this.showInfoCard(card);
      }
      
      const shouldHide = this.activeInteractiveElements.infoCard?.id === card.id && 
                         currentTime >= (card.timeToShow + card.duration);
      
      if (shouldHide) {
        this.hideInfoCard();
      }
    });
  }

  /**
   * Show a poll
   */
  private showPoll(poll: PollData): void {
    this.activeInteractiveElements.poll = poll;
    this.emit('poll-show', poll);
  }

  /**
   * Hide the active poll
   */
  private hidePoll(): void {
    const poll = this.activeInteractiveElements.poll;
    this.activeInteractiveElements.poll = null;
    if (poll) {
      this.emit('poll-hide', poll);
    }
  }

  /**
   * Show a quiz
   */
  private showQuiz(quiz: QuizData): void {
    this.activeInteractiveElements.quiz = quiz;
    this.emit('quiz-show', quiz);
  }

  /**
   * Hide the active quiz
   */
  private hideQuiz(): void {
    const quiz = this.activeInteractiveElements.quiz;
    this.activeInteractiveElements.quiz = null;
    if (quiz) {
      this.emit('quiz-hide', quiz);
    }
  }

  /**
   * Show an info card
   */
  private showInfoCard(card: InfoCardData): void {
    this.activeInteractiveElements.infoCard = card;
    this.emit('info-card-show', card);
  }

  /**
   * Hide the active info card
   */
  private hideInfoCard(): void {
    const card = this.activeInteractiveElements.infoCard;
    this.activeInteractiveElements.infoCard = null;
    if (card) {
      this.emit('info-card-hide', card);
    }
  }

  /**
   * Hide all interactive elements
   */
  private hideAllInteractiveElements(): void {
    this.hidePoll();
    this.hideQuiz();
    this.hideInfoCard();
    this.hideReactions();
  }

  /**
   * Submit a vote for a poll
   */
  public submitPollVote(pollId: string, optionId: string): void {
    const poll = this.polls.get(pollId);
    if (!poll) return;
    
    // Don't allow voting twice
    if (this.userVotes.has(pollId)) return;
    
    // Update results
    if (!poll.results) {
      poll.results = {};
    }
    
    poll.results[optionId] = (poll.results[optionId] || 0) + 1;
    this.userVotes.set(pollId, optionId);
    
    // Emit events
    this.emit('poll-voted', { pollId, optionId });
    this.emit('poll-results', poll);
  }

  /**
   * Submit an answer for a quiz
   */
  public submitQuizAnswer(quizId: string, optionId: string): void {
    const quiz = this.quizzes.get(quizId);
    if (!quiz) return;
    
    // Don't allow answering twice
    if (this.userQuizAnswers.has(quizId)) return;
    
    // Check if answer is correct and update score
    const isCorrect = quiz.correctOptionId === optionId;
    if (isCorrect) {
      const currentScore = this.quizScores.get('current') || 0;
      this.quizScores.set('current', currentScore + quiz.points);
    }
    
    // Save user's answer
    this.userQuizAnswers.set(quizId, optionId);
    
    // Emit events
    this.emit('quiz-answered', { 
      quizId, 
      optionId, 
      isCorrect,
      correctOptionId: quiz.correctOptionId,
      explanation: quiz.explanation 
    });
  }

  /**
   * Toggle info card expanded state
   */
  public toggleInfoCardExpanded(cardId: string, expanded: boolean): void {
    const card = this.infoCards.get(cardId);
    if (!card) return;
    
    this.emit('info-card-expanded', { cardId, expanded });
  }

  /**
   * Show reaction selector
   */
  public showReactions(): void {
    this.activeInteractiveElements.showingReactions = true;
    this.emit('reaction-show');
  }

  /**
   * Hide reaction selector
   */
  public hideReactions(): void {
    this.activeInteractiveElements.showingReactions = false;
    this.emit('reaction-hide');
  }

  /**
   * Add a reaction
   */
  public addReaction(contentId: string, reactionId: string): void {
    const contentReactions = this.reactions.get(contentId);
    if (!contentReactions) return;
    
    const reactionIndex = contentReactions.findIndex(r => r.id === reactionId);
    if (reactionIndex === -1) return;
    
    // Increment reaction count
    contentReactions[reactionIndex].count += 1;
    
    // Emit event
    this.emit('reaction-added', { 
      contentId, 
      reactionId, 
      reaction: contentReactions[reactionIndex] 
    });
  }

  /**
   * Get current quiz score
   */
  public getQuizScore(): number {
    return this.quizScores.get('current') || 0;
  }

  /**
   * Reset quiz score
   */
  public resetQuizScore(): void {
    this.quizScores.set('current', 0);
    this.userQuizAnswers.clear();
  }

  /**
   * Register an event listener
   */
  public on(eventName: InteractiveEventType, listener: EventListener): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.push(listener);
    }
  }

  /**
   * Remove an event listener
   */
  public off(eventName: InteractiveEventType, listener: EventListener): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event
   */
  private emit(eventName: InteractiveEventType, data?: InteractiveEventData): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }
}

export default InteractiveService; 