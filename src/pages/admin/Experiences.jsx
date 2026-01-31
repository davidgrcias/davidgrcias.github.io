import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Briefcase, Calendar, Loader2, Download, GripVertical } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { firestoreService } from '../../services/firestore';
import { seedLinkedInExperiences, linkedInExperiences } from '../../utils/seedExperiences';

// Default experiences data
const defaultExperiences = [
  {
    id: 'default-1',
    role: "Coordinator of Web Division (Full Stack Developer)",
    company: "UMN FESTIVAL 2025",
    type: "Contract",
    location: "Tangerang, Banten, Indonesia",
    locationType: "Hybrid",
    description: "Led the end-to-end development of UMN Festival's official website using Laravel, React, and Midtrans.",
    skills: ["Laravel", "React.js", "Payment Gateways"],
    startDate: "2025-02",
    endDate: "present",
    isDefault: true
  },
  {
    id: 'default-2',
    role: "Full Stack Developer",
    company: "Koperasi Mikrolet Jakarta Raya (Komilet)",
    type: "Contract",
    location: "Jakarta Metropolitan Area",
    locationType: "Remote",
    description: "Built and deployed a full-stack TypeScript platform for JakLingko angkot operator.",
    skills: ["Full-Stack Development", "TypeScript", "PostgreSQL", "Prisma ORM"],
    startDate: "2025-07",
    endDate: "present",
    isDefault: true
  }
];

const Experiences = () => {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getCollection('experiences', { orderByField: 'startDate', orderDirection: 'desc' });
      setExperiences(data && data.length > 0 ? data : defaultExperiences);
    } catch (error) {
      console.error("Error fetching experiences:", error);
      setExperiences(defaultExperiences);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (exp) => {
    if (exp.isStatic) {
      alert("Static data cannot be deleted.");
      return;
    }
    if (!window.confirm(`Delete "${exp.role} at ${exp.company}"?`)) return;
    
    setDeleting(exp.id);
    try {
      await firestoreService.deleteDocument('experiences', exp.id);
      setExperiences(prev => prev.filter(e => e.id !== exp.id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete.");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'present') return 'Present';
    const [year, month] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  const getTypeColor = (type) => {
    const colors = {
      'Contract': 'bg-blue-500/20 text-blue-400',
      'Full-time': 'bg-green-500/20 text-green-400',
      'Part-time': 'bg-yellow-500/20 text-yellow-400',
      'Internship': 'bg-purple-500/20 text-purple-400',
      'Self-employed': 'bg-orange-500/20 text-orange-400',
      'Freelance': 'bg-cyan-500/20 text-cyan-400'
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400';
  };

  const filtered = experiences.filter(e => {
    const search = searchTerm.toLowerCase();
    return (
      e.role?.toLowerCase().includes(search) ||
      e.company?.toLowerCase().includes(search) ||
      e.skills?.some(s => s.toLowerCase().includes(search))
    );
  });

  const handleSeedLinkedIn = async () => {
    if (!window.confirm(`Import ${linkedInExperiences.length} experiences from LinkedIn data?\\n\\nThis will add new experiences to Firestore.`)) return;
    
    setSeeding(true);
    try {
      const result = await seedLinkedInExperiences();
      alert(`✅ Import complete!\\n\\n${result.success} experiences added successfully.\\n${result.failed} failed.`);
      fetchExperiences();
    } catch (error) {
      console.error('Seed error:', error);
      alert('Failed to import experiences. Check console.');
    } finally {
      setSeeding(false);
    }
  };

  const handleDragStart = (e, exp) => {
    setDraggedItem(exp);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetExp) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetExp.id) return;

    const items = [...experiences];
    const draggedIdx = items.findIndex(ex => ex.id === draggedItem.id);
    const targetIdx = items.findIndex(ex => ex.id === targetExp.id);

    items.splice(draggedIdx, 1);
    items.splice(targetIdx, 0, draggedItem);

    const reordered = items.map((item, idx) => ({ ...item, order: idx + 1 }));
    setExperiences(reordered);
    setDraggedItem(null);

    setReordering(true);
    try {
      await Promise.all(
        reordered.map(ex => 
          !ex.isDefault && firestoreService.updateDocument('experiences', ex.id, { order: ex.order })
        )
      );
    } catch (error) {
      console.error('Reorder error:', error);
      fetchExperiences();
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
          <h1 className="text-2xl font-bold text-white">Experiences</h1>
          <p className="text-gray-400">Manage your work history ({experiences.length} total)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedLinkedIn}
            disabled={seeding}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
            title="Import experiences from LinkedIn data"
          >
            {seeding ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            {seeding ? 'Importing...' : 'Import LinkedIn'}
          </button>
          <Link 
            to="/admin/experiences/new"
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
          >
            <Plus size={20} />
            Add Experience
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Search by role, company, or skill..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 outline-none focus:border-blue-500 text-white placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Static Warning */}
      {experiences.some(e => e.isStatic) && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-400 text-sm">
          ⚠️ Showing static data. Add experiences via admin to store in Firestore.
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
          <Briefcase size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-medium text-white mb-2">
            {searchTerm ? 'No matches found' : 'No experiences yet'}
          </h3>
          <p className="text-gray-400 mb-4">
            {searchTerm ? 'Try different keywords' : 'Add your first work experience'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reordering && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-blue-400 text-sm">
              💾 Saving new order...
            </div>
          )}
          {filtered.map((exp) => (
            <div 
              key={exp.id}
              draggable={!exp.isDefault}
              onDragStart={(e) => handleDragStart(e, exp)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, exp)}
              onDragEnd={handleDragEnd}
              className={`bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-all p-4 ${
                draggedItem?.id === exp.id ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Drag Handle */}
                <div className={`hidden sm:flex items-start pt-1 text-gray-600 ${
                  exp.isDefault ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
                }`}>
                  <GripVertical size={20} />
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{exp.role}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs ${getTypeColor(exp.type)}`}>
                      {exp.type}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{exp.company}</p>
                  
                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                    </span>
                    {exp.location && (
                      <span>{exp.location}</span>
                    )}
                    {exp.locationType && (
                      <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">
                        {exp.locationType}
                      </span>
                    )}
                  </div>

                  {/* Skills */}
                  {exp.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {exp.skills.slice(0, 5).map((skill, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {exp.skills.length > 5 && (
                        <span className="text-xs text-gray-500">+{exp.skills.length - 5}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => !exp.isStatic && navigate(`/admin/experiences/${exp.id}`, { state: { experience: exp } })}
                    className={`p-2 text-gray-400 hover:text-green-400 hover:bg-gray-800 rounded-lg transition-colors ${
                      exp.isStatic ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={exp.isStatic}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(exp)}
                    disabled={deleting === exp.id || exp.isStatic}
                    className={`p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors ${
                      exp.isStatic ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Trash2 size={18} className={deleting === exp.id ? 'animate-pulse' : ''} />
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

export default Experiences;
