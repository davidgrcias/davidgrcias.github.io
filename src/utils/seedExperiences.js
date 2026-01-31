import { firestoreService } from '../services/firestore';

/**
 * Experiences data from LinkedIn
 * Run this once to populate Firestore with all experiences
 */
export const linkedInExperiences = [
  {
    role: "Software Developer",
    company: "NuxaTech",
    type: "Contract",
    location: "Tangerang, Banten, Indonesia",
    locationType: "On-site",
    description: "- Develop, test, and maintain high-quality code according to enterprise specifications for GMF AeroAsia.\n- Perform rigorous risk and impact analysis before code transport or system updates to ensure operational stability.\n- Manage the software lifecycle within a development environment and execute deployments following strict versioning standards.\n- Create comprehensive technical documentation for all development processes and code architectures.\n- Collaborate with QA teams and Business Analysts to deliver robust digital solutions for the aviation industry.",
    skills: ["SASS", "Bitbucket", "Jira", "Angular", "Web Engineering"],
    startDate: "2026-01",
    endDate: "present",
    order: 1
  },
  {
    role: "Full Stack Developer",
    company: "Koperasi Mikrolet Jakarta Raya (Komilet)",
    type: "Contract",
    location: "Jakarta Metropolitan Area",
    locationType: "Hybrid",
    description: "Engineered and deployed a mission-critical fleet management platform for Koperasi Mikrolet Jakarta Raya (JakLingko Angkot Operator), digitizing end-to-end operations for 383 vehicles and 1,400+ active users. Transformed fragmented manual workflows into a centralized, role-based ecosystem handling daily operations, finance, and compliance.\n\nKey Impacts & Contributions:\n- 500x Efficiency Boost: Automated the TransJakarta verification workflow for 1,600+ daily trip records, reducing processing time from 3 days to ~5 minutes.\n- Operations & Finance: Built comprehensive modules for driver onboarding, fleet registry, and complex payroll automation (calculating income, fines, and operational costs based on P1/P2 cycles).\n- Infrastructure Migration: Successfully planned and executed a cost-saving migration from managed cloud services to a self-managed Hostinger VPS (Ubuntu 24.04 LTS). Configured Nginx reverse proxy, PM2 process management, and local PostgreSQL security from scratch.\n- Security & Audit: Implemented granular Role-Based Access Control (RBAC) and immutable audit trails to ensure data integrity across Admin, Staff, Owner, and Driver roles.\n- Android Initiative: Proactively prototyped a native Android GPS tracking application (Kotlin/Jetpack Compose) featuring offline-first architecture and real-time synchronization to enhance fleet visibility.",
    skills: ["Docker", "TypeScript", "Software Development", "Prisma ORM", "REST APIs", "Full-Stack Development", "Modular Programming", "Databases", "Next.js", "Nginx", "Reverse Proxy", "PostgreSQL", "Redis", "Tailwind CSS", "Virtual Private Server (VPS)", "Presentations"],
    startDate: "2025-07",
    endDate: "2026-01",
    media: {
      type: "link",
      url: "",
      thumbnail: "",
      title: "Aplikasi Komilet",
      description: ""
    },
    order: 2
  },
  {
    role: "Coordinator of Web Division (Full Stack Developer)",
    company: "UMN FESTIVAL 2025",
    type: "Contract",
    location: "Tangerang, Banten, Indonesia",
    locationType: "Hybrid",
    description: "Engineered the official digital ecosystem for UMN Festival 2025, handling high-traffic ticket sales and event management for thousands of students and external visitors. Led the end-to-end development of a secure ticketing platform that successfully processed Rp 100,000,000+ in revenue.\n\nKey Impacts & Contributions:\n- High-Volume Ticketing System: Developed a robust booking engine (Laravel + React Inertia) capable of handling concurrent requests during flash sales. Processed 2,000+ tickets with integrated Midtrans payment gateway (QRIS, VA, E-Wallet).\n- Automated Validation Flow: Eliminated manual payment checks by implementing automatic webhook verification. Users receive personalized PDF e-tickets with secure QR codes instantly upon payment success.\n- Security Initiative: Proactively built a Camera Analysis System for on-site ticket scanning. Designed a real-time audit log that captures scan timestamps and user data to prevent ticket reuse and resolve potential entry disputes.\n- Dynamic Admin Dashboard: Created a modular admin panel allowing non-technical staff to manage content, track sales analytics, monitor referral code performance, and validate check-ins in real-time without developer intervention.\n- Marketing Integration: Implemented referral code logic and discount mechanisms to boost ticket sales, providing committee members with granular performance tracking.",
    skills: ["Laravel", "TypeScript", "Accessible PDF Creation", "MySQL", "QR", "React.js", "Team Leadership", "Image Optimization", "Google Drive", "Tailwind CSS", "Email", "Inertia.js", "Payment Gateways"],
    startDate: "2025-01",
    endDate: "2025-12",
    media: {
      type: "link",
      url: "",
      thumbnail: "",
      title: "UMN Festival 2025 — UNIFY Ticketing Flow & Admin Dashboard",
      description: "Screens from the end-to-end ticketing system for UNIFY 2025: ticket selection and checkout, email order confirmation, e-ticket PDF, and the admin dashboard showing..."
    },
    order: 3
  },
  {
    role: "IT Content Creator",
    company: "David G Tech (YouTube & TikTok)",
    type: "Freelance",
    location: "Remote",
    locationType: "Remote",
    description: "Produced web development tutorial content (Frontend, Backend, Database) on YouTube & TikTok, achieving monetization status and simplifying technical concepts for beginner audiences.",
    skills: ["JavaScript", "Laravel", "jQuery", "Web Content Creation", "MySQL", "Bootstrap", "PHP", "YouTube", "Cascading Style Sheets (CSS)", "Search Engine Optimization (SEO)"],
    startDate: "2021-03",
    endDate: "2025-09",
    media: {
      type: "link",
      url: "",
      thumbnail: "",
      title: "David G Tech - YouTube",
      description: ""
    },
    order: 4
  },
  {
    role: "Founder & Web Developer",
    company: "Rental Mobil City Park",
    type: "Self-employed",
    location: "Jakarta, Indonesia",
    locationType: "Remote",
    description: "Built the business's frontend website and configured Google Maps Business Profile, achieving 950+ monthly customer interactions and a 5-star rating (60+ reviews).",
    skills: ["Google Maps", "Search Engine Optimization (SEO)", "Digital Marketing"],
    startDate: "2024-06",
    endDate: "2025-08",
    media: {
      type: "link",
      url: "",
      thumbnail: "",
      title: "Rental Mobil City Park – Verified Google Business Profile",
      description: "Public business listing on Google Maps showcasing the verified online presence of Rental Mobil City Park, including location, contact, and customer reviews. Created and..."
    },
    order: 5
  },
  {
    role: "Frontend Developer",
    company: "Visual Journalism Day",
    type: "Contract",
    location: "Tangerang, Banten, Indonesia",
    locationType: "Hybrid",
    description: "Contributed as a frontend developer for the event website, implementing and adjusting assigned UI components using TypeScript based on committee requirements.",
    skills: ["TypeScript"],
    startDate: "2024-06",
    endDate: "2024-10",
    order: 6
  },
  {
    role: "Frontend Developer",
    company: "PPIFUMN2024",
    type: "Contract",
    location: "Tangerang, Banten, Indonesia",
    locationType: "Hybrid",
    description: "Worked as a frontend developer on the PPIF UMN 2024 website, helping build and refine event pages using React and Tailwind CSS.",
    skills: ["React.js", "Tailwind CSS"],
    startDate: "2024-04",
    endDate: "2024-08",
    order: 7
  }
];

/**
 * Seed all LinkedIn experiences to Firestore
 * @returns {Promise<{success: number, failed: number, errors: string[]}>}
 */
export const seedLinkedInExperiences = async () => {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  console.log('🚀 Starting LinkedIn experiences seed...');

  for (const experience of linkedInExperiences) {
    try {
      const payload = {
        ...experience,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await firestoreService.addDocument('experiences', payload);
      results.success++;
      console.log(`✅ Added: ${experience.role} at ${experience.company}`);
    } catch (error) {
      results.failed++;
      results.errors.push(`${experience.role} at ${experience.company}: ${error.message}`);
      console.error(`❌ Failed: ${experience.role}`, error);
    }
  }

  console.log(`\n📊 Seed complete: ${results.success} success, ${results.failed} failed`);
  return results;
};

export default seedLinkedInExperiences;
