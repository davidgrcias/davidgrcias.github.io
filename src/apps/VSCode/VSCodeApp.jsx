import React, { useState, useEffect } from 'react';
import ActivityBar from './components/ActivityBar';
import Explorer from './components/Explorer';
import SearchPanel from './components/SearchPanel';
import GitPanel from './components/GitPanel';
import ExtensionsPanel from './components/ExtensionsPanel';
import TabManager from './components/TabManager';
import EditorArea from './components/EditorArea';
import CopilotSidebar from './components/CopilotSidebar';
import { useOS } from '../../contexts/OSContext';
import { Save, Clipboard, Scissors, ClipboardCopy, Terminal as TerminalIcon } from 'lucide-react';

const VSCodeApp = ({ id }) => {
    const { updateWindow, activeWindowId } = useOS();
    const [activeTab, setActiveTab] = useState('files'); // ActivityBar Tab
    const [openFiles, setOpenFiles] = useState([]);
    const [activeFileId, setActiveFileId] = useState(null);
    const [allFiles, setAllFiles] = useState([]);

    // Update window context menu when component mounts or dependencies change
    useEffect(() => {
        if (id) {
            updateWindow(id, {
                contextMenuOptions: [
                    {
                        label: 'Save File',
                        icon: <Save size={16} />,
                        onClick: () => {
                            // Mock save functionality
                            if (activeFileId) {
                                // In a real app we'd save to file system
                                console.log('Saving file...');
                                // Maybe add a toast notification here later
                            }
                        },
                        shortcut: 'Ctrl+S',
                    },
                    { separator: true },
                    {
                        label: 'Command Palette',
                        icon: <TerminalIcon size={16} />,
                        onClick: () => {
                            // Trigger command palette logic if available
                            alert('Command Palette opened');
                        },
                        shortcut: 'Ctrl+Shift+P',
                    },
                    { separator: true },
                    {
                        label: 'Cut',
                        icon: <Scissors size={16} />,
                        onClick: () => document.execCommand('cut'),
                        shortcut: 'Ctrl+X',
                    },
                    {
                        label: 'Copy',
                        icon: <ClipboardCopy size={16} />,
                        onClick: () => document.execCommand('copy'),
                        shortcut: 'Ctrl+C',
                    },
                    {
                        label: 'Paste',
                        icon: <Clipboard size={16} />,
                        onClick: () => navigator.clipboard.readText().then(text => document.execCommand('insertText', false, text)),
                        shortcut: 'Ctrl+V',
                    }
                ]
            });
        }
    }, [id, activeFileId, updateWindow]);

    // Handle External Actions
    useEffect(() => {
        const handleAction = (e) => {
            const { appId, action, payload } = e.detail;
            if (appId !== 'vscode') return;

            if (action === 'open-file' && payload) {
                // Check if file is already open
                setOpenFiles(prev => {
                    if (prev.find(f => f.id === payload.id)) return prev;
                    return [...prev, payload];
                });
                setActiveFileId(payload.id);
            }
        };

        window.addEventListener('WEBOS_APP_ACTION', handleAction);
        return () => window.removeEventListener('WEBOS_APP_ACTION', handleAction);
    }, []);

    // Handle file content changes
    const handleFileContentChange = (fileId, newContent) => {
        setOpenFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, content: newContent, isUnsaved: true } : f
        ));
    };



    // Sidebar Resizing
    const [sidebarWidth, setSidebarWidth] = useState(250);
    const [isResizing, setIsResizing] = useState(false);
    const appRef = React.useRef(null);

    const startResizing = React.useCallback(() => {
        setIsResizing(true);
    }, []);

    const stopResizing = React.useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = React.useCallback((mouseMoveEvent) => {
        if (isResizing && appRef.current) {
            const appRect = appRef.current.getBoundingClientRect();
            // Calculate width relative to the app container's left edge
            // Subtracting 48px for the Activity Bar width
            const newWidth = mouseMoveEvent.clientX - appRect.left - 48;

            if (newWidth > 150 && newWidth < 600) {
                setSidebarWidth(newWidth);
            }
        }
    }, [isResizing]);

    React.useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    const handleOpenFile = (file) => {
        if (!openFiles.find(f => f.id === file.id)) {
            setOpenFiles([...openFiles, file]);
        }
        setActiveFileId(file.id);
    };

    const handleCloseTab = (fileId) => {
        const newFiles = openFiles.filter(f => f.id !== fileId);
        setOpenFiles(newFiles);

        if (activeFileId === fileId) {
            if (newFiles.length > 0) {
                setActiveFileId(newFiles[newFiles.length - 1].id);
            } else {
                setActiveFileId(null);
            }
        }
    };

    // Reorder tabs (drag and drop)
    const handleReorderTabs = (fromIndex, toIndex) => {
        if (fromIndex === toIndex) return;
        const updated = [...openFiles];
        const [moved] = updated.splice(fromIndex, 1);
        const insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
        const clampedIndex = Math.max(0, Math.min(updated.length, insertIndex));
        updated.splice(clampedIndex, 0, moved);
        setOpenFiles(updated);
    };

    const activeFile = openFiles.find(f => f.id === activeFileId);

    return (
        <div ref={appRef} className="flex h-full w-full bg-[#1e1e1e] text-white overflow-hidden font-sans">
            {/* Left Side: Activity Bar */}
            <ActivityBar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Sidebar Area */}
            {activeTab && (
                <div
                    className="flex h-full relative"
                    style={{ width: sidebarWidth }}
                >
                    {activeTab === 'files' && (
                        <Explorer
                            onOpenFile={handleOpenFile}
                            activeFileId={activeFileId}
                            onFilesChange={setAllFiles}
                        />
                    )}
                    {activeTab === 'search' && (
                        <SearchPanel files={allFiles} onOpenFile={handleOpenFile} />
                    )}
                    {activeTab === 'git' && (
                        <GitPanel />
                    )}
                    {activeTab === 'extensions' && (
                        <ExtensionsPanel />
                    )}

                    {/* Resize Handle */}
                    <div
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-500 z-10"
                        onMouseDown={startResizing}
                    />
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
                {/* Tabs */}
                <TabManager
                    openFiles={openFiles}
                    activeFileId={activeFileId}
                    onTabClick={(f) => setActiveFileId(f.id)}
                    onCloseTab={handleCloseTab}
                    onReorderTabs={handleReorderTabs}
                />

                {/* Editor */}
                <div className="flex-1 overflow-hidden relative">
                    <EditorArea
                        activeFile={activeFile}
                        onContentChange={handleFileContentChange}
                    />
                </div>

                {/* Status Bar - Simple */}
                <div className="h-6 bg-[#007acc] flex items-center px-4 text-xs text-white select-none justify-between">
                    <div className="flex gap-4">
                        <span>main*</span>
                        <span>0 errors, 0 warnings</span>
                    </div>
                    <div className="flex gap-4">
                        <span>Ln {activeFile ? '1' : '-'}, Col {activeFile ? '1' : '-'}</span>
                        <span>UTF-8</span>
                        <span>
                            {activeFile?.name?.endsWith('.js') || activeFile?.name?.endsWith('.jsx')
                                ? 'JavaScript React'
                                : activeFile?.name?.endsWith('.json')
                                    ? 'JSON'
                                    : activeFile?.name?.endsWith('.md')
                                        ? 'Markdown'
                                        : 'Plain Text'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VSCodeApp;
