import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, File, Folder, User, Code, Terminal, Bot, StickyNote, Settings, Clock, Sparkles, Mail } from 'lucide-react';
import { useOS } from '../../contexts/OSContext';
import { useSound } from '../../contexts/SoundContext';
import ErrorBoundary from '../ErrorBoundary';

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

/**
 * Spotlight - Global search feature (Cmd+Space or Ctrl+Space)
 * Search across apps, files, settings, and execute actions
 */
const Spotlight = ({ isOpen, onClose, initialQuery = '' }) => {
  const { openApp } = useOS();
  const { playSearchOpen, playMenuSelect, playMenuClose } = useSound();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState([]);

  // Set initial query when provided
  useEffect(() => {
    if (isOpen && initialQuery) {
      setQuery(initialQuery);
    }
    if (isOpen) {
      playSearchOpen();
    }
  }, [isOpen, initialQuery, playSearchOpen]);

  // Searchable content database
  const searchableItems = [
    // Apps
    {
      type: 'app',
      id: 'vscode',
      title: 'VS Code Portfolio',
      icon: Code,
      keywords: ['portfolio', 'code', 'vscode', 'projects'],
      color: 'text-blue-400',
      action: () => openApp({
        id: 'vscode',
        title: 'VS Code',
        icon: <Code size={24} />,
        component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="VS Code"><VSCodeApp /></ErrorBoundary></Suspense>
      })
    },
    {
      type: 'app',
      id: 'file-manager',
      title: 'File Manager',
      icon: Folder,
      keywords: ['files', 'explorer', 'folder'],
      color: 'text-yellow-400',
      action: () => openApp({
        id: 'file-manager',
        title: 'File Manager',
        icon: <Folder size={24} />,
        component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="File Manager"><FileManagerApp /></ErrorBoundary></Suspense>
      })
    },
    {
      type: 'app',
      id: 'about-me',
      title: 'About Me',
      icon: User,
      keywords: ['about', 'bio', 'profile', 'info'],
      color: 'text-cyan-400',
      action: () => openApp({
        id: 'about-me',
        title: 'About Me',
        icon: <User size={24} />,
        component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="About Me"><AboutMeApp /></ErrorBoundary></Suspense>
      })
    },
    {
      type: 'app',
      id: 'notes',
      title: 'Quick Notes',
      icon: StickyNote,
      keywords: ['notes', 'memo', 'write'],
      color: 'text-yellow-300',
      action: () => openApp({
        id: 'notes',
        title: 'Quick Notes',
        icon: <StickyNote size={24} />,
        component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Notes"><NotesApp /></ErrorBoundary></Suspense>
      })
    },
    {
      type: 'app',
      id: 'terminal',
      title: 'Terminal',
      icon: Terminal,
      keywords: ['terminal', 'cli', 'command'],
      color: 'text-green-400',
      action: () => openApp({
        id: 'terminal',
        title: 'Terminal',
        icon: <Terminal size={24} />,
        component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Terminal"><TerminalApp /></ErrorBoundary></Suspense>
      })
    },
    {
      type: 'app',
      id: 'messenger',
      title: 'Messages',
      icon: Bot,
      keywords: ['chat', 'messenger', 'ai'],
      color: 'text-purple-400',
      action: () => openApp({
        id: 'messenger',
        title: 'Messages',
        icon: <Bot size={24} />,
        component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Messenger"><MessengerApp /></ErrorBoundary></Suspense>
      })
    },
    {
      type: 'app',
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      keywords: ['settings', 'preferences', 'config'],
      color: 'text-gray-400',
      action: () => openApp({
        id: 'settings',
        title: 'Settings',
        icon: <Settings size={24} />,
        component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Settings"><SettingsApp /></ErrorBoundary></Suspense>
      })
    },

    // Skills
    { type: 'skill', title: 'React.js Development', icon: Code, keywords: ['react', 'frontend', 'javascript'], color: 'text-blue-400', description: 'Modern React development with hooks' },
    { type: 'skill', title: 'Laravel & PHP', icon: Code, keywords: ['laravel', 'php', 'backend'], color: 'text-red-400', description: 'Full-stack Laravel applications' },
    { type: 'skill', title: 'UI/UX Design', icon: Sparkles, keywords: ['design', 'ui', 'ux', 'figma'], color: 'text-pink-400', description: 'User interface and experience design' },
    { type: 'skill', title: 'MySQL Database', icon: File, keywords: ['mysql', 'database', 'sql'], color: 'text-orange-400', description: 'Database design and optimization' },

    // Quick Actions
    {
      type: 'action',
      title: 'View Projects',
      icon: Folder,
      keywords: ['projects', 'work', 'portfolio'],
      color: 'text-blue-400',
      action: () => openApp({
        id: 'vscode',
        title: 'VS Code',
        icon: <Code size={24} />,
        component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="VS Code"><VSCodeApp /></ErrorBoundary></Suspense>
      })
    },
    {
      type: 'action',
      title: 'Contact Me',
      icon: Mail,
      keywords: ['contact', 'email', 'reach'],
      color: 'text-purple-400',
      action: () => openApp({
        id: 'about-me',
        title: 'About Me',
        icon: <User size={24} />,
        component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="About Me"><AboutMeApp /></ErrorBoundary></Suspense>
      })
    },
    {
      type: 'action',
      title: 'View Experience',
      icon: Clock,
      keywords: ['experience', 'work', 'career'],
      color: 'text-green-400',
      action: () => openApp({
        id: 'vscode',
        title: 'VS Code',
        icon: <Code size={24} />,
        component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="VS Code"><VSCodeApp /></ErrorBoundary></Suspense>
      })
    },

    // Personal Info
    { type: 'info', title: 'David Garcia Saragih', icon: User, keywords: ['name', 'david', 'garcia'], color: 'text-cyan-400', description: 'Full-Stack Developer' },
    { type: 'info', title: 'Jakarta, Indonesia', icon: User, keywords: ['location', 'jakarta', 'indonesia'], color: 'text-cyan-400', description: 'Current location' },
    { type: 'info', title: 'davidgarciasaragih7@gmail.com', icon: User, keywords: ['email', 'contact'], color: 'text-cyan-400', description: 'Email address' },
  ];

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const searchLower = query.toLowerCase();
    const filtered = searchableItems.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(searchLower);
      const keywordMatch = item.keywords?.some(k => k.toLowerCase().includes(searchLower));
      const descriptionMatch = item.description?.toLowerCase().includes(searchLower);
      return titleMatch || keywordMatch || descriptionMatch;
    });

    // Sort by relevance (exact matches first)
    filtered.sort((a, b) => {
      const aExact = a.title.toLowerCase().startsWith(searchLower);
      const bExact = b.title.toLowerCase().startsWith(searchLower);
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    setResults(filtered.slice(0, 8)); // Limit to 8 results
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        playMenuSelect();
        executeAction(results[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        playMenuClose();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const executeAction = (item) => {
    if (item.action) {
      item.action();
    }
    handleClose();
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-start justify-center pt-32 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="bg-zinc-900/95 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-800">
              <Search className="text-zinc-400" size={24} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search apps, skills, actions..."
                autoFocus
                className="flex-1 bg-transparent text-white text-lg placeholder-zinc-500 focus:outline-none"
              />
              {query && (
                <kbd className="px-2 py-1 text-xs bg-zinc-800 rounded border border-zinc-700 text-zinc-400">
                  ESC to close
                </kbd>
              )}
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="max-h-96 overflow-y-auto">
                {results.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={`${item.type}-${item.id || item.title}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => { playMenuSelect(); executeAction(item); }}
                      className={`
                        flex items-center gap-4 px-6 py-4 cursor-pointer transition-all
                        ${selectedIndex === index
                          ? 'bg-blue-600/20 border-l-4 border-blue-500'
                          : 'hover:bg-zinc-800/50 border-l-4 border-transparent'
                        }
                      `}
                    >
                      <div className={`p-2 rounded-lg bg-zinc-800/50 ${item.color}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-zinc-400 truncate">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-400 capitalize">
                          {item.type}
                        </span>
                        {selectedIndex === index && (
                          <kbd className="text-xs px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-400">
                            ↵
                          </kbd>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* No Results */}
            {query && results.length === 0 && (
              <div className="px-6 py-12 text-center">
                <div className="text-5xl mb-3">🔍</div>
                <h3 className="text-white font-semibold mb-1">No results found</h3>
                <p className="text-sm text-zinc-400">Try searching for apps, skills, or actions</p>
              </div>
            )}

            {/* Tips */}
            {!query && (
              <div className="px-6 py-8">
                <h3 className="text-white font-semibold mb-4">Quick Tips</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-sm text-zinc-400">
                    <span className="text-zinc-300">Type app names</span> to open them
                  </div>
                  <div className="text-sm text-zinc-400">
                    <span className="text-zinc-300">Search skills</span> to learn more
                  </div>
                  <div className="text-sm text-zinc-400">
                    <span className="text-zinc-300">Use ↑↓</span> to navigate
                  </div>
                  <div className="text-sm text-zinc-400">
                    <span className="text-zinc-300">Press ↵</span> to select
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Keyboard Shortcut Hint */}
          <div className="mt-3 text-center text-sm text-zinc-500">
            Press <kbd className="px-2 py-1 bg-zinc-800/50 rounded border border-zinc-700 text-zinc-400 mx-1">Ctrl</kbd>
            <span className="mx-1">+</span>
            <kbd className="px-2 py-1 bg-zinc-800/50 rounded border border-zinc-700 text-zinc-400 mx-1">Space</kbd> anytime to search
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Spotlight;
