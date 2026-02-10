/**
 * Voice Feedback System
 * Provides audio/visual feedback during voice interactions
 */

// Sound effects (using Web Audio API)
class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.3;
  }
  
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }
  
  playTone(frequency, duration, type = 'sine') {
    if (!this.enabled) return;
    
    this.init();
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }
  
  start() {
    // Start listening sound - ascending tone
    this.playTone(400, 0.1);
    setTimeout(() => this.playTone(600, 0.1), 100);
  }
  
  success() {
    // Success sound - happy beep
    this.playTone(800, 0.1);
    setTimeout(() => this.playTone(1000, 0.15), 100);
  }
  
  error() {
    // Error sound - sad beep
    this.playTone(300, 0.2, 'square');
  }
  
  processing() {
    // Processing sound - subtle pulse
    this.playTone(500, 0.05);
  }
  
  enable() {
    this.enabled = true;
  }
  
  disable() {
    this.enabled = false;
  }
  
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }
}

/**
 * Visual feedback manager
 */
export class VisualFeedback {
  constructor() {
    this.currentState = 'idle';
    this.transcription = '';
    this.listeners = new Set();
  }
  
  setState(state) {
    this.currentState = state;
    this.notify();
  }
  
  setTranscription(text) {
    this.transcription = text;
    this.notify();
  }
  
  getState() {
    return {
      state: this.currentState,
      transcription: this.transcription,
    };
  }
  
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  notify() {
    this.listeners.forEach(callback => callback(this.getState()));
  }
  
  // Trigger different visual states
  idle() {
    this.setState('idle');
  }
  
  listening() {
    this.setState('listening');
  }
  
  processing() {
    this.setState('processing');
  }
  
  speaking() {
    this.setState('speaking');
  }
  
  success() {
    this.setState('success');
    setTimeout(() => this.idle(), 2000);
  }
  
  error() {
    this.setState('error');
    setTimeout(() => this.idle(), 2000);
  }
}

/**
 * Voice Feedback System
 */
export class VoiceFeedback {
  constructor(options = {}) {
    this.soundEffects = new SoundEffects();
    this.visualFeedback = new VisualFeedback();
    this.enabled = options.enabled !== false;
    this.soundEnabled = options.soundEnabled !== false;
    this.visualEnabled = options.visualEnabled !== false;
  }
  
  // Start listening feedback
  onStart() {
    if (this.soundEnabled) {
      this.soundEffects.start();
    }
    if (this.visualEnabled) {
      this.visualFeedback.listening();
    }
  }
  
  // Transcription update feedback
  onTranscription(text) {
    if (this.visualEnabled) {
      this.visualFeedback.setTranscription(text);
    }
  }
  
  // Processing command feedback
  onProcessing() {
    if (this.soundEnabled) {
      this.soundEffects.processing();
    }
    if (this.visualEnabled) {
      this.visualFeedback.processing();
    }
  }
  
  // Success feedback
  onSuccess(response) {
    if (this.soundEnabled) {
      this.soundEffects.success();
    }
    if (this.visualEnabled) {
      this.visualFeedback.success();
    }
    
    // Show toast notification
    this.showToast(response.text, 'success');
  }
  
  // Error feedback
  onError(error) {
    if (this.soundEnabled) {
      this.soundEffects.error();
    }
    if (this.visualEnabled) {
      this.visualFeedback.error();
    }
    
    // Show toast notification
    this.showToast(error.text || error.message || 'Command failed', 'error');
  }
  
  // Speaking feedback (for TTS)
  onSpeaking() {
    if (this.visualEnabled) {
      this.visualFeedback.speaking();
    }
  }
  
  // Idle feedback
  onIdle() {
    if (this.visualEnabled) {
      this.visualFeedback.idle();
    }
  }
  
  // Toast notification
  showToast(message, type = 'info') {
    const event = new CustomEvent('voice-toast', {
      detail: { message, type },
    });
    document.dispatchEvent(event);
  }
  
  // Subscribe to visual feedback changes
  subscribe(callback) {
    return this.visualFeedback.subscribe(callback);
  }
  
  // Get current state
  getState() {
    return this.visualFeedback.getState();
  }
  
  // Enable/disable features
  enableSound() {
    this.soundEnabled = true;
    this.soundEffects.enable();
  }
  
  disableSound() {
    this.soundEnabled = false;
    this.soundEffects.disable();
  }
  
  enableVisual() {
    this.visualEnabled = true;
  }
  
  disableVisual() {
    this.visualEnabled = false;
  }
  
  enable() {
    this.enabled = true;
    this.enableSound();
    this.enableVisual();
  }
  
  disable() {
    this.enabled = false;
    this.disableSound();
    this.disableVisual();
  }
  
  setVolume(volume) {
    this.soundEffects.setVolume(volume);
  }
}

/**
 * Create haptic feedback (for mobile)
 */
export function hapticFeedback(type = 'light') {
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate(50);
        break;
      case 'success':
        navigator.vibrate([10, 50, 10]);
        break;
      case 'error':
        navigator.vibrate([50, 100, 50]);
        break;
      default:
        navigator.vibrate(10);
    }
  }
}

/**
 * Animation helpers for visual feedback
 */
export const animations = {
  pulse: (element, duration = 1000) => {
    if (!element) return;
    
    element.style.animation = `pulse ${duration}ms ease-in-out`;
    setTimeout(() => {
      element.style.animation = '';
    }, duration);
  },
  
  ripple: (element, x, y) => {
    if (!element) return;
    
    const ripple = document.createElement('div');
    ripple.className = 'voice-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  },
  
  wave: (element) => {
    if (!element) return;
    
    element.style.animation = 'wave 2s ease-in-out infinite';
  },
  
  stopWave: (element) => {
    if (!element) return;
    
    element.style.animation = '';
  },
};

/**
 * Loading indicator
 */
export class LoadingIndicator {
  constructor() {
    this.dots = 0;
    this.interval = null;
  }
  
  start(callback) {
    this.dots = 0;
    this.interval = setInterval(() => {
      this.dots = (this.dots + 1) % 4;
      const text = 'Processing' + '.'.repeat(this.dots);
      if (callback) callback(text);
    }, 500);
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

/**
 * Confidence indicator
 */
export function getConfidenceColor(confidence) {
  if (confidence >= 0.9) return '#22c55e'; // green
  if (confidence >= 0.7) return '#eab308'; // yellow
  if (confidence >= 0.5) return '#f97316'; // orange
  return '#ef4444'; // red
}

export function getConfidenceLabel(confidence) {
  if (confidence >= 0.9) return 'Very confident';
  if (confidence >= 0.7) return 'Confident';
  if (confidence >= 0.5) return 'Uncertain';
  return 'Low confidence';
}

/**
 * Create feedback instance
 */
export function createVoiceFeedback(options) {
  return new VoiceFeedback(options);
}

export default {
  VoiceFeedback,
  VisualFeedback,
  SoundEffects,
  createVoiceFeedback,
  hapticFeedback,
  animations,
  LoadingIndicator,
  getConfidenceColor,
  getConfidenceLabel,
};
