import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useOS } from '../../contexts/OSContext';
import { useVoice } from '../../contexts/VoiceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Terminal, Code, FolderOpen, Settings, Wifi, WifiOff, Battery, BatteryCharging, BatteryLow, Volume2, VolumeX, Volume1, MessageSquare, User, StickyNote, Music, Search, Sliders, Linkedin, Instagram, Youtube, Globe, Phone, Sun, Moon, Zap, Leaf, Power, RotateCcw, Check, Lock, Mic } from 'lucide-react';
import SystemClock from './SystemClock';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import ErrorBoundary from '../ErrorBoundary';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';

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

const Taskbar = ({ onOpenSpotlight }) => {
  const { windows, activeWindowId, openApp, minimizeWindow, closeWindow, focusWindow, toggleSounds, isSoundEnabled, pinnedApps, togglePinApp, isPinned, reorderPinnedApps, sleep, restart, shutdown } = useOS();
  const { voiceState, startListening, stopListening, isSupported, selectedLanguage } = useVoice();
  const isListening = voiceState === 'listening';
  const serviceAvailable = true; // Always available now (no API dependency)
  const { theme } = useTheme();
  const { isMobile } = useDeviceDetection();
  const { isPlaying, track, setPlayerOpen, volume, setVolume, isMuted, setMuted } = useMusicPlayer();

  // Real System States (Simulated for realism as requested)
  // Battery: Persisted random start, always charging, increments slowly
  const [battery, setBattery] = useState(() => {
    const savedLevel = localStorage.getItem('webos-battery-level');
    return { 
      level: savedLevel ? parseFloat(savedLevel) : Math.random() * 0.6 + 0.2, // Load saved or random 20-80%
      charging: true 
    };
  });
  
  // Wifi: Random fluctuation 1-3 bars (simulated)
  const [wifiSignal, setWifiSignal] = useState(3); // 0-3 scale
  const [isOnline, setIsOnline] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // ... (other states remain the same)

  // Volume popup state
  const [volumePopupOpen, setVolumePopupOpen] = useState(false);
  
  // Battery popup state
  const [batteryPopupOpen, setBatteryPopupOpen] = useState(false);

  // Power popup state
  const [powerPopupOpen, setPowerPopupOpen] = useState(false);
  
  // Brightness & Power Saver (simulated, stored in localStorage)
  const [brightness, setBrightness] = useState(() => {
    const saved = localStorage.getItem('webos-brightness');
    return saved ? parseInt(saved) : 100;
  });
  const [batterySaver, setBatterySaver] = useState(() => {
    const saved = localStorage.getItem('webos-battery-saver');
    return saved === 'true';
  });

  // Drag & drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);
  const [taskbarContextMenu, setTaskbarContextMenu] = useState(null);
  const [networksOpen, setNetworksOpen] = useState(false);

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

  // Simulated Battery Charging Logic
  useEffect(() => {
    const chargeInterval = setInterval(() => {
      setBattery(prev => {
        // Stop at 100%
        if (prev.level >= 1) return { level: 1, charging: true };
        
        // Increment by very small fixed amount (0.5%) for stability
        const increment = 0.005; 
        const newLevel = Math.min(1, prev.level + increment);
        
        // Save to localStorage
        localStorage.setItem('webos-battery-level', newLevel.toString());
        
        return {
          level: newLevel,
          charging: true
        };
      });
    }, 5000); // Update every 5 seconds (Slow & Stable)

    return () => clearInterval(chargeInterval);
  }, []);

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
    const effectiveBrightness = batterySaver ? Math.min(brightness, 70) : brightness;
    document.documentElement.style.filter = effectiveBrightness < 100 
      ? `brightness(${effectiveBrightness / 100})` 
      : 'none';
  }, [brightness, batterySaver]);

  // Save battery saver setting
  useEffect(() => {
    localStorage.setItem('webos-battery-saver', batterySaver.toString());
  }, [batterySaver]);

  // Defined Apps - Memoized to prevent recreation
  const apps = React.useMemo(() => [
    { id: 'vscode', title: 'VS Code', icon: <Code size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="VS Code"><VSCodeApp /></ErrorBoundary></Suspense> },
    { id: 'file-manager', title: 'File Manager', icon: <FolderOpen size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="File Manager"><FileManagerApp /></ErrorBoundary></Suspense> },
    { id: 'about-me', title: 'About Me', icon: <User size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="About Me"><AboutMeApp /></ErrorBoundary></Suspense> },
    { id: 'notes', title: 'Notes', icon: <StickyNote size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Notes"><NotesApp /></ErrorBoundary></Suspense> },
    { id: 'terminal', title: 'Terminal', icon: <Terminal size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Terminal"><TerminalApp /></ErrorBoundary></Suspense> },
    { id: 'messenger', title: 'Messages', icon: <MessageSquare size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Messenger"><MessengerApp /></ErrorBoundary></Suspense> },
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
    if (battery.charging) return <BatteryCharging size={16} className="text-green-400 animate-pulse" />;
    if (battery.level < 0.2) return <Battery size={16} className="text-red-500 animate-pulse" />;
    return <Battery size={16} />;
  };

  const handleSoundToggle = () => {
    const newState = toggleSounds();
    setSoundEnabled(newState);
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
      setNetworksOpen(false);
      setVolumePopupOpen(false);
      setBatteryPopupOpen(false);
      setPowerPopupOpen(false);
    };

    if (contextMenu || taskbarContextMenu || networksOpen || volumePopupOpen || batteryPopupOpen || powerPopupOpen) {
      document.addEventListener('click', handleClickOutside);
      // Also close on right click elsewhere
      document.addEventListener('contextmenu', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('contextmenu', handleClickOutside);
      };
    }
  }, [contextMenu, taskbarContextMenu, networksOpen, volumePopupOpen, batteryPopupOpen, powerPopupOpen]);

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
    if (!networksOpen) return;

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
  }, [networksOpen]);
  
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
    setNetworksOpen(false);
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
    // Get pinned apps in order
    const pinnedAppsInOrder = pinnedApps
      .map(id => apps.find(app => app.id === id))
      .filter(Boolean);

    // Get open apps that are NOT pinned
    const openUnpinnedApps = windows
      .map(w => apps.find(app => app.id === w.id))
      .filter(app => app && !pinnedApps.includes(app.id))
      .filter((app, index, self) => index === self.findIndex(a => a.id === app.id));

    return [...pinnedAppsInOrder, ...openUnpinnedApps];
  }, [pinnedApps, windows, apps]);



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
        className={`taskbar-container absolute ${isMobile ? 'bottom-0 left-0 right-0 rounded-none' : 'bottom-2 left-2 right-2 rounded-2xl'
          } h-14 ${theme.colors.taskbar} backdrop-blur-2xl border ${theme.colors.border} flex items-center justify-between ${isMobile ? 'px-2' : 'px-4'
          } z-[9999] shadow-2xl transition-all duration-300 hover:opacity-95
          ${taskbarSettings.autoHide && !isHovered && !contextMenu && !taskbarContextMenu && !networksOpen ? 'translate-y-[85%]' : 'translate-y-0'}
        `}
        onContextMenu={handleTaskbarContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >

        {/* Start Button / Logo */}
        <div className="flex items-center gap-2 sm:gap-3 mr-1 sm:mr-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenSpotlight && onOpenSpotlight();
            }}
            title="Open Spotlight Search (Ctrl+Space)"
            className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-cyan-500/30 group"
          >
            <span className="font-bold text-white text-sm group-hover:rotate-12 transition-transform">DG</span>
          </button>


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
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 h-full px-2">
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
              onClick={() => setPlayerOpen(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-white/10 rounded-full border border-white/10 hover:bg-white/20 transition-colors"
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
                  setNetworksOpen(!networksOpen);
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
              {networksOpen && (
                <div
                  className="fixed bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 w-64 z-[10000]"
                  style={{
                    right: isMobile ? '10px' : '100px',
                    bottom: isMobile ? '70px' : '80px',
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
                  setVolumePopupOpen(!volumePopupOpen);
                }}
                title={isMuted ? "Unmute" : `Volume: ${volume}%`}
                aria-label={isMuted ? "Muted" : `Volume ${volume}%`}
              >
                {isMuted ? <VolumeX size={16} /> : volume < 50 ? <Volume1 size={16} /> : <Volume2 size={16} />}
              </div>

              {/* Volume Popup */}
              {volumePopupOpen && (
                <div
                  className="fixed bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 w-64 z-[10000]"
                  style={{
                    right: isMobile ? '10px' : '80px',
                    bottom: isMobile ? '70px' : '80px',
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
                        className={`flex-1 py-1.5 text-xs rounded-lg transition-colors ${
                          volume === v && !isMuted
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
                    onClick={() => setMuted(!isMuted)}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      isMuted
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
                  setBatteryPopupOpen(!batteryPopupOpen);
                }}
                title={`${Math.round(battery.level * 100)}%${battery.charging ? ' - Charging' : ''}${batterySaver ? ' - Power Saver ON' : ''}`}
                aria-label={`Battery ${Math.round(battery.level * 100)}%`}
              >
                {battery.charging ? <BatteryCharging size={16} className="text-green-400" /> : 
                 battery.level < 0.2 ? <BatteryLow size={16} className="text-red-500 animate-pulse" /> :
                 <Battery size={16} />}
                <span className="text-xs font-medium w-6 text-right">{Math.round(battery.level * 100)}%</span>
              </div>

              {/* Battery Popup */}
              {batteryPopupOpen && (
                <div
                  className="fixed bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 w-72 z-[10000]"
                  style={{
                    right: isMobile ? '10px' : '60px',
                    bottom: isMobile ? '70px' : '80px',
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
                      <span className={`text-2xl font-bold ${battery.level < 0.2 ? 'text-red-400' : battery.level < 0.5 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                        {Math.round(battery.level * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Battery Bar */}
                  <div className="mb-4">
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          battery.level < 0.2 ? 'bg-red-500' : 
                          battery.level < 0.5 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${battery.level * 100}%` }}
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
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
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
                          className={`flex-1 py-1 text-xs rounded-lg transition-colors ${
                            brightness === b
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
                    onClick={() => setBatterySaver(!batterySaver)}
                    className={`w-full py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between px-4 ${
                      batterySaver
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Leaf size={18} />
                      <div className="text-left">
                        <span className="block">Battery Saver</span>
                        <span className="text-xs opacity-60">
                          {batterySaver ? 'Reduces brightness & animations' : 'Extend battery life'}
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
                setPowerPopupOpen(!powerPopupOpen);
              }}
              className={`p-2 rounded-lg transition-colors ${powerPopupOpen ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/10 text-white/80 hover:text-white'}`}
              title="Power"
            >
              <Power size={20} />
            </button>

            {powerPopupOpen && (
              <div
                className="fixed bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 w-48 z-[10000]"
                style={{
                    right: isMobile ? '10px' : '10px',
                    bottom: isMobile ? '70px' : '80px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { setPowerPopupOpen(false); sleep(); }}
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
                  onClick={() => { setPowerPopupOpen(false); restart(); }}
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
                  onClick={() => { setPowerPopupOpen(false); shutdown(); }}
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
