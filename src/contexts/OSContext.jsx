import React, { createContext, useState, useContext, useCallback } from 'react';
import { useSoundEffects } from '../hooks/useSoundEffects';

const OSContext = createContext();

export const useOS = () => useContext(OSContext);

export const OSProvider = ({ children }) => {
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [maxZIndex, setMaxZIndex] = useState(100);
  
  // Sound effects system
  const { playSound, toggleSounds, isSoundEnabled } = useSoundEffects();

  const openApp = useCallback((app) => {
    playSound('open', 0.2);
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === app.id);
      if (existing) {
        // If minimized, restore it. If open, focus it.
        return prev.map(w => 
            w.id === app.id ? { ...w, isMinimized: false, isMaximized: false, zIndex: maxZIndex + 1 } : w
        );
      }
      return [...prev, { ...app, isMinimized: false, isMaximized: false, zIndex: maxZIndex + 1 }];
    });
    setActiveWindowId(app.id);
    setMaxZIndex(prev => prev + 1);
  }, [maxZIndex, playSound]);

  const closeWindow = useCallback((id) => {
    playSound('close', 0.2);
    setWindows((prev) => prev.filter((w) => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  }, [activeWindowId, playSound]);

  const minimizeWindow = useCallback((id) => {
    playSound('minimize', 0.2);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  }, [activeWindowId, playSound]);

  const focusWindow = useCallback((id) => {
    playSound('click', 0.1);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: maxZIndex + 1, isMinimized: false } : w))
    );
    setActiveWindowId(id);
    setMaxZIndex(prev => prev + 1);
  }, [maxZIndex, playSound]);

  const maximizeWindow = useCallback((id) => {
    playSound('click', 0.15);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  }, [playSound]);

  return (
    <OSContext.Provider
      value={{
        windows,
        activeWindowId,
        openApp,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
        // Sound controls
        playSound,
        toggleSounds,
        isSoundEnabled,
      }}
    >
      {children}
    </OSContext.Provider>
  );
};
