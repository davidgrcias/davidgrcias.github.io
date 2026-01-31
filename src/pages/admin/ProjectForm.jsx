import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, Plus, X, Trash2 } from 'lucide-react';
import { firestoreService } from '../../services/firestore';
import ImageUploader from '../../components/admin/ImageUploader';

const TIER_OPTIONS = ['Advanced', 'Intermediate', 'Beginner', 'Real-World', 'Capstone', 'Experimental'];
const ICON_OPTIONS = ['Bus', 'Ticket', 'Handshake', 'BotIcon', 'Car', 'School', 'Mic', 'Globe', 'Wallet', 'Music2', 'Camera', 'BookOpen', 'MapPin', 'ImageIcon', 'Clipboard', 'Code', 'Laptop', 'Smartphone', 'Server', 'Database'];

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    tech: [],
    highlights: [],
    link: '',
    icon: '',
    image: '',
    tiers: [],
    date: '',
    order: 0,
    isPublished: true
  });

  // Temp inputs for array fields
  const [techInput, setTechInput] = useState('');
  const [highlightInput, setHighlightInput] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const data = await firestoreService.getDocument('projects', id);
      if (data) {
        setFormData({
          name: data.name || '',
          role: data.role || '',
          description: data.description || '',
          tech: data.tech || [],
          highlights: data.highlights || [],
          link: data.link || '',
          icon: data.icon || '',
          image: data.image || '',
          tiers: data.tiers || [],
          date: data.date || '',
          order: data.order || 0,
          isPublished: data.isPublished !== false
        });
      }
    } catch (error) {
      console.error("Error loading project:", error);
      alert("Failed to load project");
      navigate('/admin/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addTech = () => {
    if (!techInput.trim()) return;
    const items = techInput.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      tech: [...new Set([...prev.tech, ...items])]
    }));
    setTechInput('');
  };

  const removeTech = (index) => {
    setFormData(prev => ({
      ...prev,
      tech: prev.tech.filter((_, i) => i !== index)
    }));
  };

  const addHighlight = () => {
    if (!highlightInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, highlightInput.trim()]
    }));
    setHighlightInput('');
  };

  const removeHighlight = (index) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const toggleTier = (tier) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.includes(tier)
        ? prev.tiers.filter(t => t !== tier)
        : [...prev.tiers, tier]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Project name is required");
      return;
    }

    setSaving(true);

    const payload = {
      ...formData,
      updatedAt: new Date().toISOString()
    };

    try {
      if (isEditMode) {
        await firestoreService.updateDocument('projects', id, payload);
      } else {
        // Get max order for new project
        const existing = await firestoreService.getCollection('projects');
        const maxOrder = existing.reduce((max, p) => Math.max(max, p.order || 0), 0);
        payload.order = maxOrder + 1;
        payload.createdAt = new Date().toISOString();
        
        await firestoreService.addDocument('projects', payload);
      }
      navigate('/admin/projects');
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save. Check console.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/admin/projects')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Projects
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isEditMode ? 'Update' : 'Create'} Project
        </button>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {/* Form Header */}
        <div className="p-5 border-b border-gray-800 bg-gray-800/30">
          <h1 className="text-xl font-bold text-white">
            {isEditMode ? 'Edit Project' : 'New Project'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Fill in the details for your portfolio project
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                placeholder="e.g. Portfolio WebOS"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Role
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                placeholder="e.g. Full-Stack Developer"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white resize-none"
              placeholder="Detailed description of your project..."
            />
          </div>

          {/* Image & Icon */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Image
              </label>
              <ImageUploader
                initialImage={formData.image}
                onImageUploaded={(url) => setFormData(prev => ({ ...prev, image: url }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Icon (Lucide name)
              </label>
              <select
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              >
                <option value="">Select an icon...</option>
                {ICON_OPTIONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Used when no image is set</p>
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tech Stack
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                placeholder="React, Node.js, PostgreSQL (comma separated)"
              />
              <button
                type="button"
                onClick={addTech}
                className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tech.map((t, i) => (
                <span 
                  key={i} 
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm"
                >
                  {t}
                  <button type="button" onClick={() => removeTech(i)} className="hover:text-blue-200">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Key Highlights
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                placeholder="Enter a highlight and press Add"
              />
              <button
                type="button"
                onClick={addHighlight}
                className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <ul className="space-y-2">
              {formData.highlights.map((h, i) => (
                <li 
                  key={i}
                  className="flex items-start gap-2 p-3 bg-gray-800 rounded-lg text-sm text-gray-300"
                >
                  <span className="text-green-400 mt-0.5">•</span>
                  <span className="flex-1">{h}</span>
                  <button 
                    type="button" 
                    onClick={() => removeHighlight(i)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Tiers */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Tiers / Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {TIER_OPTIONS.map(tier => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => toggleTier(tier)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    formData.tiers.includes(tier)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Link & Date */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Link
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                placeholder="https://github.com/... or https://live-demo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Date
              </label>
              <input
                type="month"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              />
            </div>
          </div>

          {/* Publishing Options */}
          <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-gray-300">Publish this project</span>
            </label>
            <span className="text-xs text-gray-500">
              {formData.isPublished ? 'Visible on portfolio' : 'Saved as draft'}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
