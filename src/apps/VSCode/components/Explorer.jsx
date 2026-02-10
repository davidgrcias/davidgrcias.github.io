import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, FileCode, FileJson, FileType, Folder, FolderOpen } from 'lucide-react';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getProjects } from '../../../data/projects';

const Explorer = ({ onOpenFile, activeFileId, onFilesChange }) => {
  const [loading, setLoading] = useState(true);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [projects, setProjects] = useState([]);
  const [staticFiles, setStaticFiles] = useState([]);
  const db = getFirestore();

  // Fetch static files from Firestore
  useEffect(() => {
    const fetchStaticFiles = async () => {
      try {
        const docRef = doc(db, 'vscodeFiles', 'main');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().staticFiles) {
          setStaticFiles(docSnap.data().staticFiles);
        } else {
          // Default fallback
          setStaticFiles([
            { id: 'about', name: 'about_me.js', type: 'js', content: '// About Me\nconst developer = {\n  name: "David Garcia",\n  role: "Full Stack Developer"\n};' },
            { id: 'contact', name: 'contact.json', type: 'json', content: '{\n  "email": "contact@example.com"\n}' },
            { id: 'skills', name: 'skills.xml', type: 'xml', content: '<skills>\n  <skill>JavaScript</skill>\n  <skill>React</skill>\n</skills>' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching VS Code files:', error);
        // Default fallback on error
        setStaticFiles([
          { id: 'about', name: 'about_me.js', type: 'js', content: '// About Me\nconst developer = {\n  name: "David Garcia",\n  role: "Full Stack Developer"\n};' },
          { id: 'contact', name: 'contact.json', type: 'json', content: '{\n  "email": "contact@example.com"\n}' },
          { id: 'skills', name: 'skills.xml', type: 'xml', content: '<skills>\n  <skill>JavaScript</skill>\n  <skill>React</skill>\n</skills>' },
        ]);
      }
    };
    fetchStaticFiles();
  }, [db]);

  // Fetch projects from centralized data source

  // Fetch projects from centralized data source
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectData = await getProjects();

        const list = projectData.map((project, index) => ({
          id: project.id || `proj-${index}`,
          name: `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.md`,
          type: 'md',
          data: {
            ...project,
            title: project.name // Ensure title maps correctly for EditorArea
          }
        }));

        if (list.length > 0) {
          setProjects(list);
        }
      } catch (e) {
        console.error("Failed to load projects in VS Code app:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    if (onFilesChange && staticFiles.length > 0) {
      onFilesChange([...staticFiles, ...projects]);
    }
  }, [projects, staticFiles, onFilesChange]);

  const getIcon = (name) => {
    if (name.endsWith('.js')) return <FileCode size={16} className="text-yellow-400" />;
    if (name.endsWith('.json')) return <FileJson size={16} className="text-yellow-400" />;
    if (name.endsWith('.md')) return <FileType size={16} className="text-blue-400" />;
    return <FileType size={16} className="text-gray-400" />;
  };

  return (
    <div
      className="bg-[#252526] text-[#CCCCCC] text-sm h-full flex flex-col font-sans select-none relative w-full"
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
              {loading ? (
                // Skeleton Loading
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-1 animate-pulse">
                    <div className="w-4 h-4 bg-[#37373d] rounded opacity-50"></div>
                    <div className="h-4 bg-[#37373d] rounded w-24 opacity-50"></div>
                  </div>
                ))
              ) : (
                projects.map(proj => (
                  <div
                    key={proj.id}
                    onClick={() => onOpenFile(proj)}
                    className={`flex items-center gap-2 px-4 py-1 hover:bg-[#37373d] cursor-pointer ${activeFileId === proj.id ? 'bg-[#37373d] text-white' : ''}`}
                  >
                    {getIcon(proj.name)}
                    <span className="truncate">{proj.name}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explorer;
