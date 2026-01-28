import React, { useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Mobile Bottom Sheet
 * iOS/Android style bottom sheet that can be dragged to dismiss
 */
const BottomSheet = ({ 
    isOpen, 
    onClose, 
    children,
    title,
    height = '80%',
    dismissible = true,
}) => {
    // Prevent body scroll when sheet is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleDrag = (event, info) => {
        // If dragged down more than 100px, close the sheet
        if (info.offset.y > 100) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={dismissible ? onClose : undefined}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        drag={dismissible ? 'y' : false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.2}
                        onDragEnd={handleDrag}
                        className="fixed left-0 right-0 bottom-0 bg-zinc-900/95 backdrop-blur-xl rounded-t-3xl border-t border-zinc-700 z-[9999] overflow-hidden flex flex-col"
                        style={{ maxHeight: height }}
                    >
                        {/* Handle */}
                        <div className="flex-shrink-0 pt-3 pb-2 flex justify-center">
                            <div className="w-12 h-1.5 bg-zinc-600 rounded-full" />
                        </div>

                        {/* Header */}
                        {title && (
                            <div className="flex-shrink-0 px-6 pb-4 border-b border-zinc-700 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white">{title}</h2>
                                {dismissible && (
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-white" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BottomSheet;
