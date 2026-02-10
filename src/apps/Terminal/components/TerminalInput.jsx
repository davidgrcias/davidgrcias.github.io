/**
 * TerminalInput Component
 * Input field for entering terminal commands with auto-focus and keyboard handling
 */

import React, { forwardRef, useEffect } from 'react';

export const TerminalInput = forwardRef(({ 
  onSubmit, 
  onKeyDown, 
  placeholder = '', 
  autoFocus = true,
  theme,
  className = '',
}, ref) => {
  const colors = theme || {
    text: '#fff',
    background: 'transparent',
    caret: '#4ade80',
  };

  useEffect(() => {
    if (autoFocus && ref?.current) {
      ref.current.focus();
    }
  }, [autoFocus, ref]);

  const handleKeyDown = (e) => {
    // Handle enter key
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const value = e.target.value;
      if (onSubmit) {
        onSubmit(value);
      }
      e.target.value = '';
    }

    // Forward other keys to parent handler
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <input
      ref={ref}
      type="text"
      className={`terminal-input flex-1 bg-transparent outline-none border-none font-mono text-sm ${className}`}
      style={{
        color: colors.text,
        caretColor: colors.caret,
      }}
      placeholder={placeholder}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
    />
  );
});

TerminalInput.displayName = 'TerminalInput';
