import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ExternalLink, GripVertical, Eye, EyeOff, Loader2, Download, Bus, Car, Smartphone, School, MapPin, Handshake, FolderOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { firestoreService } from '../../services/firestore';
import { seedLinkedInProjects, linkedInProjects } from '../../utils/seedProjects';
import { seedLinkedInProjects, linkedInProjects } from '../../utils/seedProjects';
import { getIcon } from '../../icons/iconMap';
import OptimizedImage from '../../components/common/OptimizedImage';

// Default projects data for fallback
const defaultProjects = [
  {
    id: 'default-1',
    name: "Komilet (JakLingko Management System)",
    role: "Full-Stack Web & Systems Engineer",
    description: "Architected a comprehensive fleet management system for JakLingko operators using Next.js 16 and PostgreSQL.",
    tech: ["Next.js 16", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS v4", "Redux Toolkit"],
    tiers: ["Advanced", "Real-World"],
    date: "2025-11",
    link: "#",
    icon: "Bus",
    isPublished: true,
    isDefault: true
  },
  {
    id: 'default-2',
    name: "UMN Festival 2025 (Official Platform)",
    role: "Web Development Coordinator",
    description: "Architected the comprehensive event platform for UMN Festival 2025 using a Hybrid Monolith approach.",
    tech: ["Laravel 12", "React 19", "Inertia.js 2.0", "Tailwind CSS v4", "Midtrans SDK", "PostgreSQL"],
    tiers: ["Advanced", "Real-World", "Capstone"],
    date: "2025-11",
    link: "#",
    icon: "Ticket",
    isPublished: true,
    isDefault: true
  }
];

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getCollection('projects', { orderByField: 'order' });
      // If Firestore has data, use it; otherwise use defaults
      setProjects(data && data.length > 0 ? data : defaultProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects(defaultProjects);
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

  const handleSeedLinkedIn = async () => {
    if (!window.confirm(`Import ${linkedInProjects.length} projects from LinkedIn data?\n\nThis will add new projects to Firestore.`)) return;
    
    setSeeding(true);
    try {
      const result = await seedLinkedInProjects();
      alert(`✅ Import complete!\n\n${result.success} projects added successfully.\n${result.failed} failed.`);
      fetchProjects(); // Refresh list
    } catch (error) {
      console.error('Seed error:', error);
      alert('Failed to import projects. Check console.');
    } finally {
      setSeeding(false);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, project) => {
    setDraggedItem(project);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetProject) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetProject.id) return;

    const items = [...projects];
    const draggedIdx = items.findIndex(p => p.id === draggedItem.id);
    const targetIdx = items.findIndex(p => p.id === targetProject.id);

    // Reorder array
    items.splice(draggedIdx, 1);
    items.splice(targetIdx, 0, draggedItem);

    // Update order field
    const reordered = items.map((item, idx) => ({ ...item, order: idx + 1 }));
    setProjects(reordered);
    setDraggedItem(null);

    // Save to Firestore
    setReordering(true);
    try {
      await Promise.all(
        reordered.map(p => 
          !p.isDefault && firestoreService.updateDocument('projects', p.id, { order: p.order })
        )
      );
    } catch (error) {
      console.error('Reorder error:', error);
      fetchProjects(); // Revert on error
    } finally {
      setReordering(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-400">Manage your portfolio showcase ({projects.length} total)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedLinkedIn}
            disabled={seeding}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
            title="Import projects from LinkedIn data"
          >
            {seeding ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            {seeding ? 'Importing...' : 'Import LinkedIn'}
          </button>
          <Link 
            to="/admin/projects/new"
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
          >
            <Plus size={20} />
            New Project
          </Link>
        </div>
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
          {reordering && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-blue-400 text-sm">
              💾 Saving new order...
            </div>
          )}
          {filteredProjects.map((project) => {
            const IconComponent = project.icon && getIcon(project.icon, 32);
            return (
              <div 
                key={project.id} 
                draggable={!project.isDefault}
                onDragStart={(e) => handleDragStart(e, project)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, project)}
                onDragEnd={handleDragEnd}
                className={`bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-all overflow-hidden ${
                  project.isPublished === false ? 'opacity-60' : ''
                } ${draggedItem?.id === project.id ? 'opacity-50' : ''}`}
              >
                <div className="flex items-stretch">
                  {/* Drag Handle */}
                  <div className={`hidden sm:flex items-center px-3 bg-gray-800/50 text-gray-600 ${
                    project.isDefault ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
                  }`}>
                    <GripVertical size={20} />
                  </div>

                  {/* Icon/Image */}
                  <div className="w-16 sm:w-20 flex-shrink-0 bg-gray-800 flex items-center justify-center text-gray-400">
                    {project.image ? (
                      <OptimizedImage 
                        src={project.image} 
                        alt={project.name}
                        width={80}
                        height={80}
                        quality={80}
                        className="w-full h-full object-cover" 
                      />
                    ) : IconComponent ? (
                      IconComponent
                    ) : (
                      <FolderOpen size={32} />
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
                  <button
                    onClick={() => !project.isStatic && navigate(`/admin/projects/${project.id}`, { state: { project } })}
                    className={`p-2 text-gray-400 hover:text-green-400 hover:bg-gray-800 rounded-lg transition-colors ${
                      project.isStatic ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Edit"
                    disabled={project.isStatic}
                  >
                    <Edit2 size={18} />
                  </button>
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Projects;
