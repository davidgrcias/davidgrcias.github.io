import React from 'react';
import { X, FileCode, FileJson, FileType, Circle } from 'lucide-react';

const TabManager = ({ openFiles, activeFileId, onTabClick, onCloseTab }) => {
  const getIcon = (name) => {
    if (name?.endsWith('.js') || name?.endsWith('.jsx'))
      return <FileCode size={14} className="text-yellow-400 shrink-0" />;
    if (name?.endsWith('.json'))
      return <FileJson size={14} className="text-yellow-400 shrink-0" />;
    if (name?.endsWith('.md'))
      return <FileType size={14} className="text-blue-400 shrink-0" />;
    return <FileType size={14} className="text-gray-400 shrink-0" />;
  };

  if (openFiles.length === 0) {
    return <div className="h-9 bg-[#252526] border-b border-[#1e1e1e]" />;
  }

  return (
    <div className="flex bg-[#252526] h-9 border-b border-[#1e1e1e] overflow-x-auto custom-scrollbar">
      {openFiles.map((file) => {
        const isActive = activeFileId === file.id;

        return (
          <div
            key={file.id}
            onClick={() => onTabClick(file)}
            className={`group flex items-center h-full px-3 min-w-[100px] max-w-[180px] cursor-pointer select-none text-xs relative ${isActive
                ? 'bg-[#1e1e1e] text-white'
                : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#333333]'
              }`}
          >
            {/* Active tab indicator - top border */}
            {isActive && (
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#007acc]" />
            )}

            {/* Separator */}
            {!isActive && (
              <div className="absolute right-0 top-2 bottom-2 w-px bg-[#3c3c3c]" />
            )}

            {/* File icon */}
            {getIcon(file.name)}

            {/* File name */}
            <span className="truncate flex-1 ml-2">{file.name}</span>

            {/* Close button / Modified indicator */}
            <button
              onClick={(e) => { e.stopPropagation(); onCloseTab(file.id); }}
              className={`ml-2 p-0.5 rounded hover:bg-[#505050] shrink-0 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default TabManager;
