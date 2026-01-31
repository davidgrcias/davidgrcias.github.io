import React, { useState, useEffect } from 'react';
import { Save, Loader2, Plus, X, Trash2, GripVertical } from 'lucide-react';
import { firestoreService } from '../../services/firestore';

const ICON_OPTIONS = ['Layout', 'Database', 'Server', 'Brain', 'Lightbulb', 'Code', 'Globe', 'Cpu', 'Cloud', 'Shield'];

// Default skills data
const defaultSkills = {
  technical: [
    { category: "Front-End", skills: ["HTML", "CSS", "Tailwind CSS", "JavaScript & TypeScript", "React.js", "UI/UX Implementation"], icon: "Layout" },
    { category: "Back-End", skills: ["PHP", "Laravel", "Node.js (TypeScript)", "PostgreSQL", "Prisma ORM", "MySQL", "REST API", "Auth & Session", "MVC", "Python", "Kotlin", "Java"], icon: "Database" },
    { category: "DevOps & Deployment", skills: ["Git & GitHub", "Firebase", "Vercel", "cPanel Hosting", "Chrome DevTools", "Nginx"], icon: "Server" },
    { category: "AI & Optimization Tools", skills: ["Google Analytics", "Google Search Console", "SEO Optimization", "Prompt Engineering"], icon: "Brain" },
    { category: "Others", skills: ["Docs Writing", "Canva", "Figma", "Mobile-First Development", "Continually learning new technologies"], icon: "Lightbulb" }
  ],
  soft: ["Problem Solving", "Critical Thinking", "Fast Learning", "Adaptability", "Creativity", "Digital Communication", "Initiative", "Strong Work Ethic", "Team Collaboration", "Curiosity-Driven", "Branding", "Resilience"]
};

const Skills = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState(defaultSkills);
  
  // New skill category form
  const [newCategory, setNewCategory] = useState({ category: '', skills: [], icon: 'Code' });
  const [newSkillInput, setNewSkillInput] = useState('');
  const [softSkillInput, setSoftSkillInput] = useState('');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getDocument('skills', 'main');
      
      if (data && (data.technical?.length > 0 || data.soft?.length > 0)) {
        setSkills({
          technical: data.technical || defaultSkills.technical,
          soft: data.soft || defaultSkills.soft
        });
      }
      // If no data in Firestore, keep defaultSkills
    } catch (error) {
      console.error("Error fetching skills:", error);
      // Keep default skills on error
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await firestoreService.setDocument('skills', 'main', {
        ...skills,
        updatedAt: new Date().toISOString()
      });
      alert('Skills saved successfully!');
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save skills.");
    } finally {
      setSaving(false);
    }
  };

  // Technical Skills handlers
  const addCategorySkill = () => {
    if (!newSkillInput.trim()) return;
    const items = newSkillInput.split(',').map(s => s.trim()).filter(Boolean);
    setNewCategory(prev => ({
      ...prev,
      skills: [...new Set([...prev.skills, ...items])]
    }));
    setNewSkillInput('');
  };

  const removeCategorySkill = (index) => {
    setNewCategory(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addCategory = () => {
    if (!newCategory.category.trim() || newCategory.skills.length === 0) {
      alert('Category name and at least one skill required');
      return;
    }
    setSkills(prev => ({
      ...prev,
      technical: [...prev.technical, { ...newCategory }]
    }));
    setNewCategory({ category: '', skills: [], icon: 'Code' });
  };

  const removeCategory = (index) => {
    if (!window.confirm('Remove this skill category?')) return;
    setSkills(prev => ({
      ...prev,
      technical: prev.technical.filter((_, i) => i !== index)
    }));
  };

  const updateCategorySkills = (catIndex, newSkills) => {
    setSkills(prev => ({
      ...prev,
      technical: prev.technical.map((cat, i) => 
        i === catIndex ? { ...cat, skills: newSkills } : cat
      )
    }));
  };

  // Soft Skills handlers
  const addSoftSkill = () => {
    if (!softSkillInput.trim()) return;
    const items = softSkillInput.split(',').map(s => s.trim()).filter(Boolean);
    setSkills(prev => ({
      ...prev,
      soft: [...new Set([...prev.soft, ...items])]
    }));
    setSoftSkillInput('');
  };

  const removeSoftSkill = (index) => {
    setSkills(prev => ({
      ...prev,
      soft: prev.soft.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Skills</h1>
          <p className="text-gray-400">Manage your technical and soft skills</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg transition-colors font-medium disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save All Changes
        </button>
      </div>

      {/* Technical Skills */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 bg-gray-800/30">
          <h2 className="text-lg font-semibold text-white">Technical Skills</h2>
          <p className="text-sm text-gray-400 mt-1">Organize skills by category</p>
        </div>

        <div className="p-5 space-y-6">
          {/* Existing Categories */}
          {skills.technical.map((cat, catIndex) => (
            <div key={catIndex} className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical size={18} className="text-gray-600" />
                  <h3 className="font-medium text-white">{cat.category}</h3>
                  <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">
                    {cat.icon}
                  </span>
                </div>
                <button
                  onClick={() => removeCategory(catIndex)}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((skill, skillIndex) => (
                  <span 
                    key={skillIndex}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm"
                  >
                    {skill}
                    <button 
                      onClick={() => {
                        const newSkills = cat.skills.filter((_, i) => i !== skillIndex);
                        updateCategorySkills(catIndex, newSkills);
                      }}
                      className="hover:text-blue-200"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                {/* Add skill inline */}
                <input
                  type="text"
                  placeholder="Add skill..."
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 w-32 focus:outline-none focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      const newSkills = [...cat.skills, e.target.value.trim()];
                      updateCategorySkills(catIndex, newSkills);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          ))}

          {/* Add New Category */}
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Add New Category</h4>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={newCategory.category}
                onChange={(e) => setNewCategory(prev => ({ ...prev, category: e.target.value }))}
                className="px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                placeholder="Category name (e.g. Mobile Development)"
              />
              <select
                value={newCategory.icon}
                onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                className="px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              >
                {ICON_OPTIONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategorySkill())}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                placeholder="Skills (comma separated)"
              />
              <button
                type="button"
                onClick={addCategorySkill}
                className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                <Plus size={20} />
              </button>
            </div>

            {newCategory.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {newCategory.skills.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm">
                    {s}
                    <button onClick={() => removeCategorySkill(i)} className="hover:text-green-200">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={addCategory}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium"
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Soft Skills */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 bg-gray-800/30">
          <h2 className="text-lg font-semibold text-white">Soft Skills</h2>
          <p className="text-sm text-gray-400 mt-1">Non-technical skills and personal qualities</p>
        </div>

        <div className="p-5">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={softSkillInput}
              onChange={(e) => setSoftSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSoftSkill())}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              placeholder="Add soft skills (comma separated)"
            />
            <button
              type="button"
              onClick={addSoftSkill}
              className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.soft.map((skill, i) => (
              <span 
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm"
              >
                {skill}
                <button onClick={() => removeSoftSkill(i)} className="hover:text-purple-200">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skills;
