import { useContext } from 'react';
import NavigationContext from '../context/NavigationContext';

// Create a custom hook for using the navigation context
export const useNavigation = () => useContext(NavigationContext);

export default useNavigation; 