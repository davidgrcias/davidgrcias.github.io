import { useCallback, useRef, useEffect } from 'react';

/**
 * Sound effects system for WebOS
 * Uses preloaded HTML5 Audio for reliable playback
 */

export const useSoundEffects = () => {
  const soundsRef = useRef({});
  const soundsEnabledRef = useRef(true);

  useEffect(() => {
    // Check localStorage for sound preference
    const savedPref = localStorage.getItem('os-sounds-enabled');
    soundsEnabledRef.current = savedPref !== 'false';

    // Preload sounds
    const soundFiles = {
      click: '/sounds/click.mp3',
      open: '/sounds/open.mp3',
      close: '/sounds/close.mp3',
      minimize: '/sounds/minimize.mp3',
      notification: '/sounds/notification.mp3',
      startup: '/sounds/startup.mp3',
      error: '/sounds/error.mp3',
      trash: '/sounds/trash.mp3',
    };

    Object.entries(soundFiles).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.volume = 0.4;
      audio.preload = 'auto'; // Force preload
      soundsRef.current[key] = audio;

      // Optional: Trigger a load
      audio.load();
    });

    // Cleanup
    return () => {
      soundsRef.current = {};
    };
  }, []);

  const playSound = useCallback((soundName, volume = 0.5) => {
    if (!soundsEnabledRef.current) return;

    const audio = soundsRef.current[soundName];
    if (audio) {
      // Clone node for overlapping sounds (rapid clicks) 
      // OR simpler: just reset currentTime. Resetting is lighter.
      try {
        audio.currentTime = 0;
        audio.volume = volume;
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            // Auto-play might be blocked until user interaction
            // Just ignore to prevent console spam
          });
        }
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  // Toggle or explicitly set sound enabled state
  const setSoundsEnabled = useCallback((enabled) => {
    // If no argument, toggle. If argument provided, set to that value.
    const newValue = enabled !== undefined ? enabled : !soundsEnabledRef.current;
    soundsEnabledRef.current = newValue;
    localStorage.setItem('os-sounds-enabled', newValue);
    return newValue;
  }, []);

  const isSoundEnabled = useCallback(() => {
    return soundsEnabledRef.current;
  }, []);

  return {
    playSound,
    toggleSounds: setSoundsEnabled, // Backward compatible alias
    setSoundsEnabled,
    isSoundEnabled,
  };
};

export default useSoundEffects;
