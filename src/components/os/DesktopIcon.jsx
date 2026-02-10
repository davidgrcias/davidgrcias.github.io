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

const DesktopIcon = ({ icon, label, badge, onClick, onContextMenu, onDragEnd, style, isDragging, dragKey, gridSize = 120 }) => {
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
      whileHover={{ scale: 1.1, y: -5, filter: 'brightness(1.2)' }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      onDoubleClick={handleClick}
      style={{ 
        position: 'absolute', 
        width: gridSize,
        height: gridSize,
        ...style 
      }}
      className={`flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 cursor-pointer select-none group ${isDragging ? 'z-50 cursor-grabbing opacity-80 scale-110' : 'z-10 cursor-pointer'}`}
    >
      {/* Icon - Floating Effect */}
      <div className={`relative ${gridSize < 100 ? 'w-12 h-12' : 'w-16 h-16'} flex items-center justify-center text-white transition-all pointer-events-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]`}>
        {gridSize < 100 ? React.cloneElement(icon, { size: 26 }) : icon}
        {badge && (
          <span className="absolute -top-1 -right-1 px-1.5 py-[1px] text-[8px] font-bold leading-tight rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 ring-1 ring-emerald-400/50 animate-pulse pointer-events-none">
            {badge}
          </span>
        )}
      </div>

      {/* Label - No box, just strong shadow */}
      <span className={`${gridSize < 100 ? 'text-[11px]' : 'text-[13px]'} text-white text-center font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] px-1 rounded transition-all pointer-events-none line-clamp-2 leading-tight max-w-[100%] group-hover:text-white`}>
        {label}
      </span>
    </motion.button>
  );
};

export default DesktopIcon;
