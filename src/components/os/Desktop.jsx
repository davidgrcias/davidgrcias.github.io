import React, { useState, useEffect, lazy, Suspense } from 'react';
import { OSProvider, useOS } from '../../contexts/OSContext';
import { NotificationProvider, useNotification } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useKonamiCode } from '../../hooks/useKonamiCode';
import { useAchievements } from '../../hooks/useAchievements';
import { RefreshCw, Settings, Info, Code, Terminal, MessageSquare, FolderOpen, User, StickyNote, Camera } from 'lucide-react';
import Taskbar from './Taskbar';
import WindowFrame from './WindowFrame';
import ContextMenu from './ContextMenu';
import BootSequence from './BootSequence';
import DesktopIcon from './DesktopIcon';
import CommandPalette from './CommandPalette';
import WindowSwitcher from './WindowSwitcher';
import Spotlight from './Spotlight';
import ErrorBoundary from '../ErrorBoundary';
import MusicPlayer from '../widgets/MusicPlayer';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import Calendar from '../widgets/Calendar';
import PortfolioStats from '../widgets/PortfolioStats';
import KonamiSecret from '../easter-eggs/KonamiSecret';
import ScreenshotTool from '../tools/ScreenshotTool';
import SnakeGame from '../easter-eggs/SnakeGame';
import KeyboardHelp from './KeyboardHelp';
import WelcomeTutorial from './WelcomeTutorial';
import AchievementToast from '../achievements/AchievementToast';

// Lazy load apps for better performance
const VSCodeApp = lazy(() => import('../../apps/VSCode/VSCodeApp'));
const TerminalApp = lazy(() => import('../../apps/Terminal/TerminalApp'));
const MessengerApp = lazy(() => import('../../apps/Messenger/MessengerApp'));
const FileManagerApp = lazy(() => import('../../apps/FileManager/FileManagerApp'));
const SettingsApp = lazy(() => import('../../apps/Settings/SettingsApp'));
const AboutMeApp = lazy(() => import('../../apps/AboutMe/AboutMeApp'));
const NotesApp = lazy(() => import('../../apps/Notes/NotesApp'));

// Loading fallback for lazy-loaded apps
const AppLoadingFallback = () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-zinc-400 text-sm">Loading app...</p>
        </div>
    </div>
);

