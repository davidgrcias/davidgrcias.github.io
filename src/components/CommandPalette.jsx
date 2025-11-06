import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Command, 
  Hash, 
  Briefcase, 
  FolderGit2, 
  Award, 
  GraduationCap, 
  Mail, 
  Sun, 
  Moon,
  Github,
  Linkedin,
  Instagram,
  Youtube,
  Home,
  User,
  Code,
  Trophy,
  ArrowRight,
  X
} from 'lucide-react';

const CommandPalette = ({ 
  isOpen, 
  onClose, 
  experiences = [], 
  projects = [], 
  skills = {},
  certifications = [],
  education = [],
  userProfile = {},
  onNavigate,
  isDarkMode,
  toggleTheme
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Define all commands
  const commands = [
    // Navigation
    { 
      id: 'nav-home', 
      label: 'Home', 
      icon: Home, 
      category: 'Navigation',
      action: () => onNavigate('home'),
      keywords: ['home', 'top', 'start', 'hero']
    },
    { 
      id: 'nav-about', 
      label: 'About Me', 
      icon: User, 
      category: 'Navigation',
      action: () => onNavigate('about'),
      keywords: ['about', 'profile', 'bio', 'me']
    },
    { 
      id: 'nav-education', 
      label: 'Education', 
      icon: GraduationCap, 
      category: 'Navigation',
      action: () => onNavigate('education'),
      keywords: ['education', 'school', 'university', 'degree']
    },
    { 
      id: 'nav-experience', 
      label: 'Experience', 
      icon: Briefcase, 
      category: 'Navigation',
      action: () => onNavigate('experience'),
      keywords: ['experience', 'work', 'job', 'career']
    },
    { 
      id: 'nav-projects', 
      label: 'Projects', 
      icon: FolderGit2, 
      category: 'Navigation',
      action: () => onNavigate('projects'),
      keywords: ['projects', 'portfolio', 'work']
    },
    { 
      id: 'nav-skills', 
      label: 'Skills & Certifications', 
      icon: Award, 
      category: 'Navigation',
      action: () => onNavigate('skills'),
      keywords: ['skills', 'certifications', 'abilities', 'tech']
    },
    { 
      id: 'nav-contact', 
      label: 'Contact', 
      icon: Mail, 
      category: 'Navigation',
      action: () => onNavigate('contact'),
      keywords: ['contact', 'email', 'reach', 'connect']
    },

    // Theme
    { 
      id: 'theme-toggle', 
      label: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode', 
      icon: isDarkMode ? Sun : Moon, 
      category: 'Theme',
      action: () => {
        toggleTheme();
        onClose();
      },
      keywords: ['theme', 'dark', 'light', 'mode', 'appearance']
    },

    // Social Links (only if URLs exist)
    ...(userProfile?.socials?.github?.url ? [{ 
      id: 'social-github', 
      label: 'Open GitHub Profile', 
      icon: Github, 
      category: 'Social',
      action: () => window.open(userProfile.socials.github.url, '_blank'),
      keywords: ['github', 'code', 'repository', 'social']
    }] : []),
    ...(userProfile?.socials?.linkedin?.url ? [{ 
      id: 'social-linkedin', 
      label: 'Open LinkedIn Profile', 
      icon: Linkedin, 
      category: 'Social',
      action: () => window.open(userProfile.socials.linkedin.url, '_blank'),
      keywords: ['linkedin', 'professional', 'social']
    }] : []),
    ...(userProfile?.socials?.instagram?.url ? [{ 
      id: 'social-instagram', 
      label: 'Open Instagram Profile', 
      icon: Instagram, 
      category: 'Social',
      action: () => window.open(userProfile.socials.instagram.url, '_blank'),
      keywords: ['instagram', 'social', 'photos']
    }] : []),
    ...(userProfile?.socials?.youtube?.url ? [{ 
      id: 'social-youtube', 
      label: 'Open YouTube Channel', 
      icon: Youtube, 
      category: 'Social',
      action: () => window.open(userProfile.socials.youtube.url, '_blank'),
      keywords: ['youtube', 'videos', 'channel', 'social']
    }] : []),

    // Experiences
    ...(experiences || []).map((exp, index) => ({
      id: `exp-${index}`,
      label: `${exp.role} at ${exp.company}`,
      icon: Briefcase,
      category: 'Experience',
      action: () => {
        onNavigate('experience');
        onClose();
      },
      keywords: ['experience', exp.role?.toLowerCase() || '', exp.company?.toLowerCase() || '', ...(exp.skills || []).map(s => s?.toLowerCase() || '')]
    })),

    // Projects
    ...(projects || []).map((project, index) => ({
      id: `project-${index}`,
      label: project.title || 'Untitled Project',
      icon: FolderGit2,
      category: 'Projects',
      action: () => {
        onNavigate('projects');
        onClose();
      },
      keywords: ['project', project.title?.toLowerCase() || '', ...(project.technologies || []).map(t => t?.toLowerCase() || '')]
    })),

    // Skills - Technical
    ...(skills.technical || []).flatMap((category) => 
      (category.skills || []).map((skill, index) => ({
        id: `skill-tech-${category.category}-${index}`,
        label: `${skill} (${category.category})`,
        icon: Code,
        category: 'Skills',
        action: () => {
          onNavigate('skills');
          onClose();
        },
        keywords: ['skill', skill?.toLowerCase() || '', category.category?.toLowerCase() || '']
      }))
    ),

    // Certifications
    ...(certifications || []).map((cert, index) => ({
      id: `cert-${index}`,
      label: `${cert.name} - ${cert.provider}`,
      icon: Trophy,
      category: 'Certifications',
      action: () => {
        onNavigate('skills');
        onClose();
      },
      keywords: ['certification', cert.name?.toLowerCase() || '', cert.provider?.toLowerCase() || '']
    })),
  ];

  // Filter commands based on search
  const filteredCommands = searchQuery
    ? commands.filter(cmd => 
        cmd.keywords?.some(keyword => keyword && keyword.includes(searchQuery.toLowerCase())) ||
        (cmd.label && cmd.label.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : commands;

  // Group by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Prevent default for navigation keys
      if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowDown') {
        setSelectedIndex(prev => {
          const next = prev < filteredCommands.length - 1 ? prev + 1 : 0;
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex(prev => {
          const next = prev > 0 ? prev - 1 : filteredCommands.length - 1;
          return next;
        });
      } else if (e.key === 'Enter' && filteredCommands.length > 0) {
        if (filteredCommands[selectedIndex]) {
          try {
            filteredCommands[selectedIndex].action();
          } catch (error) {
            console.error('Command execution error:', error);
          }
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Focus input when opened and reset state
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      // Prevent body scroll when command palette is open
      document.body.style.overflow = 'hidden';
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    } else {
      // Restore body scroll when closed
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Scroll selected item into view with better logic
  useEffect(() => {
    if (!listRef.current || selectedIndex < 0 || filteredCommands.length === 0) return;
    
    // Get all command buttons
    const commandButtons = listRef.current.querySelectorAll('button[data-command-item]');
    const selectedElement = commandButtons[selectedIndex];
    
    if (selectedElement) {
      selectedElement.scrollIntoView({ 
        block: 'nearest', 
        behavior: 'smooth',
        inline: 'nearest'
      });
    }
  }, [selectedIndex, filteredCommands]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-start justify-center pt-[10vh] px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
            <Search className="text-slate-400 flex-shrink-0" size={20} />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                // Prevent input from handling arrow keys
                if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 text-lg"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedIndex(0);
                  inputRef.current?.focus();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2" ref={listRef}>
            {Object.keys(groupedCommands).length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-medium">No results found</p>
                <p className="text-sm mt-2">Try searching for navigation, skills, or projects</p>
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category} className="mb-4 last:mb-0">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {category}
                  </div>
                  {cmds.map((cmd) => {
                    const globalIndex = filteredCommands.findIndex(c => c.id === cmd.id);
                    const isSelected = globalIndex === selectedIndex;
                    const Icon = cmd.icon;

                    return (
                      <button
                        key={cmd.id}
                        data-command-item
                        onClick={(e) => {
                          e.preventDefault();
                          try {
                            cmd.action();
                          } catch (error) {
                            console.error('Command error:', error);
                          }
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        onMouseMove={() => {
                          // Update selected index on mouse move to prevent keyboard/mouse conflict
                          if (selectedIndex !== globalIndex) {
                            setSelectedIndex(globalIndex);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                          isSelected
                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon size={18} className="flex-shrink-0" />
                        <span className="flex-1 text-left text-sm font-medium truncate">
                          {cmd.label}
                        </span>
                        {isSelected && <ArrowRight size={16} className="animate-pulse" />}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono">↵</kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono">esc</kbd>
                <span>Close</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {filteredCommands.length > 0 && (
                <span className="text-xs">
                  {selectedIndex + 1} / {filteredCommands.length}
                </span>
              )}
              <div className="flex items-center gap-1">
                <Command size={12} />
                <span>Command Palette</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommandPalette;
