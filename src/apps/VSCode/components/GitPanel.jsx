import React from 'react';
import { GitBranch, FilePlus2, FileMinus2 } from 'lucide-react';

const GitPanel = () => {
  const staged = ['src/App.jsx', 'src/components/WindowFrame.jsx'];
  const unstaged = ['src/apps/VSCode/VSCodeApp.jsx', 'src/components/widgets/MusicPlayer.jsx'];

  return (
    <div className="w-full bg-[#252526] text-[#CCCCCC] text-sm h-full flex flex-col font-sans select-none border-r border-[#1e1e1e]">
      <div className="text-xs font-bold px-4 py-2 uppercase tracking-wider text-[#BBBBBB]">Source Control</div>
      <div className="px-4 py-2 text-xs flex items-center gap-2 text-[#9aa0a6]">
        <GitBranch size={14} />
        <span>main</span>
      </div>

      <div className="px-4 py-2 text-xs text-[#9aa0a6] flex items-center gap-2">
        <FilePlus2 size={14} className="text-green-400" />
        <span>Staged ({staged.length})</span>
      </div>
      <div className="pl-6 pb-2">
        {staged.map((file) => (
          <div key={file} className="text-xs text-[#CCCCCC] py-1">
            {file}
          </div>
        ))}
      </div>

      <div className="px-4 py-2 text-xs text-[#9aa0a6] flex items-center gap-2">
        <FileMinus2 size={14} className="text-yellow-400" />
        <span>Changes ({unstaged.length})</span>
      </div>
      <div className="pl-6 pb-2">
        {unstaged.map((file) => (
          <div key={file} className="text-xs text-[#CCCCCC] py-1">
            {file}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GitPanel;
