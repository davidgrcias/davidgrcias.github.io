/**
 * TerminalOutput Component
 * Display terminal output with proper formatting, colors, and types
 */

import React, { useEffect, useRef } from 'react';

export function TerminalOutput({ lines, theme, autoScroll = true }) {
  const outputRef = useRef(null);

  const colors = theme || {
    text: '#e5e7eb',
    error: '#ef4444',
    success: '#4ade80',
    warning: '#fbbf24',
    info: '#60a5fa',
    prompt: '#9ca3af',
    command: '#fff',
  };

  // Auto scroll to bottom on new output
  useEffect(() => {
    if (autoScroll && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines, autoScroll]);

  const renderLine = (line, index) => {
    if (!line) {
      return <div key={index} className="terminal-line h-4"></div>;
    }

    // Handle string lines
    if (typeof line === 'string') {
      return (
        <div key={index} className="terminal-line font-mono text-sm whitespace-pre-wrap" style={{ color: colors.text }}>
          {line}
        </div>
      );
    }

    // Handle object lines with type
    const { type, content } = line;
    let color = colors.text;
    let className = 'terminal-line font-mono text-sm whitespace-pre-wrap';

    switch (type) {
      case 'error':
        color = colors.error;
        break;
      case 'success':
        color = colors.success;
        break;
      case 'warning':
        color = colors.warning;
        break;
      case 'info':
        color = colors.info;
        break;
      case 'prompt':
        color = colors.prompt;
        className += ' select-none';
        break;
      case 'command':
        color = colors.command;
        className += ' font-semibold';
        break;
      case 'text':
      default:
        color = colors.text;
        break;
    }

    // Handle HTML content (for colored/formatted text)
    if (content?.includes('<span') || content?.includes('style=')) {
      return (
        <div 
          key={index} 
          className={className}
          style={{ color }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    return (
      <div key={index} className={className} style={{ color }}>
        {content || ''}
      </div>
    );
  };

  return (
    <div 
      ref={outputRef}
      className="terminal-output flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 space-y-0.5"
      style={{ 
        scrollBehavior: autoScroll ? 'smooth' : 'auto',
      }}
    >
      {lines.map((line, index) => renderLine(line, index))}
    </div>
  );
}
