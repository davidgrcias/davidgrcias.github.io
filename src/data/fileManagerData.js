// src/data/fileManagerData.js
// Data layer for File Manager - syncs with Firestore

import { getDocument } from "../services/firestore";

// Default file system structure for File Manager
const defaultFileSystem = {
  structure: {
    '/': {
      name: 'Home',
      type: 'folder',
      children: {
        'About': {
          type: 'folder',
          children: {
            'Bio.md': { 
              type: 'file', 
              icon: 'text', 
              content: '# David Garcia Saragih\n\nFull-stack developer passionate about creating innovative web experiences.\n\n## About Me\nI\'m driven by curiosity and the excitement of learning something new, especially when it comes to technology.\n\n## What I Do\n- Build scalable web applications\n- Create intuitive user interfaces\n- Develop backend systems\n- Content creation on YouTube & TikTok', 
              size: '2 KB' 
            },
            'Resume.pdf': { 
              type: 'file', 
              icon: 'document', 
              size: '145 KB', 
              downloadUrl: '/cv.pdf' 
            },
            'Skills.json': { 
              type: 'file', 
              icon: 'code',
              content: '{\n  "frontend": ["React", "Next.js", "Tailwind CSS"],\n  "backend": ["Laravel", "Node.js", "PHP"],\n  "database": ["MySQL", "PostgreSQL", "Firebase"],\n  "tools": ["Git", "VS Code", "Figma"]\n}',
              size: '3 KB' 
            },
          }
        },
        'Projects': {
          type: 'folder',
          children: {
            'E-Commerce-Platform': {
              type: 'folder',
              children: {
                'README.md': { 
                  type: 'file', 
                  icon: 'text', 
                  content: '# E-Commerce Platform\n\nA full-featured e-commerce solution built with modern technologies.\n\n## Tech Stack\n- Next.js 16\n- PostgreSQL\n- Stripe Integration\n- Tailwind CSS\n\n## Features\n- Product catalog\n- Shopping cart\n- Payment processing\n- Order management',
                  size: '5 KB' 
                },
                'demo.png': { 
                  type: 'file', 
                  icon: 'image', 
                  imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
                  size: '890 KB' 
                },
                'live-link.url': { 
                  type: 'file', 
                  icon: 'link', 
                  url: 'https://example.com',
                  size: '1 KB' 
                },
              }
            },
            'AI-Chatbot': {
              type: 'folder',
              children: {
                'README.md': { 
                  type: 'file', 
                  icon: 'text', 
                  content: '# AI Chatbot\n\nAn intelligent chatbot powered by modern AI technologies.\n\n## Features\n- Natural language processing\n- Context-aware responses\n- Multi-language support\n\n## Tech Stack\n- Python\n- TensorFlow\n- React Frontend',
                  size: '4 KB' 
                },
                'screenshot.png': { 
                  type: 'file', 
                  icon: 'image', 
                  imageUrl: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800',
                  size: '1.2 MB' 
                },
              }
            },
            'Portfolio-WebOS': {
              type: 'folder',
              children: {
                'README.md': { 
                  type: 'file', 
                  icon: 'text', 
                  content: '# Portfolio WebOS\n\nAn OS-style portfolio website with a unique desktop experience.\n\n## Features\n- Draggable windows\n- Multiple apps\n- System tray\n- Desktop icons\n\n## Tech Stack\n- React 18\n- Framer Motion\n- Tailwind CSS\n- Firebase',
                  size: '3 KB' 
                },
                'architecture.png': { 
                  type: 'file', 
                  icon: 'image', 
                  imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
                  size: '650 KB' 
                },
              }
            },
          }
        },
        'Experience': {
          type: 'folder',
          children: {
            'Work-History.md': { 
              type: 'file', 
              icon: 'text', 
              content: '# Work History\n\n## UMN Festival 2025\n**Web Development Coordinator**\n_Nov 2025 - Present_\n\nArchitected the comprehensive event platform for UMN Festival 2025.\n\n## Komilet\n**Full-Stack Developer**\n_2025_\n\nBuilt fleet management system for JakLingko operators.',
              size: '8 KB' 
            },
            'Certifications': {
              type: 'folder',
              children: {
                'Web-Development.pdf': { 
                  type: 'file', 
                  icon: 'document', 
                  size: '200 KB',
                  downloadUrl: '#'
                },
                'React-Advanced.pdf': { 
                  type: 'file', 
                  icon: 'document', 
                  size: '180 KB',
                  downloadUrl: '#'
                },
              }
            },
          }
        },
        'Contact': {
          type: 'folder',
          children: {
            'Email.txt': { 
              type: 'file', 
              icon: 'text', 
              content: 'Email: davidgarciasaragih7@gmail.com\n\nFeel free to reach out for collaborations, opportunities, or just to say hi!', 
              size: '1 KB' 
            },
            'LinkedIn.url': { 
              type: 'file', 
              icon: 'link', 
              url: 'https://linkedin.com/in/davidgrcias',
              size: '1 KB' 
            },
            'GitHub.url': { 
              type: 'file', 
              icon: 'link', 
              url: 'https://github.com/davidgrcias',
              size: '1 KB' 
            },
          }
        },
      }
    }
  }
};

// Cache
let cachedFileSystem = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get File Manager structure from Firestore
 */
export const getFileManagerData = async () => {
  // Check cache
  if (cachedFileSystem && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return cachedFileSystem;
  }

  try {
    const firestoreData = await getDocument('fileManager', 'main');
    
    if (firestoreData && firestoreData.structure) {
      cachedFileSystem = firestoreData;
      cacheTimestamp = Date.now();
      return firestoreData;
    }
  } catch (error) {
    console.warn('Failed to fetch File Manager data from Firestore:', error);
  }

  // Return defaults
  return defaultFileSystem;
};

/**
 * Get File Manager data synchronously (from cache)
 */
export const getFileManagerDataSync = () => {
  if (cachedFileSystem) {
    return cachedFileSystem;
  }
  return defaultFileSystem;
};

/**
 * Clear cache
 */
export const clearFileManagerCache = () => {
  cachedFileSystem = null;
  cacheTimestamp = null;
};

// Initialize cache
getFileManagerData().catch(() => {});

export { defaultFileSystem };
