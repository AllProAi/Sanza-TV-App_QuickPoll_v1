declare module 'senza-sdk' {
  export enum AppState {
    FOREGROUND = 'foreground',
    BACKGROUND = 'background'
  }

  export interface KeyEvent {
    key: string;
    code: string;
    altKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
  }

  export interface UserInfo {
    id: string;
    name: string;
    email?: string;
    [key: string]: string | number | boolean | null | undefined;
  }

  export interface DeviceInfo {
    id: string;
    model: string;
    platform: string;
    version: string;
    [key: string]: string | number | boolean | null | undefined;
  }

  // SDK initialization functions
  export function init(): Promise<void>;
  export function uiReady(): void;
  export function exit(): void;

  // Event listeners
  export function onAppStateChange(callback: (state: AppState) => void): void;
  export function onKeyEvent(callback: (event: KeyEvent) => void): void;

  // User and device information
  export function getUserInfo(): Promise<UserInfo>;
  export function getDeviceInfo(): Promise<DeviceInfo>;

  // Analytics
  export function sendAnalyticsEvent(eventName: string, eventData: Record<string, string | number | boolean | null | undefined>): void;
} 