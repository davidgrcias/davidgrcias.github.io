import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Wallpaper Component
 * Renders a dynamic background that changes with time of day
 * Includes subtle particle effects and smooth transitions
 */
const Wallpaper = ({ children, onContextMenu, onClick, className = '' }) => {
  const [timeOfDay, setTimeOfDay] = useState('day'); // 'morning', 'day', 'evening', 'night'
  const [gradient, setGradient] = useState('');

  // Determine time of day and gradient
  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      let newTime = 'day';
      let newGradient = '';

      if (hour >= 5 && hour < 11) {
        newTime = 'morning';
        newGradient = 'bg-gradient-to-br from-indigo-400 via-cyan-400 to-teal-400';
      } else if (hour >= 11 && hour < 16) {
        newTime = 'day';
        newGradient = 'bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-500';
      } else if (hour >= 16 && hour < 19) {
        newTime = 'evening';
        newGradient = 'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600';
      } else {
        newTime = 'night';
        // Deep night theme
        newGradient = 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900';
      }

      setTimeOfDay(newTime);
      setGradient(newGradient);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={`h-screen w-screen overflow-hidden relative text-white transition-all duration-1000 ${gradient} ${className}`}
      onContextMenu={onContextMenu}
      onClick={onClick}
    >
      {/* Animated Particles Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs - Optimized count: 3 */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full blur-3xl opacity-30 mix-blend-overlay"
            style={{
              background: i % 2 === 0 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(34, 211, 238, 0.4)', // White or Cyan
              width: Math.random() * 300 + 200, // Max 500px
              height: Math.random() * 300 + 200,
            }}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              x: [null, Math.random() * 60 - 30], // Reduced movement range
              y: [null, Math.random() * 60 - 30],
              scale: [1, 1.05, 0.95, 1], // Reduced scaling
            }}
            transition={{
              duration: 15 + Math.random() * 30, // Slower animation (15-45s)
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Small Particles for Night Time */}
        {timeOfDay === 'night' && [...Array(30)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
            style={{
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Noise Overlay for texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.6%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} 
      />

      {/* Content Container */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default Wallpaper;
