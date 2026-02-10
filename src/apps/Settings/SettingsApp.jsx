import React, { useState, useEffect } from 'react';
import { Volume2, Globe, Info, Zap, Image, Shield } from 'lucide-react';
import { useOS } from '../../contexts/OSContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/TranslationContext';
import ThemeSettings from './ThemeSettings';
import WallpaperPicker from './WallpaperPicker';

/**
 * Settings App
 * System preferences and configurations
 */

// Toggle component - defined OUTSIDE to prevent recreation on every render
const Toggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
    <div className="flex-1">
      <div className="font-medium text-sm">{label}</div>
      {description && <div className="text-xs text-white/50 mt-1">{description}</div>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      type="button"
      className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${checked ? 'bg-cyan-500' : 'bg-white/20'
        }`}
    >
      <div
        className="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200"
        style={{ transform: checked ? 'translateX(24px)' : 'translateX(2px)' }}
      />
    </button>
  </div>
);

// SettingSection component - defined OUTSIDE
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

// RadioGroup component - defined OUTSIDE
const RadioGroup = ({ label, options, value, onChange }) => (
  <div className="p-3 rounded-lg hover:bg-white/5 transition-colors">
    <div className="font-medium text-sm mb-3">{label}</div>
    <div className="space-y-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${value === option.value ? 'border-cyan-500' : 'border-white/30'
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
        </button>
      ))}
    </div>
  </div>
);

const SettingsApp = () => {
  const { toggleSounds } = useOS();
  const { currentTheme } = useTheme();
  const { currentLanguage, translatePage } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');

  // Initialize settings from localStorage
  const [settings, setSettings] = useState(() => {
    const defaultSettings = {
      theme: 'dark',
      soundEnabled: true,
      language: 'en',
      reducedMotion: false,
      performanceMode: false,
    };

    try {
      const saved = localStorage.getItem('webos-settings');
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to parse settings:', e);
    }
    return defaultSettings;
  });

  // Apply settings on mount
  useEffect(() => {
    // Apply reducedMotion
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    // Apply performanceMode
    if (settings.performanceMode) {
      document.documentElement.classList.add('performance-mode');
    } else {
      document.documentElement.classList.remove('performance-mode');
    }

    // Apply language
    if (settings.language && settings.language !== currentLanguage) {
      translatePage(settings.language);
    }

    // Sync sound state
    toggleSounds(settings.soundEnabled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update a single setting
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('webos-settings', JSON.stringify(newSettings));

    // Apply setting immediately
    switch (key) {
      case 'soundEnabled':
        toggleSounds(value);
        break;
      case 'reducedMotion':
        if (value) {
          document.documentElement.classList.add('reduce-motion');
        } else {
          document.documentElement.classList.remove('reduce-motion');
        }
        document.documentElement.style.setProperty('--motion-duration', value ? '0ms' : '300ms');
        break;
      case 'performanceMode':
        if (value) {
          document.documentElement.classList.add('performance-mode');
        } else {
          document.documentElement.classList.remove('performance-mode');
        }
        break;
      case 'language':
        translatePage(value);
        break;
      case 'theme':
        document.documentElement.setAttribute('data-theme', value);
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full h-full bg-slate-950 text-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 p-4 sm:p-6 z-10">
        <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
        <p className="text-xs sm:text-sm text-white/60 mt-1">Customize your WebOS experience</p>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'general'
              ? 'bg-cyan-500/20 text-cyan-400'
              : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('wallpaper')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'wallpaper'
              ? 'bg-cyan-500/20 text-cyan-400'
              : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
          >
            Wallpaper
          </button>
          <button
            onClick={() => setActiveTab('themes')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'themes'
              ? 'bg-cyan-500/20 text-cyan-400'
              : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
          >
            Themes
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'admin'
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
          >
            <Shield size={14} />
            Admin
          </button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'general' && (
          <div className="p-4 sm:p-6 max-w-3xl">
            {/* ... (existing general settings) ... */}}
            {/* Sound & Effects */}
            <SettingSection icon={Volume2} title="Sound & Effects">
              <Toggle
                label="Sound Effects"
                description="Play sounds when opening, closing, and minimizing windows"
                checked={settings.soundEnabled}
                onChange={(val) => updateSetting('soundEnabled', val)}
              />
              <Toggle
                label="Reduce Motion"
                description="Minimize animations throughout the interface"
                checked={settings.reducedMotion}
                onChange={(val) => updateSetting('reducedMotion', val)}
              />
            </SettingSection>

            {/* Performance */}
            <SettingSection icon={Zap} title="Performance">
              <Toggle
                label="Performance Mode"
                description="Reduce visual effects for better performance on slower devices"
                checked={settings.performanceMode}
                onChange={(val) => updateSetting('performanceMode', val)}
              />
            </SettingSection>

            {/* Language & Region */}
            <SettingSection icon={Globe} title="Language & Region">
              <RadioGroup
                label="Language"
                value={settings.language}
                onChange={(val) => updateSetting('language', val)}
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
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Current Theme</span>
                  <span className="capitalize">{currentTheme}</span>
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
        )}

        {activeTab === 'wallpaper' && (
          <div className="p-4 sm:p-6 max-w-3xl">
            <h2 className="text-xl font-semibold mb-6">Wallpaper</h2>
            <WallpaperPicker />
          </div>
        )}

        {activeTab === 'themes' && <ThemeSettings />}

        {activeTab === 'admin' && (
          <div className="p-6 max-w-2xl">
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Shield size={24} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                  <p className="text-sm text-white/60">Manage your portfolio content</p>
                </div>
              </div>
              
              <p className="text-white/70 mb-6">
                Access the admin panel to manage your profile, projects, skills, and blog posts. 
                Protected by Google Authentication.
              </p>
              
              <button
                onClick={() => window.open('/admin', '_blank')}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-3"
              >
                <Shield size={20} />
                Open Admin Panel
              </button>
              
              <p className="text-xs text-white/40 text-center mt-4">
                🔐 Requires Google Account authentication
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsApp;
