import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Theme definitions
export const themes = {
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    colors: {
      bg: 'from-zinc-900 via-zinc-800 to-zinc-900',
      window: 'bg-slate-900/95',
      taskbar: 'bg-zinc-900/90',
      text: 'text-white',
      textSecondary: 'text-zinc-400',
      border: 'border-zinc-700',
      accent: 'blue',
    },
  },
  light: {
    id: 'light',
    name: 'Light Mode',
    colors: {
      bg: 'from-gray-100 via-gray-200 to-gray-100',
      window: 'bg-white/95',
      taskbar: 'bg-gray-100/90',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-300',
      accent: 'blue',
    },
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    colors: {
      bg: 'from-purple-950 via-pink-950 to-purple-950',
      window: 'bg-purple-900/95',
      taskbar: 'bg-purple-950/90',
      text: 'text-cyan-300',
      textSecondary: 'text-pink-400',
      border: 'border-cyan-500',
      accent: 'cyan',
    },
  },
  retro: {
    id: 'retro',
    name: 'Retro Terminal',
    colors: {
      bg: 'from-green-950 via-black to-green-950',
      window: 'bg-black/95',
      taskbar: 'bg-green-950/90',
      text: 'text-green-400',
      textSecondary: 'text-green-600',
      border: 'border-green-500',
      accent: 'green',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Breeze',
    colors: {
      bg: 'from-blue-950 via-cyan-950 to-blue-950',
      window: 'bg-blue-900/95',
      taskbar: 'bg-blue-950/90',
      text: 'text-cyan-100',
      textSecondary: 'text-blue-300',
      border: 'border-cyan-600',
      accent: 'cyan',
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Glow',
    colors: {
      bg: 'from-orange-950 via-red-950 to-purple-950',
      window: 'bg-red-900/95',
      taskbar: 'bg-orange-950/90',
      text: 'text-orange-100',
      textSecondary: 'text-yellow-400',
      border: 'border-orange-500',
      accent: 'orange',
    },
  },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('dark');

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('webos-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('webos-theme', currentTheme);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const changeTheme = (themeId) => {
    if (themes[themeId]) {
      setCurrentTheme(themeId);
    }
  };

  const theme = themes[currentTheme];

  const value = {
    theme,
    currentTheme,
    changeTheme,
    themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
