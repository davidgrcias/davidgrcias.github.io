// Seed Firestore with all default data
// Run this ONCE to populate your database

import { 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ========================================
// DEFAULT DATA - SEMUA DATA PORTFOLIO
// ========================================

const defaultProfile = {
  name: "David Garcia Saragih",
  headline: "Full-Stack Web & Systems Engineer · Content Creator",
  photoUrl: "/profilpict.webp",
  aboutText: "I'm driven by curiosity and the excitement of learning something new, especially when it comes to technology. What started as a hobby has grown into a habit of building, exploring, and bringing ideas to life through code and creativity",
  // Status card settings
  status: "open",
  availableFor: ["Full-time", "Freelance", "Contract"],
  contact: {
    email: "davidgarciasaragih7@gmail.com",
    location: "Jakarta, Indonesia",
    whatsapp: "+6287776803957",
    phone: ""
  },
  socials: {
    youtube: { url: "https://www.youtube.com/c/DavidGTech", handle: "@DavidGTech" },
    tiktok: { url: "https://www.tiktok.com/@davidgtech", handle: "@davidgtech" },
    github: { url: "https://github.com/davidgrcias", handle: "davidgrcias" },
    linkedin: { url: "https://www.linkedin.com/in/davidgrcias/", handle: "davidgrcias" },
    instagram: { url: "https://www.instagram.com/davidgrcias/", handle: "@davidgrcias" }
  }
};

const defaultSkills = {
  technical: [
    { category: "Front-End", skills: ["HTML", "CSS", "Tailwind CSS", "JavaScript & TypeScript", "React.js", "UI/UX Implementation"], icon: "Layout" },
    { category: "Back-End", skills: ["PHP", "Laravel", "Node.js (TypeScript)", "PostgreSQL", "Prisma ORM", "MySQL", "REST API", "Auth & Session", "MVC", "Python", "Kotlin", "Java"], icon: "Database" },
    { category: "DevOps & Deployment", skills: ["Git & GitHub", "Firebase", "Vercel", "cPanel Hosting", "Chrome DevTools", "Nginx"], icon: "Server" },
    { category: "AI & Optimization Tools", skills: ["Google Analytics", "Google Search Console", "SEO Optimization", "Prompt Engineering"], icon: "Brain" },
    { category: "Others", skills: ["Docs Writing", "Canva", "Figma", "Mobile-First Development", "Continually learning new technologies"], icon: "Lightbulb" }
  ],
  soft: ["Problem Solving", "Critical Thinking", "Fast Learning", "Adaptability", "Creativity", "Digital Communication", "Initiative", "Strong Work Ethic", "Team Collaboration", "Curiosity-Driven", "Branding", "Resilience"]
};

const defaultProjects = [
  {
    name: "Komilet (JakLingko Management System)",
    role: "Full-Stack Web & Systems Engineer",
    description: "Architected a comprehensive fleet management system for JakLingko operators using Next.js 16 and PostgreSQL. Designed a dual-panel architecture (Admin/Home) handling 42+ database entities, featuring soft-delete patterns, granular RBAC permissions, and automated approval workflows for financial integrity.",
    tech: ["Next.js 16", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS v4", "Redux Toolkit"],
    highlights: [
      "Engineered a secure App Router structure with Middleware-based JWT authentication and Role-Based Access Control (RBAC).",
      "Optimized 42+ table database schema using Composite Indexing and React Window virtualization for large datasets.",
      "Implemented a 'LogApproval' pattern to ensure strict audit trails for sensitive financial operations."
    ],
    link: "#",
    icon: "Bus",
    tiers: ["Advanced", "Real-World"],
    date: "2025-11",
    isPublished: true,
    order: 0
  },
  {
    name: "UMN Festival 2025 (Official Platform)",
    role: "Web Development Coordinator",
    description: "Architected the comprehensive event platform for UMN Festival 2025 using a Hybrid Monolith approach (Laravel 12 + Inertia.js). The system handles end-to-end ticketing, from dynamic bundle pricing and referral tracking to real-time Midtrans payment synchronization and secure QR code check-in.",
    tech: ["Laravel 12", "React 19", "Inertia.js 2.0", "Tailwind CSS v4", "Midtrans SDK", "PostgreSQL"],
    highlights: [
      "Designed a Hybrid SSR/SPA architecture combining Laravel's robustness with React's interactivity via Inertia.js 2.0.",
      "Built a secure Ticket Validation System using SHA-256 hashing and 'Frame Capture' anti-replay protection for scanners.",
      "Implemented complex Order Workflows: Bundle discounts, referral tracking, and automated PDF ticket generation with QR codes."
    ],
    link: "#",
    icon: "Ticket",
    tiers: ["Advanced", "Real-World", "Capstone"],
    date: "2025-11",
    isPublished: true,
    order: 1
  },
  {
    name: "Ark Care Ministry Website",
    role: "Backend Developer & Project Coordinator",
    description: "Volunteered to build a website for a nonprofit organization, leading the team and developing the backend system to support dynamic activity listings, content management, and user communication.",
    tech: ["PHP", "Laravel", "MySQL"],
    highlights: [
      "Led a four-person volunteer squad to ship the MVP and onboarding flow on schedule.",
      "Built modular backend endpoints to power dynamic activity listings and CMS updates.",
      "Introduced secure messaging channels so staff and volunteers can coordinate quickly."
    ],
    link: "https://arkcareministry.org/",
    icon: "Handshake",
    tiers: ["Advanced", "Real-World"],
    date: "2024-12",
    isPublished: true,
    order: 2
  }
];

const defaultExperiences = [
  {
    role: "Coordinator of Web Division (Full Stack Developer)",
    company: "UMN FESTIVAL 2025",
    type: "Contract",
    location: "Tangerang, Banten, Indonesia",
    locationType: "Hybrid",
    description: "Led the end-to-end development of UMN Festival's official website using Laravel, React, and Midtrans, building a fully dynamic platform for managing events, announcements, and committee access.",
    skills: ["Laravel", "React.js", "Payment Gateways"],
    media: {
      type: "pdf",
      url: "/umnfest2025.pdf",
      thumbnail: "/umnfest.png",
      title: "UMN Festival 2025 — UNIFY Ticketing Flow & Admin Dashboard",
      description: "Screens from the end-to-end ticketing system for UNIFY 2025"
    },
    startDate: "2025-02",
    endDate: "present",
    isPublished: true,
    order: 0
  },
  {
    role: "Full Stack Developer",
    company: "Koperasi Mikrolet Jakarta Raya (Komilet) — JakLingko Angkot Operator",
    type: "Contract",
    location: "Jakarta Metropolitan Area",
    locationType: "Remote",
    description: "Built and deployed a full-stack TypeScript platform for Koperasi Mikrolet Jakarta Raya (Komilet)—a JakLingko (Jakarta Integrated Transport System) angkot operator—to digitize end-to-end internal operations across drivers, vehicle owners, admin staff, and management.",
    skills: ["Full-Stack Development", "Web Technologies", "Node.js", "TypeScript", "PostgreSQL", "Prisma ORM"],
    media: {
      type: "image",
      url: "https://komilet.id",
      thumbnail: "/komilet.png",
      title: "Aplikasi Komilet",
      description: "Full-stack application for JakLingko angkot operator management system"
    },
    startDate: "2025-07",
    endDate: "present",
    isPublished: true,
    order: 1
  },
  {
    role: "Founder, Digital Strategist & Web Developer",
    company: "Rental Mobil City Park",
    type: "Self-employed",
    location: "Tangerang, Banten, Indonesia",
    locationType: "Hybrid",
    description: "Founded and developed the web interface for a local car rental business, while also helping establish its online presence and digital marketing strategy.",
    skills: ["HTML", "CSS", "JavaScript", "Digital Marketing"],
    startDate: "2024-06",
    endDate: "present",
    isPublished: true,
    order: 2
  },
  {
    role: "Web Developer",
    company: "DAAI TV",
    type: "Internship",
    location: "Jakarta, Indonesia",
    locationType: "On-site",
    description: "Completed a web development internship, working on frontend and backend development using PHP, MySQL, and Bootstrap.",
    skills: ["HTML", "Bootstrap", "PHP", "MySQL", "JavaScript"],
    startDate: "2022-03",
    endDate: "2022-05",
    isPublished: true,
    order: 3
  }
];

const defaultEducation = [
  {
    degree: "Undergraduate Student, Informatics",
    institution: "Universitas Multimedia Nusantara",
    period: "2023 - 2027",
    grade: "3.87",
    isPublished: true,
    order: 0
  },
  {
    degree: "Software Engineering",
    institution: "SMK Cinta Kasih Tzu Chi",
    period: "2020 - 2023",
    isPublished: true,
    order: 1
  }
];

const defaultCertifications = [
  { name: "HCIA-AI V3.5 Course", provider: "Huawei ICT Academy", date: "May 2025", icon: "BrainCircuit", isPublished: true, order: 0 },
  { name: "Python Intermediate Course", provider: "Sololearn", date: "June 2025", icon: "Code", isPublished: true, order: 1 },
  { name: "PHP Course", provider: "Progate", date: "Jan 2022", icon: "FileCode", isPublished: true, order: 2 },
  { name: "React Course", provider: "Progate", date: "Jan 2022", icon: "Code2", isPublished: true, order: 3 },
  { name: "SQL Course", provider: "Progate", date: "Jan 2022", icon: "Database", isPublished: true, order: 4 },
  { name: "Web Development Course", provider: "Progate", date: "Jan 2022", icon: "Globe", isPublished: true, order: 5 },
  { name: "GIT Course", provider: "Progate", date: "Dec 2021", icon: "GitBranch", isPublished: true, order: 6 },
  { name: "Startup of New Innovation Challenge", provider: "HIMPS-HI UPH", date: "2022", icon: "Rocket", isPublished: true, order: 7 },
  { name: "JavaScript Course", provider: "Progate", date: "Dec 2021", icon: "FileCode", isPublished: true, order: 8 },
  { name: "HTML & CSS Course", provider: "Progate", date: "Oct 2021", icon: "Code", isPublished: true, order: 9 }
];

const defaultFunFacts = [
  { title: "Hidden Talent", text: "Ask me about Jakarta's transport routes, I can tell you the best way to reach any destination using public transport!", icon: "MapIcon", isPublished: true, order: 0 },
  { title: "Surprising Fact", text: "Though I might seem reserved at first, I genuinely love meeting and chatting with new people.", icon: "HeartHandshake", isPublished: true, order: 1 },
  { title: "Most Productive Hours", text: "Late night hours are when my creativity and productivity peak.", icon: "Hourglass", isPublished: true, order: 2 },
  { title: "Best Way to Relax", text: "Nothing beats unwinding after a productive day of solving complex coding challenges.", icon: "Puzzle", isPublished: true, order: 3 },
  { title: "Friends Describe Me As", text: "Ambitious and analytical, I love digging deeper into things and always strive to improve.", icon: "User", isPublished: true, order: 4 },
  { title: "Underrated Joy", text: "That satisfying moment when I successfully help someone solve a problem or reach their goal.", icon: "Heart", isPublished: true, order: 5 }
];

const defaultInsights = [
  { title: "Motivation", text: "Fueled by ambition, not afraid to fail, because every setback is simply a setup for the next level.", icon: "Rocket", isPublished: true, order: 0 },
  { title: "Never Going Back", text: "I'll never return to being the shy and reserved person I once was. Now, I confidently embrace opportunities to speak and connect.", icon: "SkipBack", isPublished: true, order: 1 },
  { title: "What Keeps Me Curious", text: "I'm endlessly curious about how things work, whether complex systems or compelling stories. I'm driven by the 'why' and 'how' behind it all.", icon: "SearchCheck", isPublished: true, order: 2 },
  { title: "How I Stay Updated", text: "I actively stay informed and up-to-date on current events, tech trends, and global developments, constantly expanding my perspective and knowledge base.", icon: "Newspaper", isPublished: true, order: 3 }
];

const defaultPosts = [
  {
    title: 'How I Built This OS-Style Portfolio',
    excerpt: 'A deep dive into creating an interactive desktop experience using React, Framer Motion, and modern web technologies.',
    content: `# Building an OS-Style Portfolio

This portfolio was built with the goal of creating something unique and memorable. Instead of a traditional portfolio layout, I wanted to recreate the familiar experience of using a desktop operating system.

## Tech Stack
- **React 18** for component architecture
- **Framer Motion** for smooth animations
- **Tailwind CSS** for styling
- **Vite** for blazing fast development

## Key Features
1. Draggable windows with minimize/maximize
2. Functional taskbar with system tray
3. Desktop icons with context menus
4. Voice commands integration
5. Achievement system for engagement

Stay tuned for more technical deep-dives!`,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    category: 'Tech',
    date: '2026-01-30',
    readTime: 5,
    featured: true,
    published: true,
    externalLink: null,
  },
  {
    title: 'My Journey as a Software Developer',
    excerpt: 'From learning HTML basics to building full-stack applications — lessons learned along the way.',
    content: `# My Journey as a Developer

It all started with curiosity about how websites work. Today, I'm building complex systems that serve real users.

## The Beginning
I remember my first "Hello World" — it felt magical seeing code come to life in the browser.

## Key Milestones
- First freelance project
- Building real-world applications
- Contributing to open source
- Leading development teams

## What I've Learned
1. **Never stop learning** — technology evolves fast
2. **Build, build, build** — experience beats theory
3. **Community matters** — connect with other developers
4. **Soft skills count** — communication is key

The journey continues...`,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    category: 'Life',
    date: '2026-01-25',
    readTime: 4,
    featured: false,
    published: true,
    externalLink: null,
  },
  {
    title: 'Building Scalable Systems with Next.js',
    excerpt: 'Best practices for architecting Next.js applications that can handle thousands of users.',
    content: `# Scalable Next.js Architecture

After building several production applications, here are patterns that work.

## Key Principles
1. **Separation of Concerns** — keep logic modular
2. **Caching Strategy** — leverage ISR and SWR
3. **Database Optimization** — index wisely
4. **Error Boundaries** — fail gracefully

## Performance Tips
- Use dynamic imports for code splitting
- Optimize images with next/image
- Implement skeleton loading states
- Monitor with analytics

Happy coding!`,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    category: 'Tech',
    date: '2026-01-20',
    readTime: 6,
    featured: false,
    published: true,
    externalLink: null,
  },
  {
    title: 'Why I Love Open Source',
    excerpt: 'Contributing to open source has transformed my career and connected me with amazing developers worldwide.',
    content: `# Open Source Changed My Life

Open source is more than free software — it's a community and a mindset.

## Benefits I've Experienced
- **Learning** from world-class developers
- **Networking** with the global community
- **Building** a public portfolio
- **Giving back** to tools I use daily

## Getting Started
1. Find projects you use and love
2. Start with documentation fixes
3. Move to small bug fixes
4. Eventually tackle features

Join the movement! 🚀`,
    image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&q=80',
    category: 'Life',
    date: '2026-01-15',
    readTime: 3,
    featured: false,
    published: true,
    externalLink: null,
  },
];

// Default VS Code Files
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

// Default File Manager Structure
const defaultFileManager = {
  structure: {
    '/': {
      name: 'Home',
      type: 'folder',
      children: {
        'About': {
          type: 'folder',
          children: {
            'Bio.md': { type: 'file', icon: 'text', content: '# David Garcia Saragih\n\nFull-stack developer passionate about creating innovative web experiences. Currently based in Jakarta, Indonesia.\n\n## Background\nI started my journey in web development with a curiosity about how websites work. Today, I build complex systems that serve real users.\n\n## Current Focus\n- Building scalable web applications\n- Learning new technologies\n- Creating content for developers', size: '3 KB' },
            'Resume.pdf': { type: 'file', icon: 'document', size: '145 KB', downloadUrl: '#' },
            'Skills.json': { type: 'file', icon: 'code', content: '{\n  "frontend": ["React", "Next.js", "Tailwind CSS"],\n  "backend": ["Laravel", "Node.js", "PostgreSQL"],\n  "tools": ["Git", "VS Code", "Firebase"]\n}', size: '1 KB' },
          }
        },
        'Projects': {
          type: 'folder',
          children: {
            'Portfolio-WebOS': {
              type: 'folder',
              children: {
                'README.md': { type: 'file', icon: 'text', content: '# Portfolio WebOS\n\nAn OS-style portfolio built with React and Tailwind CSS.\n\n## Features\n- Draggable windows\n- Functional taskbar\n- Desktop icons\n- Voice commands', size: '2 KB' },
                'screenshot.png': { type: 'file', icon: 'image', size: '650 KB', imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400' },
              }
            },
            'Other-Projects': {
              type: 'folder',
              children: {
                'projects-list.md': { type: 'file', icon: 'text', content: '# My Projects\n\n1. Komilet (JakLingko Management)\n2. UMN Festival 2025\n3. Ark Care Ministry Website\n4. Various freelance projects', size: '1 KB' },
              }
            }
          }
        },
        'Experience': {
          type: 'folder',
          children: {
            'Work-History.md': { type: 'file', icon: 'text', content: '# Work Experience\n\n## Full-Stack Developer\nBuilding web applications and systems for various clients.\n\n## Content Creator\nCreating educational content about web development.', size: '2 KB' },
            'Certifications': {
              type: 'folder',
              children: {
                'certificates-info.md': { type: 'file', icon: 'text', content: '# Certifications\n\nVarious certifications in web development and related technologies.', size: '1 KB' },
              }
            },
          }
        },
        'Contact': {
          type: 'folder',
          children: {
            'Email.txt': { type: 'file', icon: 'text', content: 'davidgarciasaragih7@gmail.com', size: '1 KB' },
            'LinkedIn.url': { type: 'file', icon: 'link', url: 'https://linkedin.com/in/davidgrcias', size: '1 KB' },
            'GitHub.url': { type: 'file', icon: 'link', url: 'https://github.com/davidgrcias', size: '1 KB' },
          }
        },
      }
    }
  }
};

// ========================================
// SEED FUNCTIONS
// ========================================

/**
 * Check if a collection is empty
 */
const isCollectionEmpty = async (collectionName) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.empty;
  } catch (error) {
    console.error(`Error checking ${collectionName}:`, error);
    return true; // Assume empty on error
  }
};

/**
 * Seed a singleton document (profile, skills)
 */
const seedSingletonDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`✅ ${collectionName}/${docId} seeded successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error seeding ${collectionName}/${docId}:`, error);
    return false;
  }
};

