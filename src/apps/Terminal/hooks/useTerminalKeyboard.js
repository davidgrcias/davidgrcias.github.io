/**
 * useTerminalKeyboard Hook
 * Keyboard shortcuts and special key handling for terminal
 */

import { useEffect, useCallback } from 'react';

export function useTerminalKeyboard({
  onExecute,
  onClear,
  onNavigateHistory,
  onTabComplete,
  onInterrupt,
  inputRef,
}) {
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    // Ctrl+C - Interrupt current command
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      onInterrupt?.();
      return;
    }

    // Ctrl+L - Clear screen
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      onClear?.();
      return;
    }

    // Ctrl+U - Clear line
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      if (inputRef?.current) {
        inputRef.current.value = '';
      }
      return;
    }

    // Ctrl+K - Delete from cursor to end
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      if (inputRef?.current) {
        const input = inputRef.current;
        const cursorPos = input.selectionStart;
        input.value = input.value.substring(0, cursorPos);
      }
      return;
    }

    // Ctrl+A - Move cursor to start
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      if (inputRef?.current) {
        inputRef.current.setSelectionRange(0, 0);
      }
      return;
    }

    // Ctrl+E - Move cursor to end
    if (e.ctrlKey && e.key === 'e') {
      e.preventDefault();
      if (inputRef?.current) {
        const input = inputRef.current;
        input.setSelectionRange(input.value.length, input.value.length);
      }
      return;
    }

    // Ctrl+W - Delete word before cursor
    if (e.ctrlKey && e.key === 'w') {
      e.preventDefault();
      if (inputRef?.current) {
        const input = inputRef.current;
        const cursorPos = input.selectionStart;
        const beforeCursor = input.value.substring(0, cursorPos);
        const afterCursor = input.value.substring(cursorPos);
        
        // Find last word boundary
        const lastSpace = beforeCursor.trimEnd().lastIndexOf(' ');
        const newValue = input.value.substring(0, lastSpace + 1) + afterCursor;
        
        input.value = newValue;
        input.setSelectionRange(lastSpace + 1, lastSpace + 1);
      }
      return;
    }

    // Ctrl+R - Reverse search (future feature)
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      // TODO: Implement reverse search
      return;
    }

    // Enter - Execute command
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputRef?.current) {
        onExecute?.(inputRef.current.value);
        inputRef.current.value = '';
      }
      return;
    }

    // Tab - Auto complete
    if (e.key === 'Tab') {
      e.preventDefault();
      if (inputRef?.current) {
        const result = onTabComplete?.(inputRef.current.value);
        if (result?.completed) {
          inputRef.current.value = result.completed;
        }
      }
      return;
    }

    // Up Arrow - Previous command
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevCommand = onNavigateHistory?.('up');
      if (prevCommand !== null && inputRef?.current) {
        inputRef.current.value = prevCommand;
        // Move cursor to end
        setTimeout(() => {
          inputRef.current.setSelectionRange(
            inputRef.current.value.length,
            inputRef.current.value.length
          );
        }, 0);
      }
      return;
    }

    // Down Arrow - Next command
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextCommand = onNavigateHistory?.('down');
      if (nextCommand !== null && inputRef?.current) {
        inputRef.current.value = nextCommand;
        // Move cursor to end
        setTimeout(() => {
          inputRef.current.setSelectionRange(
            inputRef.current.value.length,
            inputRef.current.value.length
          );
        }, 0);
      }
      return;
    }

    // Home - Move to start of line
    if (e.key === 'Home') {
      e.preventDefault();
      if (inputRef?.current) {
        inputRef.current.setSelectionRange(0, 0);
      }
      return;
    }

    // End - Move to end of line
    if (e.key === 'End') {
      e.preventDefault();
      if (inputRef?.current) {
        const input = inputRef.current;
        input.setSelectionRange(input.value.length, input.value.length);
      }
      return;
    }
  }, [onExecute, onClear, onNavigateHistory, onTabComplete, onInterrupt, inputRef]);

  // Attach keyboard event listener
  useEffect(() => {
    const input = inputRef?.current;
    if (!input) return;

    input.addEventListener('keydown', handleKeyDown);

    return () => {
      input.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, inputRef]);

  // Focus input when terminal is clicked
  const focusInput = useCallback(() => {
    inputRef?.current?.focus();
  }, [inputRef]);

  return {
    focusInput,
  };
}
