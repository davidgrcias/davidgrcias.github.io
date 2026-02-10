import React, { useRef, useEffect, useCallback } from 'react';
import { useOS } from '../../contexts/OSContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSound } from '../../contexts/SoundContext';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { Trash2, XCircle, RotateCw, Terminal as TerminalIcon } from 'lucide-react';

// Import terminal hooks
import { useTerminal } from './hooks/useTerminal';
import { useCommandHistory } from './hooks/useCommandHistory';
import { useTabCompletion } from './hooks/useTabCompletion';
import { useTerminalKeyboard } from './hooks/useTerminalKeyboard';

// Import terminal components
import { TerminalPrompt } from './components/TerminalPrompt';
import { TerminalInput } from './components/TerminalInput';
import { TerminalOutput } from './components/TerminalOutput';

// Import terminal themes
import { getTheme } from './terminalThemes';

const TerminalApp = ({ id }) => {
    const osContext = useOS();
    const themeContext = useTheme();
    const soundContext = useSound();
    const musicContext = useMusicPlayer();
    const notificationContext = useNotification();
    const translationContext = useTranslation();

    const { updateWindow, closeWindow } = osContext;

    const inputRef = useRef(null);

    // Create context getter for command execution
    const getContext = useCallback(() => ({
        os: osContext,
        theme: themeContext,
        sound: soundContext,
        music: musicContext,
        notification: notificationContext,
        translation: translationContext,
    }), [osContext, themeContext, soundContext, musicContext, notificationContext, translationContext]);

    // Initialize terminal with all hooks
    const {
        output,
        currentDirectory,
        environment,
        executeCommand,
        clearOutput,
        navigateHistory,
        registry,
        fs,
    } = useTerminal(getContext);

    const { addCommand, history: cmdHistory } = useCommandHistory();

    const { handleTab, clearSuggestions } = useTabCompletion(
        registry,
        fs,
        currentDirectory
    );

    // Handle command execution
    const handleExecute = useCallback((command) => {
        if (!command.trim()) return;

        // Add to history
        addCommand(command);

        // Execute command
        executeCommand(command);

        // Clear suggestions
        clearSuggestions();

        // Play sound
        soundContext?.playSound?.('click');
    }, [addCommand, executeCommand, clearSuggestions, soundContext]);

    // Handle keyboard shortcuts
    useTerminalKeyboard({
        onExecute: handleExecute,
        onClear: clearOutput,
        onNavigateHistory: navigateHistory,
        onTabComplete: handleTab,
        onInterrupt: () => {
            soundContext?.playSound?.('error');
            // Could implement command interruption here
        },
        inputRef,
    });

    // Get terminal theme based on OS theme
    const terminalTheme = getTheme(themeContext?.theme || 'dark');

    // Context Menu
    useEffect(() => {
        if (id) {
            updateWindow(id, {
                contextMenuOptions: [
                    {
                        label: 'Clear Terminal',
                        icon: <Trash2 size={16} />,
                        onClick: clearOutput,
                        shortcut: 'Ctrl+L',
                    },
                    { separator: true },
                    {
                        label: 'Command History',
                        icon: <TerminalIcon size={16} />,
                        onClick: () => {
                            executeCommand('history');
                        },
                    },
                    {
                        label: 'Show Help',
                        icon: <TerminalIcon size={16} />,
                        onClick: () => {
                            executeCommand('help');
                        },
                    },
                    { separator: true },
                    {
                        label: 'Restart Session',
                        icon: <RotateCw size={16} />,
                        onClick: () => {
                            clearOutput();
                            executeCommand('welcome');
                        },
                    },
                    { separator: true },
                    {
                        label: 'Close Terminal',
                        icon: <XCircle size={16} />,
                        onClick: () => closeWindow(id),
                        shortcut: 'Ctrl+W',
                    }
                ]
            });
        }
    }, [id, updateWindow, closeWindow, clearOutput, executeCommand]);

    // Handle External Actions
    useEffect(() => {
        const handleAction = (e) => {
            const { appId, action, payload } = e.detail;
            if (appId !== 'terminal') return;

            if (action === 'clear') {
                clearOutput();
            } else if (action === 'run-command' && payload?.command) {
                executeCommand(payload.command);
            }
        };

        window.addEventListener('WEBOS_APP_ACTION', handleAction);
        return () => window.removeEventListener('WEBOS_APP_ACTION', handleAction);
    }, [clearOutput, executeCommand]);

    return (
        <div
            className="h-full w-full flex flex-col overflow-hidden font-mono"
            style={{
                backgroundColor: terminalTheme.background,
                color: terminalTheme.text,
            }}
            onClick={() => inputRef.current?.focus()}
        >
            {/* Terminal Output */}
            <TerminalOutput 
                lines={output} 
                theme={terminalTheme}
                autoScroll={true}
            />

            {/* Terminal Input Line */}
            <div className="flex items-center gap-2 px-4 pb-3 pt-1">
                <TerminalPrompt
                    user={environment.USER}
                    hostname={environment.HOSTNAME}
                    currentDirectory={currentDirectory}
                    theme={{
                        user: terminalTheme.user,
                        hostname: terminalTheme.hostname,
                        directory: terminalTheme.directory,
                        symbol: terminalTheme.prompt,
                    }}
                />
                <TerminalInput
                    ref={inputRef}
                    onSubmit={handleExecute}
                    theme={{
                        text: terminalTheme.text,
                        background: 'transparent',
                        caret: terminalTheme.success,
                    }}
                    autoFocus={true}
                />
            </div>
        </div>
    );
};

export default TerminalApp;
