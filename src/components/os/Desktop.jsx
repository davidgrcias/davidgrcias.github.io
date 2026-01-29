import React, { useState, useEffect, lazy, Suspense } from 'react';
import { OSProvider, useOS } from '../../contexts/OSContext';
import { NotificationProvider, useNotification } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useKonamiCode } from '../../hooks/useKonamiCode';
import { useAchievements } from '../../hooks/useAchievements';
import { RefreshCw, Settings, Info, Code, Terminal, MessageSquare, FolderOpen, User, StickyNote, Camera, FileText } from 'lucide-react';
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
import PDFViewer from '../tools/PDFViewer';

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
    const { windows, activeWindowId, closeWindow, minimizeWindow, openApp, pinnedApps, togglePinApp, isPinned } = useOS();
    const { showNotification } = useNotification();
    const { unlockAchievement, trackMetric, currentAchievement, clearAchievement } = useAchievements();
    const { theme } = useTheme();
    const [contextMenu, setContextMenu] = useState(null);
    const [shortcutContextMenu, setShortcutContextMenu] = useState(null);
    const [showBoot, setShowBoot] = useState(true);
    const hasShownWelcomeRef = React.useRef(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [windowSwitcherOpen, setWindowSwitcherOpen] = useState(false);
    const [spotlightOpen, setSpotlightOpen] = useState(false);
    const [spotlightQuery, setSpotlightQuery] = useState('');
    const { isPlayerOpen, setPlayerOpen } = useMusicPlayer();
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [konamiSecretOpen, setKonamiSecretOpen] = useState(false);
    const [screenshotToolOpen, setScreenshotToolOpen] = useState(false);
    const [snakeGameOpen, setSnakeGameOpen] = useState(false);
    const [statsOpen, setStatsOpen] = useState(false);
    const [keyboardHelpOpen, setKeyboardHelpOpen] = useState(false);
    const [welcomeTutorialOpen, setWelcomeTutorialOpen] = useState(false);
    const [pdfViewerOpen, setPdfViewerOpen] = useState(false);

    // Icon Positioning State
    const [iconPositions, setIconPositions] = useState(() => {
        const saved = localStorage.getItem('webos-desktop-icons');
        return saved ? JSON.parse(saved) : {};
    });

    const [draggingId, setDraggingId] = useState(null);

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
        // ... (Other shortcuts remain the same, just copied for reference in complete file context if needed, but here we assume strict replacement)
        {
            id: 'file-manager',
            label: 'Files',
            icon: <FolderOpen size={32} />,
            component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="File Manager"><FileManagerApp /></ErrorBoundary></Suspense>,
            title: 'File Manager',
        },
        {
            id: 'about-me',
            label: 'About Me',
            icon: <User size={32} />,
            component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="About Me"><AboutMeApp /></ErrorBoundary></Suspense>,
            title: 'About Me',
        },
        {
            id: 'notes',
            label: 'Notes',
            icon: <StickyNote size={32} />,
            component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Notes"><NotesApp /></ErrorBoundary></Suspense>,
            title: 'Quick Notes',
        },
        {
            id: 'messenger',
            label: 'Chat',
            icon: <MessageSquare size={32} />,
            component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Messenger"><MessengerApp /></ErrorBoundary></Suspense>,
            title: 'Messages',
        },
        {
            id: 'terminal',
            label: 'Terminal',
            icon: <Terminal size={32} />,
            component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Terminal"><TerminalApp /></ErrorBoundary></Suspense>,
            title: 'Terminal',
        },
    ];

    const cvShortcut = {
        id: 'cv-download',
        label: 'My CV',
        icon: <FileText size={32} />,
        onClick: () => setPdfViewerOpen(true),
        title: 'My CV'
    };

    const allShortcuts = [...desktopShortcuts, cvShortcut];

    const settingsApp = {
        id: 'settings',
        title: 'Settings',
        icon: <Settings size={32} />,
        component: (
            <Suspense fallback={<AppLoadingFallback />}>
                <ErrorBoundary componentName="Settings">
                    <SettingsApp />
                </ErrorBoundary>
            </Suspense>
        ),
    };

    // Show welcome flow after boot (mutually exclusive)
    useEffect(() => {
        if (showBoot || hasShownWelcomeRef.current) return;
        hasShownWelcomeRef.current = true;

        const tutorialCompleted = localStorage.getItem('webos-tutorial-completed');
        const tutorialSkipped = localStorage.getItem('webos-tutorial-skipped');
        const hasTutorialFlag = Boolean(tutorialCompleted || tutorialSkipped);

        const timer = setTimeout(() => {
            if (!hasTutorialFlag) {
                setWelcomeTutorialOpen(true);
                return;
            }

            showNotification({
                title: 'Welcome back! 👋',
                message: 'Press Ctrl+/ for keyboard shortcuts.',
                type: 'info',
                duration: 2000, // Quick flash - 2 seconds
            });
        }, 100); // Near instant - 100ms after load

        return () => clearTimeout(timer);
    }, [showBoot, showNotification]);

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
            } else if (shortcutContextMenu) {
                setShortcutContextMenu(null);
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
        'Ctrl+/': () => {
            setKeyboardHelpOpen(true);
        },
        '?': () => {
            setKeyboardHelpOpen(true);
        },
    });

    // Right-click context menu (Desktop Background)
    const handleContextMenu = (e) => {
        e.preventDefault();
        // Close other menus
        setShortcutContextMenu(null);
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    // Shortcut Context Menu Handler
    const handleShortcutContextMenu = (e, shortcut) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu(null); // Close background menu
        setShortcutContextMenu({
            x: e.clientX,
            y: e.clientY,
            shortcut
        });
    };

    // Drag Handler
    const handleDragEnd = (id, info) => {
        setDraggingId(null);
        const newPositions = {
            ...iconPositions,
            [id]: {
                x: (iconPositions[id]?.x || 0) + info.offset.x,
                y: (iconPositions[id]?.y || 0) + info.offset.y
            }
        };

        // Snap to grid logic (simple 100x100 grid for tidiness)
        // newPositions[id].x = Math.round(newPositions[id].x / 100) * 100;
        // newPositions[id].y = Math.round(newPositions[id].y / 100) * 100;

        setIconPositions(newPositions);
        localStorage.setItem('webos-desktop-icons', JSON.stringify(newPositions));
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
            onClick: () => openApp(settingsApp),
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
            onClick={() => {
                setContextMenu(null);
                setShortcutContextMenu(null);
            }}
        >
            {/* Overlay for depth */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

            {/* Desktop Icons Area */}
            <div className="relative z-10 w-full h-full">
                {allShortcuts.map((shortcut, index) => {
                    // Calculate initial grid position if no saved position exists
                    // Grid: 6 columns, spacing 110px x 110px, starting at 24px, 24px
                    const savedPos = iconPositions[shortcut.id];
                    const defaultX = 24 + (index % 6) * 110;
                    const defaultY = 24 + Math.floor(index / 6) * 110;

                    const x = savedPos ? savedPos.x : defaultX;
                    const y = savedPos ? savedPos.y : defaultY;

                    return (
                        <DesktopIcon
                            key={shortcut.id}
                            icon={shortcut.icon}
                            label={shortcut.label}
                            onClick={() => shortcut.onClick ? shortcut.onClick() : openApp(shortcut)}
                            onContextMenu={(e) => handleShortcutContextMenu(e, shortcut)}
                            onDragEnd={(e, info) => handleDragEnd(shortcut.id, info)}
                            isDragging={draggingId === shortcut.id}
                            style={{ left: x, top: y }}
                        />
                    );
                })}
            </div>

            {/* Windows Layer */}
            {windows.map((window) => (
                <WindowFrame key={window.id} window={window} />
            ))}

            {/* Desktop Background Context Menu */}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    options={contextMenuOptions}
                    onClose={() => setContextMenu(null)}
                />
            )}

            {/* Shortcut Context Menu */}
            {shortcutContextMenu && (
                <div
                    className="fixed bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 min-w-[180px] z-[10005]"
                    style={{
                        left: Math.min(shortcutContextMenu.x, window.innerWidth - 180),
                        top: Math.min(shortcutContextMenu.y, window.innerHeight - 150),
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <div className="px-4 py-2 border-b border-white/10 mb-1">
                        <span className="text-xs text-white/50 font-semibold uppercase tracking-wider">{shortcutContextMenu.shortcut.label}</span>
                    </div>

                    <button
                        onClick={() => {
                            shortcutContextMenu.shortcut.onClick ? shortcutContextMenu.shortcut.onClick() : openApp(shortcutContextMenu.shortcut);
                            setShortcutContextMenu(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                        <FolderOpen size={16} />
                        Open
                    </button>

                    {/* Only show Pin option if it's an app (has id that's not special like 'cv-download') */}
                    {!['cv-download'].includes(shortcutContextMenu.shortcut.id) && (
                        <button
                            onClick={() => {
                                togglePinApp(shortcutContextMenu.shortcut.id);
                                setShortcutContextMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                            {isPinned(shortcutContextMenu.shortcut.id) ? (
                                <>
                                    <span className="text-red-400 flex items-center gap-2">
                                        <div className="rotate-45">📌</div> Unpin from Taskbar
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span>📌</span> Pin to Taskbar
                                </>
                            )}
                        </button>
                    )}
                </div>
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
                onClose={() => {
                    setSpotlightOpen(false);
                    setSpotlightQuery('');
                }}
                initialQuery={spotlightQuery}
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
                onClose={(reason) => {
                    setWelcomeTutorialOpen(false);
                    unlockAchievement('firstBoot');
                    if (!reason) {
                        localStorage.setItem('webos-tutorial-skipped', 'true');
                    }
                }}
            />

            {/* Achievement Toast */}
            <AchievementToast
                achievement={currentAchievement}
                isVisible={!!currentAchievement}
                onClose={clearAchievement}
            />

            {/* Taskbar */}
            <Taskbar onOpenSpotlight={(query) => {
                setSpotlightOpen(true);
                setSpotlightQuery(query || '');
            }} />

            {/* PDF Viewer */}
            <PDFViewer
                isOpen={pdfViewerOpen}
                onClose={() => setPdfViewerOpen(false)}
                pdfUrl="/CV_DavidGarciaSaragih.pdf"
                title="CV - David Garcia Saragih"
            />
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
