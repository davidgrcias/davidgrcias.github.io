// This code is designed for React 19+ and Tailwind CSS v4+
import React, { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Youtube,
  Github,
  Mail,
  MapPin,
  Award,
  Code,
  Star,
  Heart,
  Eye,
  Clock,
  Linkedin,
  Rss,
  Layers,
  Bot,
  ExternalLink,
  School,
  Sun,
  Moon,
  Building,
  LineChart,
  Lightbulb,
  Rocket,
  Forward,
  ThumbsDown,
  Coffee,
  Map as MapIcon,
  SmilePlus,
  Laptop,
  MoonStar,
  Smile,
  BrainCircuit,
  Gamepad2,
  Loader,
} from "lucide-react";

// --- CONTEXT for theme ---
const AppContext = createContext();

// --- MOCK DATA (Most data is now fetched or static) ---
const userProfile = {
  name: "David Garcia Saragih",
  headline: "Frontend Developer & Content Creator",
  photoUrl: "https://placehold.co/400x400/1a1a2e/e94560?text=DG",
  aboutText:
    "Hello! I'm David, a YouTuber who creates educational technology videos about programming, especially in developing and designing websites. I am passionate about programming and dream of becoming an expert Software Engineer. Starting from vocational school, my curiosity about technology has driven me to continuously learn and experiment, turning coding from a hobby into a core part of my projects.",
  contact: {
    email: "davidgarciasaragih7@gmail.com",
    location: "Jakarta, Indonesia",
  },
  socials: {
    youtube: {
      url: "https://www.youtube.com/c/DavidGTech",
      handle: "@DavidGTech",
    },
    tiktok: {
      url: "https://www.tiktok.com/@davidgtech",
      handle: "@davidgtech",
    },
    github: { url: "https://github.com/davidgrcias", handle: "davidgrcias" },
    linkedin: {
      url: "https://www.linkedin.com/in/david-garcia-saragih/",
      handle: "david-garcia-saragih",
    },
  },
};
const insights = [
  {
    title: "Advice for New Programmers",
    text: "Learn the basics deeply, explore as widely as possible, and leverage your curiosity to grow continuously.",
    icon: <Lightbulb />,
  },
  {
    title: "Advice I'm Glad I Ignored",
    text: "Spend your youth just having fun without goals—I'm thankful I focused on building my future early.",
    icon: <ThumbsDown />,
  },
  {
    title: "Motivation",
    text: "Driven by success and unafraid of failure—I see every setback as an opportunity to grow.",
    icon: <Rocket />,
  },
  {
    title: "Never Going Back",
    text: "I'll never return to being the shy and reserved person I once was. Now, I confidently embrace opportunities to speak and connect.",
    icon: <Forward />,
  },
];
const funFacts = [
  {
    title: "Favorite Workplace",
    text: "Cafés—especially those with good coffee and cozy vibes.",
    icon: <Coffee />,
  },
  {
    title: "Hidden Talent",
    text: "Ask me about Jakarta's transport routes—I can tell you the best way to reach any destination using public transport!",
    icon: <MapIcon />,
  },
  {
    title: "Surprising Fact",
    text: "Despite appearing reserved, I genuinely enjoy conversations with new people.",
    icon: <SmilePlus />,
  },
  {
    title: "Essential Item",
    text: "My laptop—I can't imagine life without it.",
    icon: <Laptop />,
  },
  {
    title: "Most Productive Hours",
    text: "I'm at my best late at night.",
    icon: <MoonStar />,
  },
  {
    title: "Best Way to Relax",
    text: "Relaxing feels best after a productive day—I love winding down after meaningful work.",
    icon: <Smile />,
  },
];
const experiences = [
  {
    role: "Content Creator",
    company: "YouTube",
    period: "Mar 2021 - Present",
    type: "Freelance",
    skills: ["HTML5", "CSS3", "JavaScript", "Video Editing"],
  },
  {
    role: "Frontend Developer",
    company: "Visual Journalism Day",
    period: "Jun 2024 - Oct 2024",
    type: "Contract",
    skills: ["TypeScript", "React", "Next.js"],
  },
  {
    role: "Frontend Developer",
    company: "PPIFUMN2024",
    period: "Apr 2024 - Aug 2024",
    type: "Contract",
    skills: ["React.js", "Tailwind CSS"],
  },
  {
    role: "Back End Developer",
    company: "UMN Tech Festival 2024",
    period: "Sep 2023 - Mar 2024",
    type: "Contract",
    skills: ["Laravel", "PHP", "MySQL"],
  },
  {
    role: "Web Developer",
    company: "DAAI TV (Eid Greeting Card)",
    period: "Mar 2022 - May 2022",
    type: "Internship",
    skills: ["PHP", "JavaScript", "Bootstrap"],
  },
];
const projects = [
  {
    name: "Rental Mobil City Park",
    role: "Founder & Digital Strategist",
    description:
      "Managed and developed a car rental business, including digital strategy and online presence.",
    tech: ["Business Strategy", "Digital Marketing", "Management"],
    link: "#",
    icon: <Building />,
  },
  {
    name: "Website Exhibition - Bali Tourism",
    role: "Frontend Developer",
    description:
      "Developed a website about Bali tourism for a campus-held exhibition, associated with Universitas Multimedia Nusantara.",
    tech: ["HTML", "CSS", "JavaScript"],
    link: "#",
    icon: <School />,
  },
  {
    name: "Personal Blog Platform",
    role: "Fullstack Developer",
    description:
      "A custom blog built with Next.js and a headless CMS to share tech articles and tutorials.",
    tech: ["Next.js", "React", "Tailwind CSS", "GraphQL"],
    link: "#",
    icon: <Rss />,
  },
  {
    name: "YouTube Stats Visualizer",
    role: "Frontend Developer",
    description:
      "An interactive dashboard to visualize YouTube channel analytics using the YouTube Data API and Chart.js.",
    tech: ["React", "Chart.js", "API Integration"],
    link: "#",
    icon: <LineChart />,
  },
];
const skills = [
  { name: "HTML", level: 100, icon: <Code size={24} /> },
  { name: "CSS & Tailwind", level: 95, icon: <Layers size={24} /> },
  { name: "JavaScript", level: 95, icon: <Code size={24} /> },
  { name: "React.js", level: 90, icon: <Bot size={24} /> },
  { name: "PHP", level: 95, icon: <Code size={24} /> },
  { name: "MySQL", level: 95, icon: <Code size={24} /> },
  { name: "Python", level: 50, icon: <Code size={24} /> },
  { name: "TypeScript", level: 75, icon: <Code size={24} /> },
];
const certifications = [
  {
    name: "PHP Course",
    provider: "Progate",
    date: "Jan 2022",
    certImage: `https://placehold.co/1600x900/1e293b/ffffff?text=PHP+Course+Certificate`,
  },
  {
    name: "React Course",
    provider: "Progate",
    date: "Jan 2022",
    certImage: `https://placehold.co/1600x900/1e293b/ffffff?text=React+Course+Certificate`,
  },
  {
    name: "SQL Course",
    provider: "Progate",
    date: "Jan 2022",
    certImage: `https://placehold.co/1600x900/1e293b/ffffff?text=SQL+Course+Certificate`,
  },
  {
    name: "Web Development Course",
    provider: "Progate",
    date: "Jan 2022",
    certImage: `https://placehold.co/1600x900/1e293b/ffffff?text=Web+Dev+Course+Certificate`,
  },
  {
    name: "GIT Course",
    provider: "Progate",
    date: "Dec 2021",
    certImage: `https://placehold.co/1600x900/1e293b/ffffff?text=GIT+Course+Certificate`,
  },
  {
    name: "Startup of New Innovation Challenge",
    provider: "HIMPS-HI UPH",
    date: "Mar 2022",
    certImage: `https://placehold.co/1600x900/1e293b/ffffff?text=Startup+Challenge+Certificate`,
  },
];
const education = [
  {
    degree: "Bachelor's degree, Informatics",
    institution: "Universitas Multimedia Nusantara",
    period: "2023 - 2027",
    grade: "3.87",
  },
  {
    degree: "Software Engineering",
    institution: "SMK Cinta Kasih Tzu Chi",
    period: "2020 - 2023",
  },
];

