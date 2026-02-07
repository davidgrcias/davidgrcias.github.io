import React from 'react';
import { Database, CheckCircle, XCircle, AlertCircle, Code, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * AI Knowledge Base - DEPRECATED
 * 
 * This page is no longer used. The AI chatbot now reads data directly
 * from src/data/ files, eliminating the need for separate knowledge management.
 * 
 * Old system: Maintain portfolio data + separately manage Firestore knowledge_base
 * New system: Edit src/data/ → AI knows automatically (single source of truth)
 */
const Knowledge = () => {
  return (
    <div className="min-h-screen bg-zinc-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-800 rounded-full mb-4">
            <Database size={32} className="text-zinc-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Knowledge Base</h1>
          <p className="text-zinc-400">This feature has been deprecated and replaced with a better system</p>
        </div>

        {/* Status Card */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-amber-400 mb-2">System Upgraded</h2>
              <p className="text-zinc-300 text-sm leading-relaxed">
                The AI Knowledge Base management system is no longer needed. The chatbot now reads data
                directly from <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs font-mono text-blue-400">src/data/</code> files,
                eliminating double work and maintenance overhead.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Old System */}
          <div className="bg-zinc-800/50 border border-red-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <XCircle size={20} className="text-red-400" />
              <h3 className="font-semibold text-red-400">Old System</h3>
            </div>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-red-400 shrink-0 mt-0.5">×</span>
                <span>Maintain data in <code className="text-xs font-mono">src/data/</code></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 shrink-0 mt-0.5">×</span>
                <span>Separately manage Firestore knowledge_base</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 shrink-0 mt-0.5">×</span>
                <span>Run migration scripts manually</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 shrink-0 mt-0.5">×</span>
                <span>Generate embeddings per message</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 shrink-0 mt-0.5">×</span>
                <span>Double work on every change</span>
              </li>
            </ul>
          </div>

          {/* New System */}
          <div className="bg-zinc-800/50 border border-green-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={20} className="text-green-400" />
              <h3 className="font-semibold text-green-400">New System</h3>
            </div>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-green-400 shrink-0 mt-0.5">✓</span>
                <span>Edit <code className="text-xs font-mono">src/data/</code> files directly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 shrink-0 mt-0.5">✓</span>
                <span>AI reads automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 shrink-0 mt-0.5">✓</span>
                <span>No manual migration needed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 shrink-0 mt-0.5">✓</span>
                <span>Zero embedding API calls</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 shrink-0 mt-0.5">✓</span>
                <span>Single source of truth</span>
              </li>
            </ul>
          </div>
        </div>

        {/* What to do now */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <Zap size={24} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-blue-400 mb-2">How to Manage AI Knowledge Now</h2>
              <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                All data is managed through admin pages or by editing files directly:
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Code size={16} className="text-zinc-500" />
              <span className="text-zinc-400">Projects:</span>
              <Link to="/admin/projects" className="text-blue-400 hover:text-blue-300 hover:underline">
                /admin/projects
              </Link>
              <span className="text-zinc-600">or</span>
              <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs font-mono text-zinc-400">src/data/projects.js</code>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Code size={16} className="text-zinc-500" />
              <span className="text-zinc-400">Experience:</span>
              <Link to="/admin/experiences" className="text-blue-400 hover:text-blue-300 hover:underline">
                /admin/experiences
              </Link>
              <span className="text-zinc-600">or</span>
              <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs font-mono text-zinc-400">src/data/experiences.js</code>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Code size={16} className="text-zinc-500" />
              <span className="text-zinc-400">Skills:</span>
              <Link to="/admin/skills" className="text-blue-400 hover:text-blue-300 hover:underline">
                /admin/skills
              </Link>
              <span className="text-zinc-600">or</span>
              <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs font-mono text-zinc-400">src/data/skills.js</code>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Code size={16} className="text-zinc-500" />
              <span className="text-zinc-400">Profile:</span>
              <Link to="/admin/profile" className="text-blue-400 hover:text-blue-300 hover:underline">
                /admin/profile
              </Link>
              <span className="text-zinc-600">or</span>
              <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs font-mono text-zinc-400">src/data/userProfile.js</code>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Code size={16} className="text-zinc-500" />
              <span className="text-zinc-400">Personal Info:</span>
              <span className="text-zinc-600">NEW!</span>
              <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs font-mono text-zinc-400">src/data/additionalInfo.js</code>
            </div>
          </div>
        </div>

        {/* Back button */}
        <div className="mt-6 text-center">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Knowledge;
