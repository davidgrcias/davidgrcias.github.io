import React, { useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { X, Rocket, Bot, Mic, Code, Gamepad2 } from 'lucide-react';
import { useSound } from '../../contexts/SoundContext';

/**
 * WelcomeTutorial - First-time user onboarding
 * Simple single-step welcome modal, wide horizontal layout
 */
const WelcomeTutorial = ({ isOpen, onClose, onOpenShortcuts }) => {
  const { playAchievement, playMenuClose } = useSound();

  const handleStart = () => {
    playAchievement();
    localStorage.setItem('webos-has-seen-welcome', 'true');
    onClose('completed');
  };

  const handleClose = () => {
    playMenuClose();
    localStorage.setItem('webos-has-seen-welcome', 'true');
    onClose('skipped');
  };

  // Manual listener removed - handled by global hook now

  if (!isOpen) return null;

  const features = [
    {
      icon: <Bot className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-400',
      title: 'AI Chatbot',
      desc: 'Chat with an AI that knows all about me',
    },
    {
      icon: <Mic className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-400',
      title: 'Voice Assistant',
      desc: 'Control the OS with your voice',
    },
    {
      icon: <Code className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-400',
      title: 'VS Code & Terminal',
      desc: 'Explore my projects in a real IDE',
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 pb-16"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-2 border-zinc-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 sm:px-8 sm:py-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="p-2.5 bg-white/20 rounded-xl"
                >
                  <Rocket className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-white">
                    Welcome to David&apos;s WebOS!
                  </h2>
                  <p className="text-blue-200 text-xs sm:text-sm mt-0.5">
                    An immersive portfolio — not just a website
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white flex-shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.08 }}
                  className="group relative bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-xl p-3.5 sm:p-4 transition-all cursor-default"
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-2.5 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-700/50">
              <button
                onClick={onOpenShortcuts}
                className="text-zinc-500 text-xs hover:text-blue-400 transition-colors flex items-center gap-1 group"
              >
                <span>💡 Press</span>
                <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-600 rounded text-[11px] font-mono group-hover:border-blue-500/50 group-hover:text-blue-300 transition-colors">Ctrl + /</kbd>
                <span>for all shortcuts</span>
              </button>
              <button
                onClick={handleStart}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25 text-sm"
              >
                Get Started
                <Rocket className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeTutorial;
