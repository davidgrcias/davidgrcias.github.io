import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

/**
 * Sound Context
 * Manages system sounds for the WebOS
 * Provides sound effects for various UI interactions
 */
const SoundContext = createContext(null);

// Base64 encoded tiny sound effects (so we don't need external files)
// These are very short beep-like sounds
const SOUND_DATA = {
  // Short click sound
  click: 'data:audio/wav;base64,UklGRl9vT19teleXBhdmVmbXQgEAAAABAAEAESsAACJWAAACABAAZGF0YTtvT19',
  // Window open whoosh
  open: 'data:audio/wav;base64,UklGRl9vT19teleXBhdmVmbXQgEAAAABAAEAESsAACJWAAACABAAZGF0YTtvT19',
  // Window close
  close: 'data:audio/wav;base64,UklGRl9vT19teleXBhdmVmbXQgEAAAABAAEAESsAACJWAAACABAAZGF0YTtvT19',
  // Notification
  notification: 'data:audio/wav;base64,UklGRl9vT19teleXBhdmVmbXQgEAAAABAAEAESsAACJWAAACABAAZGF0YTtvT19',
  // Error
  error: 'data:audio/wav;base64,UklGRl9vT19teleXBhdmVmbXQgEAAAABAAEAESsAACJWAAACABAAZGF0YTtvT19',
};

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('webos-sounds-enabled');
    return saved !== 'false'; // Default to true
  });
  
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('webos-sounds-volume');
    return saved ? parseInt(saved) : 50;
  });

  const audioContextRef = useRef(null);

  // Initialize Web Audio API context
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('webos-sounds-enabled', soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('webos-sounds-volume', volume.toString());
  }, [volume]);

  // Generate a tone using Web Audio API
  const playTone = useCallback((frequency, duration, type = 'sine') => {
    if (!soundEnabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      
      // Resume context if suspended (Chrome autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Apply volume
      const vol = (volume / 100) * 0.3; // Max 30% to avoid loud sounds
      gainNode.gain.setValueAtTime(vol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }, [soundEnabled, volume]);

  // Sound effect functions
  const playClick = useCallback(() => {
    playTone(800, 0.05, 'sine');
  }, [playTone]);

  const playOpen = useCallback(() => {
    // Rising tone
    if (!soundEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);

    const vol = (volume / 100) * 0.2;
    gainNode.gain.setValueAtTime(vol, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }, [soundEnabled, volume]);

  const playClose = useCallback(() => {
    // Falling tone
    if (!soundEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);

    const vol = (volume / 100) * 0.2;
    gainNode.gain.setValueAtTime(vol, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }, [soundEnabled, volume]);

  const playNotification = useCallback(() => {
    // Two-tone notification
    if (!soundEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    [0, 0.15].forEach((delay, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(i === 0 ? 880 : 1100, ctx.currentTime + delay);

      const vol = (volume / 100) * 0.25;
      gainNode.gain.setValueAtTime(vol, ctx.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.12);

      oscillator.start(ctx.currentTime + delay);
      oscillator.stop(ctx.currentTime + delay + 0.12);
    });
  }, [soundEnabled, volume]);

  const playError = useCallback(() => {
    // Low buzzing error sound
    if (!soundEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);

    const vol = (volume / 100) * 0.15;
    gainNode.gain.setValueAtTime(vol, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  }, [soundEnabled, volume]);

  const playUnlock = useCallback(() => {
    // Pleasant unlock chime
    if (!soundEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

      const vol = (volume / 100) * 0.2;
      gainNode.gain.setValueAtTime(vol, ctx.currentTime + i * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.15);

      oscillator.start(ctx.currentTime + i * 0.08);
      oscillator.stop(ctx.currentTime + i * 0.08 + 0.15);
    });
  }, [soundEnabled, volume]);

  const contextValue = {
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    // Sound functions
    playClick,
    playOpen,
    playClose,
    playNotification,
    playError,
    playUnlock,
  };

  return (
    <SoundContext.Provider value={contextValue}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within SoundProvider');
  }
  return context;
};

export default SoundContext;