/**
 * Seed a collection with multiple documents
 */
const seedCollection = async (collectionName, dataArray) => {
  try {
    const colRef = collection(db, collectionName);
    let count = 0;
    
    for (const item of dataArray) {
      await addDoc(colRef, {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      count++;
    }
    
    console.log(`✅ ${collectionName}: ${count} documents seeded`);
    return count;
  } catch (error) {
    console.error(`❌ Error seeding ${collectionName}:`, error);
    return 0;
  }
};

/**
 * Main seed function - Seeds ALL data to Firestore
 */
export const seedAllData = async (options = { force: false }) => {
  console.log('🚀 Starting Firestore seed...\n');
  
  const results = {
    profile: false,
    skills: false,
    vscodeFiles: false,
    fileManager: false,
    projects: 0,
    experiences: 0,
    education: 0,
    certifications: 0,
    funFacts: 0,
    insights: 0,
    posts: 0
  };

  try {
    // 1. Seed Profile (singleton)
    if (options.force || await isCollectionEmpty('profile')) {
      results.profile = await seedSingletonDocument('profile', 'main', defaultProfile);
    } else {
      console.log('⏭️  Profile already exists, skipping...');
    }

    // 2. Seed Skills (singleton)
    if (options.force || await isCollectionEmpty('skills')) {
      results.skills = await seedSingletonDocument('skills', 'main', defaultSkills);
    } else {
      console.log('⏭️  Skills already exists, skipping...');
    }

    // 2.5. Seed VS Code Files (singleton)
    if (options.force || await isCollectionEmpty('vscodeFiles')) {
      results.vscodeFiles = await seedSingletonDocument('vscodeFiles', 'main', defaultVscodeFiles);
    } else {
      console.log('⏭️  VS Code Files already exists, skipping...');
    }

    // 2.6. Seed File Manager (singleton)
    if (options.force || await isCollectionEmpty('fileManager')) {
      results.fileManager = await seedSingletonDocument('fileManager', 'main', defaultFileManager);
    } else {
      console.log('⏭️  File Manager already exists, skipping...');
    }

    // 3. Seed Projects
    if (options.force || await isCollectionEmpty('projects')) {
      results.projects = await seedCollection('projects', defaultProjects);
    } else {
      console.log('⏭️  Projects already exists, skipping...');
    }

    // 4. Seed Experiences
    if (options.force || await isCollectionEmpty('experiences')) {
      results.experiences = await seedCollection('experiences', defaultExperiences);
    } else {
      console.log('⏭️  Experiences already exists, skipping...');
    }

    // 5. Seed Education
    if (options.force || await isCollectionEmpty('education')) {
      results.education = await seedCollection('education', defaultEducation);
    } else {
      console.log('⏭️  Education already exists, skipping...');
    }

    // 6. Seed Certifications
    if (options.force || await isCollectionEmpty('certifications')) {
      results.certifications = await seedCollection('certifications', defaultCertifications);
    } else {
      console.log('⏭️  Certifications already exists, skipping...');
    }

    // 7. Seed Fun Facts
    if (options.force || await isCollectionEmpty('funFacts')) {
      results.funFacts = await seedCollection('funFacts', defaultFunFacts);
    } else {
      console.log('⏭️  Fun Facts already exists, skipping...');
    }

    // 8. Seed Insights
    if (options.force || await isCollectionEmpty('insights')) {
      results.insights = await seedCollection('insights', defaultInsights);
    } else {
      console.log('⏭️  Insights already exists, skipping...');
    }

    // 9. Seed Blog Posts
    if (options.force || await isCollectionEmpty('posts')) {
      results.posts = await seedCollection('posts', defaultPosts);
    } else {
      console.log('⏭️  Posts already exists, skipping...');
    }

    console.log('\n📊 Seed Results:');
    console.log('================');
    console.log(`Profile:        ${results.profile ? '✅' : '⏭️ Skipped'}`);
    console.log(`Skills:         ${results.skills ? '✅' : '⏭️ Skipped'}`);
    console.log(`VS Code Files:  ${results.vscodeFiles ? '✅' : '⏭️ Skipped'}`);
    console.log(`File Manager:   ${results.fileManager ? '✅' : '⏭️ Skipped'}`);
    console.log(`Projects:       ${results.projects} documents`);
    console.log(`Experiences:    ${results.experiences} documents`);
    console.log(`Education:      ${results.education} documents`);
    console.log(`Certifications: ${results.certifications} documents`);
    console.log(`Fun Facts:      ${results.funFacts} documents`);
    console.log(`Insights:       ${results.insights} documents`);
    console.log(`Blog Posts:     ${results.posts} documents`);
    console.log('\n🎉 Seed complete!');

    return results;
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
};

// Export for use in admin panel
export default seedAllData;
