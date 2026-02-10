import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, X, ArrowRight } from 'lucide-react';

/**
 * MobileExperienceBanner
 * Professional, non-intrusive banner that appears once per session
 * on smaller screens, suggesting the desktop experience.
 */
const MobileExperienceBanner = ({ show }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;

    // Only show once per session
    const hasShown = sessionStorage.getItem('webos-mobile-banner-shown');
    if (hasShown) return;

    // Delay appearance for smooth UX after boot
    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem('webos-mobile-banner-shown', 'true');
    }, 1500);

    return () => clearTimeout(timer);
  }, [show]);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 10000);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-0 right-0 z-[10010] mx-auto w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="relative bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
            {/* Subtle gradient accent on top */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

            <div className="p-4 flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                <Monitor size={20} className="text-blue-400" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/90 leading-snug">
                  Best experienced on desktop
                </p>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">
                  This portfolio is built as a desktop OS. For the full experience, visit on a larger screen.
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={() => setVisible(false)}
                className="flex-shrink-0 w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X size={14} className="text-white/40" />
              </button>
            </div>

            {/* CTA */}
            <button
              onClick={() => setVisible(false)}
              className="w-full px-4 py-2.5 border-t border-white/5 flex items-center justify-center gap-2 text-xs font-medium text-blue-400 hover:bg-white/5 transition-colors"
            >
              Got it, continue exploring
              <ArrowRight size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileExperienceBanner;
