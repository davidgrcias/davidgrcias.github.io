import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, GraduationCap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { firestoreService } from '../../services/firestore';

// Default education data
const defaultEducation = [
  {
    id: 'default-1',
    degree: "Undergraduate Student, Informatics",
    institution: "Universitas Multimedia Nusantara",
    period: "2023 - 2027",
    grade: "3.87",
    isDefault: true
  },
  {
    id: 'default-2',
    degree: "Software Engineering",
    institution: "SMK Cinta Kasih Tzu Chi",
    period: "2020 - 2023",
    isDefault: true
  }
];

const Education = () => {
  const navigate = useNavigate();
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getCollection('education', { orderByField: 'order' });
      setEducation(data && data.length > 0 ? data : defaultEducation);
    } catch (error) {
      console.error("Error fetching education:", error);
      setEducation(defaultEducation);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (edu) => {
    if (edu.isStatic) {
      alert("Static data cannot be deleted.");
      return;
    }
    if (!window.confirm(`Delete "${edu.degree} at ${edu.institution}"?`)) return;
    
    setDeleting(edu.id);
    try {
      await firestoreService.deleteDocument('education', edu.id);
      setEducation(prev => prev.filter(e => e.id !== edu.id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete.");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = education.filter(e => {
    const search = searchTerm.toLowerCase();
    return (
      e.degree?.toLowerCase().includes(search) ||
      e.institution?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Education</h1>
          <p className="text-gray-400">Manage your educational background ({education.length} entries)</p>
        </div>
        <Link 
          to="/admin/education/new"
          className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
        >
          <Plus size={20} />
          Add Education
        </Link>
      </div>

      {/* Search */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Search by degree or institution..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 outline-none focus:border-blue-500 text-white placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Static Warning */}
      {education.some(e => e.isStatic) && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-400 text-sm">
          ⚠️ Showing static data. Add education via admin to store in Firestore.
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
          <GraduationCap size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-medium text-white mb-2">
            {searchTerm ? 'No matches found' : 'No education entries yet'}
          </h3>
          <p className="text-gray-400 mb-4">Add your educational background</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((edu) => (
            <div 
              key={edu.id}
              className="bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-all p-4"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={24} className="text-green-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white">{edu.degree}</h3>
                  <p className="text-gray-400 text-sm">{edu.institution}</p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>{edu.period}</span>
                    {edu.grade && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                        GPA: {edu.grade}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => !edu.isStatic && navigate(`/admin/education/${edu.id}`, { state: { education: edu } })}
                    className={`p-2 text-gray-400 hover:text-green-400 hover:bg-gray-800 rounded-lg transition-colors ${
                      edu.isStatic ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={edu.isStatic}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(edu)}
                    disabled={deleting === edu.id || edu.isStatic}
                    className={`p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors ${
                      edu.isStatic ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Trash2 size={18} className={deleting === edu.id ? 'animate-pulse' : ''} />
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

export default Education;
