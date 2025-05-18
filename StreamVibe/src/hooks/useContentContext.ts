import { useContext } from 'react';
import ContentContext from '../context/ContentContext';

/**
 * Custom hook for accessing the ContentContext
 * 
 * This hook provides access to content-related state and functions like:
 * - content items and categories
 * - favorite management
 * - progress tracking
 * - content fetching
 * 
 * @returns The ContentContext value
 */
export const useContentContext = () => useContext(ContentContext);

export default useContentContext; 