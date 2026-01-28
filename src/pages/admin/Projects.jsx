import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ExternalLink, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const Projects = () => {
    // MOCK DATA FOR INITIAL UI - Replace with real Firestore fetch later
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const db = getFirestore();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // TRY fetch from Firestore first
                const querySnapshot = await getDocs(collection(db, "projects"));
                const projList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                if (projList.length === 0) {
                    // Fallback Mock Data if empty (so user sees something)
                    setProjects([
                        { id: '1', title: 'Portfolio WebOS', description: 'A cool OS style portfolio.', tech: ['React', 'Firebase'], image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&q=80' },
                        { id: '2', title: 'E-Commerce App', description: 'Fullstack shopping app.', tech: ['Next.js', 'Stripe'], image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80' }
                    ]);
                } else {
                    setProjects(projList);
                }
            } catch (error) {
                console.error("Error fetching projects:", error);
                // Fallback on error (e.g. missing permission/key)
                setProjects([
                        { id: '1', title: 'Portfolio WebOS (Demo)', description: 'A cool OS style portfolio.', tech: ['React', 'Firebase'], image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&q=80' },
                        { id: '2', title: 'E-Commerce App (Demo)', description: 'Fullstack shopping app.', tech: ['Next.js', 'Stripe'], image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80' }
                    ]);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [db]);

    const handleDelete = async (id) => {
        if(window.confirm("Are you sure you want to delete this project?")) {
            try {
                await deleteDoc(doc(db, "projects", id));
                setProjects(projects.filter(p => p.id !== id));
            } catch (error) {
                alert("Failed to delete (check console/permissions)");
                console.error(error);
            }
        }
    };

    const filteredProjects = projects.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.tech.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your portfolio showcase items</p>
        </div>
        <Link 
            to="/admin/projects/new"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
        >
            <Plus size={20} />
            New Project
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Search projects by title or tech..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                  <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
              ))}
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
                <div key={project.id} className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                    <div className="relative h-48 overflow-hidden">
                        <img 
                            src={project.image || 'https://via.placeholder.com/400x300'} 
                            alt={project.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                            <div className="flex gap-2 text-white">
                                {project.github && <a href={project.github} target="_blank" rel="noreferrer" className="p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-colors"><Github size={18} /></a>}
                                {project.demo && <a href={project.demo} target="_blank" rel="noreferrer" className="p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-colors"><ExternalLink size={18} /></a>}
                            </div>
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                             <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{project.title}</h3>
                             <div className="flex gap-1 ml-2">
                                <Link to={`/admin/projects/edit/${project.id}`} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                                    <Edit2 size={16} />
                                </Link>
                                <button onClick={() => handleDelete(project.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                             </div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                            {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {project.tech?.map((t, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md font-medium">
                                    {t}
                                </span>
                            ))}
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
