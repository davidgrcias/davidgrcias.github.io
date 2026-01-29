import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, FileCode, FileJson, FileType, Folder, FolderOpen } from 'lucide-react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const Explorer = ({ onOpenFile, activeFileId, onFilesChange }) => {
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [projects, setProjects] = useState([]);
  const [width, setWidth] = useState(240); // Default width
  const [isResizing, setIsResizing] = useState(false);
  const resizerRef = useRef(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: `${doc.data().title.replace(/\s+/g, '_')}.md`,
          type: 'md',
          data: doc.data()
        }));

        if (list.length > 0) {
          setProjects(list);
        } else {
          // Mock data if empty
          setProjects([
            { id: 'p1', name: 'Portfolio_WebOS.md', type: 'md', data: { title: 'WebOS Portfolio', description: 'This project.' } },
            { id: 'p2', name: 'E-Commerce_App.md', type: 'md', data: { title: 'E-Commerce App', description: 'Shopping app.' } },
          ]);
        }
      } catch (e) {
        // Mock fallback
        setProjects([
          { id: 'p1', name: 'Portfolio_WebOS.md', type: 'md', data: { title: 'WebOS Portfolio', description: 'This project.' } },
          { id: 'p2', name: 'E-Commerce_App.md', type: 'md', data: { title: 'E-Commerce App', description: 'Shopping app.' } },
        ]);
      }
    };
    fetchProjects();
  }, [db]);

  const staticFiles = [
    { id: 'about', name: 'about_me.js', type: 'js' },
    { id: 'contact', name: 'contact.json', type: 'json' },
    { id: 'skills', name: 'skills.xml', type: 'xml' },
  ];

  useEffect(() => {
    if (onFilesChange) {
      onFilesChange([...staticFiles, ...projects]);
    }
  }, [projects, onFilesChange]);

  // Resize handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      // Get the new width based on mouse position
      // Offset by activity bar width (48px)
      const newWidth = e.clientX - 48;
      // Clamp between 150 and 400
      if (newWidth >= 150 && newWidth <= 400) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const getIcon = (name) => {
    if (name.endsWith('.js')) return <FileCode size={16} className="text-yellow-400" />;
    if (name.endsWith('.json')) return <FileJson size={16} className="text-yellow-400" />;
    if (name.endsWith('.md')) return <FileType size={16} className="text-blue-400" />;
    return <FileType size={16} className="text-gray-400" />;
  };

  return (
    <div
      className="bg-[#252526] text-[#CCCCCC] text-sm h-full flex flex-col font-sans select-none relative"
      style={{ width: `${width}px`, minWidth: '150px', maxWidth: '400px' }}
    >
      <div className="text-xs font-bold px-4 py-2 uppercase tracking-wider text-[#BBBBBB]">Explorer</div>

      {/* Workspace Folder */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-1 flex items-center gap-1 hover:bg-[#2a2d2e] cursor-pointer">
          <ChevronDown size={14} />
          <span className="font-bold text-xs uppercase text-blue-400">David's Portfolio</span>
        </div>

        {/* Static Files */}
        <div className="pl-4">
          {staticFiles.map(file => (
            <div
              key={file.id}
              onClick={() => onOpenFile(file)}
              className={`flex items-center gap-2 px-4 py-1 hover:bg-[#37373d] cursor-pointer ${activeFileId === file.id ? 'bg-[#37373d] text-white' : ''}`}
            >
              {getIcon(file.name)}
              <span>{file.name}</span>
            </div>
          ))}
        </div>

        {/* Projects Folder */}
        <div className="pl-4 mt-1">
          <div
            className="flex items-center gap-1 px-2 py-1 hover:bg-[#37373d] cursor-pointer"
            onClick={() => setIsProjectsOpen(!isProjectsOpen)}
          >
            {isProjectsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {isProjectsOpen ? <FolderOpen size={16} className="text-blue-400" /> : <Folder size={16} className="text-blue-400" />}
            <span className={`${isProjectsOpen ? 'font-bold' : ''}`}>projects</span>
          </div>

          {isProjectsOpen && (
            <div className="pl-4 border-l border-[#404040] ml-3 transition-all">
              {projects.map(proj => (
                <div
                  key={proj.id}
                  onClick={() => onOpenFile(proj)}
                  className={`flex items-center gap-2 px-4 py-1 hover:bg-[#37373d] cursor-pointer ${activeFileId === proj.id ? 'bg-[#37373d] text-white' : ''}`}
                >
                  {getIcon(proj.name)}
                  <span className="truncate">{proj.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resize Handle */}
      <div
        ref={resizerRef}
        onMouseDown={handleMouseDown}
        className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#007acc] transition-colors ${isResizing ? 'bg-[#007acc]' : 'bg-transparent'}`}
      />
    </div>
  );
};

export default Explorer;
