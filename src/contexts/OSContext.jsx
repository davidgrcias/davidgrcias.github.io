import React, { createContext, useState, useContext, useCallback } from 'react';

const OSContext = createContext();

export const useOS = () => useContext(OSContext);

export const OSProvider = ({ children }) => {
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [maxZIndex, setMaxZIndex] = useState(100);

  const openApp = useCallback((app) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === app.id);
      if (existing) {
        // If minimized, restore it. If open, focus it.
        return prev.map(w => 
            w.id === app.id ? { ...w, isMinimized: false, zIndex: maxZIndex + 1 } : w
        );
      }
      return [...prev, { ...app, isMinimized: false, zIndex: maxZIndex + 1 }];
    });
    setActiveWindowId(app.id);
    setMaxZIndex(prev => prev + 1);
  }, [maxZIndex]);

  const closeWindow = useCallback((id) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const minimizeWindow = useCallback((id) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const focusWindow = useCallback((id) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: maxZIndex + 1, isMinimized: false } : w))
    );
    setActiveWindowId(id);
    setMaxZIndex(prev => prev + 1);
  }, [maxZIndex]);

  return (
    <OSContext.Provider
      value={{
        windows,
        activeWindowId,
        openApp,
        closeWindow,
        minimizeWindow,
        focusWindow,
      }}
    >
      {children}
    </OSContext.Provider>
  );
};
