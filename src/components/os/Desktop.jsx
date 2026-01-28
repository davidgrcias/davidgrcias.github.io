import React, { useState, useEffect } from 'react';
import { OSProvider, useOS } from '../../contexts/OSContext';
import { NotificationProvider, useNotification } from '../../contexts/NotificationContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { RefreshCw, Settings, Info, Code, Terminal, MessageSquare, FolderOpen } from 'lucide-react';
import Taskbar from './Taskbar';
import WindowFrame from './WindowFrame';
import ContextMenu from './ContextMenu';
import BootSequence from './BootSequence';
import DesktopIcon from './DesktopIcon';

// Apps
import VSCodeApp from '../../apps/VSCode/VSCodeApp';
import TerminalApp from '../../apps/Terminal/TerminalApp';
import MessengerApp from '../../apps/Messenger/MessengerApp';

const DesktopContent = () => {
    const { windows, activeWindowId, closeWindow, minimizeWindow, openApp } = useOS();
    const { showNotification } = useNotification();
    const [contextMenu, setContextMenu] = useState(null);
    const [showBoot, setShowBoot] = useState(true);

    // Desktop shortcuts
    const desktopShortcuts = [
        { 
            id: 'vscode', 
            label: 'Portfolio', 
            icon: <Code size={32} />,
            component: <VSCodeApp />,
            title: 'VS Code',
        },
        { 
            id: 'messenger', 
            label: 'Chat', 
            icon: <MessageSquare size={32} />,
            component: <MessengerApp />,
            title: 'Messages',
        },
        { 
            id: 'terminal', 
            label: 'Terminal', 
            icon: <Terminal size={32} />,
            component: <TerminalApp />,
            title: 'Terminal',
        },
    ];

    // Show welcome notification after boot
    useEffect(() => {
        if (!showBoot) {
            setTimeout(() => {
                showNotification({
                    title: 'Welcome! 👋',
                    message: 'Double-click apps in taskbar to open. Right-click desktop for options.',
                    type: 'info',
                    duration: 6000,
                });
            }, 500);
        }
    }, [showBoot, showNotification]);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        'Escape': () => {
            if (contextMenu) {
                setContextMenu(null);
            } else if (activeWindowId) {
                closeWindow(activeWindowId);
            }
        },
        'Ctrl+w': () => {
            if (activeWindowId) {
                closeWindow(activeWindowId);
            }
        },
        'Ctrl+m': () => {
            if (activeWindowId) {
                minimizeWindow(activeWindowId);
            }
        },
    });

    // Right-click context menu
    const handleContextMenu = (e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const contextMenuOptions = [
        {
            label: 'Refresh',
            icon: <RefreshCw size={16} />,
            onClick: () => window.location.reload(),
            shortcut: 'F5',
        },
        { separator: true },
        {
            label: 'Settings',
            icon: <Settings size={16} />,
            onClick: () => console.log('Settings clicked'),
            disabled: true,
        },
        {
            label: 'About WebOS',
            icon: <Info size={16} />,
            onClick: () => alert('David\'s WebOS Portfolio v1.0\n\nBuilt with React + Vite + Tailwind'),
        },
    ];

    // Skip boot on subsequent visits (use sessionStorage)
    useEffect(() => {
        const hasBooted = sessionStorage.getItem('webos-booted');
        if (hasBooted) {
            setShowBoot(false);
        }
    }, []);

    const handleBootComplete = () => {
        sessionStorage.setItem('webos-booted', 'true');
        setShowBoot(false);
    };

    if (showBoot) {
        return <BootSequence onComplete={handleBootComplete} />;
    }

    return (
        <div 
            className="h-screen w-screen overflow-hidden bg-[url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2613&auto=format&fit=crop')] bg-cover bg-center text-white relative"
            onContextMenu={handleContextMenu}
            onClick={() => setContextMenu(null)}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

            {/* Desktop Icons Area (Clickable to open apps directly) */}
            <div className="relative z-10 w-full h-full p-6 flex flex-wrap gap-4 content-start items-start">
                {desktopShortcuts.map((shortcut) => (
                    <DesktopIcon
                        key={shortcut.id}
                        icon={shortcut.icon}
                        label={shortcut.label}
                        onClick={() => openApp(shortcut)}
                    />
                ))}
            </div>

            {/* Windows Layer */}
            {windows.map((window) => (
                <WindowFrame key={window.id} window={window} />
            ))}

            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    options={contextMenuOptions}
                    onClose={() => setContextMenu(null)}
                />
            )}

            {/* Taskbar */}
            <Taskbar />
        </div>
    );
};

const Desktop = () => {
  return (
    <OSProvider>
      <NotificationProvider>
        <DesktopContent />
      </NotificationProvider>
    </OSProvider>
  );
};

export default Desktop;
