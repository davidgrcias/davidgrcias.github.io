import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeSettings = () => {
  const { theme, currentTheme, changeTheme, themes } = useTheme();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Palette className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold">Theme Settings</h2>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Customize the appearance of your WebOS experience
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(themes).map((themeOption) => (
            <motion.button
              key={themeOption.id}
              onClick={() => changeTheme(themeOption.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-4 rounded-lg border-2 transition-all
                ${currentTheme === themeOption.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                }
              `}
            >
              {/* Theme Preview */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className={`
                    w-16 h-16 rounded-lg bg-gradient-to-br
                    ${themeOption.colors.bg}
                    border ${themeOption.colors.border}
                  `}>
                    <div className="p-2 space-y-1">
                      <div className={`h-1.5 ${themeOption.colors.taskbar} rounded`} />
                      <div className={`h-1.5 w-3/4 ${themeOption.colors.window} rounded`} />
                      <div className={`h-1.5 w-1/2 ${themeOption.colors.window} rounded`} />
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white mb-1">
                    {themeOption.name}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {themeOption.id === 'dark' && 'Classic dark theme'}
                    {themeOption.id === 'light' && 'Clean light theme'}
                    {themeOption.id === 'cyberpunk' && 'Neon-inspired future'}
                    {themeOption.id === 'retro' && 'Terminal nostalgia'}
                    {themeOption.id === 'ocean' && 'Deep sea vibes'}
                    {themeOption.id === 'sunset' && 'Warm evening glow'}
                  </p>
                </div>

                {currentTheme === themeOption.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <div className="bg-blue-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Current Theme Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
      >
        <h3 className="font-semibold mb-2 text-white">Active Theme</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-400">Name:</span>
            <span className="text-white">{theme.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">ID:</span>
            <span className="text-white font-mono">{theme.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Accent:</span>
            <span className={`text-${theme.colors.accent}-500 capitalize`}>
              {theme.colors.accent}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h4 className="font-semibold text-blue-400 mb-2">💡 Pro Tip</h4>
        <p className="text-sm text-zinc-300">
          Your theme preference is automatically saved and will persist across sessions!
        </p>
      </div>
    </div>
  );
};

export default ThemeSettings;
