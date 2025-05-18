import { useContext } from 'react';
import AppContext from '../context/AppContext';

/**
 * Custom hook for accessing the AppContext
 * 
 * This hook provides access to application-wide state and functions like:
 * - dark mode toggling
 * - loading state
 * - online status
 * - debug mode
 * 
 * @returns The AppContext value
 */
export const useAppContext = () => useContext(AppContext);

export default useAppContext; 