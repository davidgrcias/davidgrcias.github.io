import { firestoreService } from '../services/firestore';

/**
 * Projects data from LinkedIn
 * Run this once to populate Firestore with all projects
 */
export const linkedInProjects = [
  {
    name: "Komilet Pramudi - GPS Fleet Tracking (Android App)",
    role: "Android Developer",
    description: "Developed the native Android driver app for the Komilet JakLingko platform using Kotlin and Jetpack Compose, extending the web ecosystem with real-time GPS fleet tracking.\n\nEngineered a complex offline-first architecture with adaptive polling and background services to ensure accurate mileage data capture under unstable network conditions.",
    tech: ["Kotlin", "Jetpack Compose", "Android Development", "GPS Tracking", "MVVM", "Geological Mapping", "Leaflet.js"],
    highlights: [
      "Real-time GPS fleet tracking",
      "Offline-first architecture",
      "Adaptive polling for unstable networks",
      "Background services for mileage capture"
    ],
    link: "",
    icon: "Smartphone",
    image: "",
    tiers: ["Advanced", "Real-World"],
    date: "2026-01",
    order: 1,
    isPublished: true,
    association: "Koperasi Mikrolet Jakarta Raya (Komilet) — JakLingko Angkot Operator"
  },
  {
    name: "Web App for Komilet - JakLingko Angkot Operator",
    role: "Full-Stack Web Developer",
    description: "Developed a full-stack TypeScript web application for Komilet, one of the official JakLingko angkot operators within Jakarta's integrated public transport ecosystem (covering TransJakarta, MRT, LRT, KRL, and Mikrotrans). The system was designed for internal use by Komilet's drivers, owners, administrative staff, and management team, providing a unified platform for operational management and reporting.\n\nKey features include modules for driver payrolls, trip records (ritase), fines, attendance, TransJakarta verification, route and area management, financial tracking, and internal communication, along with extensive reporting tools such as distance logs and income estimations, etc. This system replaced traditional paper-based workflows that previously required extensive manual data entry, reducing administrative overhead and improving data accuracy.\n\nAs a result, Komilet's operations became fully digitalized, enabling faster decision-making, structured data management, and seamless coordination across all operational levels.",
    tech: ["TypeScript", "Prisma ORM", "Tailwind CSS", "PostgreSQL", "Next.js", "Redux Toolkit"],
    highlights: [
      "Driver payroll management system",
      "Trip records (ritase) tracking",
      "TransJakarta verification module",
      "Financial tracking & reporting",
      "Replaced paper-based workflows"
    ],
    link: "",
    icon: "Bus",
    image: "",
    tiers: ["Advanced", "Real-World", "Capstone"],
    date: "2025-12",
    order: 2,
    isPublished: true,
    association: "Koperasi Mikrolet Jakarta Raya (Komilet) — JakLingko Angkot Operator"
  },
  {
    name: "Rental Mobil City Park Website",
    role: "Frontend Developer",
    description: "Solely managed and built the frontend of a car rental service simple website for a family-run business. Designed responsive UI for browsing available cars, and other informations.",
    tech: ["HTML", "CSS", "JavaScript", "Responsive Design"],
    highlights: [
      "Responsive car browsing UI",
      "Family business digitalization",
      "User-friendly interface"
    ],
    link: "",
    icon: "Car",
    image: "",
    tiers: ["Beginner", "Real-World"],
    date: "2025-08",
    order: 3,
    isPublished: true,
    association: "Rental Mobil City Park"
  },
  {
    name: "Ark Care Ministry Website",
    role: "Team Lead & Backend Developer",
    description: "Volunteered to build a website for a nonprofit organization, leading the team and developing the backend system to support dynamic activity listings, content management, and user communication.",
    tech: ["Laravel", "PHP", "MySQL", "Tailwind CSS", "Backend Development"],
    highlights: [
      "Led development team",
      "Dynamic activity listings",
      "Content management system",
      "User communication features"
    ],
    link: "",
    icon: "Handshake",
    image: "",
    tiers: ["Intermediate", "Real-World"],
    date: "2024-12",
    order: 4,
    isPublished: true,
    association: "Universitas Multimedia Nusantara"
  },
  {
    name: "Bali Tourism Website",
    role: "Mobile Developer",
    description: "Developed an interactive website about Bali using React for the final project in the Introduction to Technology course. The website highlighted Bali's tourism and culture in line with the \"Nusantara\" theme and was showcased at a university-wide exhibition organized by HMIF Universitas Multimedia Nusantara, earning 3rd place recognition.",
    tech: ["React Native", "JavaScript", "Mobile Development"],
    highlights: [
      "3rd place at university exhibition",
      "Interactive tourism showcase",
      "Nusantara theme implementation"
    ],
    link: "",
    icon: "MapPin",
    image: "",
    tiers: ["Beginner", "Experimental"],
    date: "2024-05",
    order: 5,
    isPublished: true,
    association: "Universitas Multimedia Nusantara - Introduction to Technology Course"
  },
  {
    name: "Aplikasi Website Absen Sekolah",
    role: "Full-Stack Developer",
    description: "Developed a responsive school attendance system from scratch using native PHP and MySQL for the FIKSI SMA 2021 competition. Implemented full frontend and backend features, including camera-based student attendance input, dynamic data visualization, and interactive dashboards with embedded maps to improve accuracy and monitoring efficiency.",
    tech: ["PHP", "MySQL", "JavaScript", "HTML", "CSS", "Google Maps API"],
    highlights: [
      "Camera-based attendance input",
      "Dynamic data visualization",
      "Interactive dashboards",
      "Embedded maps integration",
      "FIKSI SMA 2021 competition entry"
    ],
    link: "",
    icon: "School",
    image: "",
    tiers: ["Intermediate", "Experimental"],
    date: "2021-10",
    order: 6,
    isPublished: true,
    association: "SMK Cinta Kasih Tzu Chi"
  }
];

/**
 * Seed all LinkedIn projects to Firestore
 * @returns {Promise<{success: number, failed: number, errors: string[]}>}
 */
export const seedLinkedInProjects = async () => {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  console.log('🚀 Starting LinkedIn projects seed...');

  for (const project of linkedInProjects) {
    try {
      const payload = {
        ...project,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await firestoreService.addDocument('projects', payload);
      results.success++;
      console.log(`✅ Added: ${project.name}`);
    } catch (error) {
      results.failed++;
      results.errors.push(`${project.name}: ${error.message}`);
      console.error(`❌ Failed: ${project.name}`, error);
    }
  }

  console.log(`\n📊 Seed complete: ${results.success} success, ${results.failed} failed`);
  return results;
};

/**
 * Check if projects already exist in Firestore
 */
export const checkExistingProjects = async () => {
  try {
    const existing = await firestoreService.getCollection('projects');
    return existing || [];
  } catch (error) {
    console.error('Error checking existing projects:', error);
    return [];
  }
};

export default seedLinkedInProjects;
