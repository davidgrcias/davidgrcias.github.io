import { useCallback, useRef, useEffect } from 'react';

/**
 * Sound effects system for WebOS
 * Uses Web Audio API for efficient sound playback
 */

// Sound data URLs (ultra-lightweight base64 encoded sounds)
const SOUNDS = {
  click: 'data:audio/wav;base64,UklGRhwAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
  // We'll add more sounds later or use external files
};

export const useSoundEffects = () => {
  const audioContextRef = useRef(null);
  const soundsEnabledRef = useRef(true);
  const soundBuffersRef = useRef({});

  useEffect(() => {
    // Check localStorage for sound preference
    const savedPref = localStorage.getItem('os-sounds-enabled');
    soundsEnabledRef.current = savedPref !== 'false';

    // Initialize Web Audio Context on first user interaction
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
    };

    // Initialize on first click
    document.addEventListener('click', initAudioContext, { once: true });

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playSound = useCallback((soundName, volume = 0.3) => {
    if (!soundsEnabledRef.current || !audioContextRef.current) return;

    try {
      const audioContext = audioContextRef.current;
      
      // Create oscillator for simple beep (temporary until we add real sounds)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different sounds
      const frequencies = {
        click: 800,
        open: 600,
        close: 400,
        minimize: 500,
        error: 300,
        notification: 700,
      };
      
      oscillator.frequency.value = frequencies[soundName] || 500;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }, []);

  const toggleSounds = useCallback(() => {
    soundsEnabledRef.current = !soundsEnabledRef.current;
    localStorage.setItem('os-sounds-enabled', soundsEnabledRef.current);
    return soundsEnabledRef.current;
  }, []);

  const isSoundEnabled = useCallback(() => {
    return soundsEnabledRef.current;
  }, []);

  return {
    playSound,
    toggleSounds,
    isSoundEnabled,
  };
};

export default useSoundEffects;
