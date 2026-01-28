import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Eye, Clock, Award, Zap, MousePointer } from 'lucide-react';
import { useOS } from '../../contexts/OSContext';
import { useAchievements } from '../../hooks/useAchievements';

const PortfolioStats = ({ isOpen, onClose }) => {
  const { windows } = useOS();
  const [stats, setStats] = useState({
    visits: 0,
    appsOpened: 0,
    timeSpent: 0,
    clicks: 0,
    achievementsUnlocked: 0,
    totalPoints: 0,
  });
  const [sessionStart] = useState(Date.now());

  // Load stats from localStorage
  useEffect(() => {
    const loadStats = () => {
      const savedStats = localStorage.getItem('webos-stats');
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        setStats(parsed);
        
        // Increment visits
        parsed.visits = (parsed.visits || 0) + 1;
        localStorage.setItem('webos-stats', JSON.stringify(parsed));
      } else {
        const initialStats = { visits: 1, appsOpened: 0, timeSpent: 0, clicks: 0, achievementsUnlocked: 0, totalPoints: 0 };
        setStats(initialStats);
        localStorage.setItem('webos-stats', JSON.stringify(initialStats));
      }
    };

    loadStats();

    // Track clicks
    const handleClick = () => {
      setStats(prev => {
        const newStats = { ...prev, clicks: (prev.clicks || 0) + 1 };
        localStorage.setItem('webos-stats', JSON.stringify(newStats));
        return newStats;
      });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Track app opens
  useEffect(() => {
    const currentCount = windows.length;
    if (currentCount > 0) {
      setStats(prev => {
        const newStats = { ...prev, appsOpened: Math.max(prev.appsOpened || 0, currentCount) };
        localStorage.setItem('webos-stats', JSON.stringify(newStats));
        return newStats;
      });
    }
  }, [windows]);

  // Track time spent (update every second)
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - sessionStart) / 1000);
      setStats(prev => ({ ...prev, sessionTime: timeSpent }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, sessionStart]);

  // Get achievements data
  useEffect(() => {
    const achievementsData = localStorage.getItem('webos-achievements');
    if (achievementsData) {
      const unlocked = JSON.parse(achievementsData);
      setStats(prev => ({ ...prev, achievementsUnlocked: unlocked.length }));
    }
  }, [isOpen]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTotalTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 hover:border-zinc-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-500/20`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-zinc-400">{label}</div>
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed top-20 right-6 z-50 w-80"
      >
        <div className="bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-white" />
                <h2 className="font-bold text-white">Portfolio Stats</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-xs text-blue-100">Your activity dashboard</p>
          </div>

          {/* Stats Grid */}
          <div className="p-4 space-y-3">
            <StatCard
              icon={Eye}
              label="Total Visits"
              value={stats.visits}
              color="blue"
            />
            
            <StatCard
              icon={Zap}
              label="Apps Opened (Peak)"
              value={stats.appsOpened || 0}
              color="yellow"
            />

            <StatCard
              icon={Clock}
              label="Session Time"
              value={formatTime(stats.sessionTime || 0)}
              color="purple"
            />

            <StatCard
              icon={Clock}
              label="Total Time"
              value={formatTotalTime(stats.timeSpent || 0)}
              color="cyan"
            />

            <StatCard
              icon={MousePointer}
              label="Total Clicks"
              value={stats.clicks || 0}
              color="green"
            />

            <StatCard
              icon={Award}
              label="Achievements Unlocked"
              value={stats.achievementsUnlocked || 0}
              color="orange"
            />

            {/* Real-time indicator */}
            <div className="mt-4 pt-4 border-t border-zinc-700">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-zinc-400">Live</span>
                </div>
                <span className="text-zinc-500 font-mono">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Milestones */}
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h3 className="text-xs font-semibold text-blue-400 mb-2">🎯 Next Milestone</h3>
              <div className="space-y-1 text-xs text-zinc-300">
                {stats.appsOpened < 5 && <div>• Open 5 different apps</div>}
                {stats.achievementsUnlocked < 5 && <div>• Unlock 5 achievements</div>}
                {stats.visits < 10 && <div>• Make 10 visits</div>}
                {stats.appsOpened >= 5 && stats.achievementsUnlocked >= 5 && stats.visits >= 10 && (
                  <div className="text-green-400">✅ All milestones completed!</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PortfolioStats;
