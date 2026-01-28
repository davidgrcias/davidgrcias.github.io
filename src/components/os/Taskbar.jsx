import React, { useState, useEffect } from 'react';
import { useOS } from '../../contexts/OSContext';
import { Terminal, Code, Globe, Settings, Wifi, WifiOff, Battery, BatteryCharging, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import SystemClock from './SystemClock';

// Apps
import VSCodeApp from '../../apps/VSCode/VSCodeApp';
import TerminalApp from '../../apps/Terminal/TerminalApp';
import MessengerApp from '../../apps/Messenger/MessengerApp';

const Taskbar = () => {
  const { windows, activeWindowId, openApp, minimizeWindow, focusWindow } = useOS();
  
  // Real System States
  const [battery, setBattery] = useState({ level: 1, charging: false });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

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
      { id: 'vscode', title: 'VS Code', icon: <Code size={24} />, component: <VSCodeApp /> },
      { id: 'terminal', title: 'Terminal', icon: <Terminal size={24} />, component: <TerminalApp /> },
      { id: 'messenger', title: 'Messages', icon: <MessageSquare size={24} />, component: <MessengerApp /> },
      { id: 'browser', title: 'Browser', icon: <Globe size={24} />, component: <div className="w-full h-full bg-white flex items-center justify-center text-black">Browser Placeholder</div> },
      { id: 'settings', title: 'Settings', icon: <Settings size={24} />, component: <div className="p-10 text-white">Settings Panel</div> },
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
      if (battery.charging) return <BatteryCharging size={16} className="text-green-400" />;
      if (battery.level < 0.2) return <Battery size={16} className="text-red-500" />;
      return <Battery size={16} />;
  };

  return (
    <div className="absolute bottom-2 left-2 right-2 h-14 bg-gray-900/60 backdrop-blur-2xl rounded-2xl border border-white/10 flex items-center justify-between px-4 z-[9999] shadow-2xl transition-all duration-300 hover:bg-gray-900/70">
      
      {/* Start Button / Logo */}
      <div className="flex items-center">
          <button className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-cyan-500/30 group">
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
      <div className="flex items-center gap-4 text-white/90">
          <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 hover:bg-white/10 transition-colors">
               
               {/* Wifi */}
               <div title={isOnline ? "Connected" : "Offline"} className={isOnline ? "text-white" : "text-gray-500"}>
                   {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
               </div>
               
               {/* Sound */}
               <div 
                  className="cursor-pointer hover:text-cyan-400 transition-colors"
                  onClick={() => setIsMuted(!isMuted)}
               >
                   {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
               </div>

               {/* Battery */}
               <div className="flex items-center gap-1 cursor-help" title={`${Math.round(battery.level * 100)}%${battery.charging ? ' - Charging' : ''}`}>
                    {getBatteryIcon()}
                    <span className="text-xs font-medium w-6 text-right">{Math.round(battery.level * 100)}%</span>
               </div>
          </div>

          <SystemClock />
      </div>
    </div>
  );
};

export default Taskbar;
