// src/data/vscodeFiles.js
// Data layer for VS Code Explorer files - syncs with Firestore

import { getDocument, setDocument } from "../services/firestore";

// Default static files for VS Code Explorer
const defaultVscodeFiles = {
  staticFiles: [
    {
      id: 'about',
      name: 'about_me.js',
      type: 'js',
      content: `// About David Garcia Saragih
const developer = {
  name: "David Garcia Saragih",
  title: "Full-Stack Web & Systems Engineer",
  location: "Jakarta, Indonesia",
  
  passion: [
    "Building innovative web experiences",
    "Creating scalable systems",
    "UI/UX Design"
  ],
  
  philosophy: \`
    I'm driven by curiosity and the excitement 
    of learning something new. What started as 
    a hobby has grown into a habit of building, 
    exploring, and bringing ideas to life.
  \`,
  
  currentFocus: "Building this OS-style portfolio"
};

export default developer;`
    },
    {
      id: 'contact',
      name: 'contact.json',
      type: 'json',
      content: `{
  "name": "David Garcia Saragih",
  "email": "davidgarciasaragih7@gmail.com",
  "location": "Jakarta, Indonesia",
  "phone": "+62 877-7680-3957",
  "socials": {
    "github": "https://github.com/davidgrcias",
    "linkedin": "https://linkedin.com/in/davidgrcias",
    "youtube": "https://youtube.com/@DavidGTech",
    "tiktok": "https://tiktok.com/@davidgtech"
  },
  "availability": {
    "status": "Open to opportunities",
    "preferredRoles": ["Full-Stack Developer", "Frontend Developer"],
    "workType": ["Full-time", "Freelance", "Contract"]
  }
}`
    },
    {
      id: 'skills',
      name: 'skills.xml',
      type: 'xml',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<skills>
  <category name="Frontend">
    <skill level="advanced">React.js</skill>
    <skill level="advanced">Next.js</skill>
    <skill level="advanced">Tailwind CSS</skill>
    <skill level="intermediate">TypeScript</skill>
    <skill level="advanced">Framer Motion</skill>
  </category>
  
  <category name="Backend">
    <skill level="advanced">Laravel</skill>
    <skill level="advanced">PHP</skill>
    <skill level="intermediate">Node.js</skill>
    <skill level="advanced">MySQL</skill>
    <skill level="intermediate">PostgreSQL</skill>
  </category>
  
  <category name="Tools">
    <skill level="advanced">Git & GitHub</skill>
    <skill level="advanced">VS Code</skill>
    <skill level="intermediate">Firebase</skill>
    <skill level="intermediate">Docker</skill>
  </category>
</skills>`
    }
  ]
};

// Cache
let cachedVscodeFiles = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get VS Code static files from Firestore
 */
export const getVscodeFiles = async () => {
  // Check cache
  if (cachedVscodeFiles && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return cachedVscodeFiles;
  }

  try {
    const firestoreData = await getDocument('vscodeFiles', 'main');
    
    if (firestoreData && firestoreData.staticFiles && firestoreData.staticFiles.length > 0) {
      cachedVscodeFiles = firestoreData;
      cacheTimestamp = Date.now();
      return firestoreData;
    }
  } catch (error) {
    console.warn('Failed to fetch VS Code files from Firestore:', error);
  }

  // Return defaults
  return defaultVscodeFiles;
};

/**
 * Get VS Code files synchronously (from cache)
 */
export const getVscodeFilesSync = () => {
  if (cachedVscodeFiles) {
    return cachedVscodeFiles;
  }
  return defaultVscodeFiles;
};

/**
 * Clear cache
 */
export const clearVscodeFilesCache = () => {
  cachedVscodeFiles = null;
  cacheTimestamp = null;
};

// Initialize cache
getVscodeFiles().catch(() => {});

export { defaultVscodeFiles };
