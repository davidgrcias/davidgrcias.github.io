import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Mail, Linkedin, Github, ExternalLink, Sparkles, Coffee, Loader2 } from 'lucide-react';
import { getUserProfile } from '../../data/userProfile';

/**
 * Professional Status Card Widget
 * Displays professional status, availability, and quick contact links
 * NOW SYNCS WITH ADMIN PANEL via Firestore
 */
const StatusCardWidget = ({ className = '' }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Fetch profile from Firestore
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await getUserProfile('en');
        
        // Transform profile data for this component
        setProfile({
          name: profileData.name,
          role: profileData.title,
          location: profileData.location,
          status: profileData.status || 'open', // 'open' | 'employed' | 'busy'
          availableFor: profileData.availableFor || ['Full-time', 'Freelance'],
          links: {
            email: profileData.email,
            linkedin: profileData.socials?.linkedin?.url,
            github: profileData.socials?.github?.url,
          }
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback data
        setProfile({
          name: 'David Garcia',
          role: 'Software Developer',
          location: 'Jakarta, Indonesia',
          status: 'open',
          availableFor: ['Full-time', 'Freelance'],
          links: {
            email: 'davidgarciasaragih7@gmail.com',
            linkedin: 'https://linkedin.com/in/david-garcia-saragih',
            github: 'https://github.com/davidgrcias',
          }
        });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const statusConfig = {
    open: {
      label: 'Open to Work',
      color: 'from-emerald-400 to-green-500',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/50',
      textColor: 'text-emerald-400',
      pulse: true,
    },
    employed: {
      label: 'Currently Employed',
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/50',
      textColor: 'text-blue-400',
      pulse: false,
    },
    busy: {
      label: 'Not Available',
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/50',
      textColor: 'text-orange-400',
      pulse: false,
    }
  };

  // Loading state
  if (loading || !profile) {
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-white/10 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 opacity-20" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
        <div className="relative p-3.5 text-white flex items-center justify-center h-full min-h-[180px]">
          <Loader2 className="w-6 h-6 animate-spin text-white/50" />
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[profile.status] || statusConfig.open;

  const handleEmailClick = () => {
    window.location.href = `mailto:${profile.links.email}?subject=Hello from your Portfolio!`;
  };

  const handleLinkClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 ${className}`}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentStatus.color} opacity-20`} />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />

      {/* Content */}
      <div className="relative p-3.5 text-white">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-3">
          <motion.div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${currentStatus.bgColor} border ${currentStatus.borderColor}`}
            animate={currentStatus.pulse ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {currentStatus.pulse && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
            <span className={`text-xs font-semibold ${currentStatus.textColor}`}>
              {currentStatus.label}
            </span>
          </motion.div>
          
          <div className="flex items-center gap-1 text-white/50">
            <Coffee size={14} />
          </div>
        </div>

        {/* Profile Info */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Briefcase size={15} className="text-cyan-400" />
            <h3 className="text-[13px] font-semibold text-white">{profile.role}</h3>
          </div>
          <div className="flex items-center gap-1.5 text-white/60 text-xs">
            <MapPin size={11} />
            <span>{profile.location}</span>
            <span className="ml-1">🇮🇩</span>
          </div>
        </div>

        {/* Available For Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Sparkles size={11} className="text-yellow-400 mr-0.5" />
          {profile.availableFor.map((type) => (
            <span
              key={type}
              className="px-2 py-0.5 bg-white/10 border border-white/10 rounded text-[10px] text-white/80"
            >
              {type}
            </span>
          ))}
        </div>

        {/* Quick Links - Compact inline icons */}
        <div className="flex items-center justify-center gap-2 pt-2.5 border-t border-white/10">
          <motion.button
            onClick={handleEmailClick}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/5 hover:border-cyan-500/30 transition-all group"
            title="Email"
          >
            <Mail size={16} className="text-white/60 group-hover:text-cyan-400 transition-colors" />
          </motion.button>
          
          <motion.button
            onClick={() => handleLinkClick(profile.links.linkedin)}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-500/30 transition-all group"
            title="LinkedIn"
          >
            <Linkedin size={16} className="text-white/60 group-hover:text-blue-400 transition-colors" />
          </motion.button>
          
          <motion.button
            onClick={() => handleLinkClick(profile.links.github)}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/5 hover:border-purple-500/30 transition-all group"
            title="GitHub"
          >
            <Github size={16} className="text-white/60 group-hover:text-purple-400 transition-colors" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default StatusCardWidget;
