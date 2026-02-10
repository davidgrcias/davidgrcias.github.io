/**
 * Terminal Themes
 * Color schemes matching OS themes
 */

export const terminalThemes = {
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    background: '#1e1e1e',
    text: '#d4d4d4',
    promptUser: '#569cd6',
    promptPath: '#dcdcaa',
    promptSymbol: '#d4d4d4',
    error: '#f44747',
    success: '#6a9955',
    warning: '#ce9178',
    info: '#569cd6',
    directory: '#4ec9b0',
    file: '#d4d4d4',
    link: '#9cdcfe',
    executable: '#b5cea8',
    comment: '#6a9955',
    selection: 'rgba(86, 156, 214, 0.3)',
    cursor: '#d4d4d4',
  },

  light: {
    id: 'light',
    name: 'Light Mode',
    background: '#ffffff',
    text: '#1e1e1e',
    promptUser: '#0066cc',
    promptPath: '#795e26',
    promptSymbol: '#1e1e1e',
    error: '#cd3131',
    success: '#008000',
    warning: '#ca5010',
    info: '#0066cc',
    directory: '#267f99',
    file: '#1e1e1e',
    link: '#0070c1',
    executable: '#4b830d',
    comment: '#008000',
    selection: 'rgba(0, 102, 204, 0.2)',
    cursor: '#1e1e1e',
  },

  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    background: '#0d0221',
    text: '#00ffff',
    promptUser: '#ff00ff',
    promptPath: '#ffff00',
    promptSymbol: '#00ffff',
    error: '#ff0055',
    success: '#00ff41',
    warning: '#ff8800',
    info: '#00ccff',
    directory: '#00ffcc',
    file: '#ffffff',
    link: '#ff66ff',
    executable: '#00ff88',
    comment: '#8800ff',
    selection: 'rgba(255, 0, 255, 0.3)',
    cursor: '#ff00ff',
  },

  retro: {
    id: 'retro',
    name: 'Retro Terminal',
    background: '#0a0f0a',
    text: '#33ff33',
    promptUser: '#33ff33',
    promptPath: '#66ff66',
    promptSymbol: '#33ff33',
    error: '#ff3333',
    success: '#00ff00',
    warning: '#ffaa00',
    info: '#33ccff',
    directory: '#00ffaa',
    file: '#33ff33',
    link: '#66ccff',
    executable: '#00ff66',
    comment: '#55ff55',
    selection: 'rgba(51, 255, 51, 0.3)',
    cursor: '#33ff33',
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean Breeze',
    background: '#001f3f',
    text: '#7fdbff',
    promptUser: '#39cccc',
    promptPath: '#ffdc00',
    promptSymbol: '#7fdbff',
    error: '#ff4136',
    success: '#2ecc40',
    warning: '#ff851b',
    info: '#0074d9',
    directory: '#39cccc',
    file: '#7fdbff',
    link: '#b10dc9',
    executable: '#01ff70',
    comment: '#3d9970',
    selection: 'rgba(57, 204, 204, 0.3)',
    cursor: '#7fdbff',
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset Glow',
    background: '#2d1b00',
    text: '#ffcc99',
    promptUser: '#ff6b35',
    promptPath: '#f7931e',
    promptSymbol: '#ffcc99',
    error: '#ff0000',
    success: '#00ff7f',
    warning: '#ffa500',
    info: '#ff69b4',
    directory: '#ff8c42',
    file: '#ffcc99',
    link: '#da70d6',
    executable: '#98d8c8',
    comment: '#f7b32b',
    selection: 'rgba(255, 107, 53, 0.3)',
    cursor: '#ff6b35',
  },
};

/**
 * Get theme by ID
 */
export function getTheme(themeId) {
  return terminalThemes[themeId] || terminalThemes.dark;
}

/**
 * Get all theme IDs
 */
export function getThemeIds() {
  return Object.keys(terminalThemes);
}

/**
 * Get theme names
 */
export function getThemeNames() {
  return Object.values(terminalThemes).map(t => ({ id: t.id, name: t.name }));
}

/**
 * Apply theme colors to output
 */
export function colorize(text, colorType, theme) {
  return {
    text,
    color: theme[colorType] || theme.text,
  };
}

/**
 * Get ANSI-like color codes for terminal output
 * This is a mapping for potential future ANSI support
 */
export const ansiColors = {
  reset: 0,
  bright: 1,
  dim: 2,
  underscore: 4,
  blink: 5,
  reverse: 7,
  hidden: 8,

  // Foreground colors
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,

  // Background colors
  bgBlack: 40,
  bgRed: 41,
  bgGreen: 42,
  bgYellow: 43,
  bgBlue: 44,
  bgMagenta: 45,
  bgCyan: 46,
  bgWhite: 47,
};

export default terminalThemes;
