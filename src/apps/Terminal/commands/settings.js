/**
 * Settings Commands
 * Commands for managing system settings and preferences
 */

import { error, success, text, colored } from '../outputFormatter.js';

export function registerSettingsCommands(registry, getContext) {
  // theme - Get or set theme
  registry.registerCommand('theme', {
    description: 'Get or set the current theme',
    usage: 'theme [name]',
    category: 'settings',
    examples: ['theme', 'theme dark', 'theme light'],
    async execute(args) {
      const { theme } = getContext();
      
      if (!theme) {
        return [error('Theme context not available')];
      }

      // Get current theme
      if (args.length === 0) {
        const currentTheme = theme.currentTheme || theme.theme || 'default';
        return [
          text(`Current theme: ${currentTheme}`),
          text(''),
          text('Available themes:'),
          text('  • light'),
          text('  • dark'),
          text('  • cyberpunk'),
          text('  • nature'),
          text('  • ocean'),
        ];
      }

      // Set theme
      const newTheme = args[0].toLowerCase();
      const validThemes = ['light', 'dark', 'cyberpunk', 'nature', 'ocean'];
      
      if (!validThemes.includes(newTheme)) {
        return [error(`Invalid theme: ${newTheme}. Valid themes: ${validThemes.join(', ')}`)];
      }

      try {
        if (theme.setTheme) {
          theme.setTheme(newTheme);
          return [success(`Theme changed to: ${newTheme}`)];
        } else if (theme.changeTheme) {
          theme.changeTheme(newTheme);
          return [success(`Theme changed to: ${newTheme}`)];
        } else {
          return [error('Theme setter not available')];
        }
      } catch (err) {
        return [error(`Failed to set theme: ${err.message}`)];
      }
    },
  });

  // volume - Get or set system volume
  registry.registerCommand('volume', {
    description: 'Get or set system volume',
    usage: 'volume [0-100]',
    category: 'settings',
    examples: ['volume', 'volume 50', 'volume 100'],
    async execute(args) {
      const { sound } = getContext();
      
      if (!sound) {
        return [error('Sound context not available')];
      }

      // Get current volume
      if (args.length === 0) {
        const currentVolume = sound.volume ?? sound.systemVolume ?? 50;
        return [
          text(`Current volume: ${currentVolume}%`),
          colored(`[${'█'.repeat(Math.floor(currentVolume / 5))}${'░'.repeat(20 - Math.floor(currentVolume / 5))}]`, 'info'),
        ];
      }

      // Set volume
      const newVolume = parseInt(args[0]);
      
      if (isNaN(newVolume) || newVolume < 0 || newVolume > 100) {
        return [error('Volume must be a number between 0 and 100')];
      }

      try {
        if (sound.setVolume) {
          sound.setVolume(newVolume);
        } else if (sound.setSystemVolume) {
          sound.setSystemVolume(newVolume);
        } else {
          return [error('Volume setter not available')];
        }
        
        return [
          success(`Volume set to: ${newVolume}%`),
          colored(`[${'█'.repeat(Math.floor(newVolume / 5))}${'░'.repeat(20 - Math.floor(newVolume / 5))}]`, 'info'),
        ];
      } catch (err) {
        return [error(`Failed to set volume: ${err.message}`)];
      }
    },
  });

  // sound - Toggle sound
  registry.registerCommand('sound', {
    description: 'Toggle sound on/off',
    usage: 'sound [on|off]',
    category: 'settings',
    examples: ['sound', 'sound on', 'sound off'],
    async execute(args) {
      const { sound } = getContext();
      
      if (!sound) {
        return [error('Sound context not available')];
      }

      // Get current sound state
      if (args.length === 0) {
        const isMuted = sound.muted ?? sound.isMuted ?? false;
        return [text(`Sound is currently: ${isMuted ? 'OFF' : 'ON'}`)];
      }

      // Set sound state
      const action = args[0].toLowerCase();
      
      if (action !== 'on' && action !== 'off') {
        return [error('Usage: sound [on|off]')];
      }

      try {
        const shouldMute = action === 'off';
        
        if (sound.setMuted) {
          sound.setMuted(shouldMute);
        } else if (sound.toggleMute) {
          const isMuted = sound.muted ?? sound.isMuted ?? false;
          if (isMuted !== shouldMute) {
            sound.toggleMute();
          }
        } else {
          return [error('Sound toggle not available')];
        }
        
        return [success(`Sound turned ${action.toUpperCase()}`)];
      } catch (err) {
        return [error(`Failed to toggle sound: ${err.message}`)];
      }
    },
  });

  // wallpaper - Get or set wallpaper
  registry.registerCommand('wallpaper', {
    description: 'Get or set wallpaper preset',
    usage: 'wallpaper [preset]',
    category: 'settings',
    examples: ['wallpaper', 'wallpaper gradient', 'wallpaper stars'],
    async execute(args) {
      const { theme } = getContext();
      
      if (!theme) {
        return [error('Theme context not available')];
      }

      // Get current wallpaper
      if (args.length === 0) {
        const currentWallpaper = theme.wallpaper || theme.background || 'default';
        return [
          text(`Current wallpaper: ${currentWallpaper}`),
          text(''),
          text('Available wallpapers:'),
          text('  • gradient'),
          text('  • stars'),
          text('  • particles'),
          text('  • solid'),
        ];
      }

      // Set wallpaper
      const newWallpaper = args[0].toLowerCase();
      const validWallpapers = ['gradient', 'stars', 'particles', 'solid'];
      
      if (!validWallpapers.includes(newWallpaper)) {
        return [error(`Invalid wallpaper: ${newWallpaper}. Valid wallpapers: ${validWallpapers.join(', ')}`)];
      }

      try {
        if (theme.setWallpaper) {
          theme.setWallpaper(newWallpaper);
          return [success(`Wallpaper changed to: ${newWallpaper}`)];
        } else if (theme.setBackground) {
          theme.setBackground(newWallpaper);
          return [success(`Wallpaper changed to: ${newWallpaper}`)];
        } else {
          return [error('Wallpaper setter not available')];
        }
      } catch (err) {
        return [error(`Failed to set wallpaper: ${err.message}`)];
      }
    },
  });

  // lang - Get or set language
  registry.registerCommand('lang', {
    description: 'Get or set interface language',
    usage: 'lang [en|id]',
    category: 'settings',
    examples: ['lang', 'lang en', 'lang id'],
    async execute(args) {
      const { translation } = getContext();
      
      if (!translation) {
        return [error('Translation context not available')];
      }

      // Get current language
      if (args.length === 0) {
        const currentLang = translation.currentLanguage || translation.language || 'en';
        const langName = currentLang === 'en' ? 'English' : 'Indonesian';
        return [
          text(`Current language: ${langName} (${currentLang})`),
          text(''),
          text('Available languages:'),
          text('  • en - English'),
          text('  • id - Indonesian'),
        ];
      }

      // Set language
      const newLang = args[0].toLowerCase();
      
      if (newLang !== 'en' && newLang !== 'id') {
        return [error('Invalid language. Use: en (English) or id (Indonesian)')];
      }

      try {
        if (translation.setLanguage) {
          translation.setLanguage(newLang);
        } else if (translation.changeLanguage) {
          translation.changeLanguage(newLang);
        } else {
          return [error('Language setter not available')];
        }
        
        const langName = newLang === 'en' ? 'English' : 'Indonesian';
        return [success(`Language changed to: ${langName}`)];
      } catch (err) {
        return [error(`Failed to set language: ${err.message}`)];
      }
    },
  });

  // cursor - Toggle custom cursor
  registry.registerCommand('cursor', {
    description: 'Toggle custom cursor on/off',
    usage: 'cursor [default|custom]',
    category: 'settings',
    examples: ['cursor', 'cursor custom', 'cursor default'],
    async execute(args) {
      const { os } = getContext();
      
      if (!os) {
        return [error('OS context not available')];
      }

      // Get current cursor state
      if (args.length === 0) {
        const customCursor = os.customCursor ?? os.settings?.customCursor ?? true;
        return [text(`Cursor mode: ${customCursor ? 'custom' : 'default'}`)];
      }

      // Set cursor mode
      const mode = args[0].toLowerCase();
      
      if (mode !== 'default' && mode !== 'custom') {
        return [error('Usage: cursor [default|custom]')];
      }

      try {
        const useCustom = mode === 'custom';
        
        if (os.setCustomCursor) {
          os.setCustomCursor(useCustom);
        } else if (os.settings && os.setSettings) {
          os.setSettings({ ...os.settings, customCursor: useCustom });
        } else {
          return [error('Cursor setter not available')];
        }
        
        return [success(`Cursor set to: ${mode}`)];
      } catch (err) {
        return [error(`Failed to set cursor: ${err.message}`)];
      }
    },
  });

  // performance - Toggle performance mode
  registry.registerCommand('performance', {
    description: 'Toggle performance mode',
    usage: 'performance [on|off]',
    category: 'settings',
    examples: ['performance', 'performance on', 'performance off'],
    async execute(args) {
      const { os } = getContext();
      
      if (!os) {
        return [error('OS context not available')];
      }

      // Get current performance mode
      if (args.length === 0) {
        const perfMode = os.performanceMode ?? os.settings?.performanceMode ?? false;
        return [
          text(`Performance mode: ${perfMode ? 'ON' : 'OFF'}`),
          text(''),
          text('Performance mode reduces animations and effects for better performance.'),
        ];
      }

      // Set performance mode
      const action = args[0].toLowerCase();
      
      if (action !== 'on' && action !== 'off') {
        return [error('Usage: performance [on|off]')];
      }

      try {
        const enable = action === 'on';
        
        if (os.setPerformanceMode) {
          os.setPerformanceMode(enable);
        } else if (os.settings && os.setSettings) {
          os.setSettings({ ...os.settings, performanceMode: enable });
        } else {
          return [error('Performance mode setter not available')];
        }
        
        return [success(`Performance mode: ${action.toUpperCase()}`)];
      } catch (err) {
        return [error(`Failed to set performance mode: ${err.message}`)];
      }
    },
  });
}
