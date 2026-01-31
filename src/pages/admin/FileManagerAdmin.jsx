import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, FolderTree, Save, Folder, File, FileText, Image, Link2, FileCode, X, ChevronRight, ChevronDown } from 'lucide-react';
import { firestoreService } from '../../services/firestore';
import { defaultFileSystem } from '../../data/fileManagerData';

const fileIconOptions = [
  { value: 'text', label: 'Text/Markdown', icon: '📝' },
  { value: 'code', label: 'Code', icon: '💻' },
  { value: 'image', label: 'Image', icon: '🖼️' },
  { value: 'document', label: 'PDF/Document', icon: '📄' },
  { value: 'link', label: 'URL/Link', icon: '🔗' },
];

const FileManager = () => {
  const [fileSystem, setFileSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({ '/': true });
  
  // Edit states
  const [editingItem, setEditingItem] = useState(null);
  const [editingPath, setEditingPath] = useState('');
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [addingToPath, setAddingToPath] = useState('/');

  useEffect(() => {
    fetchFileSystem();
  }, []);

  const fetchFileSystem = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getDocument('fileManager', 'main');

      if (data && data.structure) {
        setFileSystem(data.structure);
      } else {
        setFileSystem(defaultFileSystem.structure);
      }
    } catch (error) {
      console.error("Error fetching file system:", error);
      setFileSystem(defaultFileSystem.structure);
    } finally {
      setLoading(false);
    }
  };

  const saveFileSystem = async (newStructure) => {
    setSaving(true);
    try {
      await firestoreService.setDocument('fileManager', 'main', {
        structure: newStructure,
        updatedAt: new Date().toISOString()
      });
      setFileSystem(newStructure);
    } catch (error) {
      console.error("Error saving file system:", error);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const getItemAtPath = (path) => {
    const parts = path.split('/').filter(Boolean);
    let current = fileSystem['/'];
    
    for (const part of parts) {
      if (current.children && current.children[part]) {
        current = current.children[part];
      } else {
        return null;
      }
    }
    return current;
  };

  const setItemAtPath = (structure, path, item) => {
    const parts = path.split('/').filter(Boolean);
    const newStructure = JSON.parse(JSON.stringify(structure));
    
    if (parts.length === 0) {
      newStructure['/'] = { ...newStructure['/'], ...item };
      return newStructure;
    }

    let current = newStructure['/'];
    for (let i = 0; i < parts.length - 1; i++) {
      current = current.children[parts[i]];
    }
    
    const lastPart = parts[parts.length - 1];
    if (item === null) {
      delete current.children[lastPart];
    } else {
      current.children[lastPart] = item;
    }
    
    return newStructure;
  };

  const handleAddFolder = (parentPath) => {
    setAddingToPath(parentPath);
    setIsAddingFolder(true);
    setEditingItem({
      name: 'New Folder',
      type: 'folder',
      children: {}
    });
  };

  const handleAddFile = (parentPath) => {
    setAddingToPath(parentPath);
    setIsAddingFile(true);
    setEditingItem({
      name: 'new-file.md',
      type: 'file',
      icon: 'text',
      content: '# New File\n\nContent goes here...',
      size: '1 KB'
    });
  };

  const handleEditItem = (path, item, itemName) => {
    setEditingPath(path);
    setEditingItem({ ...item, name: itemName });
  };

  const handleDeleteItem = async (path, itemName) => {
    if (!confirm(`Delete "${itemName}"? This cannot be undone.`)) return;
    
    const fullPath = path === '/' ? `/${itemName}` : `${path}/${itemName}`;
    const newStructure = setItemAtPath(fileSystem, fullPath, null);
    await saveFileSystem(newStructure);
  };

  const handleSaveItem = async () => {
    if (!editingItem.name.trim()) {
      alert('Please enter a name');
      return;
    }

    let newStructure;
    
    if (isAddingFolder || isAddingFile) {
      // Adding new item
      const parent = getItemAtPath(addingToPath);
      if (!parent.children) parent.children = {};
      
      const newItem = { ...editingItem };
      delete newItem.name;
      
      const newChildren = { ...parent.children, [editingItem.name]: newItem };
      newStructure = setItemAtPath(fileSystem, addingToPath, { ...parent, children: newChildren });
    } else {
      // Editing existing item
      const parts = editingPath.split('/').filter(Boolean);
      const oldName = parts.pop();
      const parentPath = '/' + parts.join('/');
      
      const parent = getItemAtPath(parentPath || '/');
      const newItem = { ...editingItem };
      const newName = newItem.name;
      delete newItem.name;
      
      // Remove old, add with new name
      const newChildren = { ...parent.children };
      delete newChildren[oldName];
      newChildren[newName] = newItem;
      
      newStructure = setItemAtPath(fileSystem, parentPath || '/', { ...parent, children: newChildren });
    }
    
    await saveFileSystem(newStructure);
    resetEditState();
  };

  const resetEditState = () => {
    setEditingItem(null);
    setEditingPath('');
    setIsAddingFolder(false);
    setIsAddingFile(false);
    setAddingToPath('/');
  };

  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderFileIcon = (icon) => {
    switch (icon) {
      case 'text': return <FileText size={16} className="text-blue-400" />;
      case 'code': return <FileCode size={16} className="text-yellow-400" />;
      case 'image': return <Image size={16} className="text-green-400" />;
      case 'document': return <File size={16} className="text-red-400" />;
      case 'link': return <Link2 size={16} className="text-purple-400" />;
      default: return <File size={16} className="text-gray-400" />;
    }
  };

  const renderTree = (items, path = '/', depth = 0) => {
    if (!items) return null;

    return Object.entries(items).map(([name, item]) => {
      const currentPath = path === '/' ? `/${name}` : `${path}/${name}`;
      const isExpanded = expandedFolders[currentPath];
      
      if (item.type === 'folder') {
        return (
          <div key={currentPath} className="select-none">
            <div 
              className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-800 rounded-lg group cursor-pointer"
              style={{ paddingLeft: `${depth * 20 + 8}px` }}
            >
              <button onClick={() => toggleFolder(currentPath)} className="p-0.5">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              <Folder size={16} className="text-blue-400" />
              <span className="flex-1 text-sm">{name}</span>
              
              <div className="hidden group-hover:flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleAddFolder(currentPath); }}
                  className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-blue-400"
                  title="Add folder"
                >
                  <Folder size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleAddFile(currentPath); }}
                  className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-green-400"
                  title="Add file"
                >
                  <File size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleEditItem(currentPath, item, name); }}
                  className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-yellow-400"
                  title="Edit"
                >
                  <Edit2 size={12} />
                </button>
                {path !== '/' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteItem(path, name); }}
                    className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
            
            {isExpanded && item.children && (
              <div>{renderTree(item.children, currentPath, depth + 1)}</div>
            )}
          </div>
        );
      } else {
        return (
          <div
            key={currentPath}
            className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-800 rounded-lg group"
            style={{ paddingLeft: `${depth * 20 + 28}px` }}
          >
            {renderFileIcon(item.icon)}
            <span className="flex-1 text-sm text-gray-300">{name}</span>
            <span className="text-xs text-gray-600">{item.size}</span>
            
            <div className="hidden group-hover:flex items-center gap-1">
              <button
                onClick={() => handleEditItem(currentPath, item, name)}
                className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-yellow-400"
                title="Edit"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={() => handleDeleteItem(path, name)}
                className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-red-400"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        );
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  // Edit Modal
  if (editingItem) {
    const isFolder = editingItem.type === 'folder';
    
    return (
      <div className="space-y-6 pb-10 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isAddingFolder ? 'New Folder' : isAddingFile ? 'New File' : `Edit ${isFolder ? 'Folder' : 'File'}`}
            </h1>
            <p className="text-gray-400">
              {isAddingFolder || isAddingFile ? `Adding to: ${addingToPath}` : `Path: ${editingPath}`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={resetEditState}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveItem}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
            <input
              type="text"
              value={editingItem.name}
              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              placeholder={isFolder ? "Folder name" : "filename.md"}
            />
          </div>

          {/* File-specific fields */}
          {!isFolder && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">File Type/Icon</label>
                  <select
                    value={editingItem.icon}
                    onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                  >
                    {fileIconOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Size Display</label>
                  <input
                    type="text"
                    value={editingItem.size || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, size: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                    placeholder="e.g. 5 KB"
                  />
                </div>
              </div>

              {/* Content for text/code files */}
              {(editingItem.icon === 'text' || editingItem.icon === 'code') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                  <textarea
                    value={editingItem.content || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                    rows={12}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white font-mono text-sm resize-none"
                    placeholder="File content..."
                  />
                </div>
              )}

              {/* Image URL */}
              {editingItem.icon === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={editingItem.imageUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                    placeholder="https://..."
                  />
                  {editingItem.imageUrl && (
                    <img src={editingItem.imageUrl} alt="Preview" className="mt-3 max-h-40 rounded-lg" />
                  )}
                </div>
              )}

              {/* Link URL */}
              {editingItem.icon === 'link' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Link URL</label>
                  <input
                    type="url"
                    value={editingItem.url || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                    placeholder="https://..."
                  />
                </div>
              )}

              {/* Download URL for documents */}
              {editingItem.icon === 'document' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Download URL</label>
                  <input
                    type="url"
                    value={editingItem.downloadUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, downloadUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                    placeholder="/path/to/file.pdf or https://..."
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Main View
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderTree size={24} />
            File Manager Structure
          </h1>
          <p className="text-gray-400">Manage folders and files shown in the File Manager app</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleAddFolder('/')}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Folder size={16} />
            Add Root Folder
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
        <p className="text-purple-400 text-sm">
          💡 Hover over folders/files to see action buttons. 
          Click folders to expand/collapse. Changes are saved to Firestore automatically.
        </p>
      </div>

      {/* File Tree */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="flex items-center gap-2 py-2 px-2 border-b border-gray-800 mb-2">
          <Folder size={18} className="text-yellow-400" />
          <span className="font-semibold text-white">Home</span>
          <span className="text-xs text-gray-500 ml-auto">Root folder</span>
        </div>
        
        {fileSystem && fileSystem['/']?.children && (
          <div className="text-gray-300">
            {renderTree(fileSystem['/'].children)}
          </div>
        )}
      </div>

      {/* Saving indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
          <Loader2 size={16} className="animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );
};

export default FileManager;
