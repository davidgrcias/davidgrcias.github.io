/**
 * useTabCompletion Hook
 * Tab completion for commands, paths, and arguments
 */

import { useState, useCallback } from 'react';

export function useTabCompletion(registry, fs, currentDirectory) {
  const [suggestions, setSuggestions] = useState([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

  // Get all possible completions for current input
  const getCompletions = useCallback((input) => {
    if (!input) return [];

    const parts = input.split(' ');
    const lastPart = parts[parts.length - 1];

    // If it's the first word, complete command names
    if (parts.length === 1) {
      return getCommandCompletions(lastPart);
    }

    // Otherwise, complete file paths
    return getPathCompletions(lastPart);
  }, [registry, fs, currentDirectory]);

  // Get command name completions
  const getCommandCompletions = useCallback((partial) => {
    if (!registry) return [];

    const commands = registry.getAllCommands();
    return commands
      .filter(cmd => cmd.name.startsWith(partial))
      .map(cmd => cmd.name)
      .sort();
  }, [registry]);

  // Get path completions
  const getPathCompletions = useCallback((partial) => {
    if (!fs) return [];

    try {
      // Determine directory to search in
      let searchDir = currentDirectory;
      let prefix = '';

      if (partial.includes('/')) {
        const lastSlash = partial.lastIndexOf('/');
        const dir = partial.substring(0, lastSlash + 1);
        prefix = partial.substring(lastSlash + 1);
        
        // Resolve directory
        if (dir.startsWith('/')) {
          searchDir = dir;
        } else if (dir.startsWith('~/')) {
          searchDir = '/home/david/' + dir.substring(2);
        } else {
          searchDir = fs.resolvePath(currentDirectory, dir);
        }
      } else {
        prefix = partial;
      }

      // Get directory contents
      const contents = fs.ls(searchDir);
      
      // Filter by prefix
      const matches = contents
        .filter(item => item.name.startsWith(prefix))
        .map(item => {
          const fullPath = partial.substring(0, partial.lastIndexOf('/') + 1);
          return fullPath + item.name + (item.type === 'directory' ? '/' : '');
        })
        .sort();

      return matches;
    } catch (err) {
      return [];
    }
  }, [fs, currentDirectory]);

  // Handle tab key press
  const handleTab = useCallback((input) => {
    const completions = getCompletions(input);

    if (completions.length === 0) {
      return { completed: input, suggestions: [] };
    }

    setSuggestions(completions);

    if (completions.length === 1) {
      // Single match - auto complete
      const parts = input.split(' ');
      parts[parts.length - 1] = completions[0];
      const completed = parts.join(' ');
      
      setSuggestions([]);
      setCurrentSuggestionIndex(0);
      
      return { completed, suggestions: [] };
    }

    // Multiple matches - show suggestions
    // Find common prefix
    const commonPrefix = findCommonPrefix(completions);
    
    if (commonPrefix.length > input.split(' ').pop().length) {
      // Complete to common prefix
      const parts = input.split(' ');
      parts[parts.length - 1] = commonPrefix;
      const completed = parts.join(' ');
      
      return { completed, suggestions: completions };
    }

    // No additional completion possible
    return { completed: input, suggestions: completions };
  }, [getCompletions]);

  // Cycle through suggestions with repeated tabs
  const cycleSuggestion = useCallback((input) => {
    if (suggestions.length === 0) {
      return handleTab(input);
    }

    const nextIndex = (currentSuggestionIndex + 1) % suggestions.length;
    setCurrentSuggestionIndex(nextIndex);

    const parts = input.split(' ');
    parts[parts.length - 1] = suggestions[nextIndex];
    const completed = parts.join(' ');

    return { completed, suggestions };
  }, [suggestions, currentSuggestionIndex, handleTab]);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setCurrentSuggestionIndex(0);
  }, []);

  return {
    suggestions,
    handleTab,
    cycleSuggestion,
    clearSuggestions,
  };
}

// Helper: Find common prefix among strings
function findCommonPrefix(strings) {
  if (strings.length === 0) return '';
  if (strings.length === 1) return strings[0];

  let prefix = strings[0];

  for (let i = 1; i < strings.length; i++) {
    while (strings[i].indexOf(prefix) !== 0) {
      prefix = prefix.substring(0, prefix.length - 1);
      if (prefix === '') return '';
    }
  }

  return prefix;
}
