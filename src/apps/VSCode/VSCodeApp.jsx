import React, { useState } from 'react';
import ActivityBar from './components/ActivityBar';
import Explorer from './components/Explorer';
import SearchPanel from './components/SearchPanel';
import GitPanel from './components/GitPanel';
import ExtensionsPanel from './components/ExtensionsPanel';
import TabManager from './components/TabManager';
import EditorArea from './components/EditorArea';
import CopilotSidebar from './components/CopilotSidebar';

const VSCodeApp = () => {
  const [activeTab, setActiveTab] = useState('files'); // ActivityBar Tab
    const [openFiles, setOpenFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
    const [allFiles, setAllFiles] = useState([]);

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
    <div className="flex h-full w-full bg-[#1e1e1e] text-white overflow-hidden font-sans">
        {/* Left Side: Activity Bar */}
        <ActivityBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Sidebar Area */}
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
                <EditorArea activeFile={activeFile} />
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-[#007acc] flex items-center px-4 text-xs text-white select-none justify-between">
                <div className="flex gap-4">
                    <span>main*</span>
                    <span>0 errors, 0 warnings</span>
                </div>
                <div className="flex gap-4">
                     <span>Ln 12, Col 34</span>
                     <span>UTF-8</span>
                     <span>JavaScript React</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default VSCodeApp;
