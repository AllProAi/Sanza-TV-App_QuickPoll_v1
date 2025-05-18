import senzaSDK, { SenzaEventType } from './senza-sdk';
import type { SenzaEvent, ErrorEventData } from './senza-sdk';

// Event bus types
export const AppEventType = {
  APP_STARTED: 'app_started',
  APP_FOCUSED: 'app_focused',
  APP_BLURRED: 'app_blurred',
  APP_FOREGROUND: 'app_foreground',
  APP_BACKGROUND: 'app_background',
  APP_WILL_EXIT: 'app_will_exit',
  APP_ERROR: 'app_error',
} as const;

export type AppEventType = typeof AppEventType[keyof typeof AppEventType];

// Define possible event data types
export type AppEventData = {
  error?: Error;
  message?: string;
  stack?: string;
  [key: string]: unknown;
};

// Event interface
export interface AppEvent {
  type: AppEventType;
  data?: AppEventData;
  timestamp: number;
}

// Subscriber type
type AppEventCallback = (event: AppEvent) => void;

// Application state
interface AppState {
  isFocused: boolean;
  isActive: boolean;
  lastActiveTime: number;
  lastError: Error | null;
}

class AppLifecycleService {
  private eventSubscribers: Map<AppEventType, AppEventCallback[]> = new Map();
  private state: AppState = {
    isFocused: true,
    isActive: true,
    lastActiveTime: Date.now(),
    lastError: null,
  };

  constructor() {
    // Initialize the service
    this.initialize();
  }

  /**
   * Initialize the app lifecycle service
   */
  private async initialize(): Promise<void> {
    // Set up window focus/blur events
    window.addEventListener('focus', this.handleFocus);
    window.addEventListener('blur', this.handleBlur);
    
    // Set up error handling
    window.addEventListener('error', this.handleError);
    
    // Set up beforeunload for cleanup
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    
    // Subscribe to Senza SDK events
    senzaSDK.subscribe(this.handleSenzaEvent);
    
    // Emit app started event
    this.emit({
      type: AppEventType.APP_STARTED,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle focus event
   */
  private handleFocus = (): void => {
    this.state.isFocused = true;
    this.emit({
      type: AppEventType.APP_FOCUSED,
      timestamp: Date.now(),
    });
  };

  /**
   * Handle blur event
   */
  private handleBlur = (): void => {
    this.state.isFocused = false;
    this.emit({
      type: AppEventType.APP_BLURRED,
      timestamp: Date.now(),
    });
  };

  /**
   * Handle window error event
   */
  private handleError = (e: ErrorEvent): void => {
    const error = e.error || new Error(e.message);
    this.state.lastError = error;
    this.emit({
      type: AppEventType.APP_ERROR,
      data: { error, message: error.message, stack: error.stack },
      timestamp: Date.now(),
    });
  };

  /**
   * Handle beforeunload event
   */
  private handleBeforeUnload = (): void => {
    this.emit({
      type: AppEventType.APP_WILL_EXIT,
      timestamp: Date.now(),
    });
    this.cleanup();
  };

  /**
   * Handle Senza SDK events
   */
  private handleSenzaEvent = (event: SenzaEvent): void => {
    switch (event.type) {
      case SenzaEventType.APP_FOREGROUND:
        this.state.isActive = true;
        this.state.lastActiveTime = Date.now();
        this.emit({
          type: AppEventType.APP_FOREGROUND,
          timestamp: Date.now(),
        });
        break;
      case SenzaEventType.APP_BACKGROUND:
        this.state.isActive = false;
        this.emit({
          type: AppEventType.APP_BACKGROUND,
          timestamp: Date.now(),
        });
        break;
      case SenzaEventType.ERROR:
        if (event.data && 'error' in event.data) {
          const errorData = event.data as ErrorEventData;
          this.handleError(new ErrorEvent('error', { error: errorData.error }));
        } else {
          this.handleError(new ErrorEvent('error', { message: 'Unknown SDK error' }));
        }
        break;
    }
  };

  /**
   * Subscribe to app lifecycle events
   * @param type Event type to subscribe to
   * @param callback The callback function to handle events
   * @returns Function to unsubscribe
   */
  subscribe(type: AppEventType, callback: AppEventCallback): () => void {
    if (!this.eventSubscribers.has(type)) {
      this.eventSubscribers.set(type, []);
    }
    this.eventSubscribers.get(type)!.push(callback);

    return () => {
      const subscribers = this.eventSubscribers.get(type);
      if (subscribers) {
        const index = subscribers.indexOf(callback);
        if (index !== -1) {
          subscribers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to all app lifecycle events
   * @param callback The callback function to handle events
   * @returns Function to unsubscribe
   */
  subscribeToAll(callback: AppEventCallback): () => void {
    const unsubscribers = Object.values(AppEventType).map(type => 
      this.subscribe(type as AppEventType, callback)
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }

  /**
   * Emit an event to all subscribers
   * @param event The event to emit
   */
  private emit(event: AppEvent): void {
    const subscribers = this.eventSubscribers.get(event.type) || [];
    
    subscribers.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in app event subscriber:', error);
      }
    });
  }

  /**
   * Get the current application state
   * @returns The current app state
   */
  getState(): Readonly<AppState> {
    return { ...this.state };
  }

  /**
   * Exit the application
   */
  exitApp(): void {
    this.emit({
      type: AppEventType.APP_WILL_EXIT,
      timestamp: Date.now(),
    });
    this.cleanup();
    senzaSDK.exitApp();
  }

  /**
   * Clean up resources when app is exiting
   */
  private cleanup(): void {
    // Remove event listeners
    window.removeEventListener('focus', this.handleFocus);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('error', this.handleError);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    
    // Clear subscribers to prevent memory leaks
    this.eventSubscribers.clear();
  }
}

// Create singleton instance
const appLifecycle = new AppLifecycleService();
export default appLifecycle; 