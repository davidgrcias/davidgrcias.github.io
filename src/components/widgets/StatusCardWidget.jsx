import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Linkedin, Github, Sparkles, Loader2, Youtube } from 'lucide-react';
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
          avatar: profileData.avatar || profileData.photoUrl || '/profilpict.webp',
          status: profileData.status || 'open', // 'open' | 'employed' | 'busy'
          availableFor: profileData.availableFor || ['Full-time', 'Freelance'],
          socials: {
            youtube: profileData.socials?.youtube?.url,
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
          avatar: '/profilpict.webp',
          status: 'open',
          availableFor: ['Full-time', 'Freelance'],
          socials: {
            youtube: 'https://youtube.com/@DavidGTech',
            linkedin: 'https://linkedin.com/in/davidgrcias',
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
        {/* Header Row: Photo + Role + Status Dot */}
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
          {/* Profile Photo - Double click to access admin */}
          <div className="relative flex-shrink-0">
            <img 
              src={profile.avatar} 
              alt={profile.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white/20 shadow-lg cursor-pointer hover:border-cyan-400/50 transition-colors"
              onDoubleClick={() => window.open('/admin', '_blank')}
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
