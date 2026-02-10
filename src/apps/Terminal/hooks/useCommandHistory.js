/**
 * useCommandHistory Hook
 * Manages command history with persistent storage
 */

import { useState, useEffect, useCallback } from 'react';

const HISTORY_KEY = 'terminal-command-history';
const MAX_HISTORY = 1000;

export function useCommandHistory() {
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
      }
    } catch (err) {
      console.error('Failed to load command history:', err);
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (err) {
      console.error('Failed to save command history:', err);
    }
  }, [history]);

  // Add command to history
  const addCommand = useCallback((command) => {
    if (!command.trim()) return;

    setHistory(prev => {
      // Don't add if same as last command
      if (prev.length > 0 && prev[prev.length - 1] === command) {
        return prev;
      }

      // Add and limit to MAX_HISTORY
      const newHistory = [...prev, command];
      return newHistory.slice(-MAX_HISTORY);
    });

    // Reset index
    setHistoryIndex(-1);
  }, []);

  // Navigate history (up/down arrows)
  const navigate = useCallback((direction) => {
    if (history.length === 0) return null;

    let newIndex = historyIndex;

    if (direction === 'up') {
      // Go backwards in history
      newIndex = historyIndex === -1 
        ? history.length - 1 
        : Math.max(0, historyIndex - 1);
    } else if (direction === 'down') {
      // Go forwards in history
      if (historyIndex === -1) return '';
      newIndex = historyIndex + 1;
      
      if (newIndex >= history.length) {
        setHistoryIndex(-1);
        return '';
      }
    }

    setHistoryIndex(newIndex);
    return history[newIndex];
  }, [history, historyIndex]);

  // Search history
  const search = useCallback((query) => {
    if (!query.trim()) return history;

    return history.filter(cmd => 
      cmd.toLowerCase().includes(query.toLowerCase())
    );
  }, [history]);

  // Clear history
  const clear = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  // Get history stats
  const getStats = useCallback(() => {
    if (history.length === 0) {
      return {
        total: 0,
        unique: 0,
        mostUsed: null,
      };
    }

    // Count command frequencies
    const counts = {};
    history.forEach(cmd => {
      const base = cmd.split(' ')[0];
      counts[base] = (counts[base] || 0) + 1;
    });

    // Find most used
    let mostUsed = null;
    let maxCount = 0;
    Object.entries(counts).forEach(([cmd, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsed = { command: cmd, count };
      }
    });

    return {
      total: history.length,
      unique: Object.keys(counts).length,
      mostUsed,
    };
  }, [history]);

  return {
    history,
    historyIndex,
    addCommand,
    navigate,
    search,
    clear,
    getStats,
  };
}
