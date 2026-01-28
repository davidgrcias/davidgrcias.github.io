import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Maximize2 } from 'lucide-react';
import { useOS } from '../../contexts/OSContext';

const WindowFrame = ({ window }) => {
  const { closeWindow, minimizeWindow, focusWindow } = useOS();
  const constraintsRef = useRef(null); // Constraint to Desktop area (optional, usually parent)

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ scale: 0.9, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0 }}
      onMouseDown={() => focusWindow(window.id)}
      style={{ zIndex: window.zIndex }}
      className={`absolute top-10 left-10 md:top-20 md:left-20 w-[90vw] md:w-[800px] h-[70vh] md:h-[600px] bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl flex flex-col overflow-hidden ${
        window.isMinimized ? 'hidden' : 'flex'
      }`}
    >
      {/* Title Bar */}
      <div 
        className="h-10 bg-slate-800/50 flex items-center justify-between px-4 select-none cursor-move border-b border-white/10"
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
                className="p-1 hover:bg-white/10 rounded-full transition-colors group"
                title="Minimize"
            >
                <Minus size={14} className="text-yellow-400" />
            </button>
            <button 
                 className="p-1 hover:bg-white/10 rounded-full transition-colors group"
                 title="Maximize"
             >
                <Maximize2 size={13} className="text-green-400" />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); closeWindow(window.id); }}
                className="p-1 hover:bg-white/10 rounded-full transition-colors group"
                title="Close"
            >
                <X size={14} className="text-red-400" />
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
