import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Power } from 'lucide-react';

const PowerTransition = ({ type }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10005] bg-black flex flex-col items-center justify-center text-white"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
          {type === 'restarting' ? (
            <Loader2 size={64} className="text-blue-500 animate-spin relative z-10" />
          ) : (
            <Power size={64} className="text-red-500 animate-pulse relative z-10" />
          )}
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-light tracking-wider mb-2">
            {type === 'restarting' ? 'Restarting System' : 'Shutting Down'}
          </h2>
          <p className="text-white/40 text-sm">
            {type === 'restarting' ? 'Cleaning up resources...' : 'Saving state...'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PowerTransition;
