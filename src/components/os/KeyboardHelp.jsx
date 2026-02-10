import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Zap, Search, Command } from 'lucide-react';

/**
 * KeyboardHelp - Overlay showing all keyboard shortcuts
 * Triggered by pressing ? or Ctrl+/
 */
const KeyboardHelp = ({ isOpen, onClose }) => {
  const shortcuts = [
    {
      category: 'General',
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      items: [
        { keys: ['Ctrl', 'K'], description: 'Open Command Palette' },
        { keys: ['Ctrl', 'Space'], description: 'Open Spotlight Search' },
        { keys: ['Alt', 'Tab'], description: 'Window Switcher' },
        { keys: ['Ctrl', 'Shift', 'S'], description: 'Take Screenshot' },
        { keys: ['Ctrl', '/'], description: 'Show Keyboard Shortcuts (this)' },
        { keys: ['F5'], description: 'Refresh Desktop' },
        { keys: ['Esc'], description: 'Close active dialog/palette' },
      ],
    },
    {
      category: 'Window Management',
      icon: <Command className="w-5 h-5 text-blue-400" />,
      items: [
        { keys: ['Ctrl', 'W'], description: 'Close active window' },
        { keys: ['Ctrl', 'M'], description: 'Minimize active window' },
        { keys: ['Ctrl', 'Shift', 'M'], description: 'Maximize/restore window' },
        { keys: ['Click'], description: 'Focus window' },
        { keys: ['Drag'], description: 'Move window (from title bar)' },
      ],
    },
    {
      category: 'Search & Navigation',
      icon: <Search className="w-5 h-5 text-purple-400" />,
      items: [
        { keys: ['↑', '↓'], description: 'Navigate results' },
        { keys: ['Enter'], description: 'Select/execute' },
        { keys: ['Tab'], description: 'Next item (in switcher)' },
        { keys: ['Shift', 'Tab'], description: 'Previous item' },
      ],
    },
    {
      category: 'Easter Eggs',
      icon: <Keyboard className="w-5 h-5 text-pink-400" />,
      items: [
        { keys: ['↑↑↓↓←→←→BA'], description: 'Konami Code (+100 points!)' },
        { keys: ['Search "snake"'], description: 'Play Snake game in Command Palette' },
        { keys: ['Click DG logo'], description: 'Open Spotlight' },
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-zinc-900/95 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[85vh] overflow-hidden backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Keyboard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
                  <p className="text-blue-100 text-sm mt-1">Master your WebOS workflow</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {shortcuts.map((section, idx) => (
                <motion.div
                  key={section.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5"
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-700">
                    {section.icon}
                    <h3 className="font-semibold text-white text-lg">{section.category}</h3>
                  </div>

                  {/* Shortcuts List */}
                  <div className="space-y-3">
                    {section.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-4 p-2 rounded-lg hover:bg-zinc-700/50 transition-colors"
                      >
                        <span className="text-sm text-zinc-300 flex-1">{item.description}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {item.keys.map((key, i) => (
                            <React.Fragment key={i}>
                              <kbd className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-600 rounded-md text-xs font-mono text-zinc-200 shadow-sm min-w-[2rem] text-center">
                                {key}
                              </kbd>
                              {i < item.keys.length - 1 && key.length <= 3 && (
                                <span className="text-zinc-500 text-xs">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer Tip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
            >
              <p className="text-sm text-blue-300 text-center">
                💡 <strong>Pro Tip:</strong> Press <kbd className="px-2 py-1 bg-zinc-900 border border-blue-500/50 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-2 py-1 bg-zinc-900 border border-blue-500/50 rounded text-xs font-mono">/</kbd> anytime to see this help panel again!
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default KeyboardHelp;
