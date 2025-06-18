// src/data/personalInfo.js

const personalInfo = {
  basic: {
    fullName: "David Garcia Saragih",
    birthDate: "2005-09-13", // Format: YYYY-MM-DD
    // Age is calculated based on the birthDate. As of June 2025, David is 19.
    age: 19,
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
  },

  interests: {
    hobbies: [
      "Developing innovative web applications",
      "Creating engaging tech content for YouTube and TikTok",
      "Exploring the latest advancements in AI and web technologies",
      "Solving complex logical puzzles and coding challenges",
      "Navigating urban landscapes via public transportation",
    ],
    favoriteTopics: [
      "Full-Stack Web Development",
      "Technological Innovation & Startups",
      "Artificial Intelligence and its practical applications",
      "Digital Storytelling and Content Strategy",
      "Open-Source Contribution",
    ],
    programming: {
      favoriteLanguages: ["JavaScript", "TypeScript", "PHP", "Python"],
      favoriteTech: [
        "React (Next.js)",
        "Laravel",
        "Tailwind CSS",
        "Vite",
        "Node.js",
      ],
      currentlyLearning: [
        "Generative AI (Gemini API)",
        "Machine Learning Frameworks",
        "Advanced CI/CD pipelines",
      ],
    },
  },

  personality: {
    traits: [
      "Deeply analytical and a natural problem-solver",
      "A lifelong learner with a passion for technology",
      "Meticulous and detail-oriented in every project",
      "Highly ambitious and driven to exceed expectations",
      "A creative thinker who connects technology with user needs",
    ],
    workStyle: [
      "Thrives in late-night hours where focus is at its peak",
      "A strong believer in synergy and collaborative success",
      "Proactive and self-motivated, requiring minimal supervision",
      "Excels under pressure and is strictly deadline-driven",
    ],
    strengths: [
      "Rapidly masters new technologies and frameworks",
      "Possesses a strong foundation in modern web development",
      "Articulates complex technical ideas with clarity",
      "Manages project timelines and deliverables effectively",
      "Bridges the gap between technical implementation and creative vision",
    ],
  },

  goals: {
    shortTerm: [
      "Achieve academic excellence by maintaining a GPA above 3.9",
      "Develop and launch a full-stack AI-powered web application for my portfolio",
      "Double my YouTube and TikTok audience by creating high-value tech content",
    ],
    longTerm: [
      "Evolve into a principal full-stack engineer or tech lead",
      "Found or co-found a tech startup that solves a real-world problem",
      "Become a prominent voice in the tech community, inspiring the next generation",
      "Make significant contributions to major open-source projects",
    ],
  },

  faq: {
    "What inspired you to start programming?":
      "My fascination began with a simple question: 'How does the internet work?'. This curiosity led me down a rabbit hole of HTML, CSS, and JavaScript, and I was instantly hooked. The ability to create something functional and beautiful from pure logic felt like a superpower. It has since evolved from a hobby into a core passion for building digital experiences.",

    "How do you balance content creation and programming?":
      "I treat them as two sides of the same coin. Programming is where I build and innovate, often during the quiet late-night hours. Content creation is where I share my learnings and solidify my understanding. I schedule my weeks meticulously, dedicating blocks of time for deep work on coding and other blocks for scripting, shooting, and editing. They fuel each other—my projects provide content, and the feedback from my audience inspires new project ideas.",

    "What's your biggest achievement so far?":
      "My proudest achievement is successfully architecting and developing this very portfolio, including the AI chatbot you're interacting with. It represents the culmination of my skills in front-end (React, Vite, Tailwind CSS), back-end (integrating the Gemini API), and my dedication to creating a seamless user experience. Balancing this complex project while maintaining a 3.87 GPA and growing my online presence has been a challenging yet incredibly rewarding experience.",

    "Where do you see yourself in 5 years?":
      "In five years, I aim to be a senior full-stack developer at a forward-thinking tech company, leading projects that push the boundaries of web technology. I also envision my content creation platforms becoming a go-to resource for aspiring developers. Ultimately, I want to be at the intersection of innovation, education, and community-building.",

    "How do you stay updated with technology?":
      "I have a multi-pronged approach. I'm an avid reader of tech blogs like TechCrunch and Smashing Magazine, a constant lurker on platforms like GitHub and Stack Overflow, and an active participant in developer communities on Discord and Twitter. I also dedicate time each week to hands-on learning, whether it's taking a new certification, experimenting with a new framework, or contributing to an open-source project. Teaching concepts on my channel is also a great way to ensure I understand them deeply.",

    "What's your approach to problem-solving?":
      "I follow a systematic process. First, I ensure I fully understand the problem by breaking it down into the smallest possible components. Then, I research potential solutions, weighing the pros and cons of each. I'm a big fan of sketching out logic flows and architectures before writing a single line of code. I believe in finding the root cause rather than just treating symptoms, which leads to more robust and scalable solutions.",

    "What makes you unique as a developer?":
      "I believe my unique edge comes from my dual identity as a developer and a content creator. I don't just build things; I understand how to communicate their value and how they fit into the user's world. This allows me to think about projects holistically—from the technical architecture and code quality to the user interface and overall narrative. I bring both a programmer's logic and a storyteller's creativity to the table.",
  },
};

export default personalInfo;
