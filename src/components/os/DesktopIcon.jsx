import React, { useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Desktop Icon/Shortcut Component
 * Uses grid-based positioning with snap-to-grid on drag end
 * Icon is centered both horizontally and vertically within its cell
 * 
 * IMPORTANT: 
 * - dragSnapToOrigin=true means icon visually snaps back after drag
 * - Parent component updates actual position via left/top CSS
 * - This prevents transform offset issues
 */
const DRAG_THRESHOLD = 10; // pixels - movement less than this is considered a click

const DesktopIcon = ({ icon, label, onClick, onContextMenu, onDragEnd, style, isDragging, dragKey, gridSize = 120 }) => {
  // Track if a real drag occurred (movement > threshold)
  const hasDragged = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleDragStart = (event, info) => {
    hasDragged.current = false;
    dragStartPos.current = { x: info.point.x, y: info.point.y };
  };

  const handleDrag = (event, info) => {
    const dx = Math.abs(info.point.x - dragStartPos.current.x);
    const dy = Math.abs(info.point.y - dragStartPos.current.y);
    if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
      hasDragged.current = true;
    }
  };

  const handleDragEnd = (event, info) => {
    if (hasDragged.current && onDragEnd) {
      onDragEnd(event, info);
    }
    // Reset flag after short delay
    setTimeout(() => {
      hasDragged.current = false;
    }, 50);
  };

  const handleClick = (e) => {
    // Only open app if NO drag occurred
    if (!hasDragged.current && onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      key={dragKey}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragSnapToOrigin={true} // IMPORTANT: Snap back to origin, parent updates position
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onContextMenu={onContextMenu}
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      onDoubleClick={handleClick}
      style={{ 
        position: 'absolute', 
        width: gridSize,
        height: gridSize,
        ...style 
      }}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl transition-colors duration-200 cursor-pointer select-none group ${isDragging ? 'z-50 cursor-grabbing bg-white/10' : 'z-10 cursor-pointer'}`}
    >
      {/* Icon */}
      <div className="w-14 h-14 flex items-center justify-center text-white/90 group-hover:text-white transition-colors pointer-events-none">
        {icon}
      </div>

      {/* Label */}
      <span className="text-xs text-white text-center font-medium drop-shadow-md px-2 py-1 bg-black/30 backdrop-blur-sm rounded group-hover:bg-black/50 transition-all pointer-events-none line-clamp-2 leading-tight max-w-[95%]">
        {label}
      </span>
    </motion.button>
  );
};

export default DesktopIcon;
