import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useOS } from '../../contexts/OSContext';
import { useVoice } from '../../contexts/VoiceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Terminal, Code, FolderOpen, Settings, Wifi, WifiOff, Battery, BatteryCharging, BatteryLow, Volume2, VolumeX, Volume1, Bot, User, StickyNote, Music, Search, Sliders, Linkedin, Instagram, Youtube, Globe, Phone, Sun, Moon, Zap, Leaf, Power, RotateCcw, Check, Lock, Mic } from 'lucide-react';
import SystemClock from './SystemClock';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import ErrorBoundary from '../ErrorBoundary';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import { useSound } from '../../contexts/SoundContext';
import StartMenu from './StartMenu';
import { getUserProfile } from '../../data/userProfile';

// Lazy load apps
const VSCodeApp = lazy(() => import('../../apps/VSCode/VSCodeApp'));
const TerminalApp = lazy(() => import('../../apps/Terminal/TerminalApp'));
const MessengerApp = lazy(() => import('../../apps/Messenger/MessengerApp'));
const FileManagerApp = lazy(() => import('../../apps/FileManager/FileManagerApp'));
const SettingsApp = lazy(() => import('../../apps/Settings/SettingsApp'));
const AboutMeApp = lazy(() => import('../../apps/AboutMe/AboutMeApp'));
const NotesApp = lazy(() => import('../../apps/Notes/NotesApp'));

const AppLoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-zinc-900">
    <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);

