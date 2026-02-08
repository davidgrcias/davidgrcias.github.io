/**
 * ThinkingProcess Component
 * 
 * Animated visualization of the AI's "thinking process" before delivering a response.
 * Shows contextual analysis steps one by one, synced with the API call.
 * 
 * Flow:
 * 1. Steps 1..(N-1) appear at normal pace (~700ms each)
 * 2. When API response arrives (responseReady=true), remaining steps fast-forward
 * 3. Final step ("✅ Analysis complete!") only shows once responseReady=true
 * 4. After final step, brief pause, then onComplete() fires
 * 
 * Supports compact mode (floating widget) and full mode (messenger app).
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ThinkingProcess = ({ steps = [], responseReady = false, onComplete, compact = false }) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const prevStepsRef = useRef(steps);

  // Keep onComplete ref fresh
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Reset when steps array changes (new query)
  useEffect(() => {
    if (steps !== prevStepsRef.current && steps.length > 0) {
      prevStepsRef.current = steps;
      setVisibleCount(0);
      completedRef.current = false;
    }
  }, [steps]);

  // Progress through steps
  useEffect(() => {
    const totalSteps = steps.length;
    const nonFinalCount = Math.max(totalSteps - 1, 0);

    if (totalSteps === 0 || completedRef.current) return;

    // All steps shown → complete after brief pause
    if (visibleCount >= totalSteps) {
      completedRef.current = true;
      const timer = setTimeout(() => {
        onCompleteRef.current?.();
      }, 500);
      return () => clearTimeout(timer);
    }

    // At final step boundary — wait for API response
    if (visibleCount >= nonFinalCount && !responseReady) {
      return; // Waiting animation shows via JSX below
    }

    // Calculate delay based on position and state
    let delay;
    if (visibleCount === 0) {
      delay = 300; // First step appears quickly
    } else if (responseReady && visibleCount < nonFinalCount) {
      delay = 150; // Fast-forward when API already returned
    } else if (visibleCount >= nonFinalCount && responseReady) {
      delay = 250; // Show final "✅" step slightly delayed
    } else {
      delay = 700; // Normal pace for middle steps
    }

    const timer = setTimeout(() => {
      setVisibleCount(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [visibleCount, steps.length, responseReady, steps]);

  const totalSteps = steps.length;
  const nonFinalCount = Math.max(totalSteps - 1, 0);
  const isWaitingForResponse = visibleCount >= nonFinalCount && !responseReady;
  const lastVisibleIndex = visibleCount - 1;

  if (steps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5, transition: { duration: 0.2 } }}
      className={`flex justify-start mb-4`}
    >
      <div
        className={
          compact
            ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-none p-3 max-w-[85%]'
            : 'bg-zinc-700 text-white border border-zinc-600 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[70%]'
        }
      >
        <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
          <AnimatePresence mode="sync">
            {steps.slice(0, visibleCount).map((step, index) => {
              const isLast = index === lastVisibleIndex;
              const isFinalStep = index === totalSteps - 1;
              const isActiveStep = isLast && !isFinalStep && !responseReady;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} ${
                    isFinalStep
                      ? compact
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-emerald-400 font-medium'
                      : isActiveStep
                        ? compact
                          ? 'text-cyan-600 dark:text-cyan-400'
                          : 'text-cyan-400'
                        : compact
                          ? 'text-slate-400 dark:text-slate-500'
                          : 'text-zinc-400'
                  }`}
                >
                  <span className={isActiveStep ? 'animate-pulse' : ''}>
                    {step.icon}
                  </span>
                  <span>{step.text}</span>
                  {isActiveStep && (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className={`w-1.5 h-1.5 rounded-full ${
                        compact ? 'bg-cyan-500' : 'bg-cyan-400'
                      } ml-1 flex-shrink-0`}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Waiting spinner when all context steps shown but API hasn't returned */}
          {isWaitingForResponse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-center gap-2 ${
                compact
                  ? 'text-xs text-cyan-600 dark:text-cyan-400'
                  : 'text-sm text-cyan-400'
              }`}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className={`${
                  compact ? 'w-3 h-3' : 'w-3.5 h-3.5'
                } border-2 border-current border-t-transparent rounded-full flex-shrink-0`}
              />
              <span>Generating response...</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ThinkingProcess;
