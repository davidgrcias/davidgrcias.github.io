import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  Briefcase, 
  GraduationCap, 
  Award,
  Wrench,
  User,
  Lightbulb,
  Plus,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Database,
  Loader2,
  BookOpen
} from 'lucide-react';
import { firestoreService } from '../../services/firestore';
import { seedAllData } from '../../utils/seedFirestore';

// Default stats when Firestore is empty
const defaultStats = {
  projects: 3,
  experiences: 4,
  education: 2,
  certifications: 10,
  skills: 5,
  funFacts: 6,
  insights: 4,
  posts: 4
};

const defaultRecentProjects = [
  { id: '1', name: "Komilet (JakLingko Management System)", date: "2025-11", tiers: ["Advanced", "Real-World"] },
  { id: '2', name: "UMN Festival 2025 (Official Platform)", date: "2025-11", tiers: ["Advanced", "Real-World", "Capstone"] },
  { id: '3', name: "Ark Care Ministry Website", date: "2024-12", tiers: ["Advanced", "Real-World"] }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(defaultStats);
  const [recentProjects, setRecentProjects] = useState(defaultRecentProjects);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchStats = async () => {
    try {
      // Fetch counts from Firestore
      const [
        projectsData,
        experiencesData,
        educationData,
        certificationsData,
        skillsData,
        funFactsData,
        insightsData,
        postsData
      ] = await Promise.all([
        firestoreService.getCollection('projects'),
        firestoreService.getCollection('experiences'),
        firestoreService.getCollection('education'),
        firestoreService.getCollection('certifications'),
        firestoreService.getDocument('skills', 'main'),
        firestoreService.getCollection('funFacts'),
        firestoreService.getCollection('insights'),
        firestoreService.getCollection('posts')
      ]);

      // Use actual data if available, otherwise keep defaults
      setStats({
        projects: projectsData?.length || defaultStats.projects,
        experiences: experiencesData?.length || defaultStats.experiences,
        education: educationData?.length || defaultStats.education,
        certifications: certificationsData?.length || defaultStats.certifications,
        skills: skillsData?.technical?.length || defaultStats.skills,
        funFacts: funFactsData?.length || defaultStats.funFacts,
        insights: insightsData?.length || defaultStats.insights,
        posts: postsData?.length || defaultStats.posts
      });

      // Get recent projects (sorted by date, top 5)
      if (projectsData?.length > 0) {
        const sorted = [...projectsData]
          .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
          .slice(0, 5);
        setRecentProjects(sorted);
      }
      // If no Firestore data, keep defaultRecentProjects
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Keep defaults on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    // Clear cache first
    firestoreService.clearCache();
    fetchStats();
  };

  // Seed all data to Firestore
  const handleSeedData = async () => {
    if (!window.confirm('This will populate Firestore with all default portfolio data. Continue?')) {
      return;
    }
    
    setSeeding(true);
    try {
      await seedAllData({ force: false }); // Only seed empty collections
      alert('✅ Data seeded successfully! Refreshing...');
      firestoreService.clearCache();
      await fetchStats();
    } catch (error) {
      console.error('Seed error:', error);
      alert('❌ Failed to seed data. Check console for details.');
    } finally {
      setSeeding(false);
    }
  };

  const statCards = [
    { label: 'Projects', value: stats.projects, icon: FolderKanban, path: '/admin/projects', color: 'from-blue-500 to-cyan-500' },
    { label: 'Blog Posts', value: stats.posts, icon: BookOpen, path: '/admin/blog', color: 'from-pink-500 to-rose-500' },
    { label: 'Experiences', value: stats.experiences, icon: Briefcase, path: '/admin/experiences', color: 'from-purple-500 to-pink-500' },
    { label: 'Education', value: stats.education, icon: GraduationCap, path: '/admin/education', color: 'from-green-500 to-emerald-500' },
    { label: 'Certifications', value: stats.certifications, icon: Award, path: '/admin/certifications', color: 'from-yellow-500 to-orange-500' },
    { label: 'Skill Categories', value: stats.skills, icon: Wrench, path: '/admin/skills', color: 'from-red-500 to-rose-500' },
  ];

  const quickActions = [
    { label: 'Add Project', path: '/admin/projects/new', icon: FolderKanban },
    { label: 'New Blog Post', path: '/admin/blog', icon: BookOpen },
    { label: 'Add Experience', path: '/admin/experiences/new', icon: Briefcase },
    { label: 'Edit Profile', path: '/admin/profile', icon: User },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's your portfolio overview.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 text-white"
            title="Populate Firestore with default data"
          >
            {seeding ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
            {seeding ? 'Seeding...' : 'Seed Data'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-white"
          >
            <ExternalLink size={18} />
            View Site
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.path}
              className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all hover:scale-105 group"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <Icon size={20} className="text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{stat.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
            <Link 
              to="/admin/projects" 
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-800">
            {recentProjects.length > 0 ? (
              recentProjects.map((project, index) => (
                <button
                  key={project.id || index}
                  onClick={() => navigate(`/admin/projects/${project.id}`, { state: { project } })}
                  className="flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-colors w-full text-left"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-2xl overflow-hidden">
                    {project.image ? (
                      <img src={project.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      project.icon || '📁'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{project.name}</h3>
                    <p className="text-sm text-gray-400 truncate">{project.role}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    project.isPublished !== false ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {project.isPublished !== false ? 'Published' : 'Draft'}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FolderKanban size={40} className="mx-auto mb-3 opacity-50" />
                <p>No projects yet</p>
                <Link 
                  to="/admin/projects/new"
                  className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                >
                  Create your first project
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Plus size={16} className="text-blue-400" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
                  <ArrowRight size={16} className="ml-auto text-gray-600 group-hover:text-gray-400 transition-colors" />
                </Link>
              );
            })}
          </div>

          {/* Portfolio Health */}
          <div className="p-4 border-t border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Portfolio Health</h3>
            <div className="space-y-3">
              <HealthItem 
                label="Projects" 
                value={stats.projects} 
                target={5}
                good={stats.projects >= 5}
              />
              <HealthItem 
                label="Experiences" 
                value={stats.experiences} 
                target={3}
                good={stats.experiences >= 3}
              />
              <HealthItem 
                label="Skills" 
                value={stats.skills} 
                target={4}
                good={stats.skills >= 4}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-2">💡 Pro Tips</h3>
        <ul className="text-gray-400 text-sm space-y-2">
          <li>• Keep your projects up to date with recent work</li>
          <li>• Add detailed descriptions to improve visibility</li>
          <li>• Include high-quality images for each project</li>
          <li>• Regularly update your skills section</li>
        </ul>
      </div>
    </div>
  );
};

const HealthItem = ({ label, value, target, good }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className={good ? 'text-green-400' : 'text-yellow-400'}>
          {value}/{target}
        </span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${good ? 'bg-green-500' : 'bg-yellow-500'}`}
          style={{ width: `${Math.min((value / target) * 100, 100)}%` }}
        />
      </div>
    </div>
  </div>
);

export default Dashboard;
