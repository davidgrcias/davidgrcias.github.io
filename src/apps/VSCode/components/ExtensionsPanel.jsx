import React from 'react';
import { Puzzle } from 'lucide-react';

const ExtensionsPanel = () => {
  const extensions = [
    { name: 'ESLint', publisher: 'Microsoft' },
    { name: 'Prettier', publisher: 'Prettier' },
    { name: 'Material Icon Theme', publisher: 'Philipp Kief' },
  ];

  return (
    <div className="w-60 bg-[#252526] text-[#CCCCCC] text-sm h-full flex flex-col font-sans select-none border-r border-[#1e1e1e]">
      <div className="text-xs font-bold px-4 py-2 uppercase tracking-wider text-[#BBBBBB]">Extensions</div>
      <div className="flex-1 overflow-y-auto">
        {extensions.map((ext) => (
          <div key={ext.name} className="flex items-center gap-3 px-4 py-2 hover:bg-[#37373d]">
            <div className="w-8 h-8 rounded bg-[#1f1f1f] border border-[#3c3c3c] flex items-center justify-center">
              <Puzzle size={16} className="text-[#9aa0a6]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[#E6E6E6] truncate">{ext.name}</div>
              <div className="text-[10px] text-[#8a8a8a] truncate">{ext.publisher}</div>
            </div>
            <button className="text-[10px] px-2 py-1 rounded bg-[#3c3c3c] hover:bg-[#4b4b4b] text-[#CCCCCC]">
              Disable
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtensionsPanel;
