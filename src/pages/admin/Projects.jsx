import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ExternalLink, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { firestoreService } from '../../services/firestore';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getCollection('projects', { orderBy: 'order' });
      
      if (data && data.length > 0) {
        setProjects(data);
      } else {
        // Load from static data as fallback
        const { default: staticProjects } = await import('../../data/projects');
        setProjects(staticProjects.map((p, i) => ({ ...p, id: `static-${i}`, isStatic: true })));
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      // Fallback to static
      try {
        const { default: staticProjects } = await import('../../data/projects');
        setProjects(staticProjects.map((p, i) => ({ ...p, id: `static-${i}`, isStatic: true })));
      } catch (e) {
        setProjects([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (project) => {
    if (project.isStatic) {
      alert("Static data cannot be deleted. Migrate to Firestore first.");
      return;
    }
    
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    
    setDeleting(project.id);
    try {
      await firestoreService.deleteDocument('projects', project.id);
      setProjects(prev => prev.filter(p => p.id !== project.id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete project. Check console.");
    } finally {
      setDeleting(null);
    }
  };

  const togglePublished = async (project) => {
    if (project.isStatic) return;
    
    try {
      const newStatus = project.isPublished === false ? true : false;
      await firestoreService.updateDocument('projects', project.id, { isPublished: newStatus });
      setProjects(prev => prev.map(p => 
        p.id === project.id ? { ...p, isPublished: newStatus } : p
      ));
    } catch (error) {
      console.error("Toggle failed:", error);
    }
  };

  const filteredProjects = projects.filter(p => {
    const search = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(search) ||
      p.role?.toLowerCase().includes(search) ||
      p.tech?.some(t => t.toLowerCase().includes(search)) ||
      p.tiers?.some(t => t.toLowerCase().includes(search))
    );
  });

  const getTierColor = (tier) => {
    const colors = {
      'Advanced': 'bg-purple-500/20 text-purple-400',
      'Intermediate': 'bg-blue-500/20 text-blue-400',
      'Beginner': 'bg-green-500/20 text-green-400',
      'Real-World': 'bg-orange-500/20 text-orange-400',
      'Capstone': 'bg-pink-500/20 text-pink-400',
      'Experimental': 'bg-cyan-500/20 text-cyan-400'
    };
    return colors[tier] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-400">Manage your portfolio showcase ({projects.length} total)</p>
        </div>
        <Link 
          to="/admin/projects/new"
          className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
        >
          <Plus size={20} />
          New Project
        </Link>
      </div>

      {/* Search */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, role, tech, or tier..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 outline-none focus:border-blue-500 text-white placeholder-gray-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Static Data Warning */}
      {projects.some(p => p.isStatic) && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-400 text-sm">
          ⚠️ Showing static data. Add projects via admin to store in Firestore.
        </div>
      )}

      {/* Projects List */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-medium text-white mb-2">
            {searchTerm ? 'No matches found' : 'No projects yet'}
          </h3>
          <p className="text-gray-400 mb-4">
            {searchTerm ? 'Try a different search term' : 'Create your first project to get started'}
          </p>
          {!searchTerm && (
            <Link 
              to="/admin/projects/new"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
            >
              <Plus size={18} /> Add Project
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => (
            <div 
              key={project.id} 
              className={`bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-all overflow-hidden ${
                project.isPublished === false ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-stretch">
                {/* Drag Handle (visual only for now) */}
                <div className="hidden sm:flex items-center px-3 bg-gray-800/50 text-gray-600 cursor-grab">
                  <GripVertical size={20} />
                </div>

                {/* Icon/Image */}
                <div className="w-16 sm:w-20 flex-shrink-0 bg-gray-800 flex items-center justify-center text-3xl">
                  {project.image ? (
                    <img src={project.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    project.icon || '📁'
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white truncate">{project.name}</h3>
                      <p className="text-sm text-gray-400 truncate">{project.role}</p>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium ${
                      project.isPublished === false 
                        ? 'bg-yellow-500/20 text-yellow-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {project.isPublished === false ? 'Draft' : 'Published'}
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {project.date && (
                      <span className="text-xs text-gray-500">
                        {new Date(project.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    {project.tiers?.slice(0, 2).map((tier, i) => (
                      <span key={i} className={`px-2 py-0.5 rounded text-xs ${getTierColor(tier)}`}>
                        {tier}
                      </span>
                    ))}
                    {project.tech?.slice(0, 3).map((t, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">
                        {t}
                      </span>
                    ))}
                    {project.tech?.length > 3 && (
                      <span className="text-xs text-gray-500">+{project.tech.length - 3}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 px-3 border-l border-gray-800">
                  {!project.isStatic && (
                    <button
                      onClick={() => togglePublished(project)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      title={project.isPublished === false ? 'Publish' : 'Unpublish'}
                    >
                      {project.isPublished === false ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  )}
                  {project.link && project.link !== '#' && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-colors"
                      title="Visit Link"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                  <Link
                    to={project.isStatic ? '#' : `/admin/projects/${project.id}`}
                    className={`p-2 text-gray-400 hover:text-green-400 hover:bg-gray-800 rounded-lg transition-colors ${
                      project.isStatic ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Edit"
                    onClick={e => project.isStatic && e.preventDefault()}
                  >
                    <Edit2 size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(project)}
                    disabled={deleting === project.id || project.isStatic}
                    className={`p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors ${
                      project.isStatic ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Delete"
                  >
                    <Trash2 size={18} className={deleting === project.id ? 'animate-pulse' : ''} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
