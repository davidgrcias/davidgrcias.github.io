import { useEffect } from 'react';

/**
 * Custom hook for handling keyboard shortcuts
 * @param {Object} shortcuts - Object with key combinations as keys and callbacks as values
 * @example
 * useKeyboardShortcuts({
 *   'Escape': () => closeWindow(),
 *   'Ctrl+W': () => closeActiveWindow(),
 *   'Ctrl+M': () => minimizeWindow(),
 * });
 */
export const useKeyboardShortcuts = (shortcuts, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      // Build the key combination string
      const keys = [];
      
      if (event.ctrlKey || event.metaKey) keys.push('Ctrl');
      if (event.shiftKey) keys.push('Shift');
      if (event.altKey) keys.push('Alt');
      
      // Add the actual key (uppercase for letters)
      const key = event.key === ' ' ? 'Space' : event.key;
      if (!['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
        keys.push(key);
      }

      const combination = keys.join('+');

      // Check if this combination exists in shortcuts
      if (shortcuts[combination]) {
        event.preventDefault();
        shortcuts[combination](event);
      }

      // Also check for single key shortcuts (like Escape, F11)
      if (shortcuts[event.key]) {
        event.preventDefault();
        shortcuts[event.key](event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
};

export default useKeyboardShortcuts;
