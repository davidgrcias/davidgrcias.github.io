import React, { useState, useEffect } from 'react';
import { useOS } from '../../contexts/OSContext';
import { Terminal, Code, Globe, Settings, Wifi, Battery, Volume2 } from 'lucide-react';

// Apps
import VSCodeApp from '../../apps/VSCode/VSCodeApp';
import TerminalApp from '../../apps/Terminal/TerminalApp';

const Taskbar = () => {
  const { windows, activeWindowId, openApp, minimizeWindow, focusWindow } = useOS();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Defined Apps
  const apps = [
      { id: 'vscode', title: 'VS Code', icon: <Code size={24} />, component: <VSCodeApp /> },
      { id: 'terminal', title: 'Terminal', icon: <Terminal size={24} />, component: <TerminalApp /> },
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

  return (
    <div className="absolute bottom-0 left-0 right-0 h-14 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-4 z-[9999]">
      
      {/* Start Button / Logo (Optional) */}
      <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
              <span className="font-bold text-white text-xs">DG</span>
          </div>
      </div>

      {/* Dock Area */}
      <div className="flex items-center gap-2 h-full">
          {apps.map((app) => {
              const isOpen = windows.find(w => w.id === app.id);
              const isActive = activeWindowId === app.id && !isOpen?.isMinimized;

              return (
                  <button
                    key={app.id}
                    onClick={() => handleAppClick(app)}
                    className={`relative p-2.5 rounded-lg transition-all group ${
                        isActive ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                      {/* Icon */}
                      <div className={`text-gray-300 group-hover:text-blue-400 transition-colors ${isActive ? 'text-blue-400' : ''}`}>
                          {app.icon}
                      </div>

                      {/* Active Dot Indicator */}
                      {isOpen && (
                          <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isActive ? 'bg-blue-400 w-1.5 h-1.5' : 'bg-gray-500'}`}></div>
                      )}
                      
                      {/* Tooltip */}
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-gray-700 shadow-lg">
                          {app.title}
                      </span>
                  </button>
              )
          })}
      </div>

      {/* System Tray */}
      <div className="flex items-center gap-4 text-white/80 text-sm">
          <div className="flex items-center gap-3 px-2 border-r border-white/10 pr-4">
               <Wifi size={16} />
               <Volume2 size={16} />
               <Battery size={16} />
          </div>
          <div className="flex flex-col items-end leading-none">
              <span className="font-medium">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-xs text-white/50">{time.toLocaleDateString()}</span>
          </div>
      </div>
    </div>
  );
};

export default Taskbar;
