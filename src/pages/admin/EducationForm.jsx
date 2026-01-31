import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { firestoreService } from '../../services/firestore';

const EducationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    degree: '',
    institution: '',
    period: '',
    grade: '',
    order: 0
  });

  useEffect(() => {
    if (isEditMode) {
      fetchEducation();
    }
  }, [id]);

  const fetchEducation = async () => {
    setLoading(true);
    try {
      const data = await firestoreService.getDocument('education', id);
      if (data) {
        setFormData({
          degree: data.degree || '',
          institution: data.institution || '',
          period: data.period || '',
          grade: data.grade || '',
          order: data.order || 0
        });
      }
    } catch (error) {
      console.error("Error loading:", error);
      alert("Failed to load education");
      navigate('/admin/education');
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
    
    if (!formData.degree.trim() || !formData.institution.trim()) {
      alert("Degree and Institution are required");
      return;
    }

    setSaving(true);

    const payload = {
      ...formData,
      updatedAt: new Date().toISOString()
    };

    try {
      if (isEditMode) {
        await firestoreService.updateDocument('education', id, payload);
      } else {
        const existing = await firestoreService.getCollection('education');
        const maxOrder = existing.reduce((max, e) => Math.max(max, e.order || 0), 0);
        payload.order = maxOrder + 1;
        payload.createdAt = new Date().toISOString();
        await firestoreService.addDocument('education', payload);
      }
      navigate('/admin/education');
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
          onClick={() => navigate('/admin/education')}
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
            {isEditMode ? 'Edit Education' : 'Add Education'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Degree */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Degree / Program *
            </label>
            <input
              type="text"
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              placeholder="e.g. Bachelor of Science in Computer Science"
              required
            />
          </div>

          {/* Institution */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Institution *
            </label>
            <input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              placeholder="e.g. Massachusetts Institute of Technology"
              required
            />
          </div>

          {/* Period & Grade */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Period</label>
              <input
                type="text"
                name="period"
                value={formData.period}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                placeholder="e.g. 2020 - 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Grade / GPA</label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                placeholder="e.g. 3.87 / 4.00"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EducationForm;
