import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Code, Terminal, MessageSquare, FolderOpen, Settings, X, User, StickyNote } from 'lucide-react';
import { useOS } from '../../contexts/OSContext';
import ErrorBoundary from '../ErrorBoundary';

/**
 * Command Palette Component
 * Keyboard-driven app launcher (Cmd/Ctrl + K)
 */

// Lazy load apps
const VSCodeApp = lazy(() => import('../../apps/VSCode/VSCodeApp'));
const TerminalApp = lazy(() => import('../../apps/Terminal/TerminalApp'));
const MessengerApp = lazy(() => import('../../apps/Messenger/MessengerApp'));
const FileManagerApp = lazy(() => import('../../apps/FileManager/FileManagerApp'));
const SettingsApp = lazy(() => import('../../apps/Settings/SettingsApp'));
const AboutMeApp = lazy(() => import('../../apps/AboutMe/AboutMeApp'));
const NotesApp = lazy(() => import('../../apps/Notes/NotesApp'));

const AppLoadingFallback = () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
);

const CommandPalette = ({ isOpen, onClose }) => {
  const { openApp, windows, closeWindow } = useOS();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Available commands
  const commands = [
    {
      id: 'vscode',
      title: 'Open Portfolio',
      description: 'Browse projects and experience',
      icon: <Code size={20} className="text-blue-400" />,
      keywords: ['portfolio', 'vscode', 'code', 'projects'],
      action: () => openApp({ id: 'vscode', title: 'VS Code', icon: <Code size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="VS Code"><VSCodeApp /></ErrorBoundary></Suspense> }),
    },
    {
      id: 'file-manager',
      title: 'Open File Manager',
      description: 'Browse portfolio as file system',
      icon: <FolderOpen size={20} className="text-yellow-400" />,
      keywords: ['files', 'explorer', 'folder', 'browse'],
      action: () => openApp({ id: 'file-manager', title: 'File Manager', icon: <FolderOpen size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="File Manager"><FileManagerApp /></ErrorBoundary></Suspense> }),
    },
    {
      id: 'terminal',
      title: 'Open Terminal',
      description: 'Interactive command line',
      icon: <Terminal size={20} className="text-green-400" />,
      keywords: ['terminal', 'cli', 'command', 'shell'],
      action: () => openApp({ id: 'terminal', title: 'Terminal', icon: <Terminal size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Terminal"><TerminalApp /></ErrorBoundary></Suspense> }),
    },
    {
      id: 'messenger',
      title: 'Open Chat',
      description: 'Talk with AI assistant',
      icon: <MessageSquare size={20} className="text-purple-400" />,
      keywords: ['chat', 'messenger', 'ai', 'talk'],
      action: () => openApp({ id: 'messenger', title: 'Messages', icon: <MessageSquare size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Messenger"><MessengerApp /></ErrorBoundary></Suspense> }),
    },
    {
      id: 'about-me',
      title: 'About Me',
      description: 'View personal info and skills',
      icon: <User size={20} className="text-cyan-400" />,
      keywords: ['about', 'bio', 'profile', 'info', 'me'],
      action: () => openApp({ id: 'about-me', title: 'About Me', icon: <User size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="About Me"><AboutMeApp /></ErrorBoundary></Suspense> }),
    },
    {
      id: 'notes',
      title: 'Quick Notes',
      description: 'Create and manage notes',
      icon: <StickyNote size={20} className="text-yellow-400" />,
      keywords: ['notes', 'sticky', 'memo', 'write'],
      action: () => openApp({ id: 'notes', title: 'Quick Notes', icon: <StickyNote size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Notes"><NotesApp /></ErrorBoundary></Suspense> }),
    },
    {
      id: 'settings',
      title: 'Open Settings',
      description: 'Configure system preferences',
      icon: <Settings size={20} className="text-gray-400" />,
      keywords: ['settings', 'preferences', 'config'],
      action: () => openApp({ id: 'settings', title: 'Settings', icon: <Settings size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Settings"><SettingsApp /></ErrorBoundary></Suspense> }),
    },
  ];

  // Add close window commands for open windows
  const windowCommands = windows.map(window => ({
    id: `close-${window.id}`,
    title: `Close ${window.title}`,
    description: 'Close this window',
    icon: <X size={20} className="text-red-400" />,
    keywords: ['close', window.title.toLowerCase()],
    action: () => closeWindow(window.id),
  }));

  const allCommands = [...commands, ...windowCommands];

  // Filter commands by query
  const filteredCommands = query
    ? allCommands.filter(cmd =>
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description.toLowerCase().includes(query.toLowerCase()) ||
        cmd.keywords.some(k => k.includes(query.toLowerCase()))
      )
    : commands; // Show only main commands when no query

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          handleClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10003] flex items-start justify-center pt-[20vh] px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Palette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
            <Search size={20} className="text-white/40" />
            <input
              type="text"
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              autoFocus
              className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-base"
            />
            <kbd className="px-2 py-1 text-xs bg-white/10 rounded border border-white/20 text-white/60">
              Esc
            </kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-white/40">
                No commands found
              </div>
            ) : (
              <div className="py-2">
                {filteredCommands.map((command, index) => (
                  <motion.button
                    key={command.id}
                    onClick={() => {
                      command.action();
                      handleClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-4 px-4 py-3 transition-colors ${
                      selectedIndex === index
                        ? 'bg-cyan-500/20 text-white'
                        : 'text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex-shrink-0">{command.icon}</div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium text-sm truncate">{command.title}</div>
                      <div className="text-xs text-white/50 truncate">{command.description}</div>
                    </div>
                    {selectedIndex === index && (
                      <kbd className="px-2 py-1 text-xs bg-white/10 rounded border border-white/20 text-white/60 flex-shrink-0">
                        ↵
                      </kbd>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-slate-950/50 text-xs text-white/40">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↵</kbd>
                Select
              </span>
            </div>
            <span>
              {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
