import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  ExternalLink
} from 'lucide-react';
import { firestoreService } from '../../services/firestore';

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    experiences: 0,
    education: 0,
    certifications: 0,
    skills: 0,
    funFacts: 0,
    insights: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
        insightsData
      ] = await Promise.all([
        firestoreService.getCollection('projects'),
        firestoreService.getCollection('experiences'),
        firestoreService.getCollection('education'),
        firestoreService.getCollection('certifications'),
        firestoreService.getDocument('settings', 'skills'),
        firestoreService.getCollection('funFacts'),
        firestoreService.getCollection('insights')
      ]);

      setStats({
        projects: projectsData?.length || 0,
        experiences: experiencesData?.length || 0,
        education: educationData?.length || 0,
        certifications: certificationsData?.length || 0,
        skills: skillsData?.categories?.length || 0,
        funFacts: funFactsData?.length || 0,
        insights: insightsData?.length || 0
      });

      // Get recent projects (sorted by date, top 5)
      if (projectsData?.length > 0) {
        const sorted = [...projectsData]
          .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
          .slice(0, 5);
        setRecentProjects(sorted);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  const statCards = [
    { label: 'Projects', value: stats.projects, icon: FolderKanban, path: '/admin/projects', color: 'from-blue-500 to-cyan-500' },
    { label: 'Experiences', value: stats.experiences, icon: Briefcase, path: '/admin/experiences', color: 'from-purple-500 to-pink-500' },
    { label: 'Education', value: stats.education, icon: GraduationCap, path: '/admin/education', color: 'from-green-500 to-emerald-500' },
    { label: 'Certifications', value: stats.certifications, icon: Award, path: '/admin/certifications', color: 'from-yellow-500 to-orange-500' },
    { label: 'Skill Categories', value: stats.skills, icon: Wrench, path: '/admin/skills', color: 'from-red-500 to-rose-500' },
    { label: 'Fun Facts', value: stats.funFacts, icon: Lightbulb, path: '/admin/content', color: 'from-indigo-500 to-violet-500' },
  ];

  const quickActions = [
    { label: 'Add Project', path: '/admin/projects/new', icon: FolderKanban },
    { label: 'Add Experience', path: '/admin/experiences/new', icon: Briefcase },
    { label: 'Add Certification', path: '/admin/certifications/new', icon: Award },
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
        <div className="flex gap-3">
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
                <Link
                  key={project.id || index}
                  to={`/admin/projects/${project.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-colors"
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
                </Link>
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
