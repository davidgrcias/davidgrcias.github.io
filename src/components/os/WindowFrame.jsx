import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Maximize2 } from 'lucide-react';
import { useOS } from '../../contexts/OSContext';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';

const WindowFrame = ({ window }) => {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, activeWindowId } = useOS();
  const { isMobile, isTablet } = useDeviceDetection();
  const constraintsRef = useRef(null);
  
  const isActive = activeWindowId === window.id;

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
      dragConstraints={{ left: 0, top: 0, right: window.innerWidth - 400, bottom: window.innerHeight - 200 }}
      initial={{ scale: 0.8, opacity: 0, y: 50 }}
      animate={{ 
        scale: window.isMinimized ? 0.8 : 1, 
        opacity: window.isMinimized ? 0 : 1, 
        y: window.isMinimized ? 100 : 0,
        display: window.isMinimized ? 'none' : 'flex',
      }}
      exit={{ scale: 0.8, opacity: 0, y: 50 }}
      transition={{ 
        type: 'spring', 
        damping: 25, 
        stiffness: 300,
        opacity: { duration: 0.2 },
      }}
      onMouseDown={() => focusWindow(window.id)}
      style={{ 
        zIndex: window.zIndex,
        position: 'absolute',
        ...getWindowStyle(),
      }}
      className={`bg-slate-900/95 backdrop-blur-xl border ${
        isActive ? 'border-blue-500/50 shadow-2xl shadow-blue-500/20' : 'border-white/10 shadow-xl'
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
            <button 
                onClick={(e) => { e.stopPropagation(); minimizeWindow(window.id); }}
                className="p-1.5 hover:bg-yellow-500/20 rounded-full transition-all duration-200 group"
                title="Minimize (Ctrl+M)"
                aria-label="Minimize window"
            >
                <Minus size={14} className="text-yellow-400 group-hover:scale-110 transition-transform" />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); maximizeWindow(window.id); }}
                className="p-1.5 hover:bg-green-500/20 rounded-full transition-all duration-200 group"
                title="Maximize"
                aria-label="Maximize window"
            >
                <Maximize2 size={13} className="text-green-400 group-hover:scale-110 transition-transform" />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); closeWindow(window.id); }}
                className="p-1.5 hover:bg-red-500/20 rounded-full transition-all duration-200 group"
                title="Close (Esc or Ctrl+W)"
                aria-label="Close window"
            >
                <X size={14} className="text-red-400 group-hover:scale-110 group-hover:rotate-90 transition-all" />
            </button>
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
