// src/data/experiences.js
import { translateObject } from "../contexts/TranslationContext";

const experiencesBase = [
  {
    role: "Coordinator of Web Division (Full Stack Developer)",
    company: "UMN FESTIVAL 2025",
    type: "Contract",
    location: "Tangerang, Banten, Indonesia",
    locationType: "Hybrid",
    description: "Led the end-to-end development of UMN Festival's official website using Laravel, React, and Midtrans, building a fully dynamic platform for managing events, announcements, and committee access. The website featured an integrated digital ticketing system for the main event, UNIFY, where attendees could purchase tickets online, receive personalized PDF e-tickets with QR codes via email, and have them scanned seamlessly at the venue — eliminating slow, manual verification through Google Forms and payment proofs.\n\nThe system also included referral and discount code mechanisms, enabling committees to easily manage promotions and track ticket sales performance per code. Additionally, the admin dashboard allowed non-technical staff to update pages, prices, and content dynamically without code changes. This digital workflow significantly improved operational efficiency, reduced human error, and modernized the entire event management process for UMN Festival 2025.",
    skills: ["Laravel", "React.js", "Payment Gateways"],
    media: {
      type: "pdf",
      url: "/umnfest2025.pdf",
      thumbnail: "/umnfest.png",
      title: "UMN Festival 2025 — UNIFY Ticketing Flow & Admin Dashboard",
      description: "Screens from the end-to-end ticketing system for UNIFY 2025: ticket selection and checkout, email order confirmation, e-ticket PDF, and the admin dashboard"
    },
    startDate: "2025-02",
    endDate: "present",
  },
  {
    role: "Full Stack Developer",
    company: "Koperasi Mikrolet Jakarta Raya (Komilet) — JakLingko Angkot Operator",
    type: "Contract",
    location: "Jakarta Metropolitan Area",
    locationType: "Remote",
    description: "Built and deployed a full-stack TypeScript platform for Koperasi Mikrolet Jakarta Raya (Komilet)—a JakLingko (Jakarta Integrated Transport System) angkot operator—to digitize end-to-end internal operations across drivers, vehicle owners, admin staff, and management. The system replaces fragmented paper workflows with a centralized, role-based application, consistent data models, and structured reporting.\n\n- Operations & master data: driver onboarding & profiles; owner & fleet registry (vehicle records); route (trayek) configuration; duty roster/shift scheduling; timestamped trip/base logging.\n- Finance & revenue: driver payroll with allowance/bonus/penalty rules; fines & deductions; expense tracking (e.g., fuel/maintenance); reconciliation between reported trips and payouts; month-end exports (CSV/PDF).\n- Compliance & verification: TransJakarta verification workflow with multi-level approvals, audit trails, and immutable activity logs for traceability.\n- Communication & access control: internal announcements and role-scoped access so drivers, owners, staff, and management see only relevant actions and data.\n- Analytics & reporting: distance (km) logs, earnings estimates, attendance & productivity per driver/route, penalty/fine summaries, route performance, and daily/weekly/monthly operational dashboards.\n- Platform: PostgreSQL data layer, responsive UI for non-technical users, authentication with RBAC, data import/export, background jobs for heavy reports, periodic backups, and REST APIs for future integrations.\n\nImpact: eliminated manual data entry and paper handling, improved accuracy and auditability, accelerated approvals and reporting cycles, and enabled data-driven decision-making across operational levels.",
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
  },
  {
    role: "Frontend Developer",
    company: "UMN Visual Journalism Day 2024",
    type: "Contract",
    location: "Tangerang, Banten, Indonesia",
    locationType: "Hybrid",
    description: "Developed the frontend interface for UMN Visual Journalism Day 2024 event website using TypeScript and React with Tailwind CSS.",
    skills: ["TypeScript", "React", "Tailwind CSS", "Git Workflow"],
    startDate: "2024-06",
    endDate: "2024-10",
  },
  {
    role: "Frontend Developer",
    company: "PPIF UMN 2024",
    type: "Contract",
    location: "Tangerang, Banten, Indonesia",
    locationType: "Hybrid",
    description: "Contributed to the frontend development of PPIF UMN 2024 event website, implementing responsive design and interactive features.",
    skills: ["React", "Tailwind CSS", "Git Workflow"],
    startDate: "2024-04",
    endDate: "2024-08",
  },
  {
    role: "Backend Developer",
    company: "UMN Tech Festival 2024",
    type: "Contract",
    location: "Tangerang, Banten, Indonesia",
    locationType: "Hybrid",
    description: "Developed backend systems and database architecture for UMN Tech Festival 2024 using Laravel and MySQL.",
    skills: ["Laravel", "PHP", "MySQL", "Git Workflow"],
    startDate: "2023-09",
    endDate: "2024-03",
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
  },
];

// Function to get translated experiences based on current language
export const getExperiences = (currentLanguage = "en") => {
  if (currentLanguage === "en") {
    return experiencesBase;
  }
  return translateObject(experiencesBase, currentLanguage);
};

export default experiencesBase;
