import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Tooltip component with smooth animations
 * Position: top, bottom, left, right
 */
const Tooltip = ({ 
    children, 
    content, 
    position = 'top',
    delay = 300,
    className = '' 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);

    const showTooltip = () => {
        const id = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        setTimeoutId(id);
    };

    const hideTooltip = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        setIsVisible(false);
    };

    const positions = {
        top: {
            container: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
            arrow: 'top-full left-1/2 -translate-x-1/2 border-t-zinc-800 border-x-transparent border-b-transparent',
            initial: { opacity: 0, y: 5 },
            animate: { opacity: 1, y: 0 },
        },
        bottom: {
            container: 'top-full left-1/2 -translate-x-1/2 mt-2',
            arrow: 'bottom-full left-1/2 -translate-x-1/2 border-b-zinc-800 border-x-transparent border-t-transparent',
            initial: { opacity: 0, y: -5 },
            animate: { opacity: 1, y: 0 },
        },
        left: {
            container: 'right-full top-1/2 -translate-y-1/2 mr-2',
            arrow: 'left-full top-1/2 -translate-y-1/2 border-l-zinc-800 border-y-transparent border-r-transparent',
            initial: { opacity: 0, x: 5 },
            animate: { opacity: 1, x: 0 },
        },
        right: {
            container: 'left-full top-1/2 -translate-y-1/2 ml-2',
            arrow: 'right-full top-1/2 -translate-y-1/2 border-r-zinc-800 border-y-transparent border-l-transparent',
            initial: { opacity: 0, x: -5 },
            animate: { opacity: 1, x: 0 },
        },
    };

    const config = positions[position];

    return (
        <div 
            className={`relative inline-block ${className}`}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
        >
            {children}
            
            <AnimatePresence>
                {isVisible && content && (
                    <motion.div
                        initial={config.initial}
                        animate={config.animate}
                        exit={config.initial}
                        transition={{ duration: 0.15 }}
                        className={`absolute z-50 ${config.container}`}
                        style={{ pointerEvents: 'none' }}
                    >
                        <div className="bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-zinc-700 whitespace-nowrap">
                            {content}
                            <div className={`absolute w-0 h-0 border-4 ${config.arrow}`} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;
