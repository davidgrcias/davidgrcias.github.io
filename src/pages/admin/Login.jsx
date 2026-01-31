import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, isAdminEmail } from '../../config/firebase';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

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
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-purple-700 p-12 text-white">
        <div className="text-6xl mb-6">🎛️</div>
        <h1 className="text-5xl font-bold mb-6">AdminOS</h1>
        <p className="text-xl text-blue-100 text-center max-w-md">
          Control center for your digital portfolio ecosystem.
        </p>
        <div className="mt-12 text-sm text-blue-200 opacity-70">
          <p>✓ Manage Projects & Experiences</p>
          <p>✓ Update Skills & Certifications</p>
          <p>✓ Edit Profile & Content</p>
        </div>
      </div>

      {/* Right Side - Login */}
      <div className="flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="md:hidden text-5xl mb-4">🎛️</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to access AdminOS</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 rounded-xl font-medium shadow-sm hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {loading ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Only authorized administrators can access this panel.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
