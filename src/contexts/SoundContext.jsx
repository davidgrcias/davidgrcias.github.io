import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

/**
 * Sound Context — Futuristic WebOS Sound Engine
 * Clean, warm, Apple-inspired synthesized sounds using Web Audio API
 * Zero file dependencies — all sounds generated in real-time
 */
const SoundContext = createContext(null);

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('webos-sounds-enabled');
    return saved !== 'false';
  });

  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('webos-sounds-volume');
    return saved ? parseInt(saved) : 50;
  });

  const audioContextRef = useRef(null);
  const compressorRef = useRef(null);
  const lastSoundTimeRef = useRef({});

  // Initialize Web Audio API with master compressor
  const getContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      audioContextRef.current = new AudioCtx();
      // Master compressor prevents clipping
      const compressor = audioContextRef.current.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, audioContextRef.current.currentTime);
      compressor.knee.setValueAtTime(30, audioContextRef.current.currentTime);
      compressor.ratio.setValueAtTime(12, audioContextRef.current.currentTime);
      compressor.attack.setValueAtTime(0.003, audioContextRef.current.currentTime);
      compressor.release.setValueAtTime(0.25, audioContextRef.current.currentTime);
      compressor.connect(audioContextRef.current.destination);
      compressorRef.current = compressor;
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const getMaster = useCallback(() => {
    return compressorRef.current || (getContext() && compressorRef.current);
  }, [getContext]);

  // Save settings
  useEffect(() => {
    localStorage.setItem('webos-sounds-enabled', soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('webos-sounds-volume', volume.toString());
  }, [volume]);

  // Throttle helper — prevents the same sound from firing too fast
  const canPlay = useCallback((soundId, minIntervalMs = 30) => {
    const now = Date.now();
    const last = lastSoundTimeRef.current[soundId] || 0;
    if (now - last < minIntervalMs) return false;
    lastSoundTimeRef.current[soundId] = now;
    return true;
  }, []);

  // ─── Core Synthesis Helpers ─────────────────────────────────────

  // Calculate gain from volume setting. Scale controls relative loudness.
  const vol = useCallback((scale = 1) => {
    return (volume / 100) * 0.25 * scale; // Max ~25% for comfort
  }, [volume]);

  /**
   * Play a clean tone with smooth ADSR envelope
   * @param {number} freq - Frequency in Hz
   * @param {object} opts - { duration, type, attack, decay, sustain, release, scale, detune }
   */
  const playTone = useCallback((freq, opts = {}) => {
    if (!soundEnabled) return;
    const ctx = getContext();
    const master = getMaster();
    if (!ctx || !master) return;

    const {
      duration = 0.1,
      type = 'sine',
      attack = 0.005,
      decay = 0.03,
      sustain = 0.6,
      release = 0.06,
      scale = 1,
      detune = 0,
    } = opts;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (detune) osc.detune.setValueAtTime(detune, t);

      // ADSR envelope
      const peakVol = vol(scale);
      const sustainVol = peakVol * sustain;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(peakVol, t + attack);
      gain.gain.linearRampToValueAtTime(sustainVol, t + attack + decay);
      gain.gain.setValueAtTime(sustainVol, t + duration - release);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + duration + 0.01);
    } catch (e) {
      // Silently ignore audio errors
    }
  }, [soundEnabled, getContext, getMaster, vol]);

  /**
   * Play a frequency sweep (rising or falling tone)
   */
  const playSweep = useCallback((startFreq, endFreq, opts = {}) => {
    if (!soundEnabled) return;
    const ctx = getContext();
    const master = getMaster();
    if (!ctx || !master) return;

    const {
      duration = 0.12,
      type = 'sine',
      attack = 0.005,
      scale = 1,
    } = opts;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);

      const peakVol = vol(scale);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(peakVol, t + attack);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + duration + 0.01);
    } catch (e) {
      // Silently ignore
    }
  }, [soundEnabled, getContext, getMaster, vol]);

  /**
   * Play a sequence of notes (arpeggio / chime)
   * @param {Array} notes - Array of { freq, delay?, duration?, type?, scale? }
   */
  const playChime = useCallback((notes, baseOpts = {}) => {
    if (!soundEnabled) return;
    const ctx = getContext();
    const master = getMaster();
    if (!ctx || !master) return;

    const { scale = 1, type = 'sine' } = baseOpts;

    try {
      const t = ctx.currentTime;
      notes.forEach(({ freq, delay = 0, duration = 0.15, noteScale, noteType }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = noteType || type;
        osc.frequency.setValueAtTime(freq, t + delay);

        const peakVol = vol(noteScale || scale);
        gain.gain.setValueAtTime(0.001, t + delay);
        gain.gain.linearRampToValueAtTime(peakVol, t + delay + 0.008);
        gain.gain.setValueAtTime(peakVol * 0.7, t + delay + duration * 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + duration);

        osc.connect(gain);
        gain.connect(master);
        osc.start(t + delay);
        osc.stop(t + delay + duration + 0.01);
      });
    } catch (e) {
      // Silently ignore
    }
  }, [soundEnabled, getContext, getMaster, vol]);

  // ─── SYSTEM SOUNDS ──────────────────────────────────────────────

  /** Boot chime — warm ascending C-E-G-C arpeggio with gentle shimmer */
  const playBootChime = useCallback(() => {
    if (!canPlay('boot', 2000)) return;
    playChime([
      { freq: 523.25, delay: 0, duration: 0.28 },       // C5
      { freq: 659.25, delay: 0.09, duration: 0.25 },    // E5
      { freq: 783.99, delay: 0.18, duration: 0.25 },    // G5
      { freq: 1046.50, delay: 0.28, duration: 0.40 },   // C6 — held longer
    ], { scale: 0.9 });
    // Add a subtle high shimmer overtone
    setTimeout(() => {
      playTone(2093, { duration: 0.5, scale: 0.15, attack: 0.1, sustain: 0.3, release: 0.3 });
    }, 280);
  }, [playChime, playTone, canPlay]);

  /** Shutdown — descending G-E-C with lowpass-like fade */
  const playShutdown = useCallback(() => {
    if (!canPlay('shutdown', 2000)) return;
    playChime([
      { freq: 783.99, delay: 0, duration: 0.22 },       // G5
      { freq: 659.25, delay: 0.10, duration: 0.22 },    // E5
      { freq: 523.25, delay: 0.20, duration: 0.35 },    // C5
      { freq: 261.63, delay: 0.35, duration: 0.50 },    // C4 — low fading note
    ], { scale: 0.7 });
  }, [playChime, canPlay]);

  /** Restart — quick descend then silence */
  const playRestart = useCallback(() => {
    if (!canPlay('restart', 2000)) return;
    playChime([
      { freq: 659.25, delay: 0, duration: 0.12 },       // E5
      { freq: 523.25, delay: 0.06, duration: 0.12 },    // C5
      { freq: 392.00, delay: 0.12, duration: 0.18 },    // G4
    ], { scale: 0.65 });
  }, [playChime, canPlay]);

  /** Sleep — soft, dreamy descending two notes */
  const playSleep = useCallback(() => {
    if (!canPlay('sleep', 2000)) return;
    playChime([
      { freq: 523.25, delay: 0, duration: 0.30 },       // C5
      { freq: 392.00, delay: 0.15, duration: 0.45 },    // G4 — long fade
    ], { scale: 0.5 });
  }, [playChime, canPlay]);

  /** Unlock — bright ascending C-E-G with shimmer */
  const playUnlock = useCallback(() => {
    if (!canPlay('unlock', 500)) return;
    playChime([
      { freq: 523.25, delay: 0, duration: 0.14 },       // C5
      { freq: 659.25, delay: 0.07, duration: 0.14 },    // E5
      { freq: 783.99, delay: 0.14, duration: 0.20 },    // G5
    ], { scale: 0.75 });
  }, [playChime, canPlay]);

  // ─── WINDOW MANAGEMENT SOUNDS ──────────────────────────────────

  /** Window open — smooth rising sweep */
  const playWindowOpen = useCallback(() => {
    if (!canPlay('wopen', 50)) return;
    playSweep(440, 880, { duration: 0.12, scale: 0.6 });
  }, [playSweep, canPlay]);

  /** Window close — smooth falling sweep */
  const playWindowClose = useCallback(() => {
    if (!canPlay('wclose', 50)) return;
    playSweep(660, 330, { duration: 0.10, scale: 0.55 });
  }, [playSweep, canPlay]);

  /** Window minimize — quick soft downward glide */
  const playWindowMinimize = useCallback(() => {
    if (!canPlay('wmin', 50)) return;
    playSweep(600, 350, { duration: 0.08, scale: 0.45 });
  }, [playSweep, canPlay]);

  /** Window maximize — quick upward expansion */
  const playWindowMaximize = useCallback(() => {
    if (!canPlay('wmax', 50)) return;
    playSweep(400, 700, { duration: 0.09, scale: 0.45 });
  }, [playSweep, canPlay]);

  /** Window snap — short crisp magnetic click */
  const playWindowSnap = useCallback(() => {
    if (!canPlay('wsnap', 50)) return;
    playTone(1200, { duration: 0.04, scale: 0.35, attack: 0.001, decay: 0.01, release: 0.02 });
  }, [playTone, canPlay]);

  /** Window focus — very subtle soft blip */
  const playWindowFocus = useCallback(() => {
    if (!canPlay('wfocus', 80)) return;
    playTone(880, { duration: 0.04, scale: 0.2, attack: 0.003, decay: 0.01, release: 0.02 });
  }, [playTone, canPlay]);

  // ─── UI INTERACTION SOUNDS ─────────────────────────────────────

  /** Click — clean, short, warm click */
  const playClick = useCallback(() => {
    if (!canPlay('click', 30)) return;
    playTone(1000, { duration: 0.05, scale: 0.45, attack: 0.002, decay: 0.015, sustain: 0.3, release: 0.02 });
  }, [playTone, canPlay]);

  /** Right-click — slightly deeper resonant click */
  const playRightClick = useCallback(() => {
    if (!canPlay('rclick', 50)) return;
    playTone(700, { duration: 0.06, scale: 0.4, attack: 0.002, decay: 0.02, sustain: 0.35, release: 0.025 });
  }, [playTone, canPlay]);

  /** Toggle on — ascending two-note chirp */
  const playToggleOn = useCallback(() => {
    if (!canPlay('toggleon', 80)) return;
    playChime([
      { freq: 523.25, delay: 0, duration: 0.06 },       // C5
      { freq: 659.25, delay: 0.045, duration: 0.08 },   // E5
    ], { scale: 0.45 });
  }, [playChime, canPlay]);

  /** Toggle off — descending two-note chirp */
  const playToggleOff = useCallback(() => {
    if (!canPlay('toggleoff', 80)) return;
    playChime([
      { freq: 659.25, delay: 0, duration: 0.06 },       // E5
      { freq: 523.25, delay: 0.045, duration: 0.08 },   // C5
    ], { scale: 0.45 });
  }, [playChime, canPlay]);

  /** Slider tick — tiny granular tick */
  const playSliderTick = useCallback(() => {
    if (!canPlay('tick', 50)) return;
    playTone(1800, { duration: 0.02, scale: 0.15, attack: 0.001, decay: 0.005, release: 0.01 });
  }, [playTone, canPlay]);

  // ─── NAVIGATION SOUNDS ─────────────────────────────────────────

  /** Menu open — soft reveal swoosh */
  const playMenuOpen = useCallback(() => {
    if (!canPlay('mopen', 80)) return;
    playSweep(500, 800, { duration: 0.10, scale: 0.35 });
  }, [playSweep, canPlay]);

  /** Menu close — reverse swoosh */
  const playMenuClose = useCallback(() => {
    if (!canPlay('mclose', 80)) return;
    playSweep(700, 400, { duration: 0.08, scale: 0.3 });
  }, [playSweep, canPlay]);

  /** Menu select — gentle confirmation blip */
  const playMenuSelect = useCallback(() => {
    if (!canPlay('mselect', 30)) return;
    playTone(880, { duration: 0.05, scale: 0.35, attack: 0.002, decay: 0.01, release: 0.025 });
  }, [playTone, canPlay]);

  /** Search / Command Palette open — ethereal ping */
  const playSearchOpen = useCallback(() => {
    if (!canPlay('search', 100)) return;
    playChime([
      { freq: 880, delay: 0, duration: 0.12 },
      { freq: 1318.51, delay: 0.04, duration: 0.15, noteScale: 0.2 }, // E6 shimmer
    ], { scale: 0.4 });
  }, [playChime, canPlay]);

  /** Tab switch — quick soft toggle */
  const playTabSwitch = useCallback(() => {
    if (!canPlay('tab', 50)) return;
    playTone(750, { duration: 0.04, scale: 0.3, attack: 0.002, decay: 0.01, release: 0.02 });
  }, [playTone, canPlay]);

  // ─── NOTIFICATION SOUNDS ───────────────────────────────────────

  /** Notification chime — pleasant two-tone */
  const playNotification = useCallback(() => {
    if (!canPlay('notif', 300)) return;
    playChime([
      { freq: 830.61, delay: 0, duration: 0.14 },       // Ab5
      { freq: 1108.73, delay: 0.12, duration: 0.18 },   // Db6
    ], { scale: 0.6 });
  }, [playChime, canPlay]);

  /** Error — gentle but noticeable warning tone */
  const playError = useCallback(() => {
    if (!canPlay('error', 300)) return;
    playChime([
      { freq: 440, delay: 0, duration: 0.12 },          // A4
      { freq: 349.23, delay: 0.10, duration: 0.18 },    // F4
    ], { scale: 0.55 });
  }, [playChime, canPlay]);

  /** Achievement — triumphant ascending fanfare */
  const playAchievement = useCallback(() => {
    if (!canPlay('achieve', 500)) return;
    playChime([
      { freq: 523.25, delay: 0, duration: 0.12 },       // C5
      { freq: 659.25, delay: 0.08, duration: 0.12 },    // E5
      { freq: 783.99, delay: 0.16, duration: 0.12 },    // G5
      { freq: 1046.50, delay: 0.24, duration: 0.35 },   // C6
    ], { scale: 0.7 });
  }, [playChime, canPlay]);

  /** Screenshot shutter — synthesized camera click */
  const playScreenshot = useCallback(() => {
    if (!canPlay('screenshot', 200)) return;
    // Simulate mechanical shutter with short noise burst + click
    const ctx = getContext();
    const master = getMaster();
    if (!ctx || !master) return;

    try {
      const t = ctx.currentTime;
      // White noise burst for shutter texture
      const bufferSize = ctx.sampleRate * 0.03;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseGain = ctx.createGain();
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(3000, t);
      noiseFilter.Q.setValueAtTime(1.5, t);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);

      const nVol = vol(0.5);
      noiseGain.gain.setValueAtTime(nVol, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      noise.start(t);
      noise.stop(t + 0.04);

      // Add a sharp click
      const osc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1500, t);

      const cVol = vol(0.3);
      clickGain.gain.setValueAtTime(cVol, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

      osc.connect(clickGain);
      clickGain.connect(master);
      osc.start(t);
      osc.stop(t + 0.03);
    } catch (e) {
      // Silently ignore
    }
  }, [soundEnabled, getContext, getMaster, vol, canPlay]);

  // ─── EASTER EGG SOUNDS ─────────────────────────────────────────

  /** Easter egg discovery — magical jingle */
  const playEasterEgg = useCallback(() => {
    if (!canPlay('easter', 500)) return;
    playChime([
      { freq: 659.25, delay: 0, duration: 0.10 },       // E5
      { freq: 783.99, delay: 0.06, duration: 0.10 },    // G5
      { freq: 987.77, delay: 0.12, duration: 0.10 },    // B5
      { freq: 1174.66, delay: 0.18, duration: 0.10 },   // D6
      { freq: 1318.51, delay: 0.24, duration: 0.25 },   // E6
    ], { scale: 0.55 });
  }, [playChime, canPlay]);

  /** Game sounds — simple retro-inspired effects */
  const playGameSound = useCallback((type) => {
    if (!canPlay(`game_${type}`, 30)) return;
    switch (type) {
      case 'eat':
        playTone(880, { duration: 0.06, scale: 0.35, attack: 0.001, release: 0.02 });
        break;
      case 'die':
        playSweep(440, 110, { duration: 0.25, scale: 0.4 });
        break;
      case 'turn':
        playTone(660, { duration: 0.03, scale: 0.15, attack: 0.001, release: 0.01 });
        break;
      default:
        break;
    }
  }, [playTone, playSweep, canPlay]);

  // ─── BACKWARD COMPATIBILITY ALIASES ─────────────────────────────
  // Old API names map to new specific sounds
  const playOpen = playWindowOpen;
  const playClose = playWindowClose;

  // ─── CONTEXT VALUE ──────────────────────────────────────────────

  const contextValue = {
    // Settings
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,

    // System sounds
    playBootChime,
    playShutdown,
    playRestart,
    playSleep,
    playUnlock,

    // Window management
    playWindowOpen,
    playWindowClose,
    playWindowMinimize,
    playWindowMaximize,
    playWindowSnap,
    playWindowFocus,

    // UI interaction
    playClick,
    playRightClick,
    playToggleOn,
    playToggleOff,
    playSliderTick,

    // Navigation
    playMenuOpen,
    playMenuClose,
    playMenuSelect,
    playSearchOpen,
    playTabSwitch,

    // Notifications
    playNotification,
    playError,
    playAchievement,
    playScreenshot,

    // Easter eggs
    playEasterEgg,
    playGameSound,

    // Backward compatibility
    playOpen,
    playClose,
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
