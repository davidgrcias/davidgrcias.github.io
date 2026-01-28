import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { getFirestore, doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import ImageUploader from '../../components/admin/ImageUploader';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = getFirestore();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
      title: '',
      description: '',
      image: '',
      github: '',
      demo: '',
      tech: '', // String initially, converted to array on save
      readme: '' // Placeholder for full markdown content
  });

  useEffect(() => {
    if (isEditMode) {
        const fetchProject = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, "projects", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        ...data,
                        tech: data.tech ? data.tech.join(', ') : ''
                    });
                }
            } catch (error) {
                console.error("Error loading project:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }
  }, [id, isEditMode, db]);

  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      const payload = {
          ...formData,
          tech: formData.tech.split(',').map(s => s.trim()).filter(Boolean),
          updatedAt: new Date().toISOString()
      };

      try {
          if (isEditMode) {
              await updateDoc(doc(db, "projects", id), payload);
          } else {
              await addDoc(collection(db, "projects"), {
                  ...payload,
                  createdAt: new Date().toISOString()
              });
          }
          navigate('/admin/projects');
      } catch (error) {
          console.error("Error saving project:", error);
          alert("Failed to save. Check console.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
        <button 
            onClick={() => navigate('/admin/projects')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
            <ArrowLeft size={20} />
            Back to Projects
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isEditMode ? 'Edit Project' : 'Create New Project'}
                </h1>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    {isEditMode ? 'Update' : 'Publish'}
                </button>
            </div>

            <div className="p-8 space-y-8">
                {/* Main Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Title</label>
                            <input 
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                placeholder="e.g. Super App 2.0"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Short Description</label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white resize-none"
                                placeholder="Brief overview of the project..."
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tech Stack (comma separated)</label>
                            <input 
                                type="text"
                                name="tech"
                                value={formData.tech}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                placeholder="React, Node.js, TensorFlow"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <ImageUploader 
                            label="Project Thumbnail"
                            initialImage={formData.image}
                            onImageUploaded={(url) => setFormData(prev => ({ ...prev, image: url }))}
                        />
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GitHub URL</label>
                                <input 
                                    type="url"
                                    name="github"
                                    value={formData.github}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                    placeholder="https://github.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Demo URL</label>
                                <input 
                                    type="url"
                                    name="demo"
                                    value={formData.demo}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                    placeholder="https://my-app.com"
                                />
                            </div>
                         </div>
                    </div>
                </div>

                {/* Content Editor Placeholder */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Detailed Case Study (Markdown Support)
                    </label>
                    <div className="w-full h-80 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 font-mono text-sm opacity-60">
                         {/* We can integrate a real Text Editor later, for now simple textarea */}
                         <textarea
                            name="readme"
                             value={formData.readme}
                             onChange={handleChange}
                             className="w-full h-full bg-transparent outline-none dark:text-white"
                             placeholder="# Project Details&#10;Describe your project utilizing markdown..."
                         ></textarea>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProjectForm;
