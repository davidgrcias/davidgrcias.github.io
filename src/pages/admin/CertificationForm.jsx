import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { firestoreService } from '../../services/firestore';

const ICON_OPTIONS = ['Award', 'BrainCircuitIcon', 'CodeIcon', 'FileCode', 'Code2', 'Database', 'Globe', 'GitBranch', 'Shield', 'Star', 'Trophy', 'Medal', 'Certificate', 'BadgeCheck'];

const CertificationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    date: '',
    icon: 'Award',
    credentialUrl: '',
    order: 0
  });

  useEffect(() => {
    if (isEditMode) {
      fetchCertification();
    }
  }, [id]);

  const fetchCertification = async () => {
    setLoading(true);
    try {
      const data = await firestoreService.getDocument('certifications', id);
      if (data) {
        setFormData({
          name: data.name || '',
          provider: data.provider || '',
          date: data.date || '',
          icon: data.icon || 'Award',
          credentialUrl: data.credentialUrl || '',
          order: data.order || 0
        });
      }
    } catch (error) {
      console.error("Error loading:", error);
      alert("Failed to load certification");
      navigate('/admin/certifications');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.provider.trim()) {
      alert("Name and Provider are required");
      return;
    }

    setSaving(true);

    const payload = {
      ...formData,
      updatedAt: new Date().toISOString()
    };

    try {
      if (isEditMode) {
        await firestoreService.updateDocument('certifications', id, payload);
      } else {
        const existing = await firestoreService.getCollection('certifications');
        const maxOrder = existing.reduce((max, c) => Math.max(max, c.order || 0), 0);
        payload.order = maxOrder + 1;
        payload.createdAt = new Date().toISOString();
        await firestoreService.addDocument('certifications', payload);
      }
      navigate('/admin/certifications');
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
    <div className="max-w-2xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/admin/certifications')}
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
            {isEditMode ? 'Edit Certification' : 'Add Certification'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Certification Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              placeholder="e.g. AWS Solutions Architect"
              required
            />
          </div>

          {/* Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Provider / Issuer *
            </label>
            <input
              type="text"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              placeholder="e.g. Amazon Web Services"
              required
            />
          </div>

          {/* Date & Icon */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date Obtained
              </label>
              <input
                type="text"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                placeholder="e.g. Jan 2024 or January 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Icon
              </label>
              <select
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              >
                {ICON_OPTIONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Credential URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Credential URL (Optional)
            </label>
            <input
              type="url"
              name="credentialUrl"
              value={formData.credentialUrl}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              placeholder="https://www.credly.com/badges/..."
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CertificationForm;
