import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../contexts/OSContext';
import { useSound } from '../../contexts/SoundContext';
import { X } from 'lucide-react';

/**
 * WindowSwitcher - Alt+Tab style window switcher overlay
 * Shows all open windows with preview and keyboard navigation
 */
const WindowSwitcher = ({ isOpen, onClose, onSelectWindow }) => {
  const { windows, focusWindow } = useOS();
  const { playTabSwitch, playMenuClose } = useSound();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const openWindows = windows.filter(w => !w.minimized);

  // Reset selected index when opened
  useEffect(() => {
    if (isOpen && openWindows.length > 0) {
      setSelectedIndex(0);
      playTabSwitch();
    }
  }, [isOpen, openWindows.length, playTabSwitch]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        playTabSwitch();
        if (e.shiftKey) {
          // Shift+Tab - go backwards
          setSelectedIndex(prev => 
            prev <= 0 ? openWindows.length - 1 : prev - 1
          );
        } else {
          // Tab - go forwards
          setSelectedIndex(prev => 
            prev >= openWindows.length - 1 ? 0 : prev + 1
          );
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (openWindows[selectedIndex]) {
          focusWindow(openWindows[selectedIndex].id);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        playMenuClose();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        playTabSwitch();
        setSelectedIndex(prev => 
          prev >= openWindows.length - 1 ? 0 : prev + 1
        );
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        playTabSwitch();
        setSelectedIndex(prev => 
          prev <= 0 ? openWindows.length - 1 : prev - 1
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, openWindows, selectedIndex, focusWindow, onClose]);

  // Auto-select on Alt release
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyUp = (e) => {
      if (e.key === 'Alt') {
        if (openWindows[selectedIndex]) {
          focusWindow(openWindows[selectedIndex].id);
        }
        onClose();
      }
    };

    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [isOpen, openWindows, selectedIndex, focusWindow, onClose]);

  if (!isOpen || openWindows.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-zinc-900/95 border border-zinc-700 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl max-w-5xl w-full mx-3 sm:mx-4 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl font-bold text-white">Window Switcher</h2>
              <p className="hidden sm:block text-sm text-zinc-400 mt-1">
                Use Tab/Shift+Tab or Arrow keys to navigate • Enter to select • Esc to cancel
              </p>
              <p className="sm:hidden text-xs text-zinc-400 mt-1">Tap a window to switch</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Windows Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {openWindows.map((window, index) => (
              <motion.div
                key={window.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  focusWindow(window.id);
                  onClose();
                }}
                className={`
                  relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200
                  ${selectedIndex === index 
                    ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/50 scale-105' 
                    : 'hover:ring-2 hover:ring-zinc-600 hover:scale-102'
                  }
                `}
              >
                {/* Window Preview */}
                <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border-b border-zinc-700">
                  <div className="text-4xl sm:text-6xl opacity-50">
                    {window.icon || '📱'}
                  </div>
                </div>

                {/* Window Info */}
                <div className="bg-zinc-800/90 p-3 sm:p-4">
                  <h3 className="text-white font-semibold truncate">{window.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1">Window {index + 1} of {openWindows.length}</p>
                </div>

                {/* Selected Indicator */}
                {selectedIndex === index && (
                  <motion.div
                    layoutId="selected-window"
                    className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none"
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Footer Hint */}
          <div className="hidden sm:block mt-6 text-center text-sm text-zinc-500">
            Hold <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-300 font-mono">Alt</kbd> and press <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-300 font-mono">Tab</kbd> to switch windows
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WindowSwitcher;