const DesktopContent = () => {
    const { windows, activeWindowId, closeWindow, minimizeWindow, openApp } = useOS();
    const { showNotification } = useNotification();
    const { unlockAchievement, trackMetric, currentAchievement, clearAchievement } = useAchievements();
    const { theme } = useTheme();
    const [contextMenu, setContextMenu] = useState(null);
    const [showBoot, setShowBoot] = useState(true);
    const hasShownWelcomeRef = React.useRef(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [windowSwitcherOpen, setWindowSwitcherOpen] = useState(false);
    const [spotlightOpen, setSpotlightOpen] = useState(false);
    const { isPlayerOpen, setPlayerOpen } = useMusicPlayer();
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [konamiSecretOpen, setKonamiSecretOpen] = useState(false);
    const [screenshotToolOpen, setScreenshotToolOpen] = useState(false);
    const [snakeGameOpen, setSnakeGameOpen] = useState(false);
    const [statsOpen, setStatsOpen] = useState(false);
    const [keyboardHelpOpen, setKeyboardHelpOpen] = useState(false);
    const [welcomeTutorialOpen, setWelcomeTutorialOpen] = useState(false);

    // Konami Code detection
    useKonamiCode(() => {
        setKonamiSecretOpen(true);
        unlockAchievement('konamiCode');
    });

    // Desktop shortcuts
    const desktopShortcuts = [
        { 
            id: 'vscode', 
            label: 'Portfolio', 
            icon: <Code size={32} />,
            component: (
                <Suspense fallback={<AppLoadingFallback />}>
                    <ErrorBoundary componentName="VS Code">
                        <VSCodeApp />
                    </ErrorBoundary>
                </Suspense>
            ),
            title: 'VS Code',
        },
        { 
            id: 'file-manager', 
            label: 'Files', 
            icon: <FolderOpen size={32} />,
            component: (
                <Suspense fallback={<AppLoadingFallback />}>
                    <ErrorBoundary componentName="File Manager">
                        <FileManagerApp />
                    </ErrorBoundary>
                </Suspense>
            ),
            title: 'File Manager',
        },
        { 
            id: 'about-me', 
            label: 'About Me', 
            icon: <User size={32} />,
            component: (
                <Suspense fallback={<AppLoadingFallback />}>
                    <ErrorBoundary componentName="About Me">
                        <AboutMeApp />
                    </ErrorBoundary>
                </Suspense>
            ),
            title: 'About Me',
        },
        { 
            id: 'notes', 
            label: 'Notes', 
            icon: <StickyNote size={32} />,
            component: (
                <Suspense fallback={<AppLoadingFallback />}>
                    <ErrorBoundary componentName="Notes">
                        <NotesApp />
                    </ErrorBoundary>
                </Suspense>
            ),
            title: 'Quick Notes',
        },
        { 
            id: 'messenger', 
            label: 'Chat', 
            icon: <MessageSquare size={32} />,
            component: (
                <Suspense fallback={<AppLoadingFallback />}>
                    <ErrorBoundary componentName="Messenger">
                        <MessengerApp />
                    </ErrorBoundary>
                </Suspense>
            ),
            title: 'Messages',
        },
        { 
            id: 'terminal', 
            label: 'Terminal', 
            icon: <Terminal size={32} />,
            component: (
                <Suspense fallback={<AppLoadingFallback />}>
                    <ErrorBoundary componentName="Terminal">
                        <TerminalApp />
                    </ErrorBoundary>
                </Suspense>
            ),
            title: 'Terminal',
        },
    ];

    // Show welcome notification after boot
    useEffect(() => {
        if (!showBoot && !hasShownWelcomeRef.current) {
            hasShownWelcomeRef.current = true;
            
            // Check if tutorial has been completed
            const tutorialCompleted = localStorage.getItem('webos-tutorial-completed');
            const tutorialSkipped = localStorage.getItem('webos-tutorial-skipped');
            
            if (!tutorialCompleted && !tutorialSkipped) {
                // First time user - show tutorial after a brief delay
                setTimeout(() => {
                    setWelcomeTutorialOpen(true);
                }, 1000);
            } else {
                // Returning user - show welcome notification
                setTimeout(() => {
                    showNotification({
                        title: 'Welcome back! 👋',
                        message: 'Press Ctrl+/ for keyboard shortcuts.',
                        type: 'info',
                        duration: 5000,
                    });
                    unlockAchievement('firstBoot');
                }, 500);
            }
        }
    }, [showBoot]);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        'Escape': () => {
            if (spotlightOpen) {
                setSpotlightOpen(false);
            } else if (windowSwitcherOpen) {
                setWindowSwitcherOpen(false);
            } else if (commandPaletteOpen) {
                setCommandPaletteOpen(false);
            } else if (contextMenu) {
                setContextMenu(null);
            } else if (activeWindowId) {
                closeWindow(activeWindowId);
            }
        },
        'Ctrl+Space': () => {
            setSpotlightOpen(true);
        },
        'Ctrl+k': () => {
            setCommandPaletteOpen(true);
        },
        'Alt+Tab': () => {
            setWindowSwitcherOpen(true);
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
        'Ctrl+Shift+s': () => {
            setScreenshotToolOpen(true);
            trackMetric('screenshot');
        },
        'Ctrl+/': () => {
            setKeyboardHelpOpen(true);
        },
        '?': () => {
            setKeyboardHelpOpen(true);
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
            label: 'Take Screenshot',
            icon: <Camera size={16} />,
            onClick: () => setScreenshotToolOpen(true),
            shortcut: 'Ctrl+Shift+S',
        },
        { separator: true },
        {
            label: 'Music Player',
            icon: <Info size={16} />,
            onClick: () => setPlayerOpen(!isPlayerOpen),
        },
        {
            label: 'Calendar',
            icon: <Info size={16} />,
            onClick: () => setCalendarOpen(!calendarOpen),
        },
        {
            label: 'Portfolio Stats',
            icon: <Info size={16} />,
            onClick: () => setStatsOpen(!statsOpen),
        },
        { separator: true },
        {
            label: 'Settings',
            icon: <Settings size={16} />,
            onClick: () => openApp({ id: 'settings', title: 'Settings' }),
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
            className={`h-screen w-screen overflow-hidden bg-gradient-to-br ${theme.colors.bg} bg-cover bg-center text-white relative`}
            onContextMenu={handleContextMenu}
            onClick={() => setContextMenu(null)}
        >
            {/* Overlay for depth */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

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

            {/* Command Palette */}
            <CommandPalette 
                isOpen={commandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
                onOpenSnake={() => setSnakeGameOpen(true)}
            />

            {/* Window Switcher */}
            <WindowSwitcher 
                isOpen={windowSwitcherOpen}
                onClose={() => setWindowSwitcherOpen(false)}
            />

            {/* Spotlight Search */}
            <Spotlight 
                isOpen={spotlightOpen}
                onClose={() => setSpotlightOpen(false)}
            />

            {/* Widgets */}
            <MusicPlayer />
            <Calendar 
                isOpen={calendarOpen}
                onClose={() => setCalendarOpen(false)}
            />
            <PortfolioStats 
                isOpen={statsOpen}
                onClose={() => setStatsOpen(false)}
            />

            {/* Easter Eggs */}
            <KonamiSecret 
                isOpen={konamiSecretOpen}
                onClose={() => setKonamiSecretOpen(false)}
            />

            {/* Tools */}
            {screenshotToolOpen && (
                <ScreenshotTool onClose={() => setScreenshotToolOpen(false)} />
            )}

            {/* Easter Eggs & Games */}
            <SnakeGame 
                isOpen={snakeGameOpen}
                onClose={() => setSnakeGameOpen(false)}
            />

            {/* Keyboard Help */}
            <KeyboardHelp 
                isOpen={keyboardHelpOpen}
                onClose={() => setKeyboardHelpOpen(false)}
            />

            {/* Welcome Tutorial */}
            <WelcomeTutorial 
                isOpen={welcomeTutorialOpen}
                onClose={() => setWelcomeTutorialOpen(false)}
            />

            {/* Achievement Toast */}
            <AchievementToast 
                achievement={currentAchievement}
                isVisible={!!currentAchievement}
                onClose={clearAchievement}
            />

            {/* Taskbar */}
            <Taskbar onOpenSpotlight={() => setSpotlightOpen(true)} />
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
