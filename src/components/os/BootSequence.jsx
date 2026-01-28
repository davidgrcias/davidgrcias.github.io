import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Boot Sequence / Splash Screen
 * Fake OS loading screen on first visit
 */
const BootSequence = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('init');

  const bootStages = [
    { name: 'init', message: 'Initializing system...', duration: 400 },
    { name: 'loading', message: 'Loading kernel...', duration: 600 },
    { name: 'drivers', message: 'Loading drivers...', duration: 500 },
    { name: 'services', message: 'Starting services...', duration: 400 },
    { name: 'ready', message: 'Welcome to WebOS', duration: 800 },
  ];

  useEffect(() => {
    let currentStageIndex = 0;
    let progressInterval;
    let stageTimeout;

    const runBootSequence = () => {
      const currentStage = bootStages[currentStageIndex];
      setStage(currentStage.name);
      
      // Progress animation
      const increment = 100 / bootStages.length;
      const steps = 20;
      const stepDuration = currentStage.duration / steps;
      let step = 0;

      progressInterval = setInterval(() => {
        step++;
        const stageProgress = (step / steps) * increment;
        const totalProgress = (currentStageIndex * increment) + stageProgress;
        setProgress(Math.min(totalProgress, 100));

        if (step >= steps) {
          clearInterval(progressInterval);
        }
      }, stepDuration);

      // Move to next stage
      stageTimeout = setTimeout(() => {
        currentStageIndex++;
        if (currentStageIndex < bootStages.length) {
          runBootSequence();
        } else {
          setTimeout(onComplete, 300);
        }
      }, currentStage.duration);
    };

    runBootSequence();

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stageTimeout);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-black flex flex-col items-center justify-center z-[10002]"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/30">
            <span className="text-4xl font-bold text-white">DG</span>
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white/80 text-lg mb-8 font-medium"
        >
          {bootStages.find(s => s.name === stage)?.message}
        </motion.div>

        {/* Progress Bar */}
        <div className="w-80 max-w-[90vw] h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-xl">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-lg shadow-cyan-500/50"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Progress Percentage */}
        <div className="text-white/60 text-sm mt-4 font-mono">
          {Math.round(progress)}%
        </div>

        {/* Bottom Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 text-white/40 text-xs"
        >
          David's Portfolio WebOS v1.0
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BootSequence;
