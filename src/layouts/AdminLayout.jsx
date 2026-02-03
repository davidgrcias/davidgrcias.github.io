import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, isAdminEmail } from '../config/firebase';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Wrench,
  User,
  Lightbulb,
  LogOut,
  Menu,
  X,
  ChevronRight,
  BookOpen,
  Code2,
  FolderTree,
  Database,
  TrendingUp
} from 'lucide-react';

const AdminLayout = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/admin/login');
      } else if (!isAdminEmail(currentUser.email)) {
        // Not authorized
        signOut(auth);
        navigate('/admin/login');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading AdminOS...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
    { label: 'Blog Posts', path: '/admin/blog', icon: BookOpen },
    { label: 'Experiences', path: '/admin/experiences', icon: Briefcase },
    { label: 'Education', path: '/admin/education', icon: GraduationCap },
    { label: 'Certifications', path: '/admin/certifications', icon: Award },
    { label: 'Skills', path: '/admin/skills', icon: Wrench },
    { label: 'Profile', path: '/admin/profile', icon: User },
    { label: 'Content', path: '/admin/content', icon: Lightbulb },
    { label: 'VS Code Files', path: '/admin/vscode', icon: Code2 },
    { label: 'File Manager', path: '/admin/files', icon: FolderTree },
    { label: 'AI Knowledge', path: '/admin/knowledge', icon: Database },
    { label: 'Chat Analytics', path: '/admin/chat-analytics', icon: TrendingUp },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const NavLink = ({ item, onClick }) => {
    const Icon = item.icon;
    const active = isActive(item);
    
    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
          active
            ? 'bg-blue-500/10 text-blue-500 font-medium'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
      >
        <Icon size={20} />
        <span className={sidebarOpen ? 'block' : 'hidden lg:hidden'}>{item.label}</span>
        {active && <ChevronRight size={16} className="ml-auto" />}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-gray-800 rounded-lg"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AdminOS
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-900 border-r border-gray-800 
        flex flex-col
        transform transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:pt-0 pt-16
      `}>
        {/* Logo */}
        <div className="hidden lg:flex p-6 border-b border-gray-800 items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
            🎛️
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              AdminOS
            </h1>
            <p className="text-xs text-gray-500">Portfolio Manager</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              item={item} 
              onClick={() => setMobileMenuOpen(false)}
            />
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="" 
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {user?.email?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate text-white">
                {user?.displayName || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:pt-0 pt-16">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
