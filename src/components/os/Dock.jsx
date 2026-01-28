import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Terminal, MessageSquare, FolderOpen, User, StickyNote, Settings, Plus } from 'lucide-react';
import { useOS } from '../../contexts/OSContext';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';

/**
 * Dock - macOS-style app launcher with magnification effect
 * Bottom-center floating dock with hover animations
 */
const Dock = ({ apps = [] }) => {
  const { openApp, windows } = useOS();
  const { isMobile } = useDeviceDetection();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Default dock apps if none provided
  const defaultApps = [
    { id: 'vscode', icon: Code, label: 'Portfolio', color: 'text-blue-400' },
    { id: 'file-manager', icon: FolderOpen, label: 'Files', color: 'text-yellow-400' },
    { id: 'about-me', icon: User, label: 'About Me', color: 'text-cyan-400' },
    { id: 'notes', icon: StickyNote, label: 'Notes', color: 'text-yellow-300' },
    { id: 'terminal', icon: Terminal, label: 'Terminal', color: 'text-green-400' },
    { id: 'messenger', icon: MessageSquare, label: 'Chat', color: 'text-purple-400' },
    { id: 'settings', icon: Settings, label: 'Settings', color: 'text-gray-400' },
  ];

  const dockApps = apps.length > 0 ? apps : defaultApps;

  // Check if app is running
  const isAppRunning = (appId) => {
    return windows.some(w => w.id === appId && !w.minimized);
  };

  // Calculate scale based on distance from hovered item
  const getScale = (index) => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(index - hoveredIndex);
    if (distance === 0) return 1.6;
    if (distance === 1) return 1.3;
    if (distance === 2) return 1.1;
    return 1;
  };

  // Calculate translateY based on scale
  const getTranslateY = (index) => {
    const scale = getScale(index);
    return -(scale - 1) * 20;
  };

  if (isMobile) return null; // Hide dock on mobile

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[9998] pointer-events-none">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', damping: 20 }}
        className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl px-3 py-2 shadow-2xl pointer-events-auto"
        style={{
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        <div 
          className="flex items-end gap-2"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {dockApps.map((app, index) => {
            const Icon = app.icon;
            const isRunning = isAppRunning(app.id);
            
            return (
              <motion.div
                key={app.id}
                className="relative flex flex-col items-center"
                onMouseEnter={() => setHoveredIndex(index)}
                animate={{
                  scale: getScale(index),
                  y: getTranslateY(index),
                }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 300,
                }}
              >
                {/* Tooltip */}
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-12 bg-zinc-900/95 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg border border-white/10"
                  >
                    {app.label}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900/95 rotate-45 border-r border-b border-white/10"></div>
                  </motion.div>
                )}

                {/* App Icon */}
                <motion.button
                  onClick={() => {
                    // Get the app component from Desktop or create minimal version
                    openApp({ 
                      id: app.id, 
                      title: app.label,
                      icon: <Icon size={24} />
                    });
                  }}
                  className={`
                    relative w-14 h-14 rounded-xl flex items-center justify-center
                    bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm
                    border border-white/20 hover:border-white/40
                    transition-all duration-200 cursor-pointer
                    ${isRunning ? 'ring-2 ring-blue-400/50' : ''}
                  `}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon size={28} className={app.color} />
                  
                  {/* Running indicator */}
                  {isRunning && (
                    <motion.div
                      layoutId={`running-${app.id}`}
                      className="absolute -bottom-1 w-1 h-1 bg-blue-400 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    />
                  )}
                </motion.button>
              </motion.div>
            );
          })}

          {/* Separator */}
          <div className="w-px h-12 bg-white/20 mx-1 self-center"></div>

          {/* Add More Button */}
          <motion.div
            className="relative flex flex-col items-center"
            onMouseEnter={() => setHoveredIndex(dockApps.length)}
            animate={{
              scale: getScale(dockApps.length),
              y: getTranslateY(dockApps.length),
            }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 300,
            }}
          >
            {hoveredIndex === dockApps.length && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-12 bg-zinc-900/95 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg border border-white/10"
              >
                More Apps
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900/95 rotate-45 border-r border-b border-white/10"></div>
              </motion.div>
            )}

            <motion.button
              onClick={() => {
                // Open command palette when clicking "More Apps"
                const event = new KeyboardEvent('keydown', {
                  key: 'k',
                  ctrlKey: true,
                  bubbles: true
                });
                document.dispatchEvent(event);
              }}
              className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-200 cursor-pointer"
              whileTap={{ scale: 0.9 }}
            >
              <Plus size={28} className="text-zinc-300" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dock;
