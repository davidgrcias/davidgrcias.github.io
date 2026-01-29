import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, HardDrive, Activity, Wifi, Clock, Zap } from 'lucide-react';

/**
 * System Monitor Widget Component
 * Displays simulated CPU, RAM, and system stats with animated graphs
 */
const SystemMonitorWidget = ({ className = '' }) => {
  const [stats, setStats] = useState({
    cpu: 0,
    ram: 0,
    disk: 0,
    network: 0,
    uptime: 0,
    processes: 0,
  });

  const [cpuHistory, setCpuHistory] = useState(Array(20).fill(0));
  const [ramHistory, setRamHistory] = useState(Array(20).fill(0));

  useEffect(() => {
    // Simulate system stats
    const updateStats = () => {
      const newCpu = Math.min(100, Math.max(5, stats.cpu + (Math.random() * 30 - 15)));
      const newRam = Math.min(90, Math.max(30, stats.ram + (Math.random() * 10 - 5)));
      
      setStats(prev => ({
        cpu: Math.round(newCpu),
        ram: Math.round(newRam),
        disk: Math.round(45 + Math.random() * 10),
        network: Math.round(Math.random() * 100),
        uptime: prev.uptime + 1,
        processes: Math.round(80 + Math.random() * 40),
      }));

      setCpuHistory(prev => [...prev.slice(1), Math.round(newCpu)]);
      setRamHistory(prev => [...prev.slice(1), Math.round(newRam)]);
    };

    // Initial values
    setStats({
      cpu: 25,
      ram: 45,
      disk: 48,
      network: 30,
      uptime: 0,
      processes: 95,
    });

    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (value) => {
    if (value < 50) return 'text-green-400';
    if (value < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBarColor = (value) => {
    if (value < 50) return 'bg-green-500';
    if (value < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Mini line chart component
  const MiniChart = ({ data, color }) => (
    <svg viewBox="0 0 100 30" className="w-full h-8" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path
        d={`M 0 30 ${data.map((v, i) => `L ${(i / (data.length - 1)) * 100} ${30 - (v / 100) * 28}`).join(' ')} L 100 30 Z`}
        fill={`url(#gradient-${color})`}
      />
      {/* Line */}
      <path
        d={data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (data.length - 1)) * 100} ${30 - (v / 100) * 28}`).join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-cyan-400" />
          <span className="text-white font-medium text-sm">System Monitor</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <Clock size={12} />
          <span>{formatUptime(stats.uptime)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* CPU Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-cyan-400" />
              <span className="text-white/80 text-sm">CPU</span>
            </div>
            <span className={`text-sm font-mono ${getStatusColor(stats.cpu)}`}>
              {stats.cpu}%
            </span>
          </div>
          <MiniChart data={cpuHistory} color="#22d3ee" />
          <div className="h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${getBarColor(stats.cpu)}`}
              initial={{ width: 0 }}
              animate={{ width: `${stats.cpu}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* RAM Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive size={14} className="text-purple-400" />
              <span className="text-white/80 text-sm">Memory</span>
            </div>
            <span className={`text-sm font-mono ${getStatusColor(stats.ram)}`}>
              {stats.ram}%
            </span>
          </div>
          <MiniChart data={ramHistory} color="#a855f7" />
          <div className="h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${getBarColor(stats.ram)}`}
              initial={{ width: 0 }}
              animate={{ width: `${stats.ram}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
          <div className="text-center p-2 rounded-lg bg-white/5">
            <HardDrive size={14} className="mx-auto text-blue-400 mb-1" />
            <p className="text-[10px] text-white/50">Disk</p>
            <p className="text-xs font-medium text-white">{stats.disk}%</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/5">
            <Wifi size={14} className="mx-auto text-green-400 mb-1" />
            <p className="text-[10px] text-white/50">Network</p>
            <p className="text-xs font-medium text-white">{stats.network} Mb/s</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/5">
            <Zap size={14} className="mx-auto text-yellow-400 mb-1" />
            <p className="text-[10px] text-white/50">Processes</p>
            <p className="text-xs font-medium text-white">{stats.processes}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SystemMonitorWidget;
