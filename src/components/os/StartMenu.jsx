import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Settings, X, Cpu, FileText, Clock } from 'lucide-react';

/**
 * Windows 11-Style Start Menu
 * Shows pinned apps grid, search, and mini widgets
 */
const StartMenu = ({ 
  isOpen, 
  onClose, 
  shortcuts = [], 
  onOpenApp,
  profile = {}
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  // Filter shortcuts based on search
  const filteredShortcuts = shortcuts.filter(shortcut =>
    shortcut.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search on open
      setTimeout(() => searchRef.current?.focus(), 100);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleAppClick = (shortcut) => {
    onOpenApp(shortcut);
    onClose();
    setSearchQuery('');
  };



  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />

          {/* Start Menu */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed z-50 
              bottom-14 left-2 sm:left-4
              w-[calc(100vw-16px)] sm:w-[380px] md:w-[420px]
              max-h-[70vh] sm:max-h-[500px]
              bg-slate-950/98 backdrop-blur-3xl
              border border-white/10 rounded-2xl
              shadow-2xl shadow-black/80
              overflow-hidden flex flex-col"
          >
            {/* Header - Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search apps..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Pinned Apps Grid */}
            <div className="p-4 flex-1 overflow-auto">
              <h3 className="text-xs text-white/50 uppercase tracking-wider mb-3 font-medium">
                {searchQuery ? 'Search Results' : 'Pinned'}
              </h3>
              
              {filteredShortcuts.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {filteredShortcuts.map((shortcut, index) => (
                    <motion.button
                      key={shortcut.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleAppClick(shortcut)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/10 active:scale-95 transition-all group"
                    >
                      <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-white/80 group-hover:text-white group-hover:scale-110 transition-all">
                        {shortcut.icon}
                      </div>
                      <span className="text-[11px] text-white/70 group-hover:text-white text-center truncate w-full">
                        {shortcut.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm text-center py-8">
                  No apps found for "{searchQuery}"
                </p>
              )}
            </div>

            {/* Footer - Profile & Settings */}
            <div className="p-3 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {profile.avatar && (
                  <img 
                    src={profile.avatar} 
                    alt={profile.name}
                    className="w-8 h-8 rounded-full object-cover border border-white/20"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-[120px] sm:max-w-[180px]">
                    {profile.name || 'User'}
                  </p>
                  <p className="text-[10px] text-white/50">{profile.role || 'Developer'}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleAppClick({ id: 'settings' })}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Settings"
              >
                <Settings size={18} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StartMenu;
