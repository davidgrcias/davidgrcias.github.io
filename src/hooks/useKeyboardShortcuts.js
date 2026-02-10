import { useEffect, useRef } from 'react';

/**
 * Custom hook for handling keyboard shortcuts
 * Uses useRef to store shortcuts so the listener is stable
 * and doesn't re-register on every render.
 *
 * @param {Object} shortcuts - Object with key combinations as keys and callbacks as values
 * @example
 * useKeyboardShortcuts({
 *   'Escape': () => closeWindow(),
 *   'Ctrl+W': () => closeActiveWindow(),
 *   'Ctrl+M': () => minimizeWindow(),
 * });
 */
export const useKeyboardShortcuts = (shortcuts, enabled = true) => {
  // Store shortcuts in a ref so the listener always has the latest
  // callbacks without needing to re-register on every render
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      const currentShortcuts = shortcutsRef.current;
      if (!currentShortcuts) return;

      const target = event.target;
      const tag = target?.tagName;
      const isEditable =
        target?.isContentEditable ||
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT';

      // Build modifier prefix first to check if this is a global shortcut
      const modifiers = [];
      if (event.ctrlKey || event.metaKey) modifiers.push('ctrl');
      if (event.shiftKey) modifiers.push('shift');
      if (event.altKey) modifiers.push('alt');

      // CRITICAL FIX: Allow global shortcuts even in input fields
      // Only block if it's just a regular key press without modifiers
      // This allows Ctrl+K, Ctrl+Space, Escape etc. to work everywhere
      const isGlobalShortcut = modifiers.length > 0 || event.key === 'Escape';

      if (isEditable && !isGlobalShortcut) {
        // User is typing in a text field - block single-key shortcuts
        return;
      }

      // 2. Get the pressed key (lowercase, skip modifier-only keys)
      const rawKey = event.key;
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(rawKey)) return;

      let key = rawKey.toLowerCase();
      if (key === ' ') key = 'space';

      // 3. Build the combination string
      const combo = modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key;

      // 4. Normalize all registered shortcuts to lowercase for matching
      const normalized = {};
      for (const k of Object.keys(currentShortcuts)) {
        normalized[k.toLowerCase()] = currentShortcuts[k];
      }

      // 5. Try direct match first
      if (normalized[combo]) {
        event.preventDefault();
        event.stopPropagation();
        normalized[combo](event);
        return;
      }

      // 6. Fallback: use event.code for layout-independent keys
      // e.g., '/' key has event.code 'Slash' on all layouts
      const codeMap = {
        'Slash': '/',
        'Backslash': '\\',
        'BracketLeft': '[',
        'BracketRight': ']',
        'Semicolon': ';',
        'Quote': "'",
        'Comma': ',',
        'Period': '.',
        'Minus': '-',
        'Equal': '=',
        'Backquote': '`',
      };

      const mappedKey = codeMap[event.code];
      if (mappedKey && mappedKey !== key) {
        const fallbackCombo = modifiers.length > 0
          ? `${modifiers.join('+')}+${mappedKey}`
          : mappedKey;
        if (normalized[fallbackCombo]) {
          event.preventDefault();
          event.stopPropagation();
          normalized[fallbackCombo](event);
          return;
        }
      }

      // 7. Single-key shortcuts only fire WITHOUT modifiers
      // (prevents Ctrl+Escape from triggering Escape handler)
      if (modifiers.length === 0 && normalized[key]) {
        event.preventDefault();
        event.stopPropagation();
        normalized[key](event);
      }
    };

    // Use capture phase to ensure we get the event before anything else
    window.addEventListener('keydown', handleKeyDown, true);

    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [enabled]); // Only re-register when enabled changes, NOT on every render
};

export default useKeyboardShortcuts;
