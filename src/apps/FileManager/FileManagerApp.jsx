import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Folder, File, FileText, Image, Code, Download, ExternalLink, ChevronRight, Home, ArrowLeft, Search, Grid3x3, List, Loader2 } from 'lucide-react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

/**
 * File Manager App
 * Browse portfolio content as a file system - Data synced with Firestore
 */

// Default file system structure (used as fallback)
const defaultFileSystem = {
  '/': {
    name: 'Home',
    type: 'folder',
    children: {
      'About': {
        type: 'folder',
        children: {
          'Bio.md': { type: 'file', icon: 'text', content: '# David Gracias\n\nFull-stack developer passionate about creating innovative web experiences...', size: '2 KB' },
          'Resume.pdf': { type: 'file', icon: 'document', size: '145 KB', downloadUrl: '#' },
          'Skills.json': { type: 'file', icon: 'code', size: '3 KB' },
        }
      },
      'Projects': {
        type: 'folder',
        children: {
          'E-Commerce-Platform': {
            type: 'folder',
            children: {
              'README.md': { type: 'file', icon: 'text', size: '5 KB' },
              'demo.png': { type: 'file', icon: 'image', size: '890 KB' },
              'live-link.url': { type: 'file', icon: 'link', size: '1 KB' },
            }
          },
          'AI-Chatbot': {
            type: 'folder',
            children: {
              'README.md': { type: 'file', icon: 'text', size: '4 KB' },
              'screenshot.png': { type: 'file', icon: 'image', size: '1.2 MB' },
            }
          },
          'Portfolio-WebOS': {
            type: 'folder',
            children: {
              'README.md': { type: 'file', icon: 'text', size: '3 KB' },
              'architecture.png': { type: 'file', icon: 'image', size: '650 KB' },
            }
          },
        }
      },
      'Experience': {
        type: 'folder',
        children: {
          'Work-History.md': { type: 'file', icon: 'text', size: '8 KB' },
          'Certifications': {
            type: 'folder',
            children: {
              'AWS-Certified.pdf': { type: 'file', icon: 'document', size: '200 KB' },
              'React-Advanced.pdf': { type: 'file', icon: 'document', size: '180 KB' },
            }
          },
        }
      },
      'Contact': {
        type: 'folder',
        children: {
          'Email.txt': { type: 'file', icon: 'text', content: 'david@example.com', size: '1 KB' },
          'LinkedIn.url': { type: 'file', icon: 'link', size: '1 KB' },
          'GitHub.url': { type: 'file', icon: 'link', size: '1 KB' },
        }
      },
    }
  }
};

const FileManagerApp = () => {
  const [fileSystem, setFileSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState('/');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const db = getFirestore();

  // Fetch file system from Firestore
  useEffect(() => {
    const fetchFileSystem = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'fileManager', 'main');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().structure) {
          setFileSystem(docSnap.data().structure);
        } else {
          setFileSystem(defaultFileSystem);
        }
      } catch (error) {
        console.error('Error fetching file system:', error);
        setFileSystem(defaultFileSystem);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFileSystem();
  }, [db]);

  // Navigate to path
  const navigateTo = (path) => {
    setCurrentPath(path);
    setSelectedFile(null);
  };

  // Get current folder content
  const getCurrentFolder = () => {
    const parts = currentPath.split('/').filter(Boolean);
    let current = fileSystem['/'];
    
    for (const part of parts) {
      if (current.children && current.children[part]) {
        current = current.children[part];
      }
    }
    
    return current.children || {};
  };

  // Get breadcrumbs
  const getBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', path: '/' }];
    
    let path = '';
    for (const part of parts) {
      path += '/' + part;
      breadcrumbs.push({ name: part, path });
    }
    
    return breadcrumbs;
  };

  // Get file icon
  const getFileIcon = (item, name) => {
    if (item.type === 'folder') return <Folder className="text-blue-400" size={20} />;
    
    switch (item.icon) {
      case 'text': return <FileText className="text-gray-300" size={20} />;
      case 'code': return <Code className="text-green-400" size={20} />;
      case 'image': return <Image className="text-purple-400" size={20} />;
      case 'document': return <File className="text-red-400" size={20} />;
      case 'link': return <ExternalLink className="text-cyan-400" size={20} />;
      default: return <File className="text-gray-400" size={20} />;
    }
  };

  // Handle item click
  const handleItemClick = (name, item) => {
    if (item.type === 'folder') {
      navigateTo(currentPath === '/' ? '/' + name : currentPath + '/' + name);
    } else {
      setSelectedFile({ name, ...item });
    }
  };

  // Go back
  const goBack = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    navigateTo(parts.length ? '/' + parts.join('/') : '/');
  };

  const currentFolder = loading ? {} : getCurrentFolder();
  const breadcrumbs = getBreadcrumbs();

  // Filter items by search
  const filteredItems = Object.entries(currentFolder).filter(([name]) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-full flex flex-col bg-slate-950 text-white items-center justify-center">
        <Loader2 size={48} className="animate-spin text-cyan-400 mb-4" />
        <p className="text-white/60">Loading file system...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white">
      {/* Toolbar */}
      <div className="h-12 bg-slate-900/50 border-b border-white/10 flex items-center px-4 gap-3">
        {/* Navigation */}
        <button
          onClick={goBack}
          disabled={currentPath === '/'}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Back"
        >
          <ArrowLeft size={18} />
        </button>
        
        <button
          onClick={() => navigateTo('/')}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          title="Home"
        >
          <Home size={18} />
        </button>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && <ChevronRight size={14} className="text-white/30" />}
              <button
                onClick={() => navigateTo(crumb.path)}
                className="text-sm hover:text-cyan-400 transition-colors truncate"
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-48">
          <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* View Mode */}
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white/10' : 'hover:bg-white/5'}`}
            title="Grid View"
          >
            <Grid3x3 size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white/10' : 'hover:bg-white/5'}`}
            title="List View"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4">
        {filteredItems.length === 0 ? (
          <div className="text-center text-white/40 mt-20">
            <Folder size={48} className="mx-auto mb-4 opacity-50" />
            <p>No items found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map(([name, item]) => (
              <motion.button
                key={name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleItemClick(name, item)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className="w-16 h-16 flex items-center justify-center">
                  {getFileIcon(item, name)}
                </div>
                <span className="text-xs text-center group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {name}
                </span>
                {item.size && (
                  <span className="text-[10px] text-white/40">{item.size}</span>
                )}
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredItems.map(([name, item]) => (
              <motion.button
                key={name}
                whileHover={{ x: 4 }}
                onClick={() => handleItemClick(name, item)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all group"
              >
                {getFileIcon(item, name)}
                <span className="flex-1 text-left text-sm group-hover:text-cyan-400 transition-colors">
                  {name}
                </span>
                {item.size && (
                  <span className="text-xs text-white/40">{item.size}</span>
                )}
                {item.type === 'folder' && (
                  <ChevronRight size={16} className="text-white/30" />
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* File Preview Panel */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-48 bg-slate-900/80 border-t border-white/10 p-4 overflow-auto"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-cyan-400">{selectedFile.name}</h3>
              <p className="text-xs text-white/50">{selectedFile.size}</p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-white/10 rounded"
            >
              ×
            </button>
          </div>
          {selectedFile.content && (
            <pre className="text-xs text-white/70 whitespace-pre-wrap font-mono">
              {selectedFile.content}
            </pre>
          )}
          {selectedFile.downloadUrl && (
            <button className="mt-3 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-sm flex items-center gap-2 transition-colors">
              <Download size={16} />
              Download
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default FileManagerApp;
