import React, { useState, useEffect, lazy, Suspense } from 'react';
import { OSProvider, useOS } from '../../contexts/OSContext';
import { NotificationProvider, useNotification } from '../../contexts/NotificationContext';
import { VoiceProvider } from '../../contexts/VoiceContext';
import VoiceAssistant from './VoiceAssistant';
import { useTheme } from '../../contexts/ThemeContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useKonamiCode } from '../../hooks/useKonamiCode';
import { useAchievements } from '../../hooks/useAchievements';
import { RefreshCw, Settings, Info, Code, Terminal, MessageSquare, FolderOpen, User, StickyNote, Camera, FileText, BookOpen } from 'lucide-react';
import Taskbar from './Taskbar';
import WindowFrame from './WindowFrame';
import ContextMenu from './ContextMenu';
import BootSequence from './BootSequence';
import LockScreen from './LockScreen';
import Wallpaper from './Wallpaper';
import PowerTransition from './PowerTransition';
import DesktopIcon from './DesktopIcon';
import { useWindowSize } from '../../hooks/useWindowSize';
import CommandPalette from './CommandPalette';
import WindowSwitcher from './WindowSwitcher';
import Spotlight from './Spotlight';
import ErrorBoundary from '../ErrorBoundary';
import MusicPlayer from '../widgets/MusicPlayer';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import { useSound } from '../../contexts/SoundContext';
import Calendar from '../widgets/Calendar';
import PortfolioStats from '../widgets/PortfolioStats';
import StatusCardWidget from '../widgets/StatusCardWidget';
import SystemMonitorWidget from '../widgets/SystemMonitorWidget';
import FeaturedPostWidget from '../widgets/FeaturedPostWidget';
import KonamiSecret from '../easter-eggs/KonamiSecret';
import ScreenshotTool from '../tools/ScreenshotTool';
import SnakeGame from '../easter-eggs/SnakeGame';
import KeyboardHelp from './KeyboardHelp';
import WelcomeTutorial from './WelcomeTutorial';
import AchievementToast from '../achievements/AchievementToast';
import PDFViewer from '../tools/PDFViewer';
import { getUserProfile } from '../../data/userProfile';

