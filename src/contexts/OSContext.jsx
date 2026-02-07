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

  // Sound effects
  const {
    playWindowOpen, playWindowClose, playWindowMinimize, playWindowMaximize, playWindowFocus,
    playClick, playSleep: playSleepSound, playShutdown: playShutdownSound, playRestart: playRestartSound,
    setSoundEnabled, soundEnabled,
  } = useSound();

  const sleep = useCallback(() => {
    playSleepSound();
    setPowerState('locked');
  }, [playSleepSound]);

  const wake = useCallback(() => {
    setPowerState('active');
  }, []);

  const restart = useCallback(() => {
    playRestartSound();
    setPowerState('restarting');
    
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }, 2000);
  }, [playRestartSound]);

  const shutdown = useCallback(() => {
    playShutdownSound();
    setPowerState('shutting_down');

    setTimeout(() => {
      setPowerState('off');
    }, 2000);
  }, [playShutdownSound]);

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
  
  // Sound effects adapter (backward compatibility)
  const playSound = (type) => {
    switch(type) {
        case 'open': playWindowOpen(); break;
        case 'close': playWindowClose(); break;
        case 'click': playClick(); break;
        case 'minimize': playWindowMinimize(); break;
        default: break;
    }
  };

  const openApp = useCallback((app) => {
    playWindowOpen();
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === app.id);
      if (existing) {
        return prev.map(w => 
            w.id === app.id ? { ...w, isMinimized: false, isMaximized: false, zIndex: maxZIndex + 1 } : w
        );
      }
      return [...prev, { ...app, isMinimized: false, isMaximized: false, zIndex: maxZIndex + 1 }];
    });
    setActiveWindowId(app.id);
    setMaxZIndex(prev => prev + 1);
  }, [maxZIndex, playWindowOpen]);

  const closeWindow = useCallback((id) => {
    playWindowClose();
    setWindows((prev) => prev.filter((w) => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  }, [activeWindowId, playWindowClose]);

  const minimizeWindow = useCallback((id) => {
    playWindowMinimize();
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  }, [activeWindowId, playWindowMinimize]);

  const focusWindow = useCallback((id) => {
    playWindowFocus();
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: maxZIndex + 1, isMinimized: false } : w))
    );
    setActiveWindowId(id);
    setMaxZIndex(prev => prev + 1);
  }, [maxZIndex, playWindowFocus]);

  const maximizeWindow = useCallback((id) => {
    playWindowMaximize();
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  }, [playWindowMaximize]);

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
