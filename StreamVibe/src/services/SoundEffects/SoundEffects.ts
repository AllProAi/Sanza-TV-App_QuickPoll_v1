import { Howl } from 'howler';
import { SoundType } from '../../types/sounds';
import type { SoundOptions } from '../../types/sounds';

// Sound effect service class
class SoundEffectService {
  private sounds: Record<SoundType, Howl>;
  private enabled: boolean;
  private volume: number;
  private currentAmbient: Howl | null;
  
  constructor() {
    // Initialize with default sounds
    this.sounds = {
      [SoundType.NAVIGATION]: new Howl({ src: ['/sounds/navigation.mp3'], volume: 0.3 }),
      [SoundType.SELECT]: new Howl({ src: ['/sounds/select.mp3'], volume: 0.5 }),
      [SoundType.BACK]: new Howl({ src: ['/sounds/back.mp3'], volume: 0.4 }),
      [SoundType.ERROR]: new Howl({ src: ['/sounds/error.mp3'], volume: 0.5 }),
      [SoundType.SUCCESS]: new Howl({ src: ['/sounds/success.mp3'], volume: 0.5 }),
      [SoundType.HOVER]: new Howl({ src: ['/sounds/hover.mp3'], volume: 0.2 }),
      [SoundType.AMBIENT]: new Howl({ src: ['/sounds/ambient.mp3'], volume: 0.1, loop: true }),
    };
    
    // Try to get stored preferences
    try {
      const storedSettings = localStorage.getItem('streamvibe-sound-settings');
      const settings = storedSettings ? JSON.parse(storedSettings) : null;
      
      this.enabled = settings?.enabled ?? true;
      this.volume = settings?.volume ?? 0.5;
    } catch (error) {
      console.error('Error loading sound settings:', error);
      this.enabled = true;
      this.volume = 0.5;
    }
    
    this.currentAmbient = null;
  }
  
  // Play a specific sound
  play(type: SoundType, options: SoundOptions = {}): void {
    if (!this.enabled) return;
    
    const sound = this.sounds[type];
    if (!sound) return;
    
    const volume = options.volume !== undefined ? options.volume : this.volume;
    sound.volume(volume);
    
    if (options.rate !== undefined) {
      sound.rate(options.rate);
    }
    
    if (options.loop !== undefined) {
      sound.loop(options.loop);
    }
    
    sound.play();
  }
  
  // Stop a specific sound
  stop(type: SoundType): void {
    const sound = this.sounds[type];
    if (sound) {
      sound.stop();
    }
  }
  
  // Play ambient background sound
  playAmbient(src?: string, options: SoundOptions = {}): void {
    if (!this.enabled) return;
    
    // Stop current ambient if playing
    this.stopAmbient();
    
    // Use custom ambient sound if provided
    if (src) {
      this.currentAmbient = new Howl({
        src: [src],
        loop: options.loop !== undefined ? options.loop : true,
        volume: options.volume !== undefined ? options.volume : this.volume * 0.2,
      });
      this.currentAmbient.play();
    } else {
      // Use default ambient
      this.play(SoundType.AMBIENT, { ...options, loop: true });
      this.currentAmbient = this.sounds[SoundType.AMBIENT];
    }
  }
  
  // Stop ambient sound
  stopAmbient(): void {
    if (this.currentAmbient) {
      this.currentAmbient.stop();
      this.currentAmbient = null;
    }
  }
  
  // Enable/disable all sounds
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.saveSettings();
    
    // Stop ambient sound when disabled
    if (!enabled && this.currentAmbient) {
      this.stopAmbient();
    }
  }
  
  // Check if sounds are enabled
  isEnabled(): boolean {
    return this.enabled;
  }
  
  // Set volume for all sounds
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
    
    // Update volume for ambient if playing
    if (this.currentAmbient) {
      this.currentAmbient.volume(this.volume * 0.2);
    }
  }
  
  // Get current volume
  getVolume(): number {
    return this.volume;
  }
  
  // Replace or add a custom sound
  registerSound(type: SoundType, src: string | string[], options: SoundOptions = {}): void {
    this.sounds[type] = new Howl({
      src: Array.isArray(src) ? src : [src],
      volume: options.volume !== undefined ? options.volume : this.volume,
      loop: options.loop !== undefined ? options.loop : false,
      rate: options.rate !== undefined ? options.rate : 1,
    });
  }
  
  // Save settings to localStorage
  private saveSettings(): void {
    try {
      localStorage.setItem('streamvibe-sound-settings', JSON.stringify({
        enabled: this.enabled,
        volume: this.volume,
      }));
    } catch (error) {
      console.error('Error saving sound settings:', error);
    }
  }
}

// Create singleton instance
const soundEffectService = new SoundEffectService();
export default soundEffectService; 