// --- Custom Cursor ---
const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  useEffect(() => {
    const updatePosition = (e) => setPosition({ x: e.clientX, y: e.clientY });
    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, [role="button"]')) setIsHovering(true);
    };
    const handleMouseOut = (e) => {
      if (e.target.closest('a, button, [role="button"]')) setIsHovering(false);
    };
    window.addEventListener("mousemove", updatePosition);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      window.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);
  const cursorVariants = {
    default: { scale: 1 },
    hovering: { scale: 2.5, opacity: 0.4 },
  };
  return (
    <motion.div
      className="hidden lg:block pointer-events-none fixed top-0 left-0 z-[999] w-8 h-8 rounded-full bg-cyan-500/30 border-2 border-cyan-400"
      style={{ x: position.x - 16, y: position.y - 16 }}
      variants={cursorVariants}
      animate={isHovering ? "hovering" : "default"}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    />
  );
};

// --- Splash Screen ---
const SplashScreen = () => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 bg-[#0f172a] z-[1000] flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, delay: 0.5 } }}
    >
      <motion.div
        className="w-24 h-24 border-4 border-t-cyan-500 border-r-cyan-500 border-b-transparent border-l-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  </AnimatePresence>
);

// --- Reusable Components ---
const AnimatedSection = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const SectionTitle = ({ children }) => {
  const { theme } = useContext(AppContext);
  return (
    <h2
      className={`text-3xl md:text-4xl font-bold ${
        theme === "dark" ? "text-gray-100" : "text-slate-800"
      } mb-12 text-center relative`}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute -top-2 -left-2 w-10 h-10 bg-cyan-500/20 rounded-full z-0"></span>
    </h2>
  );
};

