import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Moon, Sun, Monitor, Palette, Sliders, Globe, Info, Zap } from 'lucide-react';
import { useOS } from '../../contexts/OSContext';

/**
 * Settings App
 * System preferences and configurations
 */

const SettingsApp = () => {
  const { toggleSounds, isSoundEnabled } = useOS();
  const [settings, setSettings] = useState({
    theme: 'dark',
    soundEnabled: true,
    language: 'en',
    reducedMotion: false,
    performanceMode: false,
  });

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('webos-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    // Sync sound state
    setSettings(prev => ({ ...prev, soundEnabled: isSoundEnabled() }));
  }, [isSoundEnabled]);

  // Save settings to localStorage
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('webos-settings', JSON.stringify(newSettings));

    // Apply settings
    if (key === 'soundEnabled') {
      toggleSounds();
    }
    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
    }
    if (key === 'reducedMotion') {
      document.documentElement.style.setProperty('--motion-duration', value ? '0ms' : '300ms');
    }
  };

  const SettingSection = ({ icon: Icon, title, children }) => (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-cyan-500/20 rounded-lg">
          <Icon size={20} className="text-cyan-400" />
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="space-y-3 pl-11">
        {children}
      </div>
    </div>
  );

  const Toggle = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
      <div className="flex-1">
        <div className="font-medium text-sm">{label}</div>
        {description && <div className="text-xs text-white/50 mt-1">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-cyan-500' : 'bg-white/20'
        }`}
      >
        <motion.div
          animate={{ x: checked ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full"
        />
      </button>
    </div>
  );

  const RadioGroup = ({ label, options, value, onChange }) => (
    <div className="p-3 rounded-lg hover:bg-white/5 transition-colors">
      <div className="font-medium text-sm mb-3">{label}</div>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              value === option.value ? 'border-cyan-500' : 'border-white/30'
            }`}>
              {value === option.value && (
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm">{option.label}</div>
              {option.description && (
                <div className="text-xs text-white/50">{option.description}</div>
              )}
            </div>
            {option.icon && <option.icon size={18} className="text-white/40" />}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-slate-950 text-white overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 p-6 z-10">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-white/60 mt-1">Customize your WebOS experience</p>
      </div>

      {/* Settings Content */}
      <div className="p-6 max-w-3xl">
        {/* Appearance */}
        <SettingSection icon={Palette} title="Appearance">
          <RadioGroup
            label="Theme"
            value={settings.theme}
            onChange={(value) => updateSetting('theme', value)}
            options={[
              { value: 'dark', label: 'Dark', description: 'Dark mode (default)', icon: Moon },
              { value: 'light', label: 'Light', description: 'Light mode', icon: Sun },
              { value: 'auto', label: 'Auto', description: 'Match system preference', icon: Monitor },
            ]}
          />
        </SettingSection>

        {/* Sound & Effects */}
        <SettingSection icon={Volume2} title="Sound & Effects">
          <Toggle
            label="Sound Effects"
            description="Play sounds when opening, closing, and minimizing windows"
            checked={settings.soundEnabled}
            onChange={(value) => updateSetting('soundEnabled', value)}
          />
          <Toggle
            label="Reduce Motion"
            description="Minimize animations throughout the interface"
            checked={settings.reducedMotion}
            onChange={(value) => updateSetting('reducedMotion', value)}
          />
        </SettingSection>

        {/* Performance */}
        <SettingSection icon={Zap} title="Performance">
          <Toggle
            label="Performance Mode"
            description="Reduce visual effects for better performance on slower devices"
            checked={settings.performanceMode}
            onChange={(value) => updateSetting('performanceMode', value)}
          />
        </SettingSection>

        {/* Language & Region */}
        <SettingSection icon={Globe} title="Language & Region">
          <RadioGroup
            label="Language"
            value={settings.language}
            onChange={(value) => updateSetting('language', value)}
            options={[
              { value: 'en', label: 'English', description: 'English (United States)' },
              { value: 'id', label: 'Bahasa Indonesia', description: 'Indonesian' },
            ]}
          />
        </SettingSection>

        {/* About */}
        <SettingSection icon={Info} title="About">
          <div className="p-4 bg-white/5 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Version</span>
              <span className="font-mono">1.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Built with</span>
              <span>React + Vite + Tailwind</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Developer</span>
              <span>David Gracias</span>
            </div>
          </div>
        </SettingSection>

        {/* Reset */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <button
            onClick={() => {
              if (confirm('Reset all settings to default?')) {
                localStorage.removeItem('webos-settings');
                window.location.reload();
              }
            }}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsApp;