const Taskbar = ({ onOpenSpotlight, shortcuts = [] }) => {
  const { windows, activeWindowId, openApp, minimizeWindow, closeWindow, focusWindow, pinnedApps, togglePinApp, isPinned, reorderPinnedApps, sleep, restart, shutdown } = useOS();
  const { voiceState, startListening, stopListening, isSupported } = useVoice();
  const isListening = voiceState === 'listening';
  const serviceAvailable = true; // Always available now (no API dependency)
  const { theme, batterySaver, setBatterySaver } = useTheme();
  const { isMobile } = useDeviceDetection();
  const { isPlaying, track, setPlayerOpen, volume, setVolume, isMuted, setMuted } = useMusicPlayer();
  const { playMenuOpen, playMenuClose, playSliderTick, playToggleOn, playToggleOff } = useSound();

  // ============================================
  // BATTERY SIMULATION - Realistic Laptop Style
  // ============================================
  // Rules:
  // - First load: Random 50-90%, charging
  // - Refresh: Persist from localStorage
  // - Charging: +1% every 11-30 seconds (random)
  // - At 100%: Hold 11-20 seconds, then unplug
  // - Discharging: -1% every 30-60 seconds (random)
  // - At 25-30% (random threshold): Plug back in
  // ============================================

  const [battery, setBattery] = useState(() => {
    const savedLevel = localStorage.getItem('webos-battery-level');
    const savedCharging = localStorage.getItem('webos-battery-charging');

    // If we have saved data, use it
    if (savedLevel !== null) {
      const level = parseInt(savedLevel, 10);
      if (!isNaN(level) && level >= 0 && level <= 100) {
        return {
          level: level,
          charging: savedCharging === 'true'
        };
      }
    }

    // First time: Random 50-90%, charging
    const randomInitial = 50 + Math.floor(Math.random() * 41);
    return {
      level: randomInitial,
      charging: true
    };
  });

  // Threshold for when to "plug back in" (25-30%)
  const dischargeThresholdRef = React.useRef(() => {
    const saved = localStorage.getItem('webos-battery-threshold');
    if (saved !== null) {
      const val = parseInt(saved, 10);
      if (!isNaN(val) && val >= 25 && val <= 30) return val;
    }
    return 25 + Math.floor(Math.random() * 6);
  });

  useEffect(() => {
    let timeoutId = null;
    let isMounted = true;

    // Delay helpers
    const getChargeDelay = () => 11000 + Math.floor(Math.random() * 19001);    // 11-30s
    const getDischargeDelay = () => 30000 + Math.floor(Math.random() * 30001); // 30-60s
    const getFullHoldDelay = () => 11000 + Math.floor(Math.random() * 9001);   // 11-20s

    const scheduleNext = (delay) => {
      if (isMounted && timeoutId === null) {
        timeoutId = setTimeout(tick, delay);
      }
    };

    const tick = () => {
      if (!isMounted) return;
      timeoutId = null;

      setBattery(prev => {
        let { level, charging } = prev;
        let delay;

        // Clamp level
        level = Math.max(0, Math.min(100, level));

        if (charging) {
          if (level < 100) {
            level = level + 1;
            delay = getChargeDelay();
          } else {
            charging = false;
            const newThreshold = 25 + Math.floor(Math.random() * 6);
            dischargeThresholdRef.current = newThreshold;
            localStorage.setItem('webos-battery-threshold', String(newThreshold));
            delay = getFullHoldDelay();
          }
        } else {
          if (level > dischargeThresholdRef.current) {
            level = level - 1;
            delay = getDischargeDelay();
          } else {
            charging = true;
            delay = getChargeDelay();
          }
        }

        // Persist to localStorage
        localStorage.setItem('webos-battery-level', String(level));
        localStorage.setItem('webos-battery-charging', String(charging));

        // Schedule next tick
        setTimeout(() => scheduleNext(delay), 0);

        return { level, charging };
      });
    };

    // Initial tick
    scheduleNext(getChargeDelay());

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
  }, []);

  // Wifi: Random fluctuation 1-3 bars (simulated)
  const [wifiSignal, setWifiSignal] = useState(3); // 0-3 scale
  const [isOnline, setIsOnline] = useState(true);

  // ... (other states remain the same)

  // Single popup state - only one can be open at a time
  // Values: null | 'wifi' | 'volume' | 'battery' | 'power'
  const [activePopup, setActivePopup] = useState(null);

  // Start Menu state
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({});

  useEffect(() => {
    getUserProfile('en').then(setUserProfile).catch(console.error);
  }, []);

  // Brightness & Power Saver (simulated, stored in localStorage)
  const [brightness, setBrightness] = useState(() => {
    const saved = localStorage.getItem('webos-brightness');
    return saved ? parseInt(saved) : 100;
  });
  // Battery saver moved to ThemeContext

  // Drag & drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);
  const [taskbarContextMenu, setTaskbarContextMenu] = useState(null);

  // Search bar state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Taskbar settings
  const [taskbarSettings, setTaskbarSettings] = useState(() => {
    const saved = localStorage.getItem('webos-taskbar-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse taskbar settings:', e);
      }
    }
    return {
      position: 'bottom',
      autoHide: false,
      showLabels: false,
      iconSize: 'medium',
    };
  });

  // Handle auto-hide hover state
  const [isHovered, setIsHovered] = useState(false);

  // Helper for icon sizes
  const getIconSize = () => {
    switch (taskbarSettings.iconSize) {
      case 'small': return 16;
      case 'large': return 32;
      default: return 24; // medium
    }
  };

  const getButtonPadding = () => {
    switch (taskbarSettings.iconSize) {
      case 'small': return 'p-1.5';
      case 'large': return 'p-3';
      default: return 'p-2'; // medium
    }
  };

  // Simulated Wifi Fluctuation
  useEffect(() => {
    const signalInterval = setInterval(() => {
      // Randomly change signal strength (heavily weighted towards 3 bars/full)
      // 0: Offline, 1: Weak, 2: Good, 3: Excellent
      const rand = Math.random();
      let newSignal = 3;
      if (rand < 0.05) newSignal = 1;      // 5% chance of weak signal
      else if (rand < 0.2) newSignal = 2;  // 15% chance of good signal
      // 80% chance of excellent signal

      setWifiSignal(newSignal);
    }, 5000); // Fluctuate every 5 seconds

    return () => clearInterval(signalInterval);
  }, []);

  // Apply brightness overlay effect
  useEffect(() => {
    localStorage.setItem('webos-brightness', brightness.toString());
    // Apply brightness as a filter to the root element
    // User requested NO dimming on battery saver, only animation reduction
    const effectiveBrightness = brightness;

    document.documentElement.style.filter = effectiveBrightness < 100
      ? `brightness(${effectiveBrightness / 100})`
      : 'none';
  }, [brightness, batterySaver]);



  // Defined Apps - Memoized to prevent recreation
  const apps = React.useMemo(() => [
    { id: 'vscode', title: 'VS Code', icon: <Code size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="VS Code"><VSCodeApp /></ErrorBoundary></Suspense> },
    { id: 'file-manager', title: 'File Manager', icon: <FolderOpen size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="File Manager"><FileManagerApp /></ErrorBoundary></Suspense> },
    { id: 'about-me', title: 'About Me', icon: <User size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="About Me"><AboutMeApp /></ErrorBoundary></Suspense> },
    { id: 'notes', title: 'Notes', icon: <StickyNote size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Notes"><NotesApp /></ErrorBoundary></Suspense> },
    { id: 'terminal', title: 'Terminal', icon: <Terminal size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Terminal"><TerminalApp /></ErrorBoundary></Suspense> },
    { id: 'messenger', title: 'Messages', icon: <Bot size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Messenger"><MessengerApp /></ErrorBoundary></Suspense> },
    { id: 'settings', title: 'Settings', icon: <Settings size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Settings"><SettingsApp /></ErrorBoundary></Suspense> },
  ], []);

  const handleAppClick = (app) => {
    const isOpen = windows.find(w => w.id === app.id);
    if (isOpen) {
      if (activeWindowId === app.id && !isOpen.isMinimized) {
        minimizeWindow(app.id);
      } else {
        focusWindow(app.id);
      }
    } else {
      openApp(app);
    }
  };

  const getBatteryIcon = () => {
    const { level, charging } = battery;

    // Changing color based on level
    let colorClass = "text-white";
    if (level <= 20) colorClass = "text-red-500";
    else if (level <= 50) colorClass = "text-yellow-400";
    else colorClass = "text-green-400"; // High battery is green or white? Usually white in OS, but user asked for "adjusted color". Green is clearer for "Good".

    if (charging) {
      return <BatteryCharging size={18} className="text-green-400 animate-pulse" />;
    }

    return (
      <div className="relative flex items-center justify-center overflow-hidden">
        {/* Fill Level - precisely aligned inside the battery outline */}
        <div
          className={`absolute left-[3px] top-[5px] h-[10px] bg-current rounded-sm transition-all duration-500 ${colorClass}`}
          style={{
            width: `${Math.max(1, (level / 100) * 11)}px`,
            opacity: 1
          }}
        />
        {/* Outline Frame */}
        <Battery size={20} className={`relative z-10 ${colorClass}`} fillOpacity={0} />

        {/* Battery Saver Indicator */}
        {!charging && batterySaver && (
          <div className="absolute -bottom-[2px] -right-[2px] bg-zinc-900 rounded-full border border-zinc-900 z-20">
            <Leaf size={10} className="text-green-400 fill-green-400" />
          </div>
        )}
      </div>
    );
  };

  // Drag & drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    reorderPinnedApps(draggedIndex, index);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Context menu
  const handleContextMenu = (e, app) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation(); // Extra protection against event bubbling
    const isOpen = windows.find(w => w.id === app.id);
    setContextMenu({ x: e.clientX, y: e.clientY, app, isOpen });
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
      setTaskbarContextMenu(null);
      setActivePopup(null);
    };

    if (contextMenu || taskbarContextMenu || activePopup) {
      document.addEventListener('click', handleClickOutside);
      // Also close on right click elsewhere
      document.addEventListener('contextmenu', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('contextmenu', handleClickOutside);
      };
    }
  }, [contextMenu, taskbarContextMenu, activePopup]);

  // Taskbar right-click handler
  const handleTaskbarContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTaskbarContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Update taskbar settings
  const updateTaskbarSetting = (key, value) => {
    const newSettings = { ...taskbarSettings, [key]: value };
    setTaskbarSettings(newSettings);
    localStorage.setItem('webos-taskbar-settings', JSON.stringify(newSettings));
    setTaskbarContextMenu(null);
  };

  // Social Networks Data with Real-time Signal Simulation
  const [socialNetworks, setSocialNetworks] = useState([
    {
      category: 'Professional',
      networks: [
        { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/in/david-garcia-saragih/', icon: Linkedin, signal: 5, color: 'text-blue-500' },
        { id: 'github', name: 'GitHub', url: 'https://github.com/davidgrcias', icon: Code, signal: 5, color: 'text-purple-400' },
      ]
    },
    {
      category: 'Social Media',
      networks: [
        { id: 'instagram', name: 'Instagram', url: 'https://instagram.com/davidgrcias', icon: Instagram, signal: 4, color: 'text-pink-500' },
        { id: 'youtube', name: 'YouTube', url: 'https://youtube.com/@davidgrcias', icon: Youtube, signal: 4, color: 'text-red-500' },
        { id: 'tiktok', name: 'TikTok', url: 'https://tiktok.com/@davidgrcias', icon: Music, signal: 3, color: 'text-cyan-400' },
      ]
    },
    {
      category: 'Contact',
      networks: [
        { id: 'whatsapp', name: 'WhatsApp', url: 'https://wa.me/6281234567890', icon: Phone, signal: 5, color: 'text-green-500' },
        { id: 'website', name: 'Website', url: 'https://davidgrcias.github.io', icon: Globe, signal: 5, color: 'text-cyan-400' },
      ]
    }
  ]);

  // Simulate network signal fluctuation
  useEffect(() => {
    if (activePopup !== 'wifi') return;

    const interval = setInterval(() => {
      setSocialNetworks(prev => prev.map(cat => ({
        ...cat,
        networks: cat.networks
          .map(net => ({
            ...net,
            // Randomly fluctuate signal between 1 and 5, favoring 3-5
            signal: Math.max(1, Math.min(5, net.signal + (Math.random() > 0.5 ? 1 : -1)))
          }))
          // Sort by signal strength (descending) to mimic real OS behavior
          .sort((a, b) => b.signal - a.signal)
      })));
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [activePopup]);

  // Voice Control Keyboard Shortcut (Ctrl+Shift+Space)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Shift+Space to toggle voice listening
      if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        if (isListening) {
          stopListening();
        } else {
          startListening();
        }
      }

      // Escape to cancel listening
      if (e.code === 'Escape' && isListening) {
        e.preventDefault();
        stopListening();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isListening, startListening, stopListening]);

  const handleNetworkClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setActivePopup(null);
  };

  const getSignalBars = (strength) => {
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`w-0.5 ${i < strength ? 'bg-cyan-400' : 'bg-white/20'
          } transition-colors`}
        style={{ height: `${(i + 1) * 3}px` }}
      />
    ));
  };

  // Ordered apps: pinned apps + open unpinned apps (CRITICAL: prevents taskbar disappearing)
  const orderedApps = React.useMemo(() => {
    // Helper to find app in shortcuts (priority) or internal apps
    const findApp = (id) => shortcuts.find(s => s.id === id) || apps.find(a => a.id === id);

    // Get pinned apps in order
    const pinnedAppsInOrder = pinnedApps
      .map(id => findApp(id))
      .filter(Boolean);

    // Get open apps that are NOT pinned
    const openUnpinnedApps = windows
      .map(w => findApp(w.id))
      .filter(app => app && !pinnedApps.includes(app.id))
      .filter((app, index, self) => index === self.findIndex(a => a.id === app.id));

    return [...pinnedAppsInOrder, ...openUnpinnedApps];
  }, [pinnedApps, windows, apps, shortcuts]);



  return (
    <>
      {/* Auto-Hide Trigger Zone - Always present at bottom when auto-hide is on */}
      {taskbarSettings.autoHide && (
        <div
          className="absolute bottom-0 left-0 right-0 h-6 z-[9998]"
          onMouseEnter={() => setIsHovered(true)}
          onContextMenu={handleTaskbarContextMenu}
        />
      )}

      <div
        className={`taskbar-container absolute ${isMobile ? 'bottom-0 left-0 right-0 rounded-none os-safe-bottom' : 'bottom-2 left-2 right-2 rounded-2xl'
          } ${isMobile ? 'h-12' : 'h-14'} ${theme.colors.taskbar} backdrop-blur-2xl border ${theme.colors.border} flex items-center justify-between ${isMobile ? 'px-1.5' : 'px-4'
          } z-[2147483647] shadow-2xl transition-all duration-300 hover:opacity-95 pointer-events-auto os-touch-action
          ${taskbarSettings.autoHide && !isHovered && !contextMenu && !taskbarContextMenu && !activePopup ? 'translate-y-[85%]' : 'translate-y-0'}
        `}
        onContextMenu={handleTaskbarContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >

        {/* Start Button / Logo */}
        <div className="flex items-center gap-2 sm:gap-3 mr-1 sm:mr-2">
          {/* DG Logo Button - Opens Start Menu */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!startMenuOpen) playMenuOpen(); else playMenuClose();
              setStartMenuOpen(!startMenuOpen);
            }}
            title="Start Menu"
            className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-lg group z-50
              ${startMenuOpen
                ? 'bg-cyan-500 shadow-cyan-500/50 scale-105 ring-2 ring-white/20'
                : 'bg-gradient-to-br from-cyan-500 to-blue-600 hover:scale-110 active:scale-95 hover:shadow-cyan-500/30'
              }`}
          >
            <span className="font-bold text-white text-sm group-hover:rotate-12 transition-transform">DG</span>
          </button>

          {/* Start Menu Component */}
          <StartMenu
            isOpen={startMenuOpen}
            onClose={() => setStartMenuOpen(false)}
            shortcuts={shortcuts}
            onOpenApp={(appOrId) => {
              // Handle both full app object (from shortcuts) and simple ID string/object (from internal buttons)
              const appId = appOrId.id || appOrId;
              let fullApp = shortcuts.find(s => s.id === appId);

              if (!fullApp) {
                // If not in shortcuts, look in registered apps
                fullApp = apps.find(a => a.id === appId);
              }

              if (fullApp) {
                handleAppClick(fullApp);
              } else {
                console.warn(`App not found: ${appId}`);
              }
              setStartMenuOpen(false);
            }}
            profile={userProfile}
          />


          {/* Search Bar */}
          {!isMobile && (
            <>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${searchFocused
                ? 'bg-white/15 border border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}>
                <Search size={16} className={`${searchFocused ? 'text-cyan-400' : 'text-white/50'} transition-colors`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const query = e.target.value;
                    setSearchQuery(query);
                    if (query.trim()) {
                      onOpenSpotlight && onOpenSpotlight(query);
                    }
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => {
                    setSearchFocused(false);
                    setSearchQuery(''); // Clear when focus is lost
                  }}
                  placeholder="Search apps, files..."
                  className="bg-transparent border-0 outline-none text-white text-sm placeholder-white/40 w-48 focus:w-64 transition-all duration-300"
                />
              </div>

              {/* Voice Control Button */}
              {isSupported && (
                <button
                  onClick={() => isListening ? stopListening() : startListening()}
                  disabled={!serviceAvailable && !isListening}
                  className={`relative w-9 h-9 ml-2 rounded-lg flex items-center justify-center transition-all duration-300 group
                      ${isListening
                      ? 'bg-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse'
                      : !serviceAvailable
                        ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed opacity-50'
                        : 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/5 hover:border-white/10 hover:shadow-lg'
                    }`}
                  title={
                    !serviceAvailable
                      ? "Voice unavailable - Works best in Chrome/Edge"
                      : isListening
                        ? "Stop Voice (Esc)"
                        : "Voice Control (Ctrl+Shift+Space)\nSay: 'Open Terminal', 'Close window'"
                  }
                >
                  <Mic size={16} className={`transition-transform duration-300 ${isListening ? 'scale-110' : 'group-hover:scale-110'}`} />

                  {/* Live Indicator Dot */}
                  {isListening && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  )}

                  {/* Service Unavailable Indicator */}
                  {!serviceAvailable && !isListening && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full" title="Service unavailable" />
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {/* Dock Area */}
        <div className={`absolute left-1/2 transform -translate-x-1/2 flex items-center ${isMobile ? 'gap-0.5 max-w-[55vw] overflow-x-auto scrollbar-hide' : 'gap-1.5'} h-full px-2`}>
          {orderedApps.map((app, index) => {
            const isOpen = windows.find(w => w.id === app.id);
            const isActive = activeWindowId === app.id && !isOpen?.isMinimized;
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <button
                key={app.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => handleAppClick(app)}
                onContextMenu={(e) => handleContextMenu(e, app)}
                className={`relative ${getButtonPadding()} rounded-xl transition-all duration-300 group flex items-center gap-2 ${isActive ? 'bg-white/15 shadow-inner' : 'hover:bg-white/10'
                  } ${isDragging ? 'opacity-50 scale-95' : ''} ${isDragOver && draggedIndex !== index ? 'scale-110' : ''
                  } ${taskbarSettings.showLabels ? 'px-3 min-w-[120px] max-w-[200px]' : ''}`}
              >
                {/* Icon */}
                <div className={`text-white/80 group-hover:text-white transition-all transform ${isActive ? 'scale-110 text-white drop-shadow-md' : 'group-hover:-translate-y-1'}`}>
                  {/* Clone element to override size prop if needed, or simply pass it if safe */}
                  {React.cloneElement(app.icon, { size: getIconSize() })}
                </div>

                {/* Label (Show Labels) */}
                {taskbarSettings.showLabels && (
                  <span className="text-xs text-white/90 truncate font-medium flex-1 text-left">
                    {app.title}
                  </span>
                )}

                {/* Active Indicator */}
                {isOpen && !taskbarSettings.showLabels && (
                  <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 transition-all duration-300 ${isActive ? 'bg-cyan-400 w-8 h-1 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-white/30 w-1.5 h-1.5 rounded-full'}`}></div>
                )}
                {/* Active Indicator (Side for labels mode) */}
                {isOpen && taskbarSettings.showLabels && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 transition-all duration-300 ${isActive ? 'bg-cyan-400 w-1 h-6 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-white/30 w-1 h-3 rounded-r-full'}`}></div>
                )}

                {/* Note: No indicator for closed pinned apps - dots only show for open apps */}

                {/* Tooltip (Only if labels hidden) */}
                {!taskbarSettings.showLabels && (
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-800/90 backdrop-blur-md text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap border border-white/10 shadow-xl translate-y-2 group-hover:translate-y-0">
                    {app.title}
                  </span>
                )}
              </button>
            )
          })}
        </div>


        <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2 sm:gap-3 md:gap-4'
          } text-white/90`}>
          {isPlaying && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPlayerOpen(true);
              }}
              className="relative z-50 pointer-events-auto flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-white/10 rounded-full border border-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              title={`${track?.title || 'Now Playing'} — ${track?.artist || ''}`}
              aria-label="Music playing"
            >
              <Music size={14} className="sm:w-4 sm:h-4 text-pink-300" />
              {!isMobile && (
                <span className="text-xs text-white/80 truncate max-w-[80px] sm:max-w-[100px] md:max-w-[120px]">
                  {track?.title || 'Now Playing'}
                </span>
              )}
            </button>
          )}
          <div className={`flex items-center ${isMobile ? 'gap-2 px-2' : 'gap-2 sm:gap-3 px-2 sm:px-3'
            } py-1.5 bg-white/5 rounded-full border border-white/5 hover:bg-white/10 transition-colors`}>

            {/* Network Status */}
            <div className="relative">
              <div
                className={`cursor-pointer hover:text-cyan-400 transition-colors ${!isOnline ? 'text-red-400' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (activePopup === 'wifi') playMenuClose(); else playMenuOpen();
                  setActivePopup(activePopup === 'wifi' ? null : 'wifi');
                }}
                title={!isOnline ? "Offline" : `Connected (Signal: ${wifiSignal === 3 ? 'Strong' : wifiSignal === 2 ? 'Good' : 'Weak'})`}
              >
                {!isOnline ? <WifiOff size={18} /> :
                  wifiSignal >= 3 ? <Wifi size={18} /> :
                    wifiSignal === 2 ? <Wifi size={18} className="opacity-80" /> :
                      <div className="relative"><Wifi size={18} className="opacity-40" /><span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span></div>
                }
              </div>

              {/* Network Popup */}
              {activePopup === 'wifi' && (
                <div
                  className={`fixed bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 ${isMobile ? 'w-[calc(100vw-1.5rem)]' : 'w-64'} z-[10000]`}
                  style={{
                    right: isMobile ? '12px' : '100px',
                    bottom: isMobile ? '58px' : '80px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                    <span className="text-white font-semibold text-sm">Wi-Fi</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isOnline}
                        onChange={() => setIsOnline(!isOnline)}
                        className="peer sr-only"
                        id="wifi-toggle-popup"
                      />
                      <label
                        htmlFor="wifi-toggle-popup"
                        className={`block w-9 h-5 rounded-full cursor-pointer transition-colors ${isOnline ? 'bg-cyan-500' : 'bg-white/20'}`}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isOnline ? 'translate-x-4' : ''}`}></div>
                      </label>
                    </div>
                  </div>

                  {isOnline ? (
                    <div className="max-h-[400px] overflow-y-auto pr-1 custom-scrollbar-thin">
                      {/* Connected Network */}
                      <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30 mb-2">
                        <div className="flex items-center gap-3">
                          {wifiSignal >= 3 ? <Wifi size={16} className="text-cyan-400" /> : <Wifi size={16} className="text-yellow-400" />}
                          <div>
                            <span className="text-white text-sm block font-medium">David's Wi-Fi</span>
                            <span className="text-cyan-400 text-xs">Connected</span>
                          </div>
                        </div>
                        <Check size={14} className="text-cyan-400" />
                      </div>

                      {/* Social Networks as Wifi */}
                      {socialNetworks.map((category, idx) => (
                        <div key={idx} className="mb-2">
                          <div className="px-2 py-1 text-white/40 text-[10px] font-bold uppercase tracking-wider">
                            {category.category}
                          </div>
                          {category.networks.map((network, netIdx) => {
                            const Icon = network.icon;
                            return (
                              <button
                                key={netIdx}
                                onClick={() => handleNetworkClick(network.url)}
                                className="w-full px-2 py-2 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between group"
                              >
                                <div className="flex items-center gap-3">
                                  <Icon size={16} className={`${network.color} opacity-80 group-hover:opacity-100`} />
                                  <span className="text-white/80 text-sm group-hover:text-white transition-colors">
                                    {network.name}
                                  </span>
                                </div>
                                <div className="flex items-end gap-0.5 h-3">
                                  {getSignalBars(network.signal)}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <WifiOff size={24} className="mx-auto text-white/20 mb-2" />
                      <p className="text-white/50 text-sm">Wi-Fi is turned off</p>
                      <button
                        onClick={() => setIsOnline(true)}
                        className="mt-3 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition-colors"
                      >
                        Turn On
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Volume Control */}
            <div className="relative">
              <div
                className={`cursor-pointer hover:text-cyan-400 transition-colors hover:scale-110 active:scale-95 ${isMuted ? 'text-red-400' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (activePopup === 'volume') playMenuClose(); else playMenuOpen();
                  setActivePopup(activePopup === 'volume' ? null : 'volume');
                }}
                title={isMuted ? "Unmute" : `Volume: ${volume}%`}
                aria-label={isMuted ? "Muted" : `Volume ${volume}%`}
              >
                {isMuted ? <VolumeX size={16} /> : volume < 50 ? <Volume1 size={16} /> : <Volume2 size={16} />}
              </div>

              {/* Volume Popup */}
              {activePopup === 'volume' && (
                <div
                  className={`fixed bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 ${isMobile ? 'w-[calc(100vw-1.5rem)]' : 'w-64'} z-[10000]`}
                  style={{
                    right: isMobile ? '12px' : '80px',
                    bottom: isMobile ? '58px' : '80px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Volume2 size={18} className="text-cyan-400" />
                      <span className="text-white font-semibold text-sm">Volume Control</span>
                    </div>
                    <span className="text-cyan-400 text-sm font-mono">{volume}%</span>
                  </div>

                  {/* Volume Slider */}
                  <div className="mb-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const newVol = parseInt(e.target.value);
                        setVolume(newVol);
                        playSliderTick();
                        if (newVol > 0 && isMuted) {
                          setMuted(false);
                        }
                      }}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                        [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                        [&::-webkit-slider-thumb]:hover:bg-cyan-300 [&::-webkit-slider-thumb]:transition-colors"
                      style={{
                        background: `linear-gradient(to right, rgb(34 211 238) 0%, rgb(34 211 238) ${isMuted ? 0 : volume}%, rgba(255,255,255,0.1) ${isMuted ? 0 : volume}%, rgba(255,255,255,0.1) 100%)`
                      }}
                    />
                  </div>

                  {/* Quick Volume Buttons */}
                  <div className="flex gap-2 mb-4">
                    {[0, 25, 50, 75, 100].map(v => (
                      <button
                        key={v}
                        onClick={() => {
                          setVolume(v);
                          if (v > 0) setMuted(false);
                          else setMuted(true);
                        }}
                        className={`flex-1 py-1.5 text-xs rounded-lg transition-colors ${volume === v && !isMuted
                          ? 'bg-cyan-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                      >
                        {v}%
                      </button>
                    ))}
                  </div>

                  {/* Mute Toggle */}
                  <button
                    onClick={() => {
                      if (!isMuted) playToggleOff(); else playToggleOn();
                      setMuted(!isMuted);
                    }}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${isMuted
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                </div>
              )}
            </div>

            {/* Battery Control */}
            <div className="relative">
              <div
                className={`flex items-center gap-1 cursor-pointer hover:text-cyan-400 transition-colors ${batterySaver ? 'text-green-400' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (activePopup === 'battery') playMenuClose(); else playMenuOpen();
                  setActivePopup(activePopup === 'battery' ? null : 'battery');
                }}
                title={`${Math.round(battery.level)}%${battery.charging ? ' - Charging' : (battery.level === 100 ? ' - Fully Charged' : ' - On Battery')}${batterySaver ? ' - Power Saver ON' : ''}`}
                aria-label={`Battery ${Math.round(battery.level)}%`}
              >
                {getBatteryIcon()}
                <span className="text-xs font-medium w-6 text-right hidden xs:inline">{Math.round(battery.level)}%</span>
              </div>

              {/* Battery Popup */}
              {activePopup === 'battery' && (
                <div
                  className={`fixed bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 ${isMobile ? 'w-[calc(100vw-1.5rem)]' : 'w-72'} z-[10000]`}
                  style={{
                    right: isMobile ? '12px' : '60px',
                    bottom: isMobile ? '58px' : '80px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header with Battery Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {battery.charging ? <BatteryCharging size={20} className="text-green-400" /> : <Battery size={20} className="text-cyan-400" />}
                      <div>
                        <span className="text-white font-semibold text-sm block">Battery</span>
                        <span className="text-white/50 text-xs">{battery.charging ? 'Charging' : 'On Battery'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${battery.level < 20 ? 'text-red-400' : battery.level < 50 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                        {Math.round(battery.level)}%
                      </span>
                    </div>
                  </div>

                  {/* Battery Bar */}
                  <div className="mb-4">
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${battery.level < 20 ? 'bg-red-500' :
                          battery.level < 50 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                        style={{ width: `${battery.level}%` }}
                      />
                    </div>
                  </div>

                  <div className="h-px bg-white/10 my-3" />

                  {/* Brightness Control */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sun size={16} className="text-yellow-400" />
                        <span className="text-white text-sm">Brightness</span>
                      </div>
                      <span className="text-cyan-400 text-sm font-mono">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={brightness}
                      onChange={(e) => { setBrightness(parseInt(e.target.value)); playSliderTick(); }}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                        [&::-webkit-slider-thumb]:bg-yellow-400 [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                      style={{
                        background: `linear-gradient(to right, rgb(250 204 21) 0%, rgb(250 204 21) ${(brightness - 20) / 80 * 100}%, rgba(255,255,255,0.1) ${(brightness - 20) / 80 * 100}%, rgba(255,255,255,0.1) 100%)`
                      }}
                    />
                    {/* Quick Brightness Buttons */}
                    <div className="flex gap-2 mt-2">
                      {[20, 50, 75, 100].map(b => (
                        <button
                          key={b}
                          onClick={() => setBrightness(b)}
                          className={`flex-1 py-1 text-xs rounded-lg transition-colors ${brightness === b
                            ? 'bg-yellow-500 text-black'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                        >
                          {b === 20 ? <Moon size={12} className="mx-auto" /> : `${b}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-white/10 my-3" />

                  {/* Battery Saver Toggle */}
                  <button
                    onClick={() => { if (!batterySaver) playToggleOn(); else playToggleOff(); setBatterySaver(!batterySaver); }}
                    className={`w-full py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between px-4 ${batterySaver
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Leaf size={18} />
                      <div className="text-left">
                        <span className="block">Battery Saver</span>
                        <span className="text-xs opacity-60">
                          {batterySaver ? 'Reduces animations used' : 'Optimize performance'}
                        </span>
                      </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-colors ${batterySaver ? 'bg-green-500' : 'bg-white/20'} relative`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${batterySaver ? 'translate-x-5' : ''}`} />
                    </div>
                  </button>

                  {/* Power Info */}
                  {battery.charging && (
                    <div className="mt-3 flex items-center gap-2 text-green-400 text-xs justify-center">
                      <Zap size={14} />
                      <span>Connected to power</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {!isMobile && <SystemClock />}

          {/* Power Menu */}
          <div className="relative ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (activePopup === 'power') playMenuClose(); else playMenuOpen();
                setActivePopup(activePopup === 'power' ? null : 'power');
              }}
              className={`p-2 rounded-lg transition-colors ${activePopup === 'power' ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/10 text-white/80 hover:text-white'}`}
              title="Power"
            >
              <Power size={20} />
            </button>

            {activePopup === 'power' && (
              <div
                className={`fixed bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 ${isMobile ? 'w-[calc(100vw-1.5rem)]' : 'w-48'} z-[10000]`}
                style={{
                  right: isMobile ? '12px' : '10px',
                  bottom: isMobile ? '58px' : '80px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { setActivePopup(null); sleep(); }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 text-blue-400">
                    <Moon size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Sleep</div>
                    <div className="text-xs text-white/50">Lock screen</div>
                  </div>
                </button>

                <button
                  onClick={() => { setActivePopup(null); restart(); }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="p-2 rounded-full bg-yellow-500/10 group-hover:bg-yellow-500/20 text-yellow-400">
                    <RotateCcw size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Restart</div>
                    <div className="text-xs text-white/50">Reboot system</div>
                  </div>
                </button>

                <div className="h-px bg-white/10 my-1"></div>

                <button
                  onClick={() => { setActivePopup(null); shutdown(); }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-500/10 transition-colors text-left group"
                >
                  <div className="p-2 rounded-full bg-red-500/10 group-hover:bg-red-500/20 text-red-400">
                    <Power size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-red-400">Shut Down</div>
                    <div className="text-xs text-white/50">Power off</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu (Moved outside transformed div to fix positioning) */}
      {contextMenu && (
        <div
          className="context-menu-container fixed bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 min-w-[180px] max-w-[250px] z-[10002]"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 200),
            bottom: window.innerHeight - contextMenu.y + 20,
          }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Custom App Actions from Desktop Shortcuts */}
          {contextMenu.app.contextMenuOptions && (
            <>
              {contextMenu.app.contextMenuOptions.map((opt, idx) => (
                opt.separator ? (
                  <div key={idx} className="h-px bg-white/10 my-1"></div>
                ) : (
                  <button
                    key={idx}
                    onClick={() => {
                      if (opt.onClick) opt.onClick();
                      setContextMenu(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors"
                  >
                    {opt.label}
                  </button>
                )
              ))}
              <div className="h-px bg-white/10 my-1"></div>
            </>
          )}

          {contextMenu.isOpen && (
            <>
              <button
                onClick={() => {
                  focusWindow(contextMenu.app.id);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors"
              >
                Focus Window
              </button>
              <button
                onClick={() => {
                  minimizeWindow(contextMenu.app.id);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors"
              >
                Minimize
              </button>
              <div className="h-px bg-white/10 my-1"></div>
              <button
                onClick={() => {
                  closeWindow(contextMenu.app.id);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 transition-colors"
              >
                Close
              </button>
              <div className="h-px bg-white/10 my-1"></div>
            </>
          )}
          <button
            onClick={() => {
              togglePinApp(contextMenu.app.id);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors"
          >
            {isPinned(contextMenu.app.id) ? 'Unpin from Taskbar' : 'Pin to Taskbar'}
          </button>
        </div>
      )}

      {/* Taskbar Settings Context Menu (Moved outside transformed div) */}
      {taskbarContextMenu && (
        <div
          className="context-menu-container fixed bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 min-w-[200px] max-w-[280px] z-[10002]"
          style={{
            left: Math.min(taskbarContextMenu.x, window.innerWidth - 220),
            bottom: window.innerHeight - taskbarContextMenu.y + 20,
          }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="px-4 py-2 text-white/60 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <Sliders size={14} />
            Taskbar Settings
          </div>
          <div className="h-px bg-white/10 my-1"></div>

          <button
            onClick={() => updateTaskbarSetting('showLabels', !taskbarSettings.showLabels)}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center justify-between"
          >
            <span>Show Labels</span>
            <div className={`w-9 h-5 rounded-full transition-colors ${taskbarSettings.showLabels ? 'bg-cyan-500' : 'bg-white/20'} relative`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${taskbarSettings.showLabels ? 'translate-x-4' : ''}`}></div>
            </div>
          </button>

          <button
            onClick={() => updateTaskbarSetting('autoHide', !taskbarSettings.autoHide)}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center justify-between"
          >
            <span>Auto-Hide</span>
            <div className={`w-9 h-5 rounded-full transition-colors ${taskbarSettings.autoHide ? 'bg-cyan-500' : 'bg-white/20'} relative`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${taskbarSettings.autoHide ? 'translate-x-4' : ''}`}></div>
            </div>
          </button>

          <div className="h-px bg-white/10 my-1"></div>

          <div className="px-4 py-2">
            <div className="text-white/60 text-xs mb-2">Icon Size</div>
            <div className="flex gap-2">
              {['small', 'medium', 'large'].map(size => (
                <button
                  key={size}
                  onClick={() => updateTaskbarSetting('iconSize', size)}
                  className={`flex-1 px-2 py-1 text-xs rounded-lg transition-colors ${taskbarSettings.iconSize === size
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/10 my-1"></div>

          <button
            onClick={() => {
              openApp({
                id: 'settings',
                title: 'Settings',
                icon: <Settings size={24} />,
                component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Settings"><SettingsApp /></ErrorBoundary></Suspense>
              });
              setTaskbarContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <Settings size={16} />
            Open Settings
          </button>
        </div>
      )}
    </>
  );
};

export default Taskbar;
