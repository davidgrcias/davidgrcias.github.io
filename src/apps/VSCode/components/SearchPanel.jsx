import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

const SearchPanel = ({ files = [], onOpenFile }) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return files;
    return files.filter((file) => file.name.toLowerCase().includes(term));
  }, [files, query]);

  return (
    <div className="w-full bg-[#252526] text-[#CCCCCC] text-sm h-full flex flex-col font-sans select-none border-r border-[#1e1e1e]">
      <div className="text-xs font-bold px-4 py-2 uppercase tracking-wider text-[#BBBBBB]">Search</div>
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 px-2 py-1.5 bg-[#1f1f1f] border border-[#3c3c3c] rounded">
          <Search size={14} className="text-[#9aa0a6]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files"
            className="bg-transparent text-[#CCCCCC] text-xs w-full outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {results.length === 0 ? (
          <div className="px-4 py-2 text-xs text-[#8a8a8a]">No results</div>
        ) : (
          results.map((file) => (
            <button
              key={file.id}
              onClick={() => onOpenFile(file)}
              className="w-full text-left px-4 py-1.5 hover:bg-[#37373d] text-xs text-[#CCCCCC]"
            >
              {file.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchPanel;
