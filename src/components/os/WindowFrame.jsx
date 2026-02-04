import React, { useRef, useState, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Minus, Maximize2, Move } from 'lucide-react';
import { useOS } from '../../contexts/OSContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { useTouchGestures } from '../../hooks/useTouchGestures';
import { useSound } from '../../contexts/SoundContext';

const WindowFrame = ({ window, onWindowContextMenu }) => {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, activeWindowId } = useOS();
  const { theme } = useTheme();
  const { isMobile, isTablet, width, height } = useDeviceDetection();
  const { playClose, playClick } = useSound();
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

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
        width: '100%',
        height: 'calc(100% - 48px)',
        top: 0,
        left: 0,
      };
    }
    if (isMobile) {
      return {
        width: '100%',
        height: '100%',
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
      width: 'min(800px, 90vw)',
      height: 'min(600px, 75vh)',
      top: '10vh',
      left: 'calc(50vw - min(400px, 45vw))',
    };
  };

  // Start drag from title bar
  const handleDragStart = (e) => {
    if (isMobile || window.isMaximized) return;
    setIsDragging(true);
    dragControls.start(e);
  };

  // Handle context menu in window content area
  const handleWindowContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling to desktop

    // Check if window has context menu options
    if (window.contextMenuOptions && window.contextMenuOptions.length > 0) {
      // Trigger window context menu callback
      if (onWindowContextMenu) {
        onWindowContextMenu(window.id, e.clientX, e.clientY, window.contextMenuOptions);
      }
    }
    // If no options, just prevent default (no menu shown)
  };

  return (
    <motion.div
      data-window-id={window.id}
      drag={!isMobile && !window.isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{
        top: 0,
        left: -width * 5, // Allow extensive dragging to the left
        right: width * 5,   // Allow extensive dragging to the right
        bottom: height * 5 // Allow extensive dragging down
      }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{
        scale: window.isMinimized ? 0 : 1,
        opacity: window.isMinimized ? 0 : 1,
        y: window.isMinimized ? 200 : (window.isMaximized ? 0 : undefined), // Force reset Y on maximize
        x: window.isMaximized ? 0 : undefined, // Force reset X on maximize
        display: window.isMinimized ? 'none' : 'flex',
      }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      transition={{
        type: isDragging ? false : 'spring',
        damping: isDragging ? 0 : 25,
        stiffness: isDragging ? 0 : 300,
      }}
      whileHover={{
        boxShadow: isActive ? '0 25px 50px -12px rgba(59, 130, 246, 0.3)' : undefined
      }}
      onMouseDown={() => focusWindow(window.id)}
      onTouchStart={() => focusWindow(window.id)}
      onContextMenu={(e) => {
        // Prevent desktop context menu when right-clicking anywhere on window (including title bar)
        e.stopPropagation();
      }}
      style={{
        zIndex: window.zIndex,
        position: 'absolute',
        ...getWindowStyle(),
        cursor: isDragging ? 'grabbing' : undefined,
      }}
      className={`${theme.colors.window} backdrop-blur-xl border ${isActive ? `border-${theme.colors.accent}-500/50 shadow-2xl shadow-${theme.colors.accent}-500/20` : `${theme.colors.border} shadow-xl`
        } rounded-xl flex flex-col overflow-hidden`}
    >
      {/* Title Bar - Drag Handle */}
      <div
        className={`h-10 flex items-center justify-between px-4 select-none border-b transition-colors ${isActive
          ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-blue-500/30'
          : 'bg-slate-800/30 border-white/5'
          } ${!isMobile && !window.isMaximized ? 'cursor-grab active:cursor-grabbing' : ''}`}
        onPointerDown={handleDragStart}
        style={{ touchAction: 'none' }} // Prevent touch scrolling interference
      >
        <div className="flex items-center gap-2">
          {/* Move indicator when dragging is available */}
          {!isMobile && !window.isMaximized && (
            <Move size={14} className="text-zinc-500" />
          )}
          {window.icon && <span className="text-blue-400">{window.icon}</span>}
          <span className="text-sm font-medium text-gray-200">{window.title}</span>
        </div>

        {/* Traffic Lights */}
        <div
          className="flex items-center gap-2"
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking buttons
        >
          <motion.button
            onClick={(e) => { e.stopPropagation(); playClick(); minimizeWindow(window.id); }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 hover:bg-yellow-500/20 rounded-full transition-colors group"
            title="Minimize (Ctrl+M)"
          >
            <Minus size={14} className="text-yellow-400" />
          </motion.button>
          <motion.button
            onClick={(e) => { e.stopPropagation(); playClick(); maximizeWindow(window.id); }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 hover:bg-green-500/20 rounded-full transition-colors group"
            title="Maximize"
          >
            <Maximize2 size={13} className="text-green-400" />
          </motion.button>
          <motion.button
            onClick={(e) => { e.stopPropagation(); playClose(); closeWindow(window.id); }}
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 hover:bg-red-500/20 rounded-full transition-colors group"
            title="Close (Esc or Ctrl+W)"
          >
            <X size={14} className="text-red-400" />
          </motion.button>
        </div>
      </div>

      {/* Content Area - No drag here */}
      <div
        className="flex-1 overflow-auto bg-slate-900/50 p-1"
        onPointerDown={(e) => e.stopPropagation()}
        onContextMenu={handleWindowContextMenu}
      >
        {window.component}
      </div>
    </motion.div>
  );
};

export default WindowFrame;
