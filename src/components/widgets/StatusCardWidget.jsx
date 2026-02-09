import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Linkedin, Github, Sparkles, Youtube, AlertCircle, RefreshCw } from 'lucide-react';
import { getUserProfile } from '../../data/userProfile';
import OptimizedImage from '../common/OptimizedImage';
import StatusCardSkeleton from './StatusCardSkeleton';

/**
 * Professional Status Card Widget
 * Displays professional status, availability, and quick contact links
 * NOW SYNCS WITH ADMIN PANEL via Firestore
 */
const StatusCardWidget = ({ className = '' }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load profile data on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const profileData = await getUserProfile('en');

      setProfile({
        name: profileData.name,
        role: profileData.title,
        location: profileData.location,
        avatar: profileData.avatar || profileData.photoUrl || '/profilpict.webp',
        status: profileData.status || 'open',
        availableFor: profileData.availableFor || ['Full-time', 'Freelance'],
        socials: {
          youtube: profileData.socials?.youtube?.url,
          linkedin: profileData.socials?.linkedin?.url,
          github: profileData.socials?.github?.url,
        }
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  // Show loading skeleton while loading
  if (loading && !profile) {
    return <StatusCardSkeleton className={className} />;
  }

  // Show error state with retry button
  if (error && !profile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative overflow-hidden rounded-2xl border border-red-500/30 ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-orange-500 opacity-20" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />

        <div className="relative p-6 text-white text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <h3 className="text-sm font-semibold text-red-300">Failed to Load Profile</h3>
          <p className="text-xs text-white/60">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadProfile}
            className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-xs font-medium text-red-300 flex items-center gap-2 mx-auto transition-colors"
          >
            <RefreshCw size={12} />
            Retry
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Removed blocking loader - Content determines visibility
  if (!profile) return null;

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
        {/* Header Row: Photo + Role + Status Dot */}
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
          {/* Profile Photo - Double click to access admin */}
          <div className="relative flex-shrink-0">
            <OptimizedImage
              src={profile.avatar}
              alt={profile.name}
              width={80}
              height={80}
              quality={90}
              className="w-10 h-10 rounded-full object-cover border-2 border-white/20 shadow-lg cursor-pointer hover:border-cyan-400/50 transition-colors"
              onDoubleClick={() => window.open('/admin', '_blank')}

              loading="eager"
              title="Double-click for admin"
            />
          </div>

          {/* Name + Role + Location */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white truncate leading-tight">
              {profile.name}
            </h3>
            <p className="text-[11px] text-white/70 truncate leading-tight mt-0.5">
              {profile.role}
            </p>
            <div className="flex items-center gap-1 text-white/50 text-[10px] mt-0.5">
              <MapPin size={9} />
              <span className="truncate">{profile.location}</span>
              <span>🇮🇩</span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
            <motion.div
              className={`w-3 h-3 rounded-full ${currentStatus.pulse ? 'bg-emerald-500' : 'bg-amber-500'}`}
              animate={currentStatus.pulse ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[9px] text-white/40 font-medium uppercase tracking-wider">
              {currentStatus.pulse ? 'Open' : 'Busy'}
            </span>
          </div>
        </div>

        {/* Available For Tags - Centered */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles size={11} className="text-yellow-400" />
          {profile.availableFor.map((type) => (
            <span
              key={type}
              className="px-2.5 py-0.5 bg-white/10 border border-white/10 rounded text-[10px] text-white/80"
            >
              {type}
            </span>
          ))}
        </div>

        {/* Connect Section - Labeled */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-center gap-3">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Connect</span>
            <div className="flex items-center gap-2">
              {profile.socials?.youtube && (
                <motion.button
                  onClick={() => handleLinkClick(profile.socials.youtube)}
                  whileHover={{ scale: 1.15, y: -1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/5 hover:border-red-500/30 transition-all group"
                  title="YouTube"
                >
                  <Youtube size={14} className="text-white/60 group-hover:text-red-400 transition-colors" />
                </motion.button>
              )}

              {profile.socials?.linkedin && (
                <motion.button
                  onClick={() => handleLinkClick(profile.socials.linkedin)}
                  whileHover={{ scale: 1.15, y: -1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-500/30 transition-all group"
                  title="LinkedIn"
                >
                  <Linkedin size={14} className="text-white/60 group-hover:text-blue-400 transition-colors" />
                </motion.button>
              )}

              {profile.socials?.github && (
                <motion.button
                  onClick={() => handleLinkClick(profile.socials.github)}
                  whileHover={{ scale: 1.15, y: -1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/5 hover:border-purple-500/30 transition-all group"
                  title="GitHub"
                >
                  <Github size={14} className="text-white/60 group-hover:text-purple-400 transition-colors" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatusCardWidget;
