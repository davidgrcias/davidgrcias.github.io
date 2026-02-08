import React, { useRef, useState, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Minus, Maximize2, Move } from 'lucide-react';
import { useOS } from '../../contexts/OSContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { useTouchGestures } from '../../hooks/useTouchGestures';
import { useSound } from '../../contexts/SoundContext';

const WindowFrame = ({ window, onWindowContextMenu }) => {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, activeWindowId, resizeWindow } = useOS();
  const { theme } = useTheme();
  const { isMobile, isTablet, width, height } = useDeviceDetection();
  const { playWindowClose, playWindowMinimize, playWindowMaximize } = useSound();
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const windowRef = useRef(null);

  const isActive = activeWindowId === window.id;

  // Minimum window dimensions
  const MIN_WIDTH = 400;
  const MIN_HEIGHT = 300;

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
      // Taskbar auto-hides when maximized, so we can use full height
      return {
        width: '100%',
        height: '100%',
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
    // Use custom dimensions if resized, else defaults
    const w = window.customWidth || 800;
    const h = window.customHeight || 600;
    return {
      width: `min(${w}px, 90vw)`,
      height: `min(${h}px, 85vh)`,
      top: `calc((100vh - 72px) / 2 - min(${h / 2}px, 42.5vh))`, // Centered in available space (excluding taskbar ~72px)
      left: `calc(50vw - min(${w / 2}px, 45vw))`,  // Horizontally centered
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

  const renderedContent = React.isValidElement(window.component)
    ? React.cloneElement(window.component, { id: window.id })
    : window.component;

  // ===== RESIZE LOGIC =====
  const handleResizeStart = (e, direction) => {
    if (isMobile || isTablet || window.isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const el = windowRef.current;
    if (!el) return;

    const startWidth = el.offsetWidth;
    const startHeight = el.offsetHeight;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      // Adjust width based on direction
      if (direction.includes('e')) newWidth = startWidth + deltaX;
      if (direction.includes('w')) newWidth = startWidth - deltaX;
      if (direction.includes('s')) newHeight = startHeight + deltaY;
      if (direction.includes('n')) newHeight = startHeight - deltaY;

      // Enforce minimums
      newWidth = Math.max(MIN_WIDTH, Math.min(newWidth, globalThis.innerWidth - 20));
      newHeight = Math.max(MIN_HEIGHT, Math.min(newHeight, globalThis.innerHeight - 20));

      resizeWindow(window.id, newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Resize handle definitions - 8 directions
  const resizeHandles = !isMobile && !isTablet && !window.isMaximized ? [
    { dir: 'n',  className: 'absolute -top-1 left-2 right-2 h-2 cursor-n-resize z-20' },
    { dir: 's',  className: 'absolute -bottom-1 left-2 right-2 h-2 cursor-s-resize z-20' },
    { dir: 'e',  className: 'absolute top-2 -right-1 w-2 bottom-2 cursor-e-resize z-20' },
    { dir: 'w',  className: 'absolute top-2 -left-1 w-2 bottom-2 cursor-w-resize z-20' },
    { dir: 'ne', className: 'absolute -top-1 -right-1 w-4 h-4 cursor-ne-resize z-30' },
    { dir: 'nw', className: 'absolute -top-1 -left-1 w-4 h-4 cursor-nw-resize z-30' },
    { dir: 'se', className: 'absolute -bottom-1 -right-1 w-4 h-4 cursor-se-resize z-30' },
    { dir: 'sw', className: 'absolute -bottom-1 -left-1 w-4 h-4 cursor-sw-resize z-30' },
  ] : [];

  return (
    <motion.div
      ref={windowRef}
      data-window-id={window.id}
      drag={!isMobile && !window.isMaximized && !isResizing}
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
        y: window.isMinimized ? 200 : 0, // Always reset to 0, not undefined - fixes vertical centering!
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
      {/* Resize Handles */}
      {resizeHandles.map(({ dir, className }) => (
        <div
          key={dir}
          className={className}
          onMouseDown={(e) => handleResizeStart(e, dir)}
        />
      ))}

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
            onClick={(e) => { e.stopPropagation(); playWindowMinimize(); minimizeWindow(window.id); }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 hover:bg-yellow-500/20 rounded-full transition-colors group"
            title="Minimize (Ctrl+M)"
          >
            <Minus size={14} className="text-yellow-400" />
          </motion.button>
          <motion.button
            onClick={(e) => { e.stopPropagation(); playWindowMaximize(); maximizeWindow(window.id); }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 hover:bg-green-500/20 rounded-full transition-colors group"
            title="Maximize"
          >
            <Maximize2 size={13} className="text-green-400" />
          </motion.button>
          <motion.button
            onClick={(e) => { e.stopPropagation(); playWindowClose(); closeWindow(window.id); }}
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
        {renderedContent}
      </div>
    </motion.div>
  );
};

export default WindowFrame;
