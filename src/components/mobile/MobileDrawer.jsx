import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight } from 'lucide-react';

/**
 * Mobile Navigation Drawer
 * Slide-in navigation menu for mobile devices
 */
const MobileDrawer = ({ isOpen, onClose, children }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-700 z-[9999] overflow-y-auto"
                    >
                        {/* Close button */}
                        <div className="sticky top-0 p-4 bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-700 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">Menu</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Mobile Menu Item
export const MobileMenuItem = ({ icon, label, onClick, badge }) => {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/50 transition-all active:scale-95 group"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/80 group-hover:text-white group-hover:bg-white/10 transition-all">
                    {icon}
                </div>
                <span className="text-white font-medium">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {badge && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-blue-500 text-white rounded-full">
                        {badge}
                    </span>
                )}
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </div>
        </button>
    );
};

export default MobileDrawer;
