import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Bot, Loader } from "lucide-react";
import { generateAIResponse } from "../api/gemini";
import userProfile from "../data/userProfile";
import experiences from "../data/experiences";
import skills from "../data/skills";
import projects from "../data/projects";
import insights from "../data/insights";
import education from "../data/education";
import certifications from "../data/certifications";
import funFacts from "../data/funFacts";
import personalInfo from "../data/personalInfo";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content: "👋 Hi! I'm David's assistant. How can I help you?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState([
    "How can I contact David?",
    "Have a project in mind?",
    "Enjoying David's work?",
  ]);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create knowledge base
  const personalityInsights = {
    funFacts: funFacts.map((fact) => `${fact.title}: ${fact.text}`).join("\n"),
    insights: insights
      .map((insight) => `${insight.title}: ${insight.text}`)
      .join("\n"),
  };

  // Enhanced knowledge base with personal information
  const knowledge = {
    personal: {
      name: userProfile.name,
      headline: userProfile.headline,
      about: userProfile.aboutText,
      location: userProfile.contact.location,
      basic: personalInfo.basic,
      interests: personalInfo.interests,
      personality: {
        ...personalityInsights,
        traits: personalInfo.personality.traits,
        workStyle: personalInfo.personality.workStyle,
        strengths: personalInfo.personality.strengths,
      },
      goals: personalInfo.goals,
      faq: personalInfo.faq,
    },
    contact: {
      email: userProfile.contact.email,
      whatsapp: userProfile.contact.whatsapp,
      location: userProfile.contact.location,
      socials: Object.entries(userProfile.socials)
        .map(([platform, data]) => `${platform}: ${data.url}`)
        .join("\n"),
    },
    personality: personalityInsights,
    professional: {
      skills: skills
        .map((skill) => `${skill.name} (Proficiency: ${skill.level}%)`)
        .join("\n"),
      certifications: certifications
        .map((cert) => `${cert.name} from ${cert.provider} (${cert.date})`)
        .join("\n"),
      education: education
        .map(
          (edu) =>
            `${edu.degree} at ${edu.institution} (${edu.period})` +
            (edu.grade ? ` - GPA: ${edu.grade}` : "")
        )
        .join("\n"),
      experience: experiences
        .map(
          (exp) =>
            `${exp.role} at ${exp.company} (${exp.type}) - ${
              exp.startDate
            } to ${exp.endDate}\nSkills used: ${exp.skills.join(", ")}`
        )
        .join("\n\n"),
    },
  };

  const findBestMatch = (input, keywords) => {
    const inputWords = input.toLowerCase().split(" ");
    return keywords.some((keyword) =>
      inputWords.some(
        (word) =>
          word.length > 3 &&
          (keyword.includes(word) ||
            word.includes(keyword) ||
            levenshteinDistance(word, keyword) <= 2)
      )
    );
  };

  const levenshteinDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  };
  const generateResponse = async (input) => {
    try {
      // Check if user is asking for CV
      if (findBestMatch(input.toLowerCase(), ["cv", "resume", "curriculum"])) {
        const cvResponse = [
          "📄 Here's David's comprehensive CV!",
          "",
          "You can download his full CV (PDF format) here:",
          `🔗 ${window.location.origin}/CV-DavidGarciaSaragih.pdf`,
          "",
          "The CV includes:",
          "• Complete professional experience",
          "• Technical skills and certifications",
          "• Educational background",
          "• Notable achievements and projects",
          "",
          "Would you like me to tell you about any specific aspect of his background? 😊",
        ].join("\n");
        updateSuggestedReplies("cv");
        return cvResponse;
      }

      // Create COMPREHENSIVE context using ALL data sources
      const comprehensiveContext = `
COMPLETE PROFILE OF DAVID GARCIA SARAGIH:

=== BASIC INFORMATION ===
Name: ${userProfile.name}
Headline: ${userProfile.headline}
Age: 19 years old (born September 13, 2005)
Location: ${userProfile.contact.location}
Religion: Christian
Email: ${userProfile.contact.email}
WhatsApp: ${userProfile.contact.whatsapp}
Portfolio: davidgrcias.github.io

About: ${userProfile.aboutText}

=== TECHNICAL SKILLS ===
${skills
  .map((skill) => `• ${skill.name}: ${skill.level}% proficiency`)
  .join("\n")}

=== PROFESSIONAL EXPERIENCE ===
${experiences
  .map(
    (exp) =>
      `• ${exp.role} at ${exp.company} (${exp.type}) - ${exp.startDate} to ${
        exp.endDate
      }
    Skills used: ${exp.skills.join(", ")}`
  )
  .join("\n\n")}

=== EDUCATION ===
${education
  .map(
    (edu) =>
      `• ${edu.degree} at ${edu.institution} (${edu.period})${
        edu.grade ? ` - GPA: ${edu.grade}` : ""
      }`
  )
  .join("\n")}

=== CERTIFICATIONS ===
${certifications
  .map((cert) => `• ${cert.name} from ${cert.provider} (${cert.date})`)
  .join("\n")}

=== PERSONALITY INSIGHTS ===
${insights.map((insight) => `• ${insight.title}: ${insight.text}`).join("\n")}

=== FUN FACTS ===
${funFacts.map((fact) => `• ${fact.title}: ${fact.text}`).join("\n")}

=== SOCIAL MEDIA PRESENCE ===
• YouTube: ${userProfile.socials.youtube.url} (${
        userProfile.socials.youtube.handle
      })
• TikTok: ${userProfile.socials.tiktok.url} (${
        userProfile.socials.tiktok.handle
      })
• GitHub: ${userProfile.socials.github.url} (${
        userProfile.socials.github.handle
      })
• LinkedIn: ${userProfile.socials.linkedin.url} (${
        userProfile.socials.linkedin.handle
      })
• Instagram: ${userProfile.socials.instagram.url} (${
        userProfile.socials.instagram.handle
      })

=== CONTENT CREATION ACHIEVEMENTS ===
• 7.7K+ YouTube subscribers with 1.8M+ total views
• 17.2K+ TikTok followers
• Creates tech content teaching programming in practical ways
• Started content creation in March 2021

=== ENTREPRENEURSHIP ===
• Founder of Rental Mobil City Park (June 2024 - Present)
• Built frontend platform and digital presence for the business
• Digital strategist and web developer for the company

=== CURRENT PROJECTS & ROLES ===
• Informatics student at Universitas Multimedia Nusantara (GPA: 3.87)
• Coordinator of Web Development for UMN Festival 2025
• Content Creator on YouTube and TikTok
• Entrepreneur running Rental Mobil City Park

=== WORK STYLE & PERSONALITY ===
• Most productive during late night hours
• Fueled by ambition, not afraid to fail
• Endlessly curious about how things work
• Loves meeting and chatting with new people (despite seeming reserved)
• Ambitious and analytical, always striving to improve
• Expert in Jakarta's public transport routes
• Philosophy: "Every setback is a setup for the next level"

=== TECHNICAL EXPERTISE DETAILS ===
• Frontend: HTML5, CSS3, Tailwind CSS, JavaScript, TypeScript, React.js
• Backend: PHP, Laravel, MySQL, Python, REST API development
• DevOps: Git, GitHub, Firebase, Vercel, cPanel Hosting
• SEO and optimization tools
• UI/UX implementation and design-to-code conversion
• Mobile-first development approach
`;

      const contextPrompt = `You are David Garcia Saragih's AI assistant. Using the comprehensive information below, answer this question: "${input}"

${comprehensiveContext}

Instructions:
- Answer based ONLY on the provided information
- Be friendly, conversational, and enthusiastic about David's achievements
- Use specific details and numbers from the context
- If asked about technical skills, mention specific proficiency levels
- If asked about experience, reference specific companies and roles
- If asked about personality, use the insights and fun facts
- Keep responses engaging but not too long
- Use emojis sparingly for personality
- Always sound knowledgeable about all aspects of David's profile`;

      // Get AI response with FULL comprehensive context
      const aiResponse = await generateAIResponse(contextPrompt);
      updateSuggestedReplies(input.toLowerCase());
      return aiResponse;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return handleFallbackResponse(input.toLowerCase());
    }
  };
  const handleFallbackResponse = (input) => {
    // Enhanced creative fallback responses using updated personalInfo
    const lowercaseInput = input.toLowerCase();

    // CV/Resume requests
    if (findBestMatch(lowercaseInput, ["cv", "resume", "curriculum"])) {
      const response = [
        "📄 You can download David's comprehensive CV here:",
        `🔗 ${window.location.origin}/CV-DavidGarciaSaragih.pdf`,
        "",
        "His CV includes complete details about:",
        "• Professional experience (6+ roles)",
        "• Technical skills across full-stack development",
        "• Educational background (GPA: 3.87)",
        "• Notable achievements and certifications",
        "",
        "What specific aspect would you like to know more about? 😊",
      ].join("\n");
      updateSuggestedReplies("cv");
      return response;
    }

    // Age/Personal info queries
    if (findBestMatch(lowercaseInput, ["age", "old", "born", "birth"])) {
      const response = [
        `David is currently ${personalInfo.basic.age} years old! 🎂`,
        `Born on September 13, 2005, in ${personalInfo.basic.birthPlace}.`,
        "",
        "Despite his young age, he's already achieved remarkable things:",
        `• Maintaining a ${personalInfo.educationalBackground[0].gpa} GPA in Informatics`,
        `• Building a YouTube audience of 7.7K+ subscribers`,
        `• Running his own business (Rental Mobil City Park)`,
        `• Leading web development for major university events`,
        "",
        "Pretty impressive for a 19-year-old, right? 🚀",
      ].join("\n");
      updateSuggestedReplies("personal");
      return response;
    }

    // Religion queries
    if (
      findBestMatch(lowercaseInput, [
        "religion",
        "faith",
        "belief",
        "christian",
      ])
    ) {
      const response = [
        `David is a ${personalInfo.basic.religion}. ✝️`,
        "",
        "His faith influences his approach to life and work, particularly his philosophy:",
        `"${personalInfo.basic.philosophy}"`,
        "",
        "This positive mindset shows in how he handles challenges in both his studies and business ventures.",
        "",
        "Would you like to know more about his goals or achievements? 😊",
      ].join("\n");
      updateSuggestedReplies("personal");
      return response;
    }

    // Goals and aspirations
    if (
      findBestMatch(lowercaseInput, [
        "goals",
        "future",
        "aspirations",
        "plans",
        "ambitions",
      ])
    ) {
      const response = [
        "🎯 David has some exciting goals ahead!",
        "",
        "**Short-term goals:**",
        personalInfo.goals.shortTerm.map((goal) => `• ${goal}`).join("\n"),
        "",
        "**Long-term vision:**",
        personalInfo.goals.longTerm.map((goal) => `• ${goal}`).join("\n"),
        "",
        "His ultimate aim is to be at the intersection of innovation, education, and community-building! 🚀",
        "",
        "What aspect of his journey interests you most?",
      ].join("\n");
      updateSuggestedReplies("goals");
      return response;
    }

    // Technical skills
    if (
      findBestMatch(lowercaseInput, [
        "skills",
        "technical",
        "programming",
        "tech",
        "expertise",
      ])
    ) {
      const response = [
        "💻 David's technical skills are quite impressive!",
        "",
        "**Frontend:** " + personalInfo.technicalSkills.frontend.join(", "),
        "**Backend:** " + personalInfo.technicalSkills.backend.join(", "),
        "**DevOps:** " + personalInfo.technicalSkills.devops.join(", "),
        "",
        "**Currently mastering:** " +
          personalInfo.interests.programming.currentlyLearning.join(", "),
        "",
        `He's particularly strong in full-stack development and has real-world experience through his ${personalInfo.professionalExperience.length} different roles!`,
        "",
        "Want to know about specific projects or his learning approach? 🤔",
      ].join("\n");
      updateSuggestedReplies("skills");
      return response;
    }

    // Education queries
    if (
      findBestMatch(lowercaseInput, [
        "education",
        "study",
        "university",
        "school",
        "gpa",
      ])
    ) {
      const current = personalInfo.educationalBackground[0];
      const previous = personalInfo.educationalBackground[1];
      const response = [
        "🎓 David's educational journey is quite impressive!",
        "",
        `**Currently:** ${current.level} at ${current.institution}`,
        `📊 GPA: ${current.gpa} (${current.period})`,
        "",
        `**Previously:** ${previous.level} at ${previous.institution}`,
        `🏆 Achievement: ${previous.achievement}`,
        "",
        "He's balancing academics with content creation and entrepreneurship - talk about time management skills! ⏰",
        "",
        "Curious about his projects or achievements? �",
      ].join("\n");
      updateSuggestedReplies("education");
      return response;
    }

    // Contact information
    if (
      findBestMatch(lowercaseInput, [
        "contact",
        "reach",
        "email",
        "phone",
        "connect",
      ])
    ) {
      const contact = personalInfo.basic.contactInfo;
      const social = personalInfo.socialMediaPresence;
      const response = [
        "📱 Here's how you can connect with David:",
        "",
        `📧 Email: ${contact.email}`,
        `� Phone: ${contact.phone}`,
        `🌐 Portfolio: ${contact.portfolio}`,
        "",
        "**Social Media:**",
        `• GitHub: ${social.github}`,
        `• Instagram: ${social.instagram}`,
        `• YouTube: ${social.youtube}`,
        `• TikTok: ${social.tiktok}`,
        "",
        "He's most active on YouTube and TikTok where he shares tech content! 🎥",
        "",
        "What's your preferred way to connect? 😊",
      ].join("\n");
      updateSuggestedReplies("contact");
      return response;
    }

    // Default welcome response
    const welcomeResponse = [
      "👋 Hey there! I'm David's AI assistant!",
      "",
      "I know everything about David Garcia Saragih - from his technical skills to his entrepreneurial journey. Here's what I can tell you about:",
      "",
      "🎯 **Personal Info:** Age, background, goals, philosophy",
      "💻 **Technical Skills:** Full-stack development expertise",
      "🎓 **Education:** Current studies and achievements",
      "💼 **Experience:** 6+ professional roles and projects",
      "🚀 **Entrepreneurship:** His business ventures",
      "🎥 **Content Creation:** YouTube/TikTok success",
      "📱 **Contact Info:** How to connect with him",
      "📄 **CV Download:** Get his complete resume",
      "",
      "What would you like to know about David? 😊",
    ].join("\n");

    updateSuggestedReplies("welcome");
    return welcomeResponse;
  };
  // Update suggested replies with more comprehensive options
  const updateSuggestedReplies = (context) => {
    const repliesMap = {
      welcome: ["How old is David?", "What are his goals?", "Download his CV"],
      personal: [
        "What are his achievements?",
        "Tell me about his skills",
        "His educational background",
      ],
      skills: [
        "What's he currently learning?",
        "His work experience",
        "Recent projects?",
      ],
      education: [
        "His professional experience",
        "Content creation journey",
        "Technical certifications?",
      ],
      goals: [
        "His biggest achievements?",
        "Current projects?",
        "How to contact him?",
      ],
      experience: [
        "His entrepreneurial journey",
        "Technical skills",
        "Educational background",
      ],
      contact: [
        "Check his YouTube content",
        "His business ventures",
        "Download his CV",
      ],
      cv: [
        "What are his main skills?",
        "Tell me about his experience",
        "How to contact David?",
      ],
    };

    setSuggestedReplies(repliesMap[context] || repliesMap.welcome);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Get response from chatbot
      const response = await generateResponse(inputMessage.trim());

      // Add bot message
      const botMessage = {
        type: "bot",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      // Add error message if something goes wrong
      const errorMessage = {
        type: "bot",
        content:
          "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedReply = async (reply) => {
    const userMessage = {
      type: "user",
      content: reply,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await generateResponse(reply);
      const botMessage = {
        type: "bot",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        type: "bot",
        content:
          "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const pulseAnimation = {
    initial: { scale: 1, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" },
    animate: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        "0 8px 12px -1px rgba(0, 0, 0, 0.2)",
        "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      ],
    },
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse",
    },
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-cyan-500 text-white shadow-lg hover:bg-cyan-600 transition-colors duration-300 flex items-center justify-center z-40 ${
          isOpen ? "hidden" : ""
        }`}
        initial={pulseAnimation.initial}
        animate={pulseAnimation.animate}
        transition={pulseAnimation.transition}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Bot size={24} />
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 border border-slate-200 dark:border-slate-700 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-cyan-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot size={24} />
                <h3 className="font-semibold">David's Portfolio Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 p-6 overflow-y-auto scroll-smooth"
            >
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  } mb-4`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.type === "user"
                        ? "bg-cyan-500 text-white rounded-br-none"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none"
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start mb-4"
                >
                  <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-2xl rounded-bl-none">
                    <Loader className="w-4 h-4 animate-spin" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {suggestedReplies.map((reply, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSuggestedReply(reply)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full text-sm whitespace-nowrap hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    {reply}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-6 border-t border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="p-3 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
                >
                  <Send size={20} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
