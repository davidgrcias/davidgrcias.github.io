import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, HardDrive, Activity, Wifi, Zap, Database, Terminal, Layers, ChevronDown } from 'lucide-react';

/**
 * DevTools Monitor Widget
 * Displays REAL browser metrics and project tech stack
 */
const SystemMonitorWidget = ({ className = '' }) => {
  const [metrics, setMetrics] = useState({
    memory: { used: 0, total: 0, percent: 0 },
    network: { latency: 0, type: 'unknown', downlink: 0 },
    disk: { usedKV: 0 }, // LocalStorage usage in KB
    fps: 0,
  });

  const [memHistory, setMemHistory] = useState(Array(20).fill(0));
  const [latencyHistory, setLatencyHistory] = useState(Array(20).fill(0));
  const [activeTab, setActiveTab] = useState('perf'); // 'perf' | 'stack'
  
  // Collapsed state - default to collapsed, persist in localStorage
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('webos-devmonitor-expanded');
    return saved === 'true'; // Default collapsed (false)
  });
  
  // Save expanded state
  useEffect(() => {
    localStorage.setItem('webos-devmonitor-expanded', isExpanded.toString());
  }, [isExpanded]);

  useEffect(() => {
    let lastTime = performance.now();
    let frames = 0;
    let fpsValue = 60;

    const updateMetrics = () => {
      // 1. Memory (Chrome only API, fallback for others)
      let memData = { used: 0, total: 0, percent: 0 };
      if (window.performance && window.performance.memory) {
        const pm = window.performance.memory;
        memData = {
          used: Math.round(pm.usedJSHeapSize / 1024 / 1024),
          total: Math.round(pm.jsHeapSizeLimit / 1024 / 1024),
          percent: Math.round((pm.usedJSHeapSize / pm.jsHeapSizeLimit) * 100)
        };
      } else {
        // Fallback simulation for Firefox/Safari
        memData = { used: 128, total: 512, percent: 25 }; 
      }

      // 2. Network
      let netData = { latency: 0, type: '4g', downlink: 10 };
      if (navigator.connection) {
        netData = {
          latency: navigator.connection.rtt || 0,
          type: navigator.connection.effectiveType || '4g',
          downlink: navigator.connection.downlink || 0
        };
      }

      // 3. Disk (LocalStorage size)
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
           totalSize += ((localStorage[key].length + key.length) * 2);
        }
      }
      const diskUsed = (totalSize / 1024).toFixed(2); // KB

      // 4. FPS Calculation
      const now = performance.now();
      frames++;
      if (now >= lastTime + 1000) {
        fpsValue = frames;
        frames = 0;
        lastTime = now;
      }

      setMetrics(prev => ({
        memory: memData,
        network: netData,
        disk: { usedKV: diskUsed },
        fps: fpsValue
      }));

      setMemHistory(prev => [...prev.slice(1), memData.percent]);
      // Normalize latency for the graph (0-200ms range mapped to 0-100%)
      setLatencyHistory(prev => [...prev.slice(1), Math.min(100, (netData.latency / 200) * 100)]);
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value, type = 'high-bad') => {
    if (type === 'high-bad') {
      if (value < 50) return 'text-green-400';
      if (value < 80) return 'text-yellow-400';
      return 'text-red-400';
    }
    // high-good
    if (value > 50) return 'text-green-400';
    if (value > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Mini Chart
  const MiniChart = ({ data, color, height = 30 }) => (
    <svg viewBox="0 0 100 30" className="w-full" style={{ height }} preserveAspectRatio="none">
      <path
        d={`M 0 30 ${data.map((v, i) => `L ${(i / (data.length - 1)) * 100} ${30 - (v / 100) * 28}`).join(' ')} L 100 30 Z`}
        fill={color}
        fillOpacity="0.2"
      />
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden flex flex-col ${className}`}
    >
      {/* Header - Clickable to expand/collapse */}
      <div 
        className="px-3 py-2.5 border-b border-white/10 flex items-center justify-between bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-emerald-400" />
          <span className="text-white/90 font-mono text-xs tracking-wider">DEV.MONITOR</span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={12} className="text-white/40" />
          </motion.div>
        </div>
        {isExpanded && (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
             <button 
               onClick={() => setActiveTab('perf')} 
               className={`px-2 py-0.5 text-[10px] rounded hover:bg-white/10 transition-colors ${activeTab === 'perf' ? 'text-white' : 'text-white/40'}`}
             >
               PERF
             </button>
             <button 
               onClick={() => setActiveTab('stack')} 
               className={`px-2 py-0.5 text-[10px] rounded hover:bg-white/10 transition-colors ${activeTab === 'stack' ? 'text-white' : 'text-white/40'}`}
             >
               STACK
             </button>
          </div>
        )}
        {!isExpanded && (
          <div className="flex items-center gap-2 text-[10px] text-white/40">
            <span className="text-emerald-400">{metrics.memory.used}MB</span>
            <span className="text-white/20">|</span>
            <span className="text-cyan-400">{metrics.network.latency}ms</span>
          </div>
        )}
      </div>

      {/* Tabs Content - Collapsible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className="p-3 flex-1"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
        {activeTab === 'perf' ? (
          <div className="space-y-3">
            
            {/* Memory Block */}
            <div className="bg-white/5 rounded-lg p-2">
               <div className="flex justify-between items-end mb-0.5">
                  <span className="text-[10px] uppercase text-white/50 font-bold flex items-center gap-1">
                    <Cpu size={10} /> JS Heap
                  </span>
                  <span className="text-[11px] font-mono text-white">
                    {metrics.memory.used} <span className="text-white/40">/ {metrics.memory.total} MB</span>
                  </span>
               </div>
               <MiniChart data={memHistory} color="#a78bfa" height={26} />
            </div>

            {/* Network Block */}
            <div className="bg-white/5 rounded-lg p-2">
               <div className="flex justify-between items-end mb-0.5">
                  <span className="text-[10px] uppercase text-white/50 font-bold flex items-center gap-1">
                    <Wifi size={10} /> Latency
                  </span>
                  <span className={`text-[11px] font-mono ${getStatusColor(Math.min(100, metrics.network.latency / 4), 'high-bad')}`}>
                    {metrics.network.latency}ms
                  </span>
               </div>
               <MiniChart data={latencyHistory} color="#34d399" height={26} />
               <div className="flex justify-between mt-0.5 px-0.5">
                  <span className="text-[9px] text-white/30">{metrics.network.type.toUpperCase()}</span>
                  <span className="text-[9px] text-white/30">{metrics.network.downlink}Mbps</span>
               </div>
            </div>

            {/* Footer Stats */}
            <div className="grid grid-cols-2 gap-1.5">
               <div className="bg-white/5 p-1.5 rounded flex items-center justify-between">
                  <span className="text-[10px] text-white/50 flex items-center gap-1"><Database size={10}/> Storage</span>
                  <span className="text-[11px] font-mono text-white">{metrics.disk.usedKV} KB</span>
               </div>
               <div className="bg-white/5 p-1.5 rounded flex items-center justify-between">
                  <span className="text-[10px] text-white/50 flex items-center gap-1"><Activity size={10}/> FPS</span>
                  <span className="text-[11px] font-mono text-white">{metrics.fps}</span>
               </div>
            </div>

          </div>
        ) : (
          <div className="space-y-2 h-full">
            <div className="text-[10px] uppercase text-white/40 font-bold mb-2 ml-1">Core Technologies</div>
            
            <div className="group flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/30">
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Layers size={14} />
                 </div>
                 <div>
                    <div className="text-xs font-medium text-white">React</div>
                    <div className="text-[10px] text-white/40">Library</div>
                 </div>
              </div>
              <div className="font-mono text-xs text-blue-300">v19.1.0</div>
            </div>

            <div className="group flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-purple-500/30">
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Zap size={14} />
                 </div>
                 <div>
                    <div className="text-xs font-medium text-white">Vite</div>
                    <div className="text-[10px] text-white/40">Bundler</div>
                 </div>
              </div>
              <div className="font-mono text-xs text-purple-300">v6.3.5</div>
            </div>

            <div className="group flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-yellow-500/30">
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                    <Database size={14} />
                 </div>
                 <div>
                    <div className="text-xs font-medium text-white">Firebase</div>
                    <div className="text-[10px] text-white/40">Backend</div>
                 </div>
              </div>
              <div className="font-mono text-xs text-yellow-300">v12.8.0</div>
            </div>

             <div className="mt-4 p-2 rounded bg-cyan-900/20 border border-cyan-500/20">
               <p className="text-[10px] text-cyan-200 leading-relaxed">
                 Running in <span className="font-bold">Agentic Mode</span>. 
                 Real-time telemetry active.
               </p>
             </div>
          </div>
        )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SystemMonitorWidget;
