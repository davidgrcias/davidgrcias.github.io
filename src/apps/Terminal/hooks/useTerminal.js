/**
 * useTerminal Hook
 * Main hook for terminal functionality with command execution, history, and state management
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { CommandRegistry } from '../commandRegistry.js';
import { parseCommand } from '../commandParser.js';
import { VirtualFS } from '../virtualFS.js';

// Import command registrations
import { registerFilesystemCommands } from '../commands/filesystem.js';
import { registerSystemCommands } from '../commands/system.js';
import { registerAppCommands } from '../commands/apps.js';
import { registerInfoCommands } from '../commands/info.js';
import { registerSettingsCommands } from '../commands/settings.js';
import { registerUtilsCommands } from '../commands/utils.js';
import { registerFunCommands } from '../commands/fun.js';
import { registerMusicCommands } from '../commands/music.js';
import { registerNavigationCommands } from '../commands/navigation.js';
import { registerNotificationCommands } from '../commands/notifications.js';

export function useTerminal(getContext) {
  const [output, setOutput] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDirectory, setCurrentDirectory] = useState('/');
  const [environment, setEnvironment] = useState({
    USER: 'david',
    HOSTNAME: 'webos',
    HOME: '/home/david',
    PATH: '/bin:/usr/bin:/usr/local/bin',
    SHELL: '/bin/terminal.sh',
  });
  const [aliases, setAliases] = useState({
    ll: 'ls -la',
    la: 'ls -a',
    ...: 'cd ../..',
  });

  const registryRef = useRef(null);
  const fsRef = useRef(null);

  // Initialize command registry and filesystem
  useEffect(() => {
    const registry = new CommandRegistry();
    const fs = new VirtualFS();

    // Register all command modules
    registerFilesystemCommands(registry, getContext);
    registerSystemCommands(registry, getContext);
    registerAppCommands(registry, getContext);
    registerInfoCommands(registry, getContext);
    registerSettingsCommands(registry, getContext);
    registerUtilsCommands(registry, getContext);
    registerFunCommands(registry, getContext);
    registerMusicCommands(registry, getContext);
    registerNavigationCommands(registry, getContext);
    registerNotificationCommands(registry, getContext);

    registryRef.current = registry;
    fsRef.current = fs;

    // Add welcome message
    setOutput([
      { type: 'text', content: 'Welcome to WebOS Terminal!' },
      { type: 'text', content: `Type "help" for available commands` },
      { type: 'text', content: '' },
    ]);
  }, [getContext]);

  // Execute command
  const executeCommand = useCallback(async (input) => {
    if (!input.trim()) {
      setOutput(prev => [...prev, { type: 'prompt', content: '' }]);
      return;
    }

    // Add to history
    setCommandHistory(prev => [...prev, input]);
    setHistoryIndex(-1);

    // Add command to output
    setOutput(prev => [
      ...prev,
      { type: 'command', content: `${environment.USER}@${environment.HOSTNAME}:${currentDirectory}$ ${input}` }
    ]);

    try {
      // Expand aliases
      let expandedInput = input;
      for (const [alias, command] of Object.entries(aliases)) {
        if (expandedInput.startsWith(alias + ' ') || expandedInput === alias) {
          expandedInput = expandedInput.replace(new RegExp(`^${alias}`), command);
          break;
        }
      }

      // Parse command
      const parsed = parseCommand(expandedInput, environment);

      // Handle chained commands
      if (parsed.type === 'chain') {
        for (const cmd of parsed.commands) {
          await executeStandardCommands(cmd);
        }
      } else if (parsed.type === 'pipe') {
        await executePipedCommands(parsed.commands);
      } else {
        await executeSingleCommand(parsed);
      }
    } catch (err) {
      setOutput(prev => [
        ...prev,
        { type: 'error', content: `Error: ${err.message}` }
      ]);
    }
  }, [commandHistory, environment, currentDirectory, aliases]);

  // Execute single command
  const executeSingleCommand = useCallback(async (parsed) => {
    const { command, args, flags } = parsed;
    const registry = registryRef.current;
    const fs = fsRef.current;

    if (!registry) return;

    // Get command from registry
    const cmd = registry.getCommand(command);

    if (!cmd) {
      setOutput(prev => [
        ...prev,
        { type: 'error', content: `Command not found: ${command}` },
        { type: 'text', content: `Type "help" for available commands` }
      ]);
      return;
    }

    // Create context getter with current state
    const contextWithState = () => ({
      ...getContext(),
      fs,
      currentDirectory,
      setCurrentDirectory,
      environment,
      setEnvironment,
      aliases,
      setAliases,
    });

    // Execute command
    try {
      const result = await cmd.execute(args, flags, contextWithState);
      
      // Add result to output
      if (Array.isArray(result)) {
        const outputLines = result.map(line => {
          if (typeof line === 'string') {
            return { type: 'text', content: line };
          }
          return line;
        });
        setOutput(prev => [...prev, ...outputLines]);
      } else if (result) {
        setOutput(prev => [...prev, { type: 'text', content: result }]);
      }
    } catch (err) {
      setOutput(prev => [
        ...prev,
        { type: 'error', content: `Error executing ${command}: ${err.message}` }
      ]);
    }
  }, [currentDirectory, environment, aliases, getContext]);

  // Execute piped commands
  const executePipedCommands = useCallback(async (commands) => {
    let pipeData = null;

    for (const cmd of commands) {
      const registry = registryRef.current;
      const fs = fsRef.current;

      if (!registry) continue;

      const command = registry.getCommand(cmd.command);

      if (!command) {
        setOutput(prev => [
          ...prev,
          { type: 'error', content: `Command not found: ${cmd.command}` }
        ]);
        return;
      }

      const contextWithState = () => ({
        ...getContext(),
        fs,
        currentDirectory,
        setCurrentDirectory,
        environment,
        setEnvironment,
        pipeInput: pipeData,
      });

      try {
        pipeData = await command.execute(cmd.args, cmd.flags, contextWithState);
      } catch (err) {
        setOutput(prev => [
          ...prev,
          { type: 'error', content: `Error in pipe: ${err.message}` }
        ]);
        return;
      }
    }

    // Output final result
    if (pipeData) {
      if (Array.isArray(pipeData)) {
        setOutput(prev => [...prev, ...pipeData.map(line => 
          typeof line === 'string' ? { type: 'text', content: line } : line
        )]);
      } else {
        setOutput(prev => [...prev, { type: 'text', content: pipeData }]);
      }
    }
  }, [currentDirectory, environment, getContext]);

  // Clear output
  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  // Get command suggestions
  const getCommandSuggestions = useCallback((partial) => {
    const registry = registryRef.current;
    if (!registry) return [];

    const commands = registry.getAllCommands();
    return commands
      .filter(cmd => cmd.name.startsWith(partial))
      .map(cmd => cmd.name);
  }, []);

  // Navigate history
  const navigateHistory = useCallback((direction) => {
    if (commandHistory.length === 0) return null;

    let newIndex = historyIndex;

    if (direction === 'up') {
      newIndex = historyIndex === -1 
        ? commandHistory.length - 1 
        : Math.max(0, historyIndex - 1);
    } else if (direction === 'down') {
      newIndex = historyIndex === -1 
        ? -1 
        : Math.min(commandHistory.length - 1, historyIndex + 1);
    }

    setHistoryIndex(newIndex);
    return newIndex === -1 ? '' : commandHistory[newIndex];
  }, [commandHistory, historyIndex]);

  return {
    output,
    commandHistory,
    currentDirectory,
    environment,
    aliases,
    executeCommand,
    clearOutput,
    getCommandSuggestions,
    navigateHistory,
    registry: registryRef.current,
    fs: fsRef.current,
  };
}
