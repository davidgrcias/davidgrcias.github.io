/**
 * Voice System Commands
 * Handles system-level operations like theme, volume, shutdown, etc.
 */

export function registerSystemVoiceCommands(registry, getContext) {
  // CHANGE_THEME
  registry.registerCommand({
    intent: 'CHANGE_THEME',
    patterns: [
      'change theme to {theme}',
      'set theme to {theme}',
      'switch to {theme} theme',
      'use {theme} mode',
      'apply {theme} theme',
      'enable {theme} theme',
      'turn on {theme} theme',
      'i want {theme} theme',
    ],
    examples: [
      'change theme to dark',
      'set theme to cyberpunk',
      'switch to light mode',
      'use dark mode',
    ],
    entities: {
      theme: { 
        type: 'string', 
        required: true,
        values: ['dark', 'light', 'cyberpunk', 'forest', 'ocean', 'sunset', 'nord', 'gruvbox', 'dracula', 'monokai'],
      },
    },
    category: 'system',
    description: 'Change the system theme',
    responses: {
      success: 'Theme changed to {theme}',
      error: 'Failed to change theme. Theme "{theme}" may not be available.',
    },
    async action(entities) {
      const { theme } = getContext();
      
      if (!entities.theme) {
        throw new Error('Theme name is required');
      }
      
      theme.setTheme(entities.theme);
      return { success: true, theme: entities.theme };
    },
  });

  // SET_VOLUME
  registry.registerCommand({
    intent: 'SET_VOLUME',
    patterns: [
      'set volume to {number}',
      'change volume to {number}',
      'volume {number}',
      'set sound to {number}',
      'adjust volume to {number}',
      'make volume {number}',
    ],
    examples: [
      'set volume to 50',
      'volume 75',
      'change volume to 30',
    ],
    entities: {
      number: { 
        type: 'number', 
        required: true,
        min: 0,
        max: 100,
      },
    },
    category: 'system',
    description: 'Set system volume level (0-100)',
    responses: {
      success: 'Volume set to {number}%',
      error: 'Failed to set volume. Please provide a number between 0 and 100.',
    },
    async action(entities) {
      const { sound } = getContext();
      
      const volume = Math.max(0, Math.min(100, entities.number));
      sound.setVolume(volume / 100);
      
      return { success: true, volume };
    },
  });

  // VOLUME_UP
  registry.registerCommand({
    intent: 'VOLUME_UP',
    patterns: [
      'volume up',
      'increase volume',
      'turn up volume',
      'louder',
      'raise volume',
      'boost volume',
      'make it louder',
    ],
    examples: [
      'volume up',
      'increase volume',
      'louder',
    ],
    category: 'system',
    description: 'Increase volume by 10%',
    responses: {
      success: 'Volume increased to {volume}%',
      error: 'Failed to increase volume',
    },
    async action(entities) {
      const { sound } = getContext();
      
      const currentVolume = sound.volume * 100;
      const newVolume = Math.min(100, currentVolume + 10);
      sound.setVolume(newVolume / 100);
      
      return { success: true, volume: Math.round(newVolume) };
    },
  });

  // VOLUME_DOWN
  registry.registerCommand({
    intent: 'VOLUME_DOWN',
    patterns: [
      'volume down',
      'decrease volume',
      'turn down volume',
      'quieter',
      'lower volume',
      'reduce volume',
      'make it quieter',
    ],
    examples: [
      'volume down',
      'decrease volume',
      'quieter',
    ],
    category: 'system',
    description: 'Decrease volume by 10%',
    responses: {
      success: 'Volume decreased to {volume}%',
      error: 'Failed to decrease volume',
    },
    async action(entities) {
      const { sound } = getContext();
      
      const currentVolume = sound.volume * 100;
      const newVolume = Math.max(0, currentVolume - 10);
      sound.setVolume(newVolume / 100);
      
      return { success: true, volume: Math.round(newVolume) };
    },
  });

  // MUTE
  registry.registerCommand({
    intent: 'MUTE',
    patterns: [
      'mute',
      'silence',
      'turn off sound',
      'disable sound',
      'mute sound',
      'shut up',
      'quiet',
    ],
    examples: [
      'mute',
      'silence',
      'turn off sound',
    ],
    category: 'system',
    description: 'Mute all sounds',
    responses: {
      success: 'Sound muted',
      error: 'Failed to mute sound',
    },
    async action(entities) {
      const { sound } = getContext();
      sound.setMuted(true);
      return { success: true, muted: true };
    },
  });

  // UNMUTE
  registry.registerCommand({
    intent: 'UNMUTE',
    patterns: [
      'unmute',
      'turn on sound',
      'enable sound',
      'restore sound',
      'sound on',
    ],
    examples: [
      'unmute',
      'turn on sound',
      'enable sound',
    ],
    category: 'system',
    description: 'Unmute sounds',
    responses: {
      success: 'Sound unmuted',
      error: 'Failed to unmute sound',
    },
    async action(entities) {
      const { sound } = getContext();
      sound.setMuted(false);
      return { success: true, muted: false };
    },
  });

  // TOGGLE_SOUND
  registry.registerCommand({
    intent: 'TOGGLE_SOUND',
    patterns: [
      'toggle sound',
      'toggle mute',
      'mute toggle',
      'sound toggle',
    ],
    examples: [
      'toggle sound',
      'toggle mute',
    ],
    category: 'system',
    description: 'Toggle sound on/off',
    responses: {
      success: 'Sound {status}',
      error: 'Failed to toggle sound',
    },
    async action(entities) {
      const { sound } = getContext();
      const newState = !sound.muted;
      sound.setMuted(newState);
      return { success: true, muted: newState, status: newState ? 'muted' : 'unmuted' };
    },
  });

  // SHUTDOWN
  registry.registerCommand({
    intent: 'SHUTDOWN',
    patterns: [
      'shutdown',
      'shut down',
      'power off',
      'turn off',
      'turn off system',
      'close everything',
      'exit system',
    ],
    examples: [
      'shutdown',
      'power off',
      'turn off system',
    ],
    category: 'system',
    description: 'Shutdown the system (close all apps)',
    responses: {
      success: 'Shutting down system...',
      error: 'Failed to shutdown system',
    },
    async action(entities) {
      const { os } = getContext();
      
      // Close all windows
      const windows = os.windows || [];
      windows.forEach(win => {
        os.closeWindow(win.id);
      });
      
      return { success: true, message: 'System shutdown complete' };
    },
  });

  // LOCK
  registry.registerCommand({
    intent: 'LOCK',
    patterns: [
      'lock',
      'lock screen',
      'lock system',
      'secure screen',
    ],
    examples: [
      'lock',
      'lock screen',
    ],
    category: 'system',
    description: 'Lock the screen',
    responses: {
      success: 'Screen locked',
      error: 'Failed to lock screen',
    },
    async action(entities) {
      const { os } = getContext();
      
      // Minimize all windows
      const windows = os.windows || [];
      windows.forEach(win => {
        os.minimizeWindow(win.id);
      });
      
      return { success: true, locked: true };
    },
  });

  // REBOOT
  registry.registerCommand({
    intent: 'REBOOT',
    patterns: [
      'reboot',
      'restart',
      'restart system',
      'reboot system',
      'reload system',
    ],
    examples: [
      'reboot',
      'restart',
      'restart system',
    ],
    category: 'system',
    description: 'Reboot the system',
    responses: {
      success: 'Rebooting system...',
      error: 'Failed to reboot system',
    },
    async action(entities) {
      const { os, notification } = getContext();
      
      notification.addNotification({
        title: 'System Reboot',
        message: 'System is rebooting...',
        type: 'info',
      });
      
      // Close all windows and reload page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      return { success: true, message: 'System rebooting' };
    },
  });

  // OPEN_SETTINGS
  registry.registerCommand({
    intent: 'OPEN_SETTINGS',
    patterns: [
      'open settings',
      'show settings',
      'settings',
      'preferences',
      'open preferences',
      'system settings',
      'configuration',
    ],
    examples: [
      'open settings',
      'show settings',
      'preferences',
    ],
    category: 'system',
    description: 'Open system settings',
    responses: {
      success: 'Opening settings...',
      error: 'Failed to open settings',
    },
    async action(entities) {
      const { os } = getContext();
      
      os.openWindow({
        id: 'settings',
        type: 'settings',
        title: 'Settings',
      });
      
      return { success: true, app: 'settings' };
    },
  });

  // CHANGE_LANGUAGE
  registry.registerCommand({
    intent: 'CHANGE_LANGUAGE',
    patterns: [
      'change language to {language}',
      'set language to {language}',
      'switch to {language}',
      'use {language} language',
      'speak {language}',
    ],
    examples: [
      'change language to english',
      'set language to indonesian',
      'switch to bahasa',
    ],
    entities: {
      language: {
        type: 'string',
        required: true,
        values: ['english', 'indonesian', 'en', 'id', 'bahasa'],
      },
    },
    category: 'system',
    description: 'Change system language',
    responses: {
      success: 'Language changed to {language}',
      error: 'Failed to change language',
    },
    async action(entities) {
      const { translation } = getContext();
      
      let lang = entities.language.toLowerCase();
      
      // Normalize language codes
      if (lang === 'indonesian' || lang === 'bahasa') {
        lang = 'id';
      } else if (lang === 'english') {
        lang = 'en';
      }
      
      translation.setLanguage(lang);
      
      return { success: true, language: lang };
    },
  });

  // TOGGLE_CURSOR_EFFECTS
  registry.registerCommand({
    intent: 'TOGGLE_CURSOR',
    patterns: [
      'toggle cursor',
      'toggle cursor effects',
      'enable cursor effects',
      'disable cursor effects',
      'turn on custom cursor',
      'turn off custom cursor',
    ],
    examples: [
      'toggle cursor',
      'enable cursor effects',
      'disable cursor effects',
    ],
    category: 'system',
    description: 'Toggle custom cursor effects',
    responses: {
      success: 'Cursor effects {status}',
      error: 'Failed to toggle cursor effects',
    },
    async action(entities) {
      const { theme } = getContext();
      
      // Toggle cursor effects in theme settings
      const currentState = theme.cursorEffects ?? true;
      theme.setCursorEffects(!currentState);
      
      return { 
        success: true, 
        cursorEffects: !currentState,
        status: !currentState ? 'enabled' : 'disabled',
      };
    },
  });

  // GET_SYSTEM_INFO
  registry.registerCommand({
    intent: 'GET_SYSTEM_INFO',
    patterns: [
      'system info',
      'system information',
      'show system info',
      'what is the system info',
      'tell me about the system',
    ],
    examples: [
      'system info',
      'show system info',
      'what is the system info',
    ],
    category: 'system',
    description: 'Display system information',
    responses: {
      success: 'Here is the system information',
      error: 'Failed to get system info',
    },
    async action(entities) {
      const { theme, sound, translation, os } = getContext();
      
      const info = {
        theme: theme.currentTheme,
        volume: Math.round(sound.volume * 100),
        muted: sound.muted,
        language: translation.language,
        openWindows: os.windows?.length || 0,
        performance: theme.performance || 'high',
      };
      
      return { success: true, info };
    },
  });
}

export default registerSystemVoiceCommands;
