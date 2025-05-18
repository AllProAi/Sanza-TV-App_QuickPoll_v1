import React, { createContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define types for the app state
export interface AppState {
  isLoading: boolean;
  darkMode: boolean;
  isOnline: boolean;
  lastUpdated: string;
  isDebugMode: boolean;
}

// Define action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SET_DEBUG_MODE'; payload: boolean };

// Define the initial state
const initialState: AppState = {
  isLoading: false,
  darkMode: true, // Default to dark mode for TV interface
  isOnline: true,
  lastUpdated: new Date().toISOString(),
  isDebugMode: false,
};

// Create the context with a default value
export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  toggleDarkMode: () => void;
  setLoading: (loading: boolean) => void;
  setDebugMode: (enabled: boolean) => void;
}

const AppContext = createContext<AppContextType>({
  state: initialState,
  dispatch: () => null,
  toggleDarkMode: () => null,
  setLoading: () => null,
  setDebugMode: () => null,
});

// Create a reducer function to handle state updates
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, lastUpdated: new Date().toISOString() };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode, lastUpdated: new Date().toISOString() };
    case 'SET_DARK_MODE':
      return { ...state, darkMode: action.payload, lastUpdated: new Date().toISOString() };
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload, lastUpdated: new Date().toISOString() };
    case 'SET_DEBUG_MODE':
      return { ...state, isDebugMode: action.payload, lastUpdated: new Date().toISOString() };
    default:
      return state;
  }
};

// Create the AppProvider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Use reducer to manage state
  const [state, dispatch] = useReducer(appReducer, initialState, () => {
    // Load persisted state from localStorage if available
    const persistedState = localStorage.getItem('appState');
    return persistedState ? { ...initialState, ...JSON.parse(persistedState) } : initialState;
  });

  // Create memoized action creators
  const toggleDarkMode = React.useCallback(() => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  }, []);

  const setLoading = React.useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setDebugMode = React.useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_DEBUG_MODE', payload: enabled });
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: navigator.onLine });
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify({
      darkMode: state.darkMode,
      isDebugMode: state.isDebugMode,
    }));
  }, [state.darkMode, state.isDebugMode]);

  // Provide the context value
  const contextValue: AppContextType = {
    state,
    dispatch,
    toggleDarkMode,
    setLoading,
    setDebugMode,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext; 