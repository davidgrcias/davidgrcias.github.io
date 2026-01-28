import React from 'react';
import { motion } from 'framer-motion';
import { FileText, FolderOpen, Image, Mail } from 'lucide-react';

/**
 * Desktop Icon/Shortcut Component
 */
const DesktopIcon = ({ icon, label, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onDoubleClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer select-none group w-24"
    >
      {/* Icon */}
      <div className="w-16 h-16 flex items-center justify-center text-white/90 group-hover:text-white transition-colors">
        {icon}
      </div>
      
      {/* Label */}
      <span className="text-xs text-white text-center font-medium drop-shadow-lg px-2 py-1 bg-black/30 backdrop-blur-sm rounded-md group-hover:bg-black/50 transition-all">
        {label}
      </span>
    </motion.button>
  );
};

export default DesktopIcon;
