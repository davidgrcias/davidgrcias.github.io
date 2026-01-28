import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Globe, Code, Mail, Linkedin, Github, TrendingUp, Sparkles } from 'lucide-react';

/**
 * AboutMeApp - Personal information and bio in a beautiful card layout
 * Displays comprehensive personal details, skills, and social links
 */
const AboutMeApp = () => {
  const [activeTab, setActiveTab] = useState('personal');

  // Personal Information
  const personalInfo = {
    name: "David Garcia Saragih",
    title: "Full-Stack Developer & UI/UX Enthusiast",
    location: "Jakarta",
    email: "davidgarciasaragih7@gmail.com",
    portfolio: "davidgrcias.github.io",
    summary: "Full-stack developer focused on crafting fast, accessible, and delightful web experiences. I enjoy turning complex ideas into clean, scalable products.",
  };

  // Skills
  const skills = {
    frontend: ["React.js", "Next.js", "Tailwind CSS", "TypeScript", "Framer Motion", "Responsive Design"],
    backend: ["Laravel", "PHP", "MySQL", "REST API", "Python", "Firebase"],
    tools: ["Git & GitHub", "VS Code", "Vite", "Vercel", "Postman", "Figma"],
    soft: ["Problem Solving", "Team Collaboration", "Quick Learner", "Creative Thinking", "Time Management"],
  };

  // Social Links
  const socials = [
    { name: "GitHub", icon: <Github size={20} />, link: "https://github.com/davidgrcias", color: "hover:text-purple-400" },
    { name: "LinkedIn", icon: <Linkedin size={20} />, link: "https://linkedin.com/in/david-garcia-saragih", color: "hover:text-blue-400" },
  ];

  const tabs = [
    { id: 'personal', label: 'Personal', icon: <User size={16} /> },
    { id: 'skills', label: 'Skills', icon: <Code size={16} /> },
    { id: 'contact', label: 'Contact', icon: <Mail size={16} /> },
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 overflow-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-6xl shadow-xl">
            👨‍💻
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{personalInfo.name}</h1>
          <p className="text-lg text-zinc-400">{personalInfo.title}</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-zinc-500">
            <MapPin size={16} />
            <span>{personalInfo.location}</span>
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
                  <h3 className="font-semibold">Life Philosophy</h3>
                </div>
                <p className="text-zinc-300 leading-relaxed">{personalInfo.summary}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={<User />} label="Name" value={personalInfo.name} />
                <InfoCard icon={<Code />} label="Role" value={personalInfo.title} />
                <InfoCard icon={<MapPin />} label="Location" value={personalInfo.location} />
                <InfoCard icon={<Globe />} label="Portfolio" value={personalInfo.portfolio} />
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <SkillSection title="Frontend Development" skills={skills.frontend} color="blue" />
              <SkillSection title="Backend Development" skills={skills.backend} color="green" />
              <SkillSection title="Tools & Technologies" skills={skills.tools} color="purple" />
              <SkillSection title="Soft Skills" skills={skills.soft} color="orange" />
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
                  value={personalInfo.email}
                  link={`mailto:${personalInfo.email}`}
                />
                <ContactCard 
                  icon={<Globe />} 
                  label="Portfolio" 
                  value={personalInfo.portfolio}
                  link={`https://${personalInfo.portfolio}`}
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
                  href={`mailto:${personalInfo.email}`}
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
