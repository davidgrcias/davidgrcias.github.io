/**
 * TerminalPrompt Component
 * Display the command prompt with user, hostname, and current directory
 */

import React from 'react';

export function TerminalPrompt({ user, hostname, currentDirectory, theme }) {
  const colors = theme || {
    user: '#4ade80',
    hostname: '#60a5fa',
    directory: '#fbbf24',
    symbol: '#fff',
  };

  return (
    <div className="terminal-prompt flex items-center gap-1 font-mono text-sm select-none">
      <span style={{ color: colors.user }}>{user}</span>
      <span style={{ color: colors.symbol }}>@</span>
      <span style={{ color: colors.hostname }}>{hostname}</span>
      <span style={{ color: colors.symbol }}>:</span>
      <span style={{ color: colors.directory }}>{currentDirectory}</span>
      <span style={{ color: colors.symbol }}>$</span>
    </div>
  );
}
