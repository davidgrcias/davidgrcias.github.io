import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Maximize2 } from 'lucide-react';
import { useOS } from '../../contexts/OSContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { useTouchGestures } from '../../hooks/useTouchGestures';

const WindowFrame = ({ window }) => {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, activeWindowId } = useOS();
  const { theme } = useTheme();
  const { isMobile, isTablet, width, height } = useDeviceDetection();
  const constraintsRef = useRef(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  
  const isActive = activeWindowId === window.id;

  // Touch gestures for mobile
  useTouchGestures({
    onSwipeDown: ({ deltaY }) => {
      if (isMobile && deltaY > 100) {
        closeWindow(window.id);
      }
    },
    enabled: isMobile && isActive,
    threshold: 80,
  });

  // Responsive window dimensions
  const getWindowStyle = () => {
    if (window.isMaximized) {
      return {
        width: '100vw',
        height: 'calc(100vh - 64px)',
        top: 0,
        left: 0,
      };
    }
    if (isMobile) {
      return {
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0,
      };
    }
    if (isTablet) {
      return {
        width: '90vw',
        height: '80vh',
        top: '10vh',
        left: '5vw',
      };
    }
    return {
      width: '800px',
      height: '600px',
      top: '80px',
      left: '80px',
    };
  };

  return (
    <motion.div
      drag={!isMobile && !window.isMaximized}
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{ 
        left: 0, 
        top: 0, 
        right: Math.max(0, width - 400), 
        bottom: Math.max(0, height - 200) 
      }}
      initial={{ scale: 0.9, opacity: 0, y: 20, filter: 'blur(4px)' }}
      animate={{ 
        scale: window.isMinimized ? 0 : 1, 
        opacity: window.isMinimized ? 0 : 1, 
        y: window.isMinimized ? 200 : 0,
        filter: window.isMinimized ? 'blur(8px)' : 'blur(0px)',
        display: window.isMinimized ? 'none' : 'flex',
      }}
      exit={{ scale: 0.9, opacity: 0, y: 20, filter: 'blur(4px)' }}
      transition={{ 
        type: 'spring', 
        damping: 30, 
        stiffness: 400,
        mass: 0.8,
        opacity: { duration: 0.15 },
        filter: { duration: 0.2 },
      }}
      whileHover={{ 
        boxShadow: isActive ? '0 25px 50px -12px rgba(59, 130, 246, 0.3)' : '0 20px 40px -12px rgba(0, 0, 0, 0.5)'
      }}
      onMouseDown={() => focusWindow(window.id)}
      style={{ 
        zIndex: window.zIndex,
        position: 'absolute',
        ...getWindowStyle(),
      }}
      className={`${theme.colors.window} backdrop-blur-xl border ${
        isActive ? `border-${theme.colors.accent}-500/50 shadow-2xl shadow-${theme.colors.accent}-500/20` : `${theme.colors.border} shadow-xl`
      } rounded-xl flex flex-col overflow-hidden transition-all duration-200`}
    >
      {/* Title Bar */}
      <div 
        className={`h-10 flex items-center justify-between px-4 select-none border-b transition-all duration-200 ${
          isActive 
            ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-blue-500/30' 
            : 'bg-slate-800/30 border-white/5'
        } ${!isMobile && !window.isMaximized ? 'cursor-move' : ''}`}
        onPointerDownCapture={(e) => {
           // This ensures drag starts only from title bar
        }}
      >
        <div className="flex items-center gap-2">
           {window.icon && <span className="text-blue-400">{window.icon}</span>}
           <span className="text-sm font-medium text-gray-200">{window.title}</span>
        </div>

        {/* Traffic Lights */}
        <div className="flex items-center gap-2">
            <motion.button 
                onClick={(e) => { e.stopPropagation(); minimizeWindow(window.id); }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 hover:bg-yellow-500/20 rounded-full transition-all duration-200 group"
                title="Minimize (Ctrl+M)"
                aria-label="Minimize window"
            >
                <Minus size={14} className="text-yellow-400 group-hover:scale-110 transition-transform" />
            </motion.button>
            <motion.button 
                onClick={(e) => { e.stopPropagation(); maximizeWindow(window.id); }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 hover:bg-green-500/20 rounded-full transition-all duration-200 group"
                title="Maximize"
                aria-label="Maximize window"
            >
                <Maximize2 size={13} className="text-green-400 group-hover:scale-110 transition-transform" />
            </motion.button>
            <motion.button 
                onClick={(e) => { e.stopPropagation(); closeWindow(window.id); }}
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 hover:bg-red-500/20 rounded-full transition-all duration-200 group"
                title="Close (Esc or Ctrl+W)"
                aria-label="Close window"
            >
                <X size={14} className="text-red-400 transition-all" />
            </motion.button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-slate-900/50 p-1 cursor-auto" onMouseDown={(e) => e.stopPropagation()}>
        {window.component}
      </div>
    </motion.div>
  );
};

export default WindowFrame;
