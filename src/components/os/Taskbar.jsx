import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useOS } from '../../contexts/OSContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Terminal, Code, FolderOpen, Settings, Wifi, WifiOff, Battery, BatteryCharging, Volume2, VolumeX, MessageSquare, User, StickyNote } from 'lucide-react';
import SystemClock from './SystemClock';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import ErrorBoundary from '../ErrorBoundary';

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
  const { windows, activeWindowId, openApp, minimizeWindow, focusWindow, toggleSounds, isSoundEnabled } = useOS();
  const { theme } = useTheme();
  const { isMobile } = useDeviceDetection();
  
  // Real System States
  const [battery, setBattery] = useState({ level: 1, charging: false });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Update sound state from context
  useEffect(() => {
    setSoundEnabled(isSoundEnabled());
  }, [isSoundEnabled]);

  // Battery API
  useEffect(() => {
    if ('getBattery' in navigator) {
        navigator.getBattery().then((bat) => {
            const updateBat = () => setBattery({ level: bat.level, charging: bat.charging });
            updateBat();
            bat.addEventListener('levelchange', updateBat);
            bat.addEventListener('chargingchange', updateBat);
        });
    }
  }, []);

  // Network API
  useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
      };
  }, []);

  // Defined Apps
  const apps = [
      { id: 'vscode', title: 'VS Code', icon: <Code size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="VS Code"><VSCodeApp /></ErrorBoundary></Suspense> },
      { id: 'file-manager', title: 'File Manager', icon: <FolderOpen size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="File Manager"><FileManagerApp /></ErrorBoundary></Suspense> },
      { id: 'about-me', title: 'About Me', icon: <User size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="About Me"><AboutMeApp /></ErrorBoundary></Suspense> },
      { id: 'notes', title: 'Notes', icon: <StickyNote size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Notes"><NotesApp /></ErrorBoundary></Suspense> },
      { id: 'terminal', title: 'Terminal', icon: <Terminal size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Terminal"><TerminalApp /></ErrorBoundary></Suspense> },
      { id: 'messenger', title: 'Messages', icon: <MessageSquare size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Messenger"><MessengerApp /></ErrorBoundary></Suspense> },
      { id: 'settings', title: 'Settings', icon: <Settings size={24} />, component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Settings"><SettingsApp /></ErrorBoundary></Suspense> },
  ];

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

  return (
    <div className={`absolute ${isMobile ? 'bottom-0 left-0 right-0 rounded-none' : 'bottom-2 left-2 right-2 rounded-2xl'} h-14 ${theme.colors.taskbar} backdrop-blur-2xl border ${theme.colors.border} flex items-center justify-between px-4 z-[9999] shadow-2xl transition-all duration-300 hover:opacity-95`}>
      
      {/* Start Button / Logo */}
      <div className="flex items-center">
          <button 
            onClick={() => onOpenSpotlight && onOpenSpotlight()}
            title="Open Spotlight Search (Ctrl+Space)"
            className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-cyan-500/30 group"
          >
              <span className="font-bold text-white text-sm group-hover:rotate-12 transition-transform">DG</span>
          </button>
      </div>

      {/* Dock Area */}
      <div className="flex items-center gap-3 h-full px-4">
          {apps.map((app) => {
              const isOpen = windows.find(w => w.id === app.id);
              const isActive = activeWindowId === app.id && !isOpen?.isMinimized;

              return (
                  <button
                    key={app.id}
                    onClick={() => handleAppClick(app)}
                    className={`relative p-2 rounded-xl transition-all duration-300 group ${
                        isActive ? 'bg-white/15 shadow-inner' : 'hover:bg-white/10'
                    }`}
                  >
                      {/* Icon */}
                      <div className={`text-white/80 group-hover:text-white transition-all transform ${isActive ? 'scale-110 text-white drop-shadow-md' : 'group-hover:-translate-y-1'}`}>
                          {app.icon}
                      </div>

                      {/* Active Indicator */}
                      {isOpen && (
                          <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 transition-all duration-300 ${isActive ? 'bg-cyan-400 w-8 h-1 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-white/30 w-1.5 h-1.5 rounded-full'}`}></div>
                      )}
                      
                      {/* Tooltip */}
                      <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-800/90 backdrop-blur-md text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap border border-white/10 shadow-xl translate-y-2 group-hover:translate-y-0">
                          {app.title}
                      </span>
                  </button>
              )
          })}
      </div>

      {/* System Tray */}
      <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'} text-white/90`}>
          <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'} px-3 py-1.5 bg-white/5 rounded-full border border-white/5 hover:bg-white/10 transition-colors`}>
               
               {/* Wifi */}
               <div title={isOnline ? "Connected" : "Offline"} className={isOnline ? "text-white" : "text-gray-500"}>
                   {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
               </div>
               
               {/* Sound */}
               <div 
                  className="cursor-pointer hover:text-cyan-400 transition-colors hover:scale-110 active:scale-95"
                  onClick={handleSoundToggle}
                  title={soundEnabled ? "Mute sounds" : "Enable sounds"}
                  aria-label={soundEnabled ? "Sounds on" : "Sounds off"}
               >
                   {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
               </div>

               {/* Battery */}
               <div className="flex items-center gap-1 cursor-help hover:text-cyan-400 transition-colors" title={`${Math.round(battery.level * 100)}%${battery.charging ? ' - Charging' : ''}`} aria-label={`Battery ${Math.round(battery.level * 100)}%`}>
                    {getBatteryIcon()}
                    <span className="text-xs font-medium w-6 text-right">{Math.round(battery.level * 100)}%</span>
               </div>
          </div>

          {!isMobile && <SystemClock />}
      </div>
    </div>
  );
};

export default Taskbar;
