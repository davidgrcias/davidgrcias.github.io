import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Rocket, Keyboard, Mouse, Sparkles, Trophy } from 'lucide-react';

/**
 * WelcomeTutorial - First-time user onboarding
 * Shows on first visit, explains key features
 */
const WelcomeTutorial = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Rocket className="w-12 h-12 text-blue-400" />,
      title: 'Welcome to David\'s WebOS! 🚀',
      description: 'An immersive portfolio experience designed like a real operating system.',
      highlight: 'Explore my projects, skills, and experience in a unique way!',
      tips: [
        'Click desktop icons to open apps',
        'Use the taskbar to manage windows',
        'Right-click anywhere for quick actions',
      ],
    },
    {
      icon: <Keyboard className="w-12 h-12 text-purple-400" />,
      title: 'Master Keyboard Shortcuts ⌨️',
      description: 'Become a power user with these essential shortcuts:',
      shortcuts: [
        { keys: 'Ctrl + K', action: 'Command Palette' },
        { keys: 'Ctrl + Space', action: 'Spotlight Search' },
        { keys: 'Alt + Tab', action: 'Window Switcher' },
        { keys: 'Ctrl + /', action: 'Show all shortcuts' },
      ],
      tips: [
        'Press Ctrl+/ anytime to see all shortcuts',
      ],
    },
    {
      icon: <Mouse className="w-12 h-12 text-green-400" />,
      title: 'Interact with Windows 🪟',
      description: 'Manage multiple apps like a pro:',
      tips: [
        'Drag title bars to move windows',
        'Click colored buttons to minimize/close',
        'Click taskbar icons to focus or minimize apps',
        'Use Alt+Tab to quickly switch between windows',
      ],
    },
    {
      icon: <Sparkles className="w-12 h-12 text-yellow-400" />,
      title: 'Discover Hidden Features ✨',
      description: 'Explore these special features:',
      tips: [
        '🎨 Change themes in Settings (6 beautiful themes!)',
        '📸 Take screenshots with Ctrl+Shift+S',
        '🐍 Play Snake game via Command Palette',
        '🎮 Try the Konami Code (↑↑↓↓←→←→BA)',
        '🎵 Listen to music with the Music Player widget',
      ],
    },
    {
      icon: <Trophy className="w-12 h-12 text-orange-400" />,
      title: 'Unlock Achievements 🏆',
      description: 'Track your exploration progress:',
      tips: [
        'Open 5 different apps to unlock "Explorer"',
        'Use keyboard shortcuts to unlock "Power User"',
        'Find all easter eggs for bonus points',
        'Check Portfolio Stats widget for your progress',
      ],
      highlight: 'Right-click desktop → Portfolio Stats to see your achievements!',
    },
  ];

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('webos-tutorial-completed', 'true');
    onClose('completed');
  };

  const handleSkip = () => {
    localStorage.setItem('webos-tutorial-skipped', 'true');
    onClose('skipped');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/70 backdrop-blur-md"
      >
        <motion.div
          key={currentStep}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-2 border-zinc-700 rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-2xl mx-2 sm:mx-4 overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 sm:p-4 md:p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
            <div className="relative flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="p-2 sm:p-3 bg-white/20 rounded-xl flex-shrink-0"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                    {React.cloneElement(step.icon, { className: 'w-full h-full' })}
                  </div>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] sm:text-xs text-blue-200 mb-0.5 sm:mb-1">
                    Step {currentStep + 1} of {steps.length}
                  </div>
                  <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white truncate">{step.title}</h2>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors text-white flex-shrink-0"
                title="Skip tutorial"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8">
            <p className="text-sm sm:text-base md:text-lg text-zinc-300 mb-4 sm:mb-6">{step.description}</p>

            {/* Shortcuts */}
            {step.shortcuts && (
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {step.shortcuts.map((shortcut, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
                  >
                    <span className="text-sm sm:text-base text-zinc-300">{shortcut.action}</span>
                    <kbd className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-zinc-900 border border-zinc-600 rounded-md text-xs sm:text-sm font-mono text-blue-400 whitespace-nowrap">
                      {shortcut.keys}
                    </kbd>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Tips */}
            {step.tips && (
              <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                {step.tips.map((tip, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm md:text-base text-zinc-400"
                  >
                    <span className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                    <span className="flex-1">{tip}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Highlight */}
            {step.highlight && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-3 sm:p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg"
              >
                <p className="text-xs sm:text-sm md:text-base text-blue-300 font-medium">✨ {step.highlight}</p>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 md:p-6 bg-zinc-800/50 border-t border-zinc-700 flex items-center justify-between gap-3">
            {/* Progress Dots */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? 'w-6 sm:w-8 bg-blue-500'
                      : idx < currentStep
                      ? 'w-1.5 sm:w-2 bg-blue-500/50'
                      : 'w-1.5 sm:w-2 bg-zinc-600'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {!isFirst && (
                <button
                  onClick={handlePrev}
                  className="px-2.5 py-1.5 sm:px-4 sm:py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Back</span>
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-3 py-1.5 sm:px-6 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all flex items-center gap-1 sm:gap-2 shadow-lg shadow-blue-500/30 text-xs sm:text-sm whitespace-nowrap"
              >
                {isLast ? (
                  <>
                    <span className="hidden xs:inline">Get Started</span>
                    <span className="xs:hidden">Start</span>
                    <Rocket className="w-3 h-3 sm:w-4 sm:h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeTutorial;
