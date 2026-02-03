import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Globe, Code, Mail, Linkedin, Github, TrendingUp, Sparkles, Youtube, Loader2, Copy, FileText, Download } from 'lucide-react';
import { getUserProfile } from '../../data/userProfile';
import { getSkills } from '../../data/skills';
import { useOS } from '../../contexts/OSContext';

/**
 * AboutMeApp - Personal information and bio in a beautiful card layout
 * Displays comprehensive personal details, skills, and social links
 * Now fetches data from Firestore for synchronization with Admin Panel
 */
const AboutMeApp = ({ id }) => {
  const { updateWindow } = useOS();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState(null);

  // Context Menu
  useEffect(() => {
    if (id && profile) {
        updateWindow(id, {
            contextMenuOptions: [
                {
                    label: 'Copy Contact Info',
                    icon: <Copy size={16} />,
                    onClick: () => {
                        const info = `Name: ${profile.name}\nEmail: ${profile.email}\nWebsite: ${profile.website}`;
                        navigator.clipboard.writeText(info);
                        // Optional: Show toast
                    },
                    shortcut: 'Ctrl+C',
                },
                { separator: true },
                {
                    label: 'Download CV',
                    icon: <Download size={16} />,
                    onClick: () => {
                         if (profile.cvUrl) {
                             window.open(profile.cvUrl, '_blank');
                         } else {
                             alert('CV URL not available');
                         }
                    },
                },
                {
                   label: 'Open Portfolio',
                   icon: <Globe size={16} />,
                   onClick: () => window.open(`https://${profile.website}`, '_blank'),
                }
            ]
        });
    }
  }, [id, profile, updateWindow]);

  // Fetch data from Firestore
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, skillsData] = await Promise.all([
          getUserProfile('en'),
          getSkills('en')
        ]);
        setProfile(profileData);
        setSkills(skillsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Loading state
  if (loading || !profile) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Social Links from profile
  const socials = [
    { name: "GitHub", icon: <Github size={20} />, link: profile.socials?.github?.url, color: "hover:text-purple-400" },
    { name: "LinkedIn", icon: <Linkedin size={20} />, link: profile.socials?.linkedin?.url, color: "hover:text-blue-400" },
    { name: "YouTube", icon: <Youtube size={20} />, link: profile.socials?.youtube?.url, color: "hover:text-red-400" },
  ].filter(s => s.link);

  const tabs = [
    { id: 'personal', label: 'Personal', icon: <User size={16} /> },
    { id: 'skills', label: 'Skills', icon: <Code size={16} /> },
    { id: 'contact', label: 'Contact', icon: <Mail size={16} /> },
  ];

  // Format skills for display
  const formattedSkills = skills ? {
    frontend: skills.technical?.find(t => t.category === 'Front-End')?.skills || [],
    backend: skills.technical?.find(t => t.category === 'Back-End')?.skills || [],
    tools: skills.technical?.find(t => t.category === 'DevOps & Deployment')?.skills || [],
    soft: skills.soft || [],
  } : { frontend: [], backend: [], tools: [], soft: [] };

  return (
    <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 overflow-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl ring-4 ring-blue-500/20">
            <img 
              src={profile.avatar || "/profilpict.webp"}
              alt={profile.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/profilpict.webp';
              }}
              loading="eager"
              width="128"
              height="128"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{profile.name}</h1>
          <p className="text-lg text-zinc-400">{profile.title}</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-zinc-500">
            <MapPin size={16} />
            <span>{profile.location}</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-zinc-800/50 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Personal Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              {/* Philosophy Card */}
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3 text-blue-400">
                  <Sparkles size={20} />
                  <h3 className="font-semibold">About Me</h3>
                </div>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-line">{profile.bio}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={<User />} label="Name" value={profile.name} />
                <InfoCard icon={<Code />} label="Role" value={profile.title} />
                <InfoCard icon={<MapPin />} label="Location" value={profile.location} />
                <InfoCard icon={<Globe />} label="Portfolio" value={profile.website} />
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <SkillSection title="Frontend Development" skills={formattedSkills.frontend} color="blue" />
              <SkillSection title="Backend Development" skills={formattedSkills.backend} color="green" />
              <SkillSection title="Tools & Technologies" skills={formattedSkills.tools} color="purple" />
              <SkillSection title="Soft Skills" skills={formattedSkills.soft} color="orange" />
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              {/* Contact Methods */}
              <div className="space-y-4">
                <ContactCard 
                  icon={<Mail />} 
                  label="Email" 
                  value={profile.email}
                  link={`mailto:${profile.email}`}
                />
                <ContactCard 
                  icon={<Globe />} 
                  label="Portfolio" 
                  value={profile.website}
                  link={`https://${profile.website}`}
                />
              </div>

              {/* Social Links */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp size={20} />
                  Social Media
                </h3>
                <div className="flex flex-wrap gap-3">
                  {socials.map((social) => (
                    <a
                      key={social.name}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                        flex items-center gap-2 px-4 py-2 bg-zinc-700/50 rounded-lg
                        border border-zinc-600 hover:border-zinc-500
                        text-zinc-400 ${social.color} transition-all duration-200
                        hover:scale-105 hover:shadow-lg
                      `}
                    >
                      {social.icon}
                      <span className="font-medium">{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-center">
                <h3 className="text-white font-bold text-xl mb-2">Let's Build Something Amazing!</h3>
                <p className="text-blue-100 mb-4">I'm always open to discussing new projects, creative ideas, or opportunities.</p>
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Get In Touch
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Helper Components
const InfoCard = ({ icon, label, value }) => (
  <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 flex items-center gap-3">
    <div className="text-blue-400">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  </div>
);

const SkillSection = ({ title, skills, color }) => {
  const colorMap = {
    blue: 'bg-blue-600/10 border-blue-500/30 text-blue-400',
    green: 'bg-green-600/10 border-green-500/30 text-green-400',
    purple: 'bg-purple-600/10 border-purple-500/30 text-purple-400',
    orange: 'bg-orange-600/10 border-orange-500/30 text-orange-400',
  };

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
      <h3 className="text-white font-semibold mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${colorMap[color]}`}
          >
            {skill}
          </motion.span>
        ))}
      </div>
    </div>
  );
};

const ContactCard = ({ icon, label, value, link }) => (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className="block bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 hover:border-blue-500/50 hover:bg-zinc-800 transition-all duration-200 group"
  >
    <div className="flex items-center gap-3">
      <div className="text-zinc-400 group-hover:text-blue-400 transition-colors">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div className="flex-1">
        <p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p>
        <p className="text-white font-medium group-hover:text-blue-400 transition-colors">{value}</p>
      </div>
      <div className="text-zinc-600 group-hover:text-blue-400 transition-colors">
        <TrendingUp size={20} />
      </div>
    </div>
  </a>
);

export default AboutMeApp;
