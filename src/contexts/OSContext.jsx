import React, { createContext, useState, useContext, useCallback } from 'react';
import { useSound } from './SoundContext';

const OSContext = createContext();

export const useOS = () => useContext(OSContext);

export const OSProvider = ({ children }) => {
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [maxZIndex, setMaxZIndex] = useState(100);
  
  
  // Power State: 'booting' | 'active' | 'locked' | 'off'
  const [powerState, setPowerState] = useState(() => {
    // Check if we just rebooted or it's a fresh load
    // For now default to 'booting' so boot sequence always runs on refresh
    return 'booting';
  });

  const sleep = useCallback(() => {
    // sound is played by component or here? Desktop handles lock screen so maybe here is better
    setPowerState('locked');
  }, []);

  const wake = useCallback(() => {
    setPowerState('active');
  }, []);

  const restart = useCallback(() => {
    // 1. Set transitional state
    setPowerState('restarting');
    
    // 2. Wait for animation (e.g., 2 seconds)
    setTimeout(() => {
      // 3. Factory Reset: Clear ALL data
      localStorage.clear();
      sessionStorage.clear();
      
      // 4. Hard Reload
      window.location.reload();
    }, 2000);
  }, []);

  const shutdown = useCallback(() => {
    // 1. Set transitional state
    setPowerState('shutting_down');

    // 2. Wait for animation
    setTimeout(() => {
      setPowerState('off');
    }, 2000);
  }, []);

  // Pinned apps state
  const [pinnedApps, setPinnedApps] = useState(() => {
    const saved = localStorage.getItem('webos-pinned-apps');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse pinned apps:', e);
      }
    }
    return ['vscode', 'file-manager', 'about-me', 'terminal'];
  });
  
  // Sound effects system
  const { playOpen, playClose, playClick, setSoundEnabled, soundEnabled } = useSound();

  const playSound = (type, volume) => {
    // Adapter function to match old API if needed, or just map direct calls
    switch(type) {
        case 'open': playOpen(); break;
        case 'close': playClose(); break;
        case 'click': playClick(); break;
        case 'minimize': playClick(); break; // reuse click for minimize
        default: break;
    }
  };

  const openApp = useCallback((app) => {
    playOpen();
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
  }, [maxZIndex, playOpen]);

  const closeWindow = useCallback((id) => {
    playClose();
    setWindows((prev) => prev.filter((w) => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  }, [activeWindowId, playClose]);

  const minimizeWindow = useCallback((id) => {
    playClick(); // Reuse click/minimize sound
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  }, [activeWindowId, playClick]);

  const focusWindow = useCallback((id) => {
    playClick();
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: maxZIndex + 1, isMinimized: false } : w))
    );
    setActiveWindowId(id);
    setMaxZIndex(prev => prev + 1);
  }, [maxZIndex, playClick]);

  const maximizeWindow = useCallback((id) => {
    playClick();
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  }, [playClick]);

  const updateWindow = useCallback((id, updates) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
  }, []);

  // Pin/Unpin app
  const togglePinApp = useCallback((appId) => {
    setPinnedApps((prev) => {
      const newPinned = prev.includes(appId)
        ? prev.filter(id => id !== appId)
        : [...prev, appId];
      localStorage.setItem('webos-pinned-apps', JSON.stringify(newPinned));
      return newPinned;
    });
  }, []);

  const isPinned = useCallback((appId) => {
    return pinnedApps.includes(appId);
  }, [pinnedApps]);

  // Reorder pinned apps
  const reorderPinnedApps = useCallback((fromIndex, toIndex) => {
    setPinnedApps((prev) => {
      const newOrder = [...prev];
      const [removed] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, removed);
      localStorage.setItem('webos-pinned-apps', JSON.stringify(newOrder));
      return newOrder;
    });
  }, []);

  return (
    <OSContext.Provider
      value={{
        windows,
        activeWindowId,
        openApp,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        updateWindow,
        focusWindow,
        // Pinned apps
        pinnedApps,
        togglePinApp,
        isPinned,
        reorderPinnedApps,
        // Sound controls
        playSound,
        toggleSounds: setSoundEnabled,
        isSoundEnabled: soundEnabled,
        // Power controls
        powerState,
        setPowerState,
        sleep,
        wake,
        restart,
        shutdown,
      }}
    >
      {children}
    </OSContext.Provider>
  );
};
