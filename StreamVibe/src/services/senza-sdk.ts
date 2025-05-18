import { init, uiReady } from 'senza-sdk';

// Event types
export const SenzaEventType = {
  APP_FOREGROUND: 'app_foreground',
  APP_BACKGROUND: 'app_background',
  KEY_EVENT: 'key_event',
  ERROR: 'error',
} as const;

export type SenzaEventType = typeof SenzaEventType[keyof typeof SenzaEventType];

// Define specific data types for different event types
export interface KeyEventData {
  key: string;
  code: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}

export interface ErrorEventData {
  message: string;
  error?: Error;
}

// Union type for all possible event data
export type SenzaEventData = KeyEventData | ErrorEventData | Record<string, unknown> | null;

// Event interface
export interface SenzaEvent {
  type: SenzaEventType;
  data?: SenzaEventData;
}

// Define user info and device info interfaces
export interface UserInfo {
  id: string;
  username?: string;
  email?: string;
  subscriptionType?: string;
  region?: string;
  [key: string]: unknown;
}

export interface DeviceInfo {
  id: string;
  model?: string;
  type?: string;
  os?: string;
  osVersion?: string;
  capabilities?: string[];
  [key: string]: unknown;
}

// Analytics data type
export type AnalyticsData = Record<string, string | number | boolean | null | undefined>;

// Subscriber type
type SenzaEventCallback = (event: SenzaEvent) => void;

class SenzaSDKService {
  private isInitialized: boolean = false;
  private eventSubscribers: SenzaEventCallback[] = [];
  
  /**
   * Initialize the Senza SDK
   * @returns Promise that resolves when SDK is initialized
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    
    try {
      // Initialize the SDK
      await init();
      this.isInitialized = true;
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Signal that UI is ready
      uiReady();
      
      // Emit foreground event
      this.emit({
        type: SenzaEventType.APP_FOREGROUND,
      });
      
      console.log('Senza SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Senza SDK:', error);
      this.emit({
        type: SenzaEventType.ERROR,
        data: { message: 'Failed to initialize Senza SDK', error: error instanceof Error ? error : new Error(String(error)) }
      });
      throw error;
    }
  }
  
  /**
   * Setup event listeners for the SDK
   */
  private setupEventListeners(): void {
    if (typeof document !== 'undefined') {
      // Listen for key events
      document.addEventListener('keydown', (e: KeyboardEvent) => {
        this.emit({
          type: SenzaEventType.KEY_EVENT,
          data: {
            key: e.key,
            code: e.code,
            altKey: e.altKey,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            metaKey: e.metaKey
          }
        });
      });
      
      // Listen for app state changes via DOM events
      document.addEventListener('hs/uistatechange', ((e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail === 'foreground') {
          this.emit({ type: SenzaEventType.APP_FOREGROUND });
        } else if (customEvent.detail === 'background') {
          this.emit({ type: SenzaEventType.APP_BACKGROUND });
        }
      }) as EventListener);
    }
  }
  
  /**
   * Subscribe to SDK events
   * @param callback The callback function to handle events
   * @returns Function to unsubscribe
   */
  subscribe(callback: SenzaEventCallback): () => void {
    this.eventSubscribers.push(callback);
    return () => {
      this.eventSubscribers = this.eventSubscribers.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Emit an event to all subscribers
   * @param event The event to emit
   */
  private emit(event: SenzaEvent): void {
    this.eventSubscribers.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in Senza event subscriber:', error);
      }
    });
  }
  
  /**
   * Get user information from the SDK
   * @returns User information
   */
  async getUserInfo(): Promise<UserInfo> {
    this.checkInitialized();
    // Mock implementation instead of calling SDK
    return {
      id: 'mock-user-id',
      username: 'Mock User',
      email: 'user@example.com',
      subscriptionType: 'premium',
      region: 'US'
    };
  }
  
  /**
   * Get device information from the SDK
   * @returns Device information
   */
  async getDeviceInfo(): Promise<DeviceInfo> {
    this.checkInitialized();
    // Mock implementation instead of calling SDK
    return {
      id: 'mock-device-id',
      model: 'Mock Device',
      type: 'desktop',
      os: 'Windows',
      osVersion: '10',
      capabilities: ['hd', '4k']
    };
  }
  
  /**
   * Send analytics event
   * @param eventName Event name
   * @param eventData Event data
   */
  sendAnalytics(eventName: string, eventData: AnalyticsData): void {
    this.checkInitialized();
    console.log('Analytics event:', eventName, eventData);
  }
  
  /**
   * Exit the application
   */
  exitApp(): void {
    this.checkInitialized();
    console.log('Exit app called');
  }
  
  /**
   * Check if the SDK is initialized
   * @throws Error if SDK is not initialized
   */
  private checkInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Senza SDK is not initialized. Call initialize() first.');
    }
  }
}

// Create and export a singleton instance
const senzaSDK = new SenzaSDKService();
export default senzaSDK; 