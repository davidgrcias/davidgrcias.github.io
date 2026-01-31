import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import { firestoreService } from '../../services/firestore';
import ImageUploader from '../../components/admin/ImageUploader';

const TYPE_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Self-employed'];
const LOCATION_TYPE_OPTIONS = ['Remote', 'On-site', 'Hybrid'];

const ExperienceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    type: 'Full-time',
    location: '',
    locationType: 'On-site',
    description: '',
    skills: [],
    startDate: '',
    endDate: '',
    isCurrent: false,
    media: {
      type: 'image',
      url: '',
      thumbnail: '',
      title: '',
      description: ''
    }
  });

  const [skillInput, setSkillInput] = useState('');

  const fetchExperience = async () => {
    setLoading(true);
    try {
      const data = await firestoreService.getDocument('experiences', id);
      if (data) {
        setFormData({
          role: data.role || '',
          company: data.company || '',
          type: data.type || 'Full-time',
          location: data.location || '',
          locationType: data.locationType || 'On-site',
          description: data.description || '',
          skills: data.skills || [],
          startDate: data.startDate || '',
          endDate: data.endDate === 'present' ? '' : (data.endDate || ''),
          isCurrent: data.endDate === 'present',
          media: data.media || { type: 'image', url: '', thumbnail: '', title: '', description: '' }
        });
      }
    } catch (error) {
      console.error("Error loading:", error);
      alert("Failed to load experience");
      navigate('/admin/experiences');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditMode && id) {
      // First check if data was passed via router state
      const stateData = location.state?.experience;
      if (stateData) {
        console.log('Loading from router state:', stateData);
        setFormData({
          role: stateData.role || '',
          company: stateData.company || '',
          type: stateData.type || 'Full-time',
          location: stateData.location || '',
          locationType: stateData.locationType || 'On-site',
          description: stateData.description || '',
          skills: stateData.skills || [],
          startDate: stateData.startDate || '',
          endDate: stateData.endDate === 'present' ? '' : (stateData.endDate || ''),
          isCurrent: stateData.endDate === 'present',
          media: stateData.media || { type: 'image', url: '', thumbnail: '', title: '', description: '' }
        });
      } else {
        // Fallback to fetching from Firestore
        console.log('Fetching from Firestore, id:', id);
        fetchExperience();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, id, location.state?.experience]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('media.')) {
      const mediaField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        media: { ...prev.media, [mediaField]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    const items = skillInput.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      skills: [...new Set([...prev.skills, ...items])]
    }));
    setSkillInput('');
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.role.trim() || !formData.company.trim()) {
      alert("Role and Company are required");
      return;
    }

    setSaving(true);

    const payload = {
      ...formData,
      endDate: formData.isCurrent ? 'present' : formData.endDate,
      updatedAt: new Date().toISOString()
    };
    delete payload.isCurrent;

    // Clean empty media
    if (!payload.media?.url && !payload.media?.thumbnail) {
      delete payload.media;
    }

    try {
      // Check if editing default data (not in Firestore)
      const isDefaultData = id?.startsWith('default-') || location.state?.experience?.isDefault;
      
      if (isEditMode && !isDefaultData) {
        // Normal update for real Firestore documents
        await firestoreService.updateDocument('experiences', id, payload);
      } else {
        // Create new document (for new entries or migrating default data)
        payload.createdAt = new Date().toISOString();
        await firestoreService.addDocument('experiences', payload);
      }
      navigate('/admin/experiences');
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save.");
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
    <div className="max-w-3xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/admin/experiences')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isEditMode ? 'Update' : 'Create'}
        </button>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 bg-gray-800/30">
          <h1 className="text-xl font-bold text-white">
            {isEditMode ? 'Edit Experience' : 'Add Experience'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Role & Company */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Role / Position *</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                placeholder="e.g. Full Stack Developer"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Company *</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                placeholder="e.g. Google Inc."
                required
              />
            </div>
          </div>

          {/* Type & Location Type */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Employment Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              >
                {TYPE_OPTIONS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Work Location Type</label>
              <select
                name="locationType"
                value={formData.locationType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              >
                {LOCATION_TYPE_OPTIONS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              placeholder="e.g. Jakarta, Indonesia"
            />
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
              <input
                type="month"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
              <input
                type="month"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                disabled={formData.isCurrent}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white disabled:opacity-50"
              />
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isCurrent"
                  checked={formData.isCurrent}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
                />
                <span className="text-sm text-gray-400">I currently work here</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white resize-none"
              placeholder="Describe your responsibilities and achievements..."
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Skills Used</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                placeholder="React, Node.js, TypeScript (comma separated)"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                  {s}
                  <button type="button" onClick={() => removeSkill(i)} className="hover:text-blue-200">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Media Section */}
          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-lg font-medium text-white mb-4">Media (Optional)</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Media Type</label>
                <select
                  name="media.type"
                  value={formData.media.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                >
                  <option value="image">Image</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Media URL</label>
                <input
                  type="text"
                  name="media.url"
                  value={formData.media.url}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                  placeholder="Link to media..."
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail Image</label>
              <ImageUploader
                initialImage={formData.media.thumbnail}
                onImageUploaded={(url) => setFormData(prev => ({
                  ...prev,
                  media: { ...prev.media, thumbnail: url }
                }))}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Media Title</label>
                <input
                  type="text"
                  name="media.title"
                  value={formData.media.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                  placeholder="Title for the media..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Media Description</label>
                <input
                  type="text"
                  name="media.description"
                  value={formData.media.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                  placeholder="Short description..."
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExperienceForm;
