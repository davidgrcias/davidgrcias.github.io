import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, isAdminEmail } from '../../config/firebase';
import { getUserProfile } from '../../data/userProfile';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  // Load verified owner profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getUserProfile('en');
        setProfile(data);
      } catch (e) {
        console.error("Failed to verify ownership:", e);
      }
    };
    loadProfile();
  }, []);

  // Check if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && isAdminEmail(user.email)) {
        navigate('/admin');
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if email is in whitelist
      if (!isAdminEmail(user.email)) {
        await auth.signOut();
        setError(`Access denied. ${user.email} is not authorized.`);
        setLoading(false);
        return;
      }

      navigate('/admin');
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup blocked. Please allow popups for this site.');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-900">
      {/* Left Side - Visual */}
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-purple-700 p-12 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

        <div className="relative z-10 flex flex-col items-center">
          {profile?.avatar ? (
            <div className="w-40 h-40 rounded-full border-4 border-white/20 shadow-2xl mb-8 overflow-hidden transform hover:scale-105 transition-transform duration-500">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=DG'; }}
              />
            </div>
          ) : (
            <div className="text-8xl mb-6 animate-pulse">🎛️</div>
          )}

          <h1 className="text-5xl font-bold mb-4 tracking-tight">{profile ? profile.name : 'AdminOS'}</h1>
          <p className="text-xl text-blue-100 text-center max-w-md font-light leading-relaxed">
            {profile ? profile.headline : 'Control center for your digital portfolio ecosystem.'}
          </p>

          <div className="mt-12 space-y-3 text-sm text-blue-200 opacity-80 font-mono bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm">
            <p className="flex items-center gap-3">
              <span className="text-green-300">✓</span> Verified Owner Access
            </p>
            <p className="flex items-center gap-3">
              <span className="text-green-300">✓</span> Encrypted Connection
            </p>
            <p className="flex items-center gap-3">
              <span className="text-green-300">✓</span> Full System Control
            </p>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="absolute bottom-8 text-xs text-blue-200/40 font-mono">
          © {new Date().getFullYear()} {profile?.name || 'David Garcia Saragih'}. All Rights Reserved.
        </div>
      </div>

      {/* Right Side - Login */}
      <div className="flex items-center justify-center p-8 bg-white dark:bg-gray-900 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            {profile?.avatar && (
              <div className="md:hidden w-24 h-24 mx-auto rounded-full border-4 border-blue-500/20 shadow-xl mb-6 overflow-hidden">
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
            )}

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">System Access</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Authenticate to verify identity as <span className="font-semibold text-blue-600 dark:text-blue-400">{profile ? profile.name.split(' ')[0] : 'Admin'}</span>
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 rounded-xl font-medium shadow-sm hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-semibold">
              {loading ? 'Verifying Credentials...' : 'Sign in with Google'}
            </span>
          </button>

          <div className="text-center pt-8 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold">
              Secured by AdminOS Encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
