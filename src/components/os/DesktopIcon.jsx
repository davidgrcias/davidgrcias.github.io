import React from 'react';
import { motion } from 'framer-motion';
import { FileText, FolderOpen, Image, Mail } from 'lucide-react';

/**
 * Desktop Icon/Shortcut Component
 */
const DesktopIcon = ({ icon, label, onClick, onContextMenu, onDragEnd, style, isDragging }) => {
  return (
    <motion.button
      layoutId={label} // Helps with smooth layout transitions
      drag
      dragMomentum={false}
      onDragEnd={onDragEnd}
      onContextMenu={onContextMenu}
      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onDoubleClick={onClick}
      style={{ position: 'absolute', ...style }}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors duration-200 cursor-pointer select-none group w-24 ${isDragging ? 'z-50 cursor-grabbing' : 'z-10 cursor-pointer'}`}
    >
      {/* Icon */}
      <div className="w-16 h-16 flex items-center justify-center text-white/90 group-hover:text-white transition-colors pointer-events-none">
        {icon}
      </div>

      {/* Label */}
      <span className="text-xs text-white text-center font-medium drop-shadow-md px-2 py-1 bg-black/20 backdrop-blur-sm rounded-md group-hover:bg-black/40 transition-all pointer-events-none line-clamp-2 leading-tight">
        {label}
      </span>
    </motion.button>
  );
};

export default DesktopIcon;
