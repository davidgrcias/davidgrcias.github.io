import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Settings, Info, Wallpaper } from 'lucide-react';
import { useSound } from '../../contexts/SoundContext';

/**
 * Context Menu Component
 * Reusable right-click menu for desktop and windows
 */
const ContextMenu = ({ x, y, onClose, options }) => {
  const { playMenuSelect } = useSound();

  // Calculate safe position to prevent overflow
  const menuWidth = 220;
  const menuHeight = Math.min(options.length * 40 + 16, 400);
  const safeX = Math.min(x, window.innerWidth - menuWidth - 8);
  const safeY = y + menuHeight > window.innerHeight - 8
    ? Math.max(8, y - menuHeight)
    : y;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="fixed bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[10000] min-w-[200px] max-w-[calc(100vw-1rem)]"
        style={{ left: Math.max(8, safeX), top: safeY }}
        onMouseLeave={onClose}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="py-2">
          {options.map((option, index) => (
            <React.Fragment key={`${option.label}-${index}`}>
              {option.separator ? (
                <div className="h-px bg-white/10 my-1 mx-2" />
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playMenuSelect();
                    option.onClick();
                    onClose();
                  }}
                  disabled={option.disabled}
                  className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                    option.disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-white/10 text-white/90 hover:text-white'
                  }`}
                >
                  {option.icon && <span className="text-blue-400">{option.icon}</span>}
                  <span className="text-sm">{option.label}</span>
                  {option.shortcut && (
                    <span className="ml-auto text-xs text-white/40">{option.shortcut}</span>
                  )}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContextMenu;
