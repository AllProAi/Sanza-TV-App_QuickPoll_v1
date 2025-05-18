import { useContext } from 'react';
import { AnimationContext, type AnimationContextType } from '../context/animation-context';

/**
 * Hook to access animation settings
 * @returns Animation context values including enabled state and configurations
 */
export const useAnimation = (): AnimationContextType => {
  const context = useContext(AnimationContext);
  
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  
  return context;
};

export default useAnimation; 