const Header = () => {
  const { theme, setTheme } = useContext(AppContext);
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-100/80 dark:bg-[#0f172a]/80 backdrop-blur-sm shadow-md dark:shadow-cyan-500/10">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a
          href="#"
          onClick={(e) => handleNavClick(e, "#hero")}
          className="text-xl font-bold text-slate-800 dark:text-white tracking-wider"
        >
          David G.
        </a>
        <div className="hidden md:flex items-center space-x-6 text-sm text-slate-600 dark:text-gray-300">
          <a
            href="#about"
            onClick={(e) => handleNavClick(e, "#about")}
            className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            About
          </a>
          <a
            href="#experience"
            onClick={(e) => handleNavClick(e, "#experience")}
            className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            Experience
          </a>
          <a
            href="#projects"
            onClick={(e) => handleNavClick(e, "#projects")}
            className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            Projects
          </a>
          <a
            href="#skills"
            onClick={(e) => handleNavClick(e, "#skills")}
            className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            Skills
          </a>
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "#contact")}
            className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            Contact
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a
            href={`mailto:${userProfile.contact.email}`}
            className="hidden md:block bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-transform duration-300 hover:scale-105 text-sm"
          >
            Hire Me
          </a>
        </div>
      </nav>
    </header>
  );
};

const CertificationsSection = () => {
  const [openCert, setOpenCert] = useState(null);
  return (
    <AnimatedSection delay={0.2}>
      <h2 className="text-3xl font-bold text-slate-800 dark:text-gray-100 mb-8 text-center">
        Licenses & Certifications
      </h2>
      <div className="space-y-4">
        {certifications.map((cert, index) => (
          <div key={index}>
            <motion.div
              role="button"
              onClick={() => setOpenCert(openCert === index ? null : index)}
              className="bg-slate-200/50 dark:bg-slate-800/50 p-4 rounded-lg flex items-center border border-transparent hover:border-cyan-500/30 transition-colors cursor-pointer"
              viewport={{ once: true }}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Award
                className="text-cyan-500 dark:text-cyan-400 mr-4 flex-shrink-0"
                size={24}
              />
              <div>
                <p className="font-bold text-slate-800 dark:text-white">
                  {cert.name}
                </p>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  {cert.provider} - {cert.date}
                </p>
              </div>
            </motion.div>
            <AnimatePresence>
              {openCert === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: "1rem" }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <img
                    src={cert.certImage}
                    alt={`${cert.name} certificate`}
                    className="rounded-lg w-full object-cover"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </AnimatedSection>
  );
};

// --- NEW: YouTube Stats Component with Real-time Data ---
const YouTubeStats = () => {
  const fallbackStats = {
    subscribers: "4.7K+",
    views: "876K+",
    likes: "11K+", // Static data as per old site
    watchHours: "30K+", // Static data as per old site
  };

  const [stats, setStats] = useState(fallbackStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiKey = "REMOVED_KEY"; // API Key from your old code
    const channelID = "UCDRagVrqj_v2Wbf_UFfTluw"; // Channel ID from your old code
    const part = "statistics";
    const url = `https://www.googleapis.com/youtube/v3/channels?part=${part}&id=${channelID}&key=${apiKey}`;

    const fetchStats = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const channelStats = data.items[0].statistics;

        setStats({
          subscribers: formatNumber(channelStats.subscriberCount),
          views: formatNumber(channelStats.viewCount),
          likes: "11K+", // Keep static as it's not in this API response
          watchHours: "30K+", // Keep static as it's not in this API response
        });
      } catch (error) {
        console.error("Failed to fetch YouTube stats:", error);
        setStats(fallbackStats); // Revert to fallback on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const StatItem = ({ icon, value, label }) => (
    <div className="flex items-center">
      {icon}
      <div>
        <span className="font-bold text-xl text-slate-800 dark:text-white">
          {isLoading ? <Loader size={20} className="animate-spin" /> : value}
        </span>
        <br />
        {label}
      </div>
    </div>
  );

  return (
    <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-xl border border-slate-200 dark:border-gray-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
      <div className="flex items-center mb-6">
        <Youtube className="text-red-500 mr-4" size={40} />
        <div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
            YouTube
          </h3>
          <a
            href={userProfile.socials.youtube.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            {userProfile.socials.youtube.handle}
          </a>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <StatItem
          icon={<Star className="text-yellow-400 mr-3" />}
          value={stats.subscribers}
          label="Subscribers"
        />
        <StatItem
          icon={<Eye className="text-blue-400 mr-3" />}
          value={stats.views}
          label="Views"
        />
        <StatItem
          icon={<Heart className="text-pink-400 mr-3" />}
          value={stats.likes}
          label="Likes"
        />
        <StatItem
          icon={<Clock className="text-green-400 mr-3" />}
          value={stats.watchHours}
          label="Watch Hours"
        />
      </div>
    </div>
  );
};

// --- MAIN PORTFOLIO CONTENT ---
const PortfolioContent = () => {
  const { theme } = useContext(AppContext);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState("philosophy");

  useEffect(() => {
    const handleMouseMove = (event) =>
      setMousePosition({ x: event.clientX, y: event.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const backgroundGradient =
    theme === "dark"
      ? `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(22, 163, 175, 0.2), transparent 80%)`
      : `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(22, 163, 175, 0.1), transparent 80%)`;

  const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const gridItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const TabButton = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`${
        activeTab === id ? "text-cyan-500" : "text-slate-500 dark:text-gray-400"
      } relative flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors duration-300 focus:outline-none`}
    >
      {icon} {label}
      {activeTab === id && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"
        />
      )}
    </button>
  );

  return (
    <div
      className={` ${
        theme === "dark"
          ? "dark bg-[#0f172a] text-gray-300"
          : "bg-slate-50 text-slate-700"
      } font-sans leading-relaxed selection:bg-cyan-400/20 transition-colors duration-500 overflow-x-hidden`}
    >
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: backgroundGradient }}
        transition={{ type: "tween", ease: "backOut", duration: 0.5 }}
      />
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-6 pt-24">
          <section
            id="hero"
            className="min-h-screen flex flex-col items-center justify-center text-center -mt-20"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-32 h-32 md:w-40 md:h-40 mb-6 rounded-full overflow-hidden border-4 border-cyan-500/50 shadow-lg shadow-cyan-500/20"
            >
              <img
                src={userProfile.photoUrl}
                alt={userProfile.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-extrabold text-slate-800 dark:text-white mb-2"
            >
              {userProfile.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-cyan-600 dark:text-cyan-400"
            >
              {userProfile.headline}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex justify-center space-x-6 mt-8"
            >
              <a
                href={userProfile.socials.github.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-transform duration-300 hover:scale-125"
              >
                <Github size={28} />
              </a>
              <a
                href={userProfile.socials.youtube.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-transform duration-300 hover:scale-125"
              >
                <Youtube size={28} />
              </a>
              <a
                href={userProfile.socials.tiktok.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-transform duration-300 hover:scale-125"
              >
                <Rss size={28} />
              </a>
              <a
                href={userProfile.socials.linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-transform duration-300 hover:scale-125"
              >
                <Linkedin size={28} />
              </a>
            </motion.div>
          </section>

          <section id="about" className="py-20">
            <AnimatedSection>
              <SectionTitle>About Me</SectionTitle>
              <p className="max-w-3xl mx-auto text-center text-lg text-slate-600 dark:text-gray-400 leading-relaxed">
                {userProfile.aboutText}
              </p>
              <div className="max-w-4xl mx-auto mt-16">
                <div className="flex justify-center border-b border-slate-200 dark:border-gray-700 mb-8">
                  <TabButton
                    id="philosophy"
                    label="My Philosophy"
                    icon={<BrainCircuit size={18} />}
                  />
                  <TabButton
                    id="funfacts"
                    label="Personal Fun Facts"
                    icon={<Gamepad2 size={18} />}
                  />
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeTab === "philosophy" && (
                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        variants={gridContainerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {insights.map((item) => (
                          <motion.div
                            key={item.title}
                            className="bg-slate-100 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-gray-700 flex items-start gap-4 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1"
                            variants={gridItemVariants}
                          >
                            <div className="text-cyan-500 dark:text-cyan-400 mt-1 flex-shrink-0">
                              {React.cloneElement(item.icon, { size: 24 })}
                            </div>
                            <div>
                              {" "}
                              <h4 className="font-bold text-slate-800 dark:text-white mb-1">
                                {item.title}
                              </h4>{" "}
                              <p className="text-sm text-slate-600 dark:text-gray-400">
                                {item.text}
                              </p>{" "}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                    {activeTab === "funfacts" && (
                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        variants={gridContainerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {funFacts.map((item) => (
                          <motion.div
                            key={item.title}
                            className="bg-slate-100 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-gray-700 flex items-start gap-4 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1"
                            variants={gridItemVariants}
                          >
                            <div className="text-cyan-500 dark:text-cyan-400 mt-1 flex-shrink-0">
                              {React.cloneElement(item.icon, { size: 24 })}
                            </div>
                            <div>
                              {" "}
                              <h4 className="font-bold text-slate-800 dark:text-white mb-1">
                                {item.title}
                              </h4>{" "}
                              <p className="text-sm text-slate-600 dark:text-gray-400">
                                {item.text}
                              </p>{" "}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </AnimatedSection>
          </section>

          <section id="stats" className="py-20">
            <AnimatedSection>
              <SectionTitle>My Content Creation Journey</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <YouTubeStats />
                <div className="space-y-8">
                  <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-xl border border-slate-200 dark:border-gray-700 hover:border-cyan-500/50 transition-all duration-300 flex items-center justify-between hover:shadow-2xl hover:shadow-cyan-500/10">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                        <Rss className="mr-3" /> TikTok
                      </h3>
                      <p className="text-slate-600 dark:text-gray-400">
                        Shorts, tips, and fun tech content.
                      </p>
                    </div>
                    <a
                      href={userProfile.socials.tiktok.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-800 hover:bg-slate-900 text-white dark:bg-white/90 dark:hover:bg-white dark:text-black font-bold py-2 px-4 rounded-lg transition-transform duration-300 hover:scale-105 flex items-center"
                    >
                      Visit <ExternalLink size={16} className="ml-2" />
                    </a>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-xl border border-slate-200 dark:border-gray-700 hover:border-cyan-500/50 transition-all duration-300 flex items-center justify-between hover:shadow-2xl hover:shadow-cyan-500/10">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                        <Github className="mr-3" /> GitHub
                      </h3>
                      <p className="text-slate-600 dark:text-gray-400">
                        My code, experiments, and projects.
                      </p>
                    </div>
                    <a
                      href={userProfile.socials.github.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-transform duration-300 hover:scale-105 flex items-center"
                    >
                      Explore <ExternalLink size={16} className="ml-2" />
                    </a>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </section>

          <section id="experience" className="py-20">
            <AnimatedSection>
              <SectionTitle>Work Experience</SectionTitle>
              <div className="relative border-l-2 border-cyan-500/30 pl-10">
                {experiences.map((exp, index) => (
                  <motion.div
                    key={index}
                    className="mb-12 relative"
                    viewport={{ once: true }}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                  >
                    <div className="absolute -left-[49px] top-1 w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full border-4 border-cyan-500"></div>
                    <p className="text-cyan-600 dark:text-cyan-400 text-sm mb-1">
                      {exp.period}
                    </p>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                      {exp.role}{" "}
                      <span className="text-slate-500 dark:text-gray-400 font-normal">
                        at {exp.company}
                      </span>
                    </h3>
                    <p className="text-slate-500 dark:text-gray-500 mb-3">
                      {exp.type}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {exp.skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-slate-200 dark:bg-gray-700 text-xs text-cyan-700 dark:text-cyan-300 py-1 px-3 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          </section>

          <section id="education" className="py-20">
            <AnimatedSection>
              <SectionTitle>Education</SectionTitle>
              <div className="grid md:grid-cols-2 gap-8">
                {education.map((edu, index) => (
                  <motion.div
                    key={index}
                    className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-gray-700 flex"
                    viewport={{ once: true }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                  >
                    <School
                      className="text-cyan-500 dark:text-cyan-400 mr-6 mt-1 flex-shrink-0"
                      size={32}
                    />
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        {edu.institution}
                      </h3>
                      <p className="text-slate-600 dark:text-gray-400">
                        {edu.degree}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-gray-500">
                        {edu.period}
                      </p>
                      {edu.grade && (
                        <p className="text-sm text-cyan-500 dark:text-cyan-400 mt-1">
                          Grade: {edu.grade}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          </section>

          <section id="projects" className="py-20">
            <AnimatedSection>
              <SectionTitle>Featured Projects</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {projects.map((proj, index) => (
                  <motion.div
                    key={index}
                    className="bg-slate-100 dark:bg-slate-800/50 rounded-xl overflow-hidden border border-slate-200 dark:border-gray-700 group transition-all duration-300 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2 flex flex-col"
                    viewport={{ once: true }}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="p-6 flex-grow">
                      <div className="text-cyan-500 dark:text-cyan-400 mb-4">
                        {React.cloneElement(proj.icon, { size: 40 })}
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                        {proj.name}
                      </h3>
                      <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mb-3">
                        {proj.role}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-gray-400 mb-4 flex-grow">
                        {proj.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {proj.tech.map((t) => (
                          <span
                            key={t}
                            className="bg-slate-200 dark:bg-gray-700 text-xs text-cyan-700 dark:text-cyan-300 py-1 px-3 rounded-full"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-6 bg-slate-200/50 dark:bg-slate-900/50">
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-600 dark:text-cyan-400 font-semibold text-sm flex items-center group-hover:underline"
                      >
                        View Project{" "}
                        <ExternalLink
                          size={14}
                          className="ml-2 transform transition-transform group-hover:translate-x-1"
                        />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          </section>

          <section id="skills" className="py-20">
            <div className="grid md:grid-cols-2 gap-16">
              <AnimatedSection>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-gray-100 mb-8 text-center">
                  Core Competencies
                </h2>
                <div className="space-y-6">
                  {skills.map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 dark:text-white flex items-center">
                          {skill.icon}{" "}
                          <span className="ml-2">{skill.name}</span>
                        </span>
                        <span className="text-sm text-cyan-600 dark:text-cyan-400">
                          {skill.level}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2.5">
                        <motion.div
                          className="bg-cyan-500 h-2.5 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1.5,
                            ease: "easeOut",
                            delay: 0.2,
                          }}
                        ></motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
              <CertificationsSection />
            </div>
          </section>

          <section id="contact" className="py-20 text-center">
            <AnimatedSection>
              <SectionTitle>Get In Touch</SectionTitle>
              <p className="max-w-xl mx-auto text-slate-600 dark:text-gray-400 mb-8">
                I'm currently open to new opportunities and collaborations. Feel
                free to reach out if you have a project in mind or just want to
                connect!
              </p>
              <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 mb-8 text-lg">
                <div className="flex items-center">
                  <Mail className="text-cyan-500 dark:text-cyan-400 mr-3" />
                  <a
                    href={`mailto:${userProfile.contact.email}`}
                    className="text-slate-800 dark:text-white hover:underline"
                  >
                    {userProfile.contact.email}
                  </a>
                </div>
                <div className="flex items-center">
                  <MapPin className="text-cyan-500 dark:text-cyan-400 mr-3" />
                  <span className="text-slate-800 dark:text-white">
                    {userProfile.contact.location}
                  </span>
                </div>
              </div>
              <a
                href={`mailto:${userProfile.contact.email}`}
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition-transform duration-300 hover:scale-105 inline-block shadow-lg shadow-cyan-500/20"
              >
                Say Hello
              </a>
            </AnimatedSection>
          </section>
        </main>
        <footer className="py-8 border-t border-slate-200 dark:border-gray-800">
          <div className="container mx-auto px-6 text-center text-slate-500 dark:text-gray-500 text-sm">
            <p>
              &copy; {new Date().getFullYear()} {userProfile.name}. Designed &
              Built with ❤️.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    document.body.style.cursor = "none";
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);
  const contextValue = { theme, setTheme };
  return (
    <AppContext.Provider value={contextValue}>
      <CustomCursor />
      {isLoading && <SplashScreen />}
      <AnimatePresence>{!isLoading && <PortfolioContent />}</AnimatePresence>
    </AppContext.Provider>
  );
}
