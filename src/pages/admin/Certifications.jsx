import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { firestoreService } from '../../services/firestore';

// Default certifications data
const defaultCertifications = [
  { id: 'default-1', name: "HCIA-AI V3.5 Course", provider: "Huawei ICT Academy", date: "May 2025", icon: "BrainCircuitIcon", isDefault: true },
  { id: 'default-2', name: "Python Intermediate Course", provider: "Sololearn", date: "June 2025", icon: "CodeIcon", isDefault: true },
  { id: 'default-3', name: "PHP Course", provider: "Progate", date: "Jan 2022", icon: "FileCode", isDefault: true },
  { id: 'default-4', name: "React Course", provider: "Progate", date: "Jan 2022", icon: "Code2", isDefault: true },
  { id: 'default-5', name: "SQL Course", provider: "Progate", date: "Jan 2022", icon: "Database", isDefault: true },
  { id: 'default-6', name: "GIT Course", provider: "Progate", date: "Dec 2021", icon: "GitBranch", isDefault: true }
];

const Certifications = () => {
  const navigate = useNavigate();
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getCollection('certifications', { orderByField: 'order' });
      setCertifications(data && data.length > 0 ? data : defaultCertifications);
    } catch (error) {
      console.error("Error fetching certifications:", error);
      setCertifications(defaultCertifications);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cert) => {
    if (cert.isStatic) {
      alert("Static data cannot be deleted.");
      return;
    }
    if (!window.confirm(`Delete "${cert.name}"?`)) return;
    
    setDeleting(cert.id);
    try {
      await firestoreService.deleteDocument('certifications', cert.id);
      setCertifications(prev => prev.filter(c => c.id !== cert.id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete.");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = certifications.filter(c => {
    const search = searchTerm.toLowerCase();
    return (
      c.name?.toLowerCase().includes(search) ||
      c.provider?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Certifications</h1>
          <p className="text-gray-400">Manage your certificates ({certifications.length} total)</p>
        </div>
        <Link 
          to="/admin/certifications/new"
          className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
        >
          <Plus size={20} />
          Add Certification
        </Link>
      </div>

      {/* Search */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or provider..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 outline-none focus:border-blue-500 text-white placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Static Warning */}
      {certifications.some(c => c.isStatic) && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-400 text-sm">
          ⚠️ Showing static data. Add certifications via admin to store in Firestore.
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
          <Award size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-medium text-white mb-2">
            {searchTerm ? 'No matches found' : 'No certifications yet'}
          </h3>
          <p className="text-gray-400 mb-4">Add your certificates and achievements</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cert) => (
            <div 
              key={cert.id}
              className="bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-all p-4 group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <Award size={20} className="text-yellow-400" />
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => !cert.isStatic && navigate(`/admin/certifications/${cert.id}`, { state: { certification: cert } })}
                    className={`p-1.5 text-gray-400 hover:text-green-400 hover:bg-gray-800 rounded-lg transition-colors ${
                      cert.isStatic ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={cert.isStatic}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(cert)}
                    disabled={deleting === cert.id || cert.isStatic}
                    className={`p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors ${
                      cert.isStatic ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-white mb-1 line-clamp-2">{cert.name}</h3>
              <p className="text-sm text-gray-400 mb-2">{cert.provider}</p>
              
              {cert.date && (
                <span className="text-xs text-gray-500">{cert.date}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certifications;
