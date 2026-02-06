import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Save, X, Search, StickyNote, Clock, Lightbulb, Sparkles, Lock } from 'lucide-react';
import { useOS } from '../../contexts/OSContext';
import { firestoreService } from '../../services/firestore';

/**
 * NotesApp - Simple sticky notes app for quick thoughts
 * Features: Create, edit, delete notes with local storage persistence
 * + Sync: Displays Fun Facts and Insights from Admin Panel as read-only notes
 */
const NotesApp = ({ id }) => {
  const { updateWindow } = useOS();
  const [notes, setNotes] = useState([]); // Local notes
  const [syncedNotes, setSyncedNotes] = useState([]); // Remote notes (Fun Facts/Insights)
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Context Menu
  useEffect(() => {
    if (id) {
      updateWindow(id, {
        contextMenuOptions: [
          {
            label: 'New Note',
            icon: <Plus size={16} />,
            onClick: () => createNote(),
            shortcut: 'Ctrl+N',
          },
          { separator: true },
          {
            label: 'Clear All Local Notes',
            icon: <Trash2 size={16} />,
            onClick: () => {
              if (confirm('Delete all local notes? Synced content will remain.')) setNotes([]);
            },
          }
        ]
      });
    }
  }, [id, updateWindow]);

  // Handle External Actions
  useEffect(() => {
    const handleAction = (e) => {
      const { appId, action } = e.detail;
      if (appId !== 'notes') return;

      if (action === 'new-note') {
        createNote();
      } else if (action === 'clear-all') {
        if (confirm('Delete all local notes?')) setNotes([]);
      }
    };

    window.addEventListener('WEBOS_APP_ACTION', handleAction);
    return () => window.removeEventListener('WEBOS_APP_ACTION', handleAction);
  }, []);

  // Load local notes
  useEffect(() => {
    const savedNotes = localStorage.getItem('portfolio-notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (error) {
        setNotes([]);
      }
    }
  }, []);

  // Save local notes
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('portfolio-notes', JSON.stringify(notes));
    }
  }, [notes]);

  // Fetch Synced Content (Fun Facts & Insights)
  useEffect(() => {
    const fetchSyncedContent = async () => {
      try {
        const [facts, insights] = await Promise.all([
          firestoreService.getCollection('funFacts'),
          firestoreService.getCollection('insights')
        ]);

        const convertDate = (val) => {
          if (!val) return new Date().toISOString();
          // Handle Firestore Timestamp
          if (val && typeof val.toDate === 'function') {
            return val.toDate().toISOString();
          }
          // Handle string or date object
          return new Date(val).toISOString();
        };

        const factNotes = (facts || []).map(f => ({
          id: `fact-${f.id}`,
          content: `${f.title}\n\n${f.text}`,
          createdAt: convertDate(f.createdAt),
          updatedAt: convertDate(f.updatedAt),
          isSynced: true,
          type: 'fun-fact',
          icon: <Lightbulb size={16} />
        }));

        const insightNotes = (insights || []).map(i => ({
          id: `insight-${i.id}`,
          content: `${i.title}\n\n${i.text}`,
          createdAt: convertDate(i.createdAt),
          updatedAt: convertDate(i.updatedAt),
          isSynced: true,
          type: 'insight',
          icon: <Sparkles size={16} />
        }));

        setSyncedNotes([...factNotes, ...insightNotes]);
      } catch (error) {
        console.error("Failed to sync admin content:", error);
      }
    };

    fetchSyncedContent();
  }, []);

  // Combine and Sort Notes
  const allNotes = [...notes, ...syncedNotes].sort((a, b) => 
    new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
  );

  const filteredNotes = allNotes.filter(note =>
    (note.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Actions
  const createNote = () => {
    const newNote = {
      id: Date.now(),
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setEditingId(newNote.id);
    setEditContent('');
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditContent('');
    }
  };

  const startEditing = (note) => {
    if (note.isSynced) return;
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = (id) => {
    setNotes(notes.map(note =>
      note.id === id
        ? { ...note, content: editContent, updatedAt: new Date().toISOString() }
        : note
    ));
    setEditingId(null);
    setEditContent('');
  };

  const cancelEdit = () => {
    const note = notes.find(n => n.id === editingId);
    if (note && !note.content) {
      deleteNote(editingId);
    }
    setEditingId(null);
    setEditContent('');
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch (e) {
      return '';
    }
  };

  const getNoteStyle = (note, index) => {
    if (note.type === 'fun-fact') {
      return 'from-blue-500/20 to-blue-700/20 border-blue-500/40 ring-1 ring-blue-500/20';
    }
    if (note.type === 'insight') {
      return 'from-purple-500/20 to-purple-700/20 border-purple-500/40 ring-1 ring-purple-500/20';
    }
    // Local note colors
    const colors = [
      'from-yellow-400/20 to-yellow-600/20 border-yellow-500/30',
      'from-pink-400/20 to-pink-600/20 border-pink-500/30',
      'from-emerald-400/20 to-emerald-600/20 border-emerald-500/30',
      'from-orange-400/20 to-orange-600/20 border-orange-500/30',
      'from-cyan-400/20 to-cyan-600/20 border-cyan-500/30',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-600/20 rounded-xl">
                <StickyNote className="text-yellow-400" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Quick Notes</h1>
                <p className="text-zinc-400 text-sm">
                  {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                </p>
              </div>
            </div>
            <button
              onClick={createNote}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-yellow-600/30"
            >
              <Plus size={20} />
              New Note
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-600/50"
            />
          </div>
        </motion.div>

        {/* Empty State */}
        {filteredNotes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-zinc-400 mb-6">
              {searchQuery ? 'Try a different search term' : 'Create your first note to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={createNote}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors"
              >
                Create Note
              </button>
            )}
          </motion.div>
        )}

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note, index) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={() => !editingId && startEditing(note)}
                className={`
                  bg-gradient-to-br ${getNoteStyle(note, index)}
                  border rounded-xl p-4 shadow-lg relative group cursor-default
                  ${editingId === note.id ? 'ring-2 ring-yellow-500' : ''}
                  ${!note.isSynced && !editingId ? 'hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer' : ''}
                `}
              >
                {/* Note Content */}
                {editingId === note.id ? (
                  <div className="space-y-3" onClick={e => e.stopPropagation()}>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Type your note here..."
                      autoFocus
                      className="w-full h-40 bg-zinc-900/50 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-600/50 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(note.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
                      >
                        <Save size={16} />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 min-h-[120px]">
                      {/* Synced Badge */}
                      {note.isSynced && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                          {note.icon}
                          <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                            {note.type === 'fun-fact' ? 'Fun Fact' : 'Insight'}
                          </span>
                        </div>
                      )}

                      {note.content ? (
                        <p className="text-white whitespace-pre-wrap break-words">
                          {note.content}
                        </p>
                      ) : (
                        <p className="text-zinc-500 italic">Empty note</p>
                      )}
                    </div>

                    {/* Note Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Clock size={12} />
                        <span>{formatDate(note.updatedAt)}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {!note.isSynced && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); startEditing(note); }}
                              className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                              title="Edit note"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                              className="p-1.5 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete note"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NotesApp;
