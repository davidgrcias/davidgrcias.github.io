// src/data/personalInfo.js

const personalInfo = {
  basic: {
    fullName: "David Garcia Saragih",
    birthDate: "2005-09-13", // Format: YYYY-MM-DD
    get age() {
      const today = new Date();
      const birthDate = new Date(this.birthDate);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    },
    birthPlace: "Jakarta, Indonesia",
    nationality: "Indonesian",
    languages: [
      "Indonesian (Native)",
      "English (Professional Working Proficiency)",
    ],
    currentLocation: "Jakarta, Indonesia",
    religion: "Christian",
    philosophy:
      "Every setback is a setup for the next level. I see challenges not as obstacles, but as stepping stones for growth and innovation.",
    contactInfo: {
      phone: "0877-7680-3957",
      email: "davidgarciasaragih7@gmail.com",
      portfolio: "davidgrcias.github.io",
    },
  },

  // Comprehensive technical skills from CV
  technicalSkills: {
    frontend: [
      "HTML5, CSS3, Tailwind CSS",
      "JavaScript & TypeScript",
      "React.js and UI/UX implementation",
      "Mobile-First Development",
    ],
    backend: [
      "PHP & Laravel",
      "MySQL",
      "REST API development",
      "Authentication & Session management",
      "MVC Architecture",
      "Python",
    ],
    devops: [
      "Git & GitHub",
      "Firebase",
      "Vercel",
      "cPanel Hosting",
      "Chrome DevTools",
      "Nginx",
    ],
    ai_tools: [
      "GitHub Copilot",
      "ChatGPT",
      "Gemini API integration",
      "Prompt Engineering",
    ],
    optimization: [
      "Google Analytics",
      "Google Search Console",
      "SEO Optimization",
    ],
    design: ["Canva", "Figma", "Documentation Writing"],
  },

  // Soft skills from CV
  softSkills: [
    "Problem Solving",
    "Critical Thinking",
    "Fast Learning",
    "Adaptability",
    "Creativity",
    "Digital Communication",
    "Initiative",
    "Strong Work Ethic",
    "Team Collaboration",
    "Curiosity-Driven",
    "Branding",
    "Resilience",
  ],

  // Professional experience from CV
  professionalExperience: [
    {
      role: "Full-Stack Web & Systems Engineer",
      company: "Komilet (JakLingko System)",
      period: "2024 - Present",
      description:
        "Architecting a massive-scale fleet management ERP with Next.js 16, managing 42+ database tables and complex approval workflows.",
      achievements: "Built End-to-End System for Fleet Operations, 100% Digitized Financial Tracking",
    },
    {
      role: "Content Creator",
      company: "David G Tech (YouTube, TikTok & Instagram)",
      period: "Mar 2021 - Present",
      description:
        "Produce tech content on YouTube & TikTok to teach programming in practical ways.",
      achievements:
        "7.7K+ subscribers / 1.8M+ views on YouTube, 17.2K+ TikTok followers",
    },
    {
      role: "Founder, Digital Strategist & Web Developer",
      company: "Rental Mobil City Park",
      period: "June 2024 - Present",
      description:
        "Built the frontend platform & supported the business's digital presence.",
    },
    {
      role: "Coordinator of Web Development",
      company: "UMN Festival 2025",
      period: "Feb 2025 - Nov 2025",
      description:
        "Leading the development of a Full-Stack Ticketing Ecosystem using Laravel 12 & Inertia.js. Managing payment gateways (Midtrans), QR check-in security, and high-traffic infrastructure.",
      achievements: "Architected Secure Ticketing System & Real-time Payment Sync Logic",
    },
    {
      role: "Backend Developer & Project Lead (Volunteer)",
      company: "Ark Care Ministry",
      period: "Nov 2024 - Dec 2024",
      description:
        "Developed a custom backend with Laravel, leading the team to build a web for non-profit organization.",
    },
    {
      role: "Frontend Developer",
      company: "UMN Visual Journalism Day 2024",
      period: "Jun 2024 - Oct 2024",
      description:
        "Collaborated on building a responsive site using TypeScript, React & Tailwind CSS.",
    },
    {
      role: "Web Developer Intern",
      company: "DAAI TV",
      period: "Mar 2022 - May 2022",
      description:
        "Contributed to developing a seasonal web feature as part of the internal web team.",
    },
  ],

  // Educational background from CV
  educationalBackground: [
    {
      level: "Undergraduate Student in Informatics",
      institution: "Universitas Multimedia Nusantara",
      period: "2023 - 2027",
      gpa: "3.87",
      status: "Current",
    },
    {
      level: "Software Engineering",
      institution: "SMK Cinta Kasih Tzu Chi",
      period: "2020 - 2023",
      achievement: "Top 3 vocational student every year",
    },
  ],

  // Notable achievements from CV
  achievements: [
    "Top 3 vocational student every year",
    "Launched a rental car business",
    "7.7K+ subscribers / 1.8M+ views on YouTube",
    "17.2K+ TikTok followers",
    "Winner of multiple English competitions",
    "Certified in Web Development (Progate)",
    "Tech brand promotion on YouTube",
    "Active GitHub filled with mini & experimental projects",
  ],

  // Social media presence
  socialMediaPresence: {
    github: "@davidgrcias",
    instagram: "@davidgrcias",
    youtube: "@davidgtech",
    tiktok: "@davidgtech",
  },
  interests: {
    hobbies: [
      "Developing innovative web applications",
      "Creating engaging tech content for YouTube and TikTok",
      "Exploring the latest advancements in AI and web technologies",
      "Solving complex logical puzzles and coding challenges",
      "Navigating urban landscapes via public transportation",
      "Teaching programming through content creation",
      "Building real-world applications",
      "Digital entrepreneurship",
    ],
    favoriteTopics: [
      "Full-Stack Web Development",
      "Technological Innovation & Startups",
      "Artificial Intelligence and its practical applications",
      "Digital Storytelling and Content Strategy",
      "Open-Source Contribution",
      "Web Performance Optimization",
      "User Experience Design",
    ],
    programming: {
      favoriteLanguages: ["JavaScript", "TypeScript", "PHP", "Python"],
      favoriteTech: [
        "React (Next.js)",
        "Laravel",
        "Tailwind CSS",
        "Vite",
        "Node.js",
        "MySQL",
        "Firebase",
      ],
      currentlyLearning: [
        "Generative AI (Gemini API)",
        "Machine Learning Frameworks",
        "Advanced CI/CD pipelines",
        "Mobile Development",
        "Cloud Computing",
      ],
    },
  },

  personality: {
    traits: [
      "Creative and driven programmer",
      "Strong passion for technology and continuous learning",
      "Natural problem-solver with analytical mindset",
      "Meticulous and detail-oriented in every project",
      "Highly ambitious and driven to exceed expectations",
      "Excellent at adapting to various tools and tech stacks",
      "Strong leadership in end-to-end project execution",
      "Passionate about digital entrepreneurship",
    ],
    workStyle: [
      "Thrives in late-night hours where focus is at its peak",
      "Strong believer in synergy and collaborative success",
      "Proactive and self-motivated, requiring minimal supervision",
      "Excels under pressure and is strictly deadline-driven",
      "Enjoys leading teams and mentoring others",
      "Values continuous learning and skill development",
    ],
    strengths: [
      "Rapidly masters new technologies and frameworks",
      "Strong foundation in modern web development",
      "Articulates complex technical ideas with clarity",
      "Manages project timelines and deliverables effectively",
      "Bridges technical implementation with creative vision",
      "Excellent at building real-world applications",
      "Strong content creation and communication skills",
    ],
  },

  goals: {
    shortTerm: [
      "Achieve academic excellence by maintaining GPA above 3.9",
      "Continue growing YouTube and TikTok audience",
      "Expand Rental Mobil City Park business",
      "Complete current university projects successfully",
      "Master advanced AI and machine learning concepts",
    ],
    longTerm: [
      "Become a leading full-stack developer",
      "Build impactful tech solutions that solve real problems",
      "Establish a successful tech startup",
      "Inspire the next generation through content creation",
      "Make significant contributions to open-source communities",
      "Become a recognized voice in the tech community",
    ],
  },

  // Comprehensive FAQ based on CV and experience
  faq: {
    "What's David's current role and focus?":
      "David is currently a multi-faceted tech professional. He's an undergraduate Informatics student at Universitas Multimedia Nusantara (GPA: 3.87), a successful content creator with 7.7K+ YouTube subscribers and 17.2K+ TikTok followers, and an entrepreneur running Rental Mobil City Park. He also serves as Coordinator of Web Development for UMN Festival 2025.",

    "What makes David unique as a developer?":
      "David's unique edge comes from his triple identity as a developer, content creator, and entrepreneur. He doesn't just build applications—he understands how to communicate their value and scale businesses. His experience ranges from frontend development with React and TypeScript to backend systems with Laravel and PHP, plus his proven track record in leading teams and managing end-to-end projects.",

    "What are David's main technical skills?":
      "David is proficient in full-stack development with expertise in React.js, TypeScript, PHP, Laravel, MySQL, and modern deployment tools like Vercel and Firebase. He's also skilled in AI integration (currently working with Gemini API), SEO optimization, and has experience with various development tools from GitHub to Figma. His soft skills include problem-solving, fast learning, and strong leadership abilities.",

    "How does David balance multiple roles?":
      "David treats his various roles as complementary rather than competing. His programming work provides content for his YouTube and TikTok channels, while his content creation helps him stay current with technology trends. His entrepreneurial experience with Rental Mobil City Park gives him real-world business perspective that enhances his development projects. He's particularly productive during late-night hours and excels at time management.",

    "What are David's biggest achievements so far?":
      "David has achieved remarkable success across multiple domains: maintaining a 3.87 GPA while building a substantial online presence (7.7K+ YouTube subscribers, 17.2K+ TikTok followers), launching and running a successful rental car business, leading web development for major university events, and consistently ranking as a top 3 vocational student. He's also won multiple English competitions and earned web development certifications.",

    "What's David's educational background?":
      "David is currently pursuing an Undergraduate degree in Informatics at Universitas Multimedia Nusantara (2023-2027) with an impressive 3.87 GPA. He previously completed Software Engineering at SMK Cinta Kasih Tzu Chi (2020-2023), where he was consistently ranked as a top 3 student. He continues learning through certifications, including web development credentials from Progate.",

    "How can someone work with or contact David?":
      "David is open to collaboration and can be reached via email at davidgarciasaragih7@gmail.com, phone at 0877-7680-3957, or through his portfolio at davidgrcias.github.io. You can also connect with him on GitHub and Instagram @davidgrcias, or check out his content on YouTube and TikTok @davidgtech. He's particularly interested in innovative tech projects and entrepreneurial opportunities.",

    "What's David's approach to learning and staying current?":
      "David has a multi-pronged approach to staying current with technology. He actively experiments with new frameworks and tools, documents his learning through content creation, takes formal certifications, and engages with the developer community on platforms like GitHub. Teaching others through his content channels also reinforces his own learning and ensures he understands concepts deeply.",
  },
  // CV download information
  cvInfo: {
    available: true,
    downloadUrl: "/CV-DavidGarciaSaragih.pdf",
    lastUpdated: "2025",
    description:
      "Comprehensive CV including all professional experience, technical skills, education, and achievements",
  },
};

export default personalInfo;
