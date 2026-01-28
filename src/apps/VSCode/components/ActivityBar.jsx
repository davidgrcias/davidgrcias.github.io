import React from 'react';
import { Files, Search, GitGraph, Box, Settings, Bot } from 'lucide-react';

const ActivityBar = ({ activeTab, setActiveTab }) => {
  const icons = [
    { id: 'files', icon: <Files size={24} />, label: 'Explorer' },
    { id: 'search', icon: <Search size={24} />, label: 'Search' },
    { id: 'git', icon: <GitGraph size={24} />, label: 'Source Control' },
    { id: 'extensions', icon: <Box size={24} />, label: 'Extensions' },
  ];

  return (
    <div className="w-12 bg-[#333333] flex flex-col items-center py-2 justify-between h-full border-r border-[#1e1e1e]">
      <div className="flex flex-col gap-4 w-full">
        {icons.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex justify-center py-2 relative group hover:text-white transition-colors ${
              activeTab === item.id ? 'text-white border-l-2 border-white' : 'text-[#858585] border-l-2 border-transparent'
            }`}
            title={item.label}
          >
            {item.icon}
          </button>
        ))}
      </div>
      <div className="pb-2">
         <button className="text-[#858585] hover:text-white p-2">
            <Settings size={24} />
         </button>
      </div>
    </div>
  );
};

export default ActivityBar;
