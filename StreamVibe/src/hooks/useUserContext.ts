import { useContext } from 'react';
import UserContext from '../context/UserContext';

/**
 * Custom hook for accessing the UserContext
 * 
 * This hook provides access to user-related state and functions like:
 * - authentication status
 * - user profiles
 * - preferences management 
 * - profile switching
 * 
 * @returns The UserContext value
 */
export const useUserContext = () => useContext(UserContext);

export default useUserContext; 