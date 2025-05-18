import React, { createContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define user-related types
export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  parentalControlLevel?: 'kids' | 'teen' | 'adult' | 'all';
  language: string;
  subtitle: string;
  audioOutput: 'stereo' | 'surround' | 'dolby';
  streamingQuality: 'auto' | 'low' | 'medium' | 'high' | '4k';
  autoplay: boolean;
}

export interface UserState {
  profiles: UserProfile[];
  activeProfileId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Define action types
type UserAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { profiles: UserProfile[]; activeProfileId: string } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SWITCH_PROFILE'; payload: string }
  | { type: 'UPDATE_PROFILE'; payload: UserProfile }
  | { type: 'ADD_PROFILE'; payload: UserProfile }
  | { type: 'REMOVE_PROFILE'; payload: string }
  | { type: 'SET_USER_PREFERENCE'; payload: { profileId: string; key: keyof UserProfile; value: unknown } };

// Define initial state
const initialState: UserState = {
  profiles: [],
  activeProfileId: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

// Create context
interface UserContextType {
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  switchProfile: (profileId: string) => void;
  updateProfile: (profile: UserProfile) => void;
  setPreference: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => void;
  getActiveProfile: () => UserProfile | null;
}

const UserContext = createContext<UserContextType>({
  state: initialState,
  dispatch: () => null,
  login: async () => {},
  logout: () => {},
  switchProfile: () => {},
  updateProfile: () => {},
  setPreference: () => {},
  getActiveProfile: () => null
});

// Create reducer
const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        profiles: action.payload.profiles,
        activeProfileId: action.payload.activeProfileId
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...initialState
      };
    case 'SWITCH_PROFILE':
      return {
        ...state,
        activeProfileId: action.payload
      };
    case 'UPDATE_PROFILE': {
      const updatedProfiles = state.profiles.map(profile => 
        profile.id === action.payload.id ? action.payload : profile
      );
      return {
        ...state,
        profiles: updatedProfiles
      };
    }
    case 'ADD_PROFILE':
      return {
        ...state,
        profiles: [...state.profiles, action.payload]
      };
    case 'REMOVE_PROFILE': {
      const filteredProfiles = state.profiles.filter(profile => profile.id !== action.payload);
      return {
        ...state,
        profiles: filteredProfiles,
        activeProfileId: state.activeProfileId === action.payload
          ? (filteredProfiles[0]?.id || null)
          : state.activeProfileId
      };
    }
    case 'SET_USER_PREFERENCE': {
      const { profileId, key, value } = action.payload;
      const updatedProfiles = state.profiles.map(profile => {
        if (profile.id === profileId) {
          return {
            ...profile,
            [key]: value
          };
        }
        return profile;
      });
      return {
        ...state,
        profiles: updatedProfiles
      };
    }
    default:
      return state;
  }
};

// Create provider
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState, () => {
    // Load user state from localStorage
    const savedUserState = localStorage.getItem('userState');
    if (savedUserState) {
      try {
        return JSON.parse(savedUserState) as UserState;
      } catch (e) {
        console.error('Failed to parse saved user state', e);
      }
    }
    return initialState;
  });

  // Login function (mock implementation)
  const login = React.useCallback(async (username: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, use the username and password for authentication
      console.log(`Logging in with username: ${username} and password: ${password.replace(/./g, '*')}`);
      
      // Mock successful login with sample profiles
      const mockProfiles: UserProfile[] = [
        {
          id: '1',
          name: 'Primary User',
          language: 'en',
          subtitle: 'en',
          audioOutput: 'stereo',
          streamingQuality: 'auto',
          autoplay: true
        }
      ];
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { 
          profiles: mockProfiles, 
          activeProfileId: mockProfiles[0].id 
        } 
      });
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_ERROR', 
        payload: (error as Error).message || 'Login failed' 
      });
    }
  }, []);

  // Logout function
  const logout = React.useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Switch profile
  const switchProfile = React.useCallback((profileId: string) => {
    dispatch({ type: 'SWITCH_PROFILE', payload: profileId });
  }, []);

  // Update profile
  const updateProfile = React.useCallback((profile: UserProfile) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: profile });
  }, []);

  // Set preference for active profile
  const setPreference = React.useCallback(<K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    if (state.activeProfileId) {
      dispatch({ 
        type: 'SET_USER_PREFERENCE', 
        payload: { 
          profileId: state.activeProfileId, 
          key, 
          value 
        } 
      });
    }
  }, [state.activeProfileId]);

  // Get active profile
  const getActiveProfile = React.useCallback(() => {
    if (!state.activeProfileId) return null;
    return state.profiles.find(profile => profile.id === state.activeProfileId) || null;
  }, [state.profiles, state.activeProfileId]);

  // Persist state to localStorage
  useEffect(() => {
    if (state.isAuthenticated) {
      localStorage.setItem('userState', JSON.stringify(state));
    }
  }, [state]);

  // Context value
  const contextValue: UserContextType = {
    state,
    dispatch,
    login,
    logout,
    switchProfile,
    updateProfile,
    setPreference,
    getActiveProfile
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext; 