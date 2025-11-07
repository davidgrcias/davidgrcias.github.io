// src/data/projects.js
import { translateObject } from "../contexts/TranslationContext";

const projectsBase = [
  {
    name: "Ark Care Ministry Website",
    role: "Backend Developer & Project Coordinator",
    description:
      "Volunteered to build a website for a nonprofit organization, leading the team and developing the backend system to support dynamic activity listings, content management, and user communication.",
    tech: ["PHP", "Laravel", "MySQL"],
    highlights: [
      "Led a four-person volunteer squad to ship the MVP and onboarding flow on schedule.",
      "Built modular backend endpoints to power dynamic activity listings and CMS updates.",
      "Introduced secure messaging channels so staff and volunteers can coordinate quickly.",
    ],
    link: "https://arkcareministry.org/",
    icon: "Handshake",
    tiers: ["Advanced", "Real-World"],
    date: "2024-12", // May 2025
  },
  {
    name: "LINE Discord Bot Integration",
    role: "Backend Developer",
    description:
      "Created a Node.js-based bot that bridges LINE and Discord, enabling real-time message forwarding between platforms via Webhook and REST API integration.",
    tech: ["Node.js", "Express", "LINE API", "Discord.js"],
    highlights: [
      "Mapped LINE webhook events into Discord embeds with role-specific routing rules.",
      "Added delivery confirmation logs and retries to keep cross-platform chats reliable.",
      "Exposed admin slash commands so moderators can pause or resume relay channels instantly.",
    ],
    link: "https://github.com/davidgrcias/line-discord-bot",
    icon: "BotIcon",
    tiers: ["Intermediate", "Real-World"],
    date: "2025-03", // March 2025
  },
  {
    name: "Rental Mobil City Park Website",
    role: "Frontend Developer",
    description:
      "Solely managed and built the frontend of a car rental service website for a family-run business. Designed responsive UI for browsing available cars, and other informations.",
    tech: ["HTML", "CSS", "JavaScript", "React"],
    highlights: [
      "Delivered adaptive car listings with quick filters for price, seats, and transmission.",
      "Optimized hero imagery and assets so the site loads fast on mid-tier mobile devices.",
      "Iterated weekly with business owners to capture accurate copy and booking messages.",
    ],
    link: "https://rentalmobilcitypark.vercel.app/",
    icon: "Car",
    tiers: ["Intermediate", "Real-World"],
    date: "2024-09", // February 2025
  },
  {
    name: "Bali Tourism Website",
    role: "Frontend Developer & Project Coordinator",
    description:
      "Developed a website about Bali tourism for a campus-held exhibition, associated with Universitas Multimedia Nusantara.",
    tech: ["HTML", "CSS", "JavaScript"],
    highlights: [
      "Orchestrated campus exhibit content, blending faculty input with student stories.",
      "Crafted immersive destination sections with layered gradients and motion cues.",
      "Embedded quick facts and travel tips so visitors could scan must-see spots fast.",
    ],
    link: "https://ptibali.vercel.app/",
    icon: "School",
    tiers: ["Intermediate", "Capstone"],
    date: "2024-07", // November 2024
  },
  {
    name: "Scream Challenge Website",
    role: "Frontend Developer",
    description:
      "Built a fun and experimental web app for a shouting competition, where users can test how loud they can scream. Developed the entire frontend to visualize the volume input and user interaction.",
    tech: ["HTML", "CSS", "JavaScript"],
    highlights: [
      "Animated decibel gauges that react in real time to microphone input.",
      "Calibrated scoring states so participants instantly see personal records.",
      "Packaged the experience for pop-up events with simple setup instructions.",
    ],
    link: "https://github.com/davidgrcias/scream",
    icon: "Mic",
    tiers: ["Beginner", "Experimental"],
    date: "2023-07", // September 2024
  },
  {
    name: "Visitor IP Tracker",
    role: "Fullstack Developer",
    description:
      "Created a lightweight visitor tracking system that detects and stores website visitor IP details, such as country, ASN, and bot status into a MySQL database using an external IP API and native PHP. Built both the frontend request handler and backend data storage logic.",
    tech: ["PHP", "MySQL", "jQuery", "IPDetective API"],
    link: "https://github.com/davidgrcias/getclientipaddress",
    icon: "Globe",
    tiers: ["Beginner", "Experimental"],
    date: "2023-01", // July 2024
  },
  {
    name: "Money Tracker Website",
    role: "Fullstack Developer",
    description:
      "Developed a simple money tracking app for personal finance management as part of a midterm exam project. The app allows users to log income and expenses, displaying totals with dynamic updates.",
    tech: ["HTML", "CSS", "JavaScript"],
    link: "https://davidgrcias.github.io/midtermexamlab",
    icon: "Wallet",
    tiers: ["Beginner", "Capstone"],
    date: "2023-07", // May 2024
  },
  {
    name: "Lyrics Animation Generator",
    role: "Frontend Developer",
    description:
      "Built an interactive lyrics animation tool that lets users create, preview, and customize animated lyric displays with adjustable delays and durations. Utilizes the Vara.js library to render handwriting-style animations with real-time controls and table management.",
    tech: ["HTML", "CSS", "JavaScript", "Vara.js"],
    link: "https://github.com/davidgrcias/lyricsgenerator",
    icon: "Music2",
    tiers: ["Beginner", "Experimental"],
    date: "2024-07", // March 2024
  },
  {
    name: "Simple Photo Booth Website",
    role: "Frontend Developer",
    description:
      "Developed an interactive photo booth web app that accesses the user’s camera, allows timed captures, previews taken photos, and enables downloads. Built entirely in vanilla JavaScript with DOM manipulation, mediaStream API, and dynamic UI creation.",
    tech: ["HTML", "CSS", "JavaScript"],
    link: "https://github.com/davidgrcias/photoboothjs",
    icon: "Camera",
    tiers: ["Beginner", "Experimental"],
    date: "2023-12",
  },
  {
    name: "Aplikasi Website Kelas",
    role: "Fullstack Developer",
    description:
      "Built a classroom management web application to support online learning environments. Implemented both frontend and backend features including student data input, class schedules, and basic navigation/dashboard layout.",
    tech: ["PHP", "MySQL", "HTML", "CSS", "JavaScript"],
    link: "https://github.com/davidgrcias/AplikasiKelas",
    icon: "BookOpen",
    tiers: ["Intermediate", "Capstone"],
    date: "2022-10",
  },
  {
    name: "Geolocation Data Collector",
    role: "Fullstack Developer",
    description:
      "Created a web app that captures user’s name, email, and geolocation via browser API, then stores the data in a MySQL database. Built both frontend (geolocation form) and backend (PHP + database insertion) logic, plus a data page displaying entries with embedded Google Maps.",
    tech: [
      "HTML",
      "CSS",
      "JavaScript",
      "PHP",
      "MySQL",
      "Geolocation API",
      "Google Maps",
    ],
    link: "https://github.com/davidgrcias/InsertDataWithGeolocationData",
    icon: "MapPin",
    tiers: ["Intermediate", "Experimental"],
    date: "2022-02",
  },
  {
    name: "Simple Card Template Maker",
    role: "Fullstack Developer",
    description:
      "Built a dynamic, real‑time card generator that lets users upload images, customize colors and text, and download the result as PNG. Backend handles image uploads in PHP, while frontend uses jQuery and html2canvas for live preview and export.",
    tech: ["PHP", "jQuery", "HTML2Canvas", "HTML", "CSS", "JavaScript"],
    link: "https://github.com/davidgrcias/CardTemplateMaker",
    icon: "ImageIcon",
    tiers: ["Beginner", "Experimental"],
    date: "2022-12",
  },
  {
    name: "Aplikasi Website Absen Sekolah",
    role: "Fullstack Developer",
    description:
      "Developed a responsive school attendance system from scratch using native PHP and MySQL. Built full frontend and backend features including student attendance input (with camera), dynamic data display, and interactive dashboards with embedded maps.",
    tech: ["PHP", "MySQL", "HTML", "CSS", "JavaScript"],
    link: "https://github.com/davidgrcias/aplikasi-absen-sekolah-old",
    icon: "Clipboard",
    tiers: ["Intermediate", "Capstone"],
    date: "2021-09",
  },
];

// Function to get translated projects based on current language
export const getProjects = (currentLanguage = "en") => {
  if (currentLanguage === "en") {
    return projectsBase;
  }
  return translateObject(projectsBase, currentLanguage);
};

export default projectsBase;
