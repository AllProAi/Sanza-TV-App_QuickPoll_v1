import { useCallback } from 'react';
import soundEffectService from '../services/SoundEffects/SoundEffects';
import { SoundType } from '../types/sounds';
import type { SoundOptions } from '../types/sounds';

interface SoundEffectsHook {
  playSound: (type: SoundType, options?: SoundOptions) => void;
  stopSound: (type: SoundType) => void;
  playAmbient: (src?: string, options?: SoundOptions) => void;
  stopAmbient: () => void;
  isEnabled: () => boolean;
  setEnabled: (enabled: boolean) => void;
  getVolume: () => number;
  setVolume: (volume: number) => void;
}

/**
 * Hook for using sound effects in components
 */
export const useSoundEffects = (): SoundEffectsHook => {
  // Wrap service methods in useCallback to maintain reference stability
  const playSound = useCallback((type: SoundType, options = {}) => {
    soundEffectService.play(type, options);
  }, []);
  
  const stopSound = useCallback((type: SoundType) => {
    soundEffectService.stop(type);
  }, []);
  
  const playAmbient = useCallback((src?: string, options = {}) => {
    soundEffectService.playAmbient(src, options);
  }, []);
  
  const stopAmbient = useCallback(() => {
    soundEffectService.stopAmbient();
  }, []);
  
  const isEnabled = useCallback(() => {
    return soundEffectService.isEnabled();
  }, []);
  
  const setEnabled = useCallback((enabled: boolean) => {
    soundEffectService.setEnabled(enabled);
  }, []);
  
  const getVolume = useCallback(() => {
    return soundEffectService.getVolume();
  }, []);
  
  const setVolume = useCallback((volume: number) => {
    soundEffectService.setVolume(volume);
  }, []);
  
  return {
    playSound,
    stopSound,
    playAmbient,
    stopAmbient,
    isEnabled,
    setEnabled,
    getVolume,
    setVolume,
  };
};

export default useSoundEffects; 