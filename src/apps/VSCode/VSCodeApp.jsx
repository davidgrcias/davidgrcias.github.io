import React, { useState } from 'react';
import ActivityBar from './components/ActivityBar';
import Explorer from './components/Explorer';
import TabManager from './components/TabManager';
import EditorArea from './components/EditorArea';

const VSCodeApp = () => {
  const [activeTab, setActiveTabTab] = useState('files'); // ActivityBar Tab
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);

  const handleOpenFile = (file) => {
      if (!openFiles.find(f => f.id === file.id)) {
          setOpenFiles([...openFiles, file]);
      }
      setActiveFileId(file.id);
  };

  const handCloseTab = (fileId) => {
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

  const activeFile = openFiles.find(f => f.id === activeFileId);

  return (
    <div className="flex h-full w-full bg-[#1e1e1e] text-white overflow-hidden font-sans">
        {/* Left Side: Activity Bar */}
        <ActivityBar activeTab={activeTab} setActiveTab={setActiveTabTab} />

        {/* Sidebar (Explorer) */}
        {activeTab === 'files' && (
            <Explorer onOpenFile={handleOpenFile} activeFileId={activeFileId} />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
            {/* Tabs */}
            <TabManager 
                openFiles={openFiles} 
                activeFileId={activeFileId} 
                onTabClick={(f) => setActiveFileId(f.id)}
                onCloseTab={handCloseTab}
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
