import React from 'react';
import { X, FileCode, FileJson, FileType } from 'lucide-react';

const TabManager = ({ openFiles, activeFileId, onTabClick, onCloseTab }) => {
  const getIcon = (name) => {
      if (name.endsWith('.js')) return <FileCode size={14} className="text-yellow-400" />;
      if (name.endsWith('.json')) return <FileJson size={14} className="text-yellow-400" />;
      if (name.endsWith('.md')) return <FileType size={14} className="text-blue-400" />;
      return <FileType size={14} className="text-gray-400" />;
  };

  return (
    <div className="flex bg-[#252526] h-9 border-b border-[#1e1e1e] overflow-x-auto custom-scrollbar">
      {openFiles.map((file) => (
        <div
          key={file.id}
          onClick={() => onTabClick(file)}
          className={`group flex items-center gap-2 px-3 min-w-[120px] max-w-[200px] border-r border-[#1e1e1e] cursor-pointer select-none text-xs ${
            activeFileId === file.id ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#2a2d2e]'
          }`}
        >
          {getIcon(file.name)}
          <span className="truncate flex-1">{file.name}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onCloseTab(file.id); }}
            className={`p-0.5 rounded-md hover:bg-gray-700 opacity-0 group-hover:opacity-100 ${activeFileId === file.id ? 'opacity-100' : ''}`}
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default TabManager;
