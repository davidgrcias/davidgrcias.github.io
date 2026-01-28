import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Zap, Star } from 'lucide-react';
import Confetti from 'react-confetti';

/**
 * KonamiSecret - Easter egg activated by Konami Code
 * Shows special animation and unlocks secret achievement
 */
const KonamiSecret = ({ isOpen, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 backdrop-blur-lg"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 200,
          }}
          className="relative max-w-2xl w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glowing background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-3xl opacity-50 animate-pulse"></div>
          
          <div className="relative bg-gradient-to-br from-zinc-900 via-purple-900/50 to-zinc-900 border-2 border-purple-500/50 rounded-3xl p-12 shadow-2xl overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '50px 50px',
              }}></div>
            </div>

            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <X className="text-white" size={24} />
            </motion.button>

            {/* Content */}
            <div className="relative text-center space-y-8">
              {/* Icon */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="inline-block"
              >
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Trophy size={64} className="text-white" />
                </div>
              </motion.div>

              {/* Title */}
              <div>
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent"
                >
                  🎮 KONAMI CODE!
                </motion.h1>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl text-white font-semibold mb-2"
                >
                  You Found The Secret!
                </motion.p>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-purple-200"
                >
                  ↑ ↑ ↓ ↓ ← → ← → B A
                </motion.p>
              </div>

              {/* Achievement box */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-2xl p-6"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Star className="text-yellow-400" size={32} />
                  <h3 className="text-2xl font-bold text-white">Achievement Unlocked!</h3>
                  <Star className="text-yellow-400" size={32} />
                </div>
                <p className="text-yellow-200 text-lg mb-2">🎮 Konami Master</p>
                <p className="text-white text-sm mb-4">You entered the legendary Konami Code!</p>
                <div className="flex items-center justify-center gap-2">
                  <Zap className="text-yellow-400" size={20} />
                  <span className="text-2xl font-bold text-yellow-400">+100 Points</span>
                  <Zap className="text-yellow-400" size={20} />
                </div>
              </motion.div>

              {/* Fun message */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <p className="text-purple-200 text-lg">
                  "The secret to getting ahead is getting started... with cheat codes!"
                </p>
                <p className="text-sm text-zinc-400">
                  You're a true gamer at heart. Respect! 🎮
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10"
              >
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-400">30</p>
                  <p className="text-xs text-zinc-400">Lives Added</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">∞</p>
                  <p className="text-xs text-zinc-400">Ammo</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-400">MAX</p>
                  <p className="text-xs text-zinc-400">Power</p>
                </div>
              </motion.div>

              {/* Close button */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-2xl"
              >
                Continue Your Journey
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default KonamiSecret;