// Lazy load apps for better performance
const VSCodeApp = lazy(() => import('../../apps/VSCode/VSCodeApp'));
const TerminalApp = lazy(() => import('../../apps/Terminal/TerminalApp'));
const MessengerApp = lazy(() => import('../../apps/Messenger/MessengerApp'));
const FileManagerApp = lazy(() => import('../../apps/FileManager/FileManagerApp'));
const SettingsApp = lazy(() => import('../../apps/Settings/SettingsApp'));
const AboutMeApp = lazy(() => import('../../apps/AboutMe/AboutMeApp'));
const NotesApp = lazy(() => import('../../apps/Notes/NotesApp'));
const BlogApp = lazy(() => import('../../apps/Blog/BlogApp'));

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
    const { windows, activeWindowId, closeWindow, minimizeWindow, openApp, pinnedApps, togglePinApp, isPinned, powerState, setPowerState, wake } = useOS();
    const { showNotification } = useNotification();
    const { unlockAchievement, trackMetric, currentAchievement, clearAchievement } = useAchievements();
    const { theme } = useTheme();
    const { playUnlock, playOpen, playClose } = useSound();
    const [contextMenu, setContextMenu] = useState(null);
    const [shortcutContextMenu, setShortcutContextMenu] = useState(null);
    const [windowContextMenu, setWindowContextMenu] = useState(null);
    // Removed local boot/lock states
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
    const [cvUrl, setCvUrl] = useState('/CV_DavidGarciaSaragih.pdf');
    const [preloadedPdfUrl, setPreloadedPdfUrl] = useState(null);

    // Desktop widgets state
    const [showWidgets, setShowWidgets] = useState(() => {
        const saved = localStorage.getItem('webos-show-widgets');
        return saved !== 'false'; // Default true
    });

    // Helper function to generate FASTEST embed URL
    const generateEmbedUrl = (url) => {
        if (!url) return null;

        // Extract Google Drive file ID
        const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        const fileId = match1?.[1] || match2?.[1];

        if (fileId) {
            // FASTEST: Direct Google Drive preview (instant load!)
            return `https://drive.google.com/file/d/${fileId}/preview`;
        }

        return `${url}#toolbar=0&navpanes=0&scrollbar=1`;
    };

    // Load CV URL from profile and PRELOAD it immediately
    useEffect(() => {
        getUserProfile('en').then(profile => {
            if (profile.cvUrl) {
                setCvUrl(profile.cvUrl);
                // Generate and set preloaded URL
                const embedUrl = generateEmbedUrl(profile.cvUrl);
                setPreloadedPdfUrl(embedUrl);

                // Preload the PDF in a hidden iframe for instant loading
                const preloadIframe = document.createElement('iframe');
                preloadIframe.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;';
                preloadIframe.src = embedUrl;
                document.body.appendChild(preloadIframe);

                // Remove preload iframe after loading (keep browser cache)
                preloadIframe.onload = () => {
                    setTimeout(() => {
                        preloadIframe.remove();
                    }, 2000);
                };
            }
        }).catch(console.error);
    }, []);

    // Grid configuration constants - CENTERED with equal margins
    const { width, height } = useWindowSize();
    const GRID_SIZE = 120; // pixels per cell (bigger for more visible icons)
    const TASKBAR_HEIGHT = 48;
    const MIN_MARGIN = 24; // minimum margin on all sides

    // Reserve space for widgets if they are visible (approx 320px + margins)
    const WIDGET_SIDEBAR_WIDTH = (showWidgets && powerState === 'active' && width > 768) ? 320 : 0;

    // Calculate how many cells fit with equal margins
    const availableWidth = width - (MIN_MARGIN * 2) - WIDGET_SIDEBAR_WIDTH;
    const availableHeight = height - TASKBAR_HEIGHT - (MIN_MARGIN * 2);
    const GRID_COLS = Math.max(1, Math.floor(availableWidth / GRID_SIZE));
    const GRID_ROWS = Math.max(1, Math.floor(availableHeight / GRID_SIZE));

    // Calculate actual margins to center the grid perfectly in the available space
    const GRID_WIDTH = GRID_COLS * GRID_SIZE;
    const GRID_HEIGHT = GRID_ROWS * GRID_SIZE;

    // Center logic: (AvailableSpace - GridWidth) / 2
    // We treat the "AvailableSpace" as the full width minus the widget sidebar.
    // So the grid centers in the "empty" area on the left.
    const MARGIN_X = Math.floor((width - WIDGET_SIDEBAR_WIDTH - GRID_WIDTH) / 2);
    const MARGIN_Y = Math.floor((height - TASKBAR_HEIGHT - GRID_HEIGHT) / 2);

    // Icon Grid Positions State (stored as {row, col} indices)
    // Validates saved positions and removes invalid ones
    const [iconGridPositions, setIconGridPositions] = useState(() => {
        const saved = localStorage.getItem('webos-desktop-grid');
        // Default layout if no saved data matches user request
        const defaultLayout = {
            'vscode': { row: 0, col: 0 },      // Portfolio
            'messenger': { row: 0, col: 1 },   // Chat
            'terminal': { row: 0, col: 2 },    // Terminal
            'about-me': { row: 1, col: 0 },    // About Me
            'cv-download': { row: 1, col: 1 }, // My CV
            'blog': { row: 1, col: 2 },        // Blog
            'file-manager': { row: 2, col: 0 },// Files
            'notes': { row: 3, col: 0 },       // Notes
        };

        if (!saved) return defaultLayout;

        try {
            const parsed = JSON.parse(saved);
            // Validate each position - must have valid row/col within bounds
            const validated = {};
            for (const [id, pos] of Object.entries(parsed)) {
                if (
                    pos &&
                    typeof pos.row === 'number' &&
                    typeof pos.col === 'number' &&
                    pos.row >= 0 &&
                    pos.col >= 0
                ) {
                    validated[id] = pos;
                }
            }
            // Merge defaults if validation results in empty object (fallback)
            return Object.keys(validated).length > 0 ? validated : defaultLayout;
        } catch {
            // Invalid JSON, clear it
            localStorage.removeItem('webos-desktop-grid');
            return defaultLayout;
        }
    });

    // Counter to force DesktopIcon re-mount after drag (resets framer-motion transform)
    const [dragKeyCounter, setDragKeyCounter] = useState(0);

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
        {
            id: 'blog',
            label: 'Blog',
            icon: <BookOpen size={32} />,
            component: <Suspense fallback={<AppLoadingFallback />}><ErrorBoundary componentName="Blog"><BlogApp /></ErrorBoundary></Suspense>,
            title: 'Blog',
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
        if (powerState === 'booting' || hasShownWelcomeRef.current) return;
        hasShownWelcomeRef.current = true;

        const hasSeenWelcome = localStorage.getItem('webos-has-seen-welcome');

        const timer = setTimeout(() => {
            if (!hasSeenWelcome) {
                setWelcomeTutorialOpen(true);
                return;
            }

            // Only show welcome back notification ONCE per session
            // Only show welcome back notification ONCE per session
            // DISABLED temporarily as per user request
            /*
            const hasShownWelcomeSession = sessionStorage.getItem('webos-welcome-shown');
            if (!hasShownWelcomeSession) {
                showNotification({
                    title: 'Welcome back! 👋',
                    message: 'Press Ctrl+/ for keyboard shortcuts.',
                    type: 'info',
                    duration: 3000,
                });
                sessionStorage.setItem('webos-welcome-shown', 'true');
            }
            */
        }, 800); // Slight delay for smoother entrance

        return () => clearTimeout(timer);
    }, [powerState, showNotification]);

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
            } else if (windowContextMenu) {
                setWindowContextMenu(null);
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

    // Voice Control Event Listeners
    useEffect(() => {
        const handleVoiceOpenApp = (event) => {
            const { appId } = event.detail;

            // Find the app from desktopShortcuts or settingsApp
            let targetApp = desktopShortcuts.find(app => app.id === appId);
            if (!targetApp && appId === 'settings') {
                targetApp = settingsApp;
            }

            if (targetApp) {
                openApp(targetApp);
            }
        };

        const handleVoiceSpotlight = (event) => {
            const query = event.detail;
            setSpotlightQuery(query);
            setSpotlightOpen(true);
        };

        window.addEventListener('VOICE_OPEN_APP', handleVoiceOpenApp);
        window.addEventListener('VOICE_OPEN_SPOTLIGHT', handleVoiceSpotlight);

        return () => {
            window.removeEventListener('VOICE_OPEN_APP', handleVoiceOpenApp);
            window.removeEventListener('VOICE_OPEN_SPOTLIGHT', handleVoiceSpotlight);
        };
    }, [desktopShortcuts, settingsApp, openApp]);

    // Right-click context menu (Desktop Background)
    const handleContextMenu = (e) => {
        // Check if click target is inside a window
        const clickedElement = e.target;
        const isInsideWindow = clickedElement.closest && clickedElement.closest('[data-window-id]');

        // If click is inside a window, don't show desktop menu
        // (WindowFrame already handles its own context menu and stops propagation)
        if (isInsideWindow) {
            return;
        }

        e.preventDefault();
        // Close other menus
        setShortcutContextMenu(null);
        setWindowContextMenu(null);
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    // Handler untuk window context menu
    const handleWindowContextMenu = (windowId, x, y, options) => {
        // Close other menus
        setContextMenu(null);
        setShortcutContextMenu(null);
        setWindowContextMenu({ windowId, x, y, options });
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

    // Helper: Get all occupied grid cells
    const getOccupiedCells = (currentId) => {
        const occupied = new Set();
        allShortcuts.forEach((shortcut, index) => {
            if (shortcut.id === currentId) return; // Skip current dragging icon

            const gridPos = iconGridPositions[shortcut.id];
            if (gridPos) {
                occupied.add(`${gridPos.row},${gridPos.col}`);
            } else {
                // Default position based on index
                const defaultRow = Math.floor(index / GRID_COLS);
                const defaultCol = index % GRID_COLS;
                occupied.add(`${defaultRow},${defaultCol}`);
            }
        });
        return occupied;
    };

    // Helper: Find nearest free cell if target is occupied
    const findNearestFreeCell = (targetRow, targetCol, occupied) => {
        // First check if target is free
        if (!occupied.has(`${targetRow},${targetCol}`)) {
            return { row: targetRow, col: targetCol };
        }

        // Spiral search for nearest free cell
        for (let radius = 1; radius <= 20; radius++) {
            for (let dr = -radius; dr <= radius; dr++) {
                for (let dc = -radius; dc <= radius; dc++) {
                    if (Math.abs(dr) !== radius && Math.abs(dc) !== radius) continue;
                    const newRow = targetRow + dr;
                    const newCol = targetCol + dc;
                    if (newRow >= 0 && newCol >= 0 && newCol < GRID_COLS) {
                        if (!occupied.has(`${newRow},${newCol}`)) {
                            return { row: newRow, col: newCol };
                        }
                    }
                }
            }
        }
        // Fallback: return target anyway
        return { row: targetRow, col: targetCol };
    };

    // Drag Handler with Grid Snapping and Collision Detection
    const handleDragEnd = (id, info, currentIndex) => {
        setDraggingId(null);

        // Use mouse position to determine target cell
        // info.point is the absolute position of the pointer
        const mouseX = info.point.x;
        const mouseY = info.point.y;

        // Convert mouse position to grid indices
        const targetCol = Math.floor((mouseX - MARGIN_X) / GRID_SIZE);
        const targetRow = Math.floor((mouseY - MARGIN_Y) / GRID_SIZE);

        // Clamp to valid range
        const clampedRow = Math.max(0, Math.min(GRID_ROWS - 1, targetRow));
        const clampedCol = Math.max(0, Math.min(GRID_COLS - 1, targetCol));

        // Check for collision and find free cell
        const occupied = getOccupiedCells(id);
        const finalPos = findNearestFreeCell(clampedRow, clampedCol, occupied);

        console.log('DRAG:', { id, mouseX, mouseY, targetRow, targetCol, clampedRow, clampedCol, finalPos });

        // Update state
        const newGridPositions = {
            ...iconGridPositions,
            [id]: finalPos
        };

        setIconGridPositions(newGridPositions);
        localStorage.setItem('webos-desktop-grid', JSON.stringify(newGridPositions));

        // Increment dragKey to force DesktopIcon re-mount
        setDragKeyCounter(prev => prev + 1);
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
        if (hasBooted && powerState === 'booting') {
            setPowerState('active');
        }
    }, [powerState, setPowerState]);

    // Boot Sequence Logic
    if (powerState === 'off') {
        return <div className="h-screen w-screen bg-black" />;
    }

    if (powerState === 'restarting' || powerState === 'shutting_down') {
        return <PowerTransition type={powerState} />;
    }

    if (powerState === 'booting') {
        return <BootSequence onComplete={() => {
            sessionStorage.setItem('webos-booted', 'true');
            setPowerState('active');
        }} />;
    }

    return (
        <Wallpaper
            onContextMenu={handleContextMenu}
            onClick={() => {
                setContextMenu(null);
                setShortcutContextMenu(null);
                setWindowContextMenu(null);
                setCommandPaletteOpen(false);
                setWindowSwitcherOpen(false);
                setSpotlightOpen(false);
                setCalendarOpen(false);
                setPlayerOpen(false);
                setStatsOpen(false);
                setKeyboardHelpOpen(false);
                // Close other widgets if needed
            }}
        >
            {/* Overlay for depth */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

            {/* Desktop Icons Area */}
            <div className="relative z-10 w-full h-full">
                {allShortcuts.map((shortcut, index) => {
                    // Get grid position from state or use default based on index
                    const gridPos = iconGridPositions[shortcut.id] || {
                        row: Math.floor(index / GRID_COLS),
                        col: index % GRID_COLS
                    };

                    // CLAMP position to ensure it fits within current grid (responsiveness)
                    // This prevents icons from overlapping with the widget area or going off-screen
                    const validCol = Math.min(gridPos.col, GRID_COLS - 1);
                    const validRow = Math.min(gridPos.row, GRID_ROWS - 1);

                    // Convert grid position to pixel coordinates (using centered margins)
                    const x = MARGIN_X + validCol * GRID_SIZE;
                    const y = MARGIN_Y + validRow * GRID_SIZE;

                    return (
                        <DesktopIcon
                            key={`${shortcut.id}-${dragKeyCounter}`}
                            dragKey={`${shortcut.id}-${dragKeyCounter}`}
                            gridSize={GRID_SIZE}
                            icon={shortcut.icon}
                            label={shortcut.label}
                            onClick={() => shortcut.onClick ? shortcut.onClick() : openApp(shortcut)}
                            onContextMenu={(e) => handleShortcutContextMenu(e, shortcut)}
                            onDragEnd={(e, info) => handleDragEnd(shortcut.id, info, index)}
                            isDragging={draggingId === shortcut.id}
                            style={{ left: x, top: y }}
                        />
                    );
                })}
            </div>

            {/* Windows Layer */}
            {windows.map((window) => (
                <WindowFrame
                    key={window.id}
                    window={window}
                    onWindowContextMenu={handleWindowContextMenu}
                />
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

            {/* Window Context Menu */}
            {windowContextMenu && (
                <ContextMenu
                    x={windowContextMenu.x}
                    y={windowContextMenu.y}
                    options={windowContextMenu.options}
                    onClose={() => setWindowContextMenu(null)}
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
            <VoiceAssistant />
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
                    // Force save just in case
                    localStorage.setItem('webos-has-seen-welcome', 'true');
                }}
            />

            {/* Achievement Toast */}
            <AchievementToast
                achievement={currentAchievement}
                isVisible={!!currentAchievement}
                onClose={clearAchievement}
            />

            {/* Taskbar */}
            <Taskbar
                shortcuts={desktopShortcuts}
                onOpenSpotlight={(query) => {
                    setSpotlightOpen(true);
                    setSpotlightQuery(query || '');
                }}
            />

            {/* PDF Viewer - with preloaded URL for instant loading */}
            <PDFViewer
                isOpen={pdfViewerOpen}
                onClose={() => setPdfViewerOpen(false)}
                pdfUrl={cvUrl}
                title="CV - David Garcia Saragih"
                preloadedUrl={preloadedPdfUrl}
            />

            {/* Desktop Widgets - Status Card, System Monitor & Featured Post */}
            {showWidgets && powerState === 'active' && (
                <div className="absolute right-4 sm:right-6 top-4 sm:top-6 z-0 flex flex-col gap-4 pointer-events-auto">
                    <StatusCardWidget className="w-56 sm:w-64 md:w-72" />
                    <FeaturedPostWidget
                        className="w-56 sm:w-64 md:w-72"
                        onOpenBlog={() => {
                            // Find the blog shortcut and open it
                            const blogShortcut = desktopShortcuts.find(s => s.id === 'blog');
                            if (blogShortcut) {
                                openApp({
                                    id: blogShortcut.id,
                                    title: blogShortcut.title,
                                    icon: blogShortcut.icon,
                                    component: blogShortcut.component
                                });
                            }
                        }}
                    />
                    <SystemMonitorWidget className="w-56 sm:w-64 md:w-72" />
                </div>
            )}

            {/* Lock Screen - Show only when locked */}
            {powerState === 'locked' && (
                <LockScreen
                    onUnlock={() => {
                        playUnlock();
                        wake();
                    }}
                />
            )}
        </Wallpaper>
    );
};

const Desktop = () => {
    return (
        <OSProvider>
            <NotificationProvider>
                <VoiceProvider>
                    <DesktopContent />
                </VoiceProvider>
            </NotificationProvider>
        </OSProvider>
    );
};

export default Desktop;
