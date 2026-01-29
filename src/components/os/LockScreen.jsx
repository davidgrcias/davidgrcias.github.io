import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ChevronUp, User } from 'lucide-react';

/**
 * Lock Screen Component
 * Shows a beautiful lock screen on initial load
 * User can click/swipe up to unlock
 */
const LockScreen = ({ onUnlock }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [dragY, setDragY] = useState(0);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleUnlock = () => {
    setIsUnlocking(true);
    // Play unlock sound if available
    setTimeout(() => {
      onUnlock();
    }, 500);
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.y < -100) {
      handleUnlock();
    }
  };

  return (
    <AnimatePresence>
      {!isUnlocking && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: '-100%' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-between overflow-hidden select-none"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 30%, #0f172a 70%, #1e3a5f 100%)',
          }}
        >
          {/* Animated Background Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
                }}
                animate={{
                  y: [null, -100],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

          {/* Top Section - Empty for spacing */}
          <div className="flex-1" />

          {/* Center Content - Time & Date */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center z-10 px-4"
          >
            {/* Time */}
            <motion.h1
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extralight text-white tracking-tight"
              style={{ textShadow: '0 0 60px rgba(34, 211, 238, 0.3)' }}
            >
              {formatTime(currentTime)}
            </motion.h1>

            {/* Date */}
            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-white/70 mt-2 sm:mt-4 font-light tracking-wide text-center"
            >
              {formatDate(currentTime)}
            </motion.p>

            {/* User Avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="mt-8 sm:mt-12 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/30"
            >
              <User size={40} className="text-white sm:w-12 sm:h-12" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-3 sm:mt-4 text-white font-medium text-base sm:text-lg"
            >
              David Garcia
            </motion.p>
          </motion.div>

          {/* Bottom Section - Unlock Prompt */}
          <motion.div
            drag="y"
            dragConstraints={{ top: -150, bottom: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
            onClick={handleUnlock}
            className="flex-1 flex flex-col items-center justify-end pb-8 sm:pb-12 md:pb-16 cursor-pointer z-10"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2"
            >
              <ChevronUp size={32} className="text-white/60" />
              <ChevronUp size={32} className="text-white/40 -mt-5" />
            </motion.div>

            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/60 text-sm sm:text-base mt-4 flex items-center gap-2"
            >
              <Lock size={16} />
              Swipe up or click to unlock
            </motion.p>
          </motion.div>

          {/* Subtle Glow Effect at bottom */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LockScreen;
