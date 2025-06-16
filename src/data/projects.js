// src/data/projects.js
const projects = [
  {
    name: "Bali Tourism Website",
    role: "Frontend Developer & Project Coordinator",
    description:
      "Developed a website about Bali tourism for a campus-held exhibition, associated with Universitas Multimedia Nusantara.",
    tech: ["HTML", "CSS", "JavaScript"],
    link: "https://ptibali.vercel.app/",
    icon: "School",
    tiers: ["Beginner", "Real-World"],
  },
  {
    name: "LINE Discord Bot Integration",
    role: "Backend Developer",
    description:
      "Created a Node.js-based bot that bridges LINE and Discord, enabling real-time message forwarding between platforms via Webhook and REST API integration.",
    tech: ["Node.js", "Express", "LINE API", "Discord.js"],
    link: "https://github.com/davidgrcias/line-discord-bot",
    icon: "BotIcon",
    tiers: ["Intermediate", "Real-World"],
  },
  {
    name: "Ark Care Ministry Website",
    role: "Backend Developer & Project Coordinator",
    description:
      "Volunteered to build a website for a nonprofit organization, leading the team and developing the backend system to support dynamic activity listings, content management, and user communication.",
    tech: ["PHP", "Laravel", "MySQL"],
    link: "https://arkcareministry.org/",
    icon: "Handshake",
    tiers: ["Advanced", "Real-World"],
  },
  {
    name: "Scream Challenge",
    role: "Frontend Developer",
    description:
      "Built a fun and experimental web app for a shouting competition, where users can test how loud they can scream. Developed the entire frontend to visualize the volume input and user interaction.",
    tech: ["HTML", "CSS", "JavaScript"],
    link: "https://github.com/davidgrcias/scream",
    icon: "Mic",
    tiers: ["Beginner", "Capstone"],
  },
];

export default projects;
