import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  X,
  Bot,
  Loader,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { generateAIResponse } from "../api/gemini";
import { getUserProfile } from "../data/userProfile";
import { getExperiences } from "../data/experiences";
import { getSkills } from "../data/skills";
import { getProjects } from "../data/projects";
import { getInsights } from "../data/insights";
import { getEducation } from "../data/education";
import { getCertifications } from "../data/certifications";
import { getFunFacts } from "../data/funFacts";
import personalInfo from "../data/personalInfo";
import { useTranslation } from "../contexts/TranslationContext";

const ChatBot = () => {
  const { currentLanguage, translateText } = useTranslation();

  // Get translated data based on current language
  const userProfile = getUserProfile(currentLanguage);
  const experiences = getExperiences(currentLanguage);
  const skills = getSkills(currentLanguage);
  const projects = getProjects(currentLanguage);
  const insights = getInsights(currentLanguage);
  const education = getEducation(currentLanguage);
  const certifications = getCertifications(currentLanguage);
  const funFacts = getFunFacts(currentLanguage);

  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content: translateText(
        "👋 Hi! I'm David's assistant. How can I help you?",
        currentLanguage
      ),
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState([
    translateText("What's David's age and background?", currentLanguage),
    translateText("Show me his technical skills", currentLanguage),
    translateText("Tell me about his YouTube journey", currentLanguage),
    translateText("What projects is he working on?", currentLanguage),
    translateText("How can I contact him?", currentLanguage),
  ]);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

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
      skills: `Technical Skills:\n${skills.technical
        ?.map(
          (category) =>
            `${category.category}: ${category.skills.join(", ")}`
        )
        .join("\n")}\n\nSoft Skills:\n${skills.soft?.join(", ")}`,
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
  /* 
    REFACTORED: Removed hardcoded keyword interceptors to allow Gemini AI 
    to handle all conversational logic using the RAG context.
  */

  const generateResponse = async (input) => {
    try {
      const inputLower = input.toLowerCase().trim();
      setIsTyping(true); // Ensure typing state is valid

      // Create COMPREHENSIVE context using ALL data sources
      const comprehensiveContext = `
COMPLETE PROFILE OF DAVID GARCIA SARAGIH:

=== BASIC INFORMATION ===
${userProfile.name}
Headline: ${userProfile.headline}
Age: ${personalInfo.basic.age} years old (born ${personalInfo.basic.birthDate})
Location: ${userProfile.contact.location}
Religion: ${personalInfo.basic.religion}
Email: ${userProfile.contact.email}
WhatsApp: ${userProfile.contact.whatsapp}
Portfolio: ${personalInfo.basic.contactInfo.portfolio}
Philosophy: "${personalInfo.basic.philosophy}"

About: ${userProfile.aboutText}

=== TECHNICAL SKILLS ===
${skills.technical
  .map(
    (cat) =>
      `• ${cat.category}: ${cat.skills.join(", ")}`
  )
  .join("\n")}

=== PROFESSIONAL EXPERIENCE ===
${experiences
  .map(
    (exp) =>
      `• ${exp.role} at ${exp.company} (${exp.type}) - ${exp.startDate} to ${
        exp.endDate
      }
    Description: ${exp.description || ""}
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

=== PERSONALITY INSIGHTS & FUN FACTS ===
${insights.map((insight) => `• ${insight.title}: ${insight.text}`).join("\n")}
${funFacts.map((fact) => `• ${fact.title}: ${fact.text}`).join("\n")}

=== SOCIAL MEDIA PRESENCE ===
• YouTube: ${userProfile.socials.youtube.url} (${
        userProfile.socials.youtube.handle
      }) - ${personalInfo.professionalExperience.find(e => e.company.includes("YouTube"))?.achievements || ""}
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

=== CURRENT PROJECTS & ROLES ===
${personalInfo.professionalExperience
    .filter(e => e.period.includes("Present") || e.period.includes("2025"))
    .map(e => `• ${e.role} at ${e.company}`)
    .join("\n")}

=== FAQ & KNOWLEDGE ===
${Object.entries(personalInfo.faq).map(([q, a]) => `Q: ${q}\nA: ${a}`).join("\n\n")}
`;

      const contextPrompt = `You are David Garcia Saragih's advanced AI assistant. Your goal is to represent David professionally, enthusiastically, and smartly.

TODAY'S DATE: ${new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}

=== CHAMELEON PERSONALITY MODE (CRITICAL) ===
You must ADAPT your tone AND LANGUAGE to match the user's vibe.

STEP 1: DETECT LANGUAGE (HIGHEST PRIORITY)
- is the user speaking mostly English? -> YOU MUST REPLY IN ENGLISH.
- is the user speaking mostly Indonesian? -> YOU MUST REPLY IN INDONESIA.

STEP 2: DETECT TONE (Apply AFTER Language is set)
- **IF ENGLISH + SLANG (e.g. "bro", "cool", "lit"):** Reply in Casual/Cool English.
- **IF INDONESIA + SLANG (e.g. "gw", "lu", "bro", "kocak"):** Reply in "Jakarta South (Jaksel)" style.
- **IF FORMAL:** Reply in standard, professional language.

⚠️ CRITICAL FAILURE PREVENTION:
- DO NOT reply in Indo/Jaksel if the user asks in English, even if they use "bro".
- Example: "Is he smart bro?" -> Reply: "He is incredibly smart, bro! Let me tell you..." (English)
- Example: "Pinter gak dia bro?" -> Reply: "Gacor parah bro!..." (Indo)

=== MAGIC ACTIONS (HIDDEN COMMANDS) ===
You can CONTROL the website to help the user. Append these tags at the end of your response (invisible to user) to trigger actions:
- User asks to see projects? -> Append [ACTION: SCROLL_PROJECTS]
- User asks to see skills/stack? -> Append [ACTION: SCROLL_SKILLS]
- User wants to contact/hire? -> Append [ACTION: SCROLL_CONTACT]
- User wants to see CV/Resume? -> Append [ACTION: DOWNLOAD_CV]
- User wants to see experiences? -> Append [ACTION: SCROLL_EXPERIENCE]
- User asks about "About Me"? -> Append [ACTION: SCROLL_ABOUT]
- User wants to WhatsApp? -> Append [ACTION: OPEN_WHATSAPP]
- User wants to Email? -> Append [ACTION: OPEN_EMAIL]

Example Response: "Sure bro! Cek project-project gw di bawah ini ya, keren-keren semua! 😎 [ACTION: SCROLL_PROJECTS]"

CONTEXT DATA (Review this carefully):
${comprehensiveContext}

CONVERSATION HISTORY:
${messages
  .slice(-5)
  .map((m) => `${m.type.toUpperCase()}: ${m.content}`)
  .join("\n")}

USER INPUT: "${input}"

ANSWER:`;

      const aiResponse = await generateAIResponse(contextPrompt);

      // --- MAGIC ACTION HANDLER ---
      const actionRegex = /\[ACTION: ([^\]]+)\]/;
      const match = aiResponse.match(actionRegex);
      let cleanResponse = aiResponse;

      if (match) {
        const action = match[1];
        cleanResponse = aiResponse.replace(match[0], "").trim(); // Remove tag from chat
        console.log("🤖 Magic Action Triggered:", action);

        // Execute Action with small delay to allow UI to update
        setTimeout(() => {
          switch (action) {
            case "SCROLL_PROJECTS":
              document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
              break;
            case "SCROLL_SKILLS":
              document.getElementById("skills")?.scrollIntoView({ behavior: "smooth" });
              break;
            case "SCROLL_CONTACT":
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              break;
            case "SCROLL_EXPERIENCE":
              document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" });
              break;
            case "SCROLL_ABOUT":
              document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
              break;
            case "DOWNLOAD_CV":
               // Click the header CV button if available
               const cvBtn = document.querySelector('button[title="Preview CV"]');
               if(cvBtn) cvBtn.click(); 
               else window.open("/CV-DavidGarciaSaragih.pdf", "_blank");
              break;
            case "OPEN_WHATSAPP":
               if(userProfile?.contact?.whatsapp) window.open(`https://wa.me/${userProfile.contact.whatsapp}`, "_blank");
              break;
             case "OPEN_EMAIL":
               if(userProfile?.contact?.email) window.open(`mailto:${userProfile.contact.email}`, "_blank");
              break;
            default:
              console.warn("Unknown action:", action);
          }
        }, 100);
      }

      // Intelligent suggestion update based on input/response analysis
      let responseContext = "welcome";
      if (inputLower.includes("youtube") || inputLower.includes("video")) responseContext = "youtube";
      else if (inputLower.includes("project") || inputLower.includes("work")) responseContext = "projects";
      else if (inputLower.includes("skill") || inputLower.includes("tech")) responseContext = "skills";
      else if (inputLower.includes("contact") || inputLower.includes("email")) responseContext = "contact";
      
      updateSuggestedReplies(responseContext);

      return cleanResponse;

    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I'm having a bit of trouble connecting to my brain right now! 🧠 Please try asking again in a moment.";
    }
  }; // Update suggested replies with more comprehensive options
  const updateSuggestedReplies = (context) => {
    const repliesMap = {
      welcome: [
        "What's David's age and background?",
        "Show me his technical skills",
        "Tell me about his YouTube journey",
        "What projects is he working on?",
        "How can I contact him?",
      ],
      greeting: [
        "Tell me about his achievements",
        "What makes him unique?",
        "Show me his technical expertise",
        "His content creation journey",
        "What's his educational background?",
      ],
      affirmative: [
        "Tell me about his business ventures",
        "What programming languages does he know?",
        "Show me his social media stats",
        "What certifications does he have?",
        "How did he achieve all this at 19?",
      ],
      clarify: [
        "His technical skills breakdown",
        "Educational achievements and GPA",
        "Content creation statistics",
        "Professional work experience",
        "Personal interests and hobbies",
      ],
      thanks: [
        "What's his biggest achievement?",
        "Tell me about his learning approach",
        "Show me his future goals",
        "How can I connect with him?",
        "What inspired his career path?",
      ],
      personal: [
        "What are his biggest achievements?",
        "Tell me about his entrepreneurship",
        "Show me his educational background",
        "What are his future goals?",
        "How did he start content creation?",
      ],
      skills: [
        "What's he currently learning?",
        "Show me his work experience",
        "Tell me about his certifications",
        "What tools does he master?",
        "How proficient is he in React?",
      ],
      education: [
        "What's his GPA and achievements?",
        "Tell me about his work experience",
        "Show me his content creation stats",
        "What certifications does he have?",
        "How does he balance everything?",
      ],
      goals: [
        "What are his biggest achievements?",
        "Tell me about his current projects",
        "How can I work with him?",
        "Show me his business ventures",
        "What's his content creation like?",
      ],
      experience: [
        "Tell me about his business ventures",
        "What are his technical strengths?",
        "Show me his educational journey",
        "How many followers does he have?",
        "What programming languages does he know?",
      ],
      contact: [
        "Check out his YouTube channel",
        "Tell me about his business",
        "Download his complete CV",
        "What are his social media stats?",
        "Show me his latest projects",
      ],
      cv: [
        "What are his main technical skills?",
        "Tell me about his work experience",
        "How can I connect with David?",
        "Show me his content creation journey",
        "What are his educational achievements?",
      ],
      content: [
        "How many YouTube subscribers?",
        "Tell me about his TikTok success",
        "What type of content does he create?",
        "When did he start creating content?",
        "Show me his technical skills",
      ],
      business: [
        "What business does he run?",
        "Tell me about his technical roles",
        "How does he balance everything?",
        "Show me his educational background",
        "What are his future business plans?",
      ],
      youtube: [
        "How many total views does he have?",
        "What type of content does he create?",
        "When did he start his channel?",
        "Show me his other social platforms",
        "Tell me about his technical skills",
      ],
      projects: [
        "What's his role in UMN Festival?",
        "Tell me about his business",
        "Show me his technical expertise",
        "What are his current goals?",
        "How can I collaborate with him?",
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
        } md:bottom-6 md:right-6 md:w-14 md:h-14 bottom-4 right-4 w-12 h-12 sm:bottom-4 sm:right-4 sm:w-12 sm:h-12`}
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
            className={`fixed z-50 transition-all duration-300
        ${
          isFullscreen
            ? "inset-4 w-auto h-auto"
            : "bottom-2 left-16 right-2 w-auto max-w-full h-[70vh] sm:bottom-6 sm:right-6 sm:left-auto sm:w-96 sm:h-[600px]"
        }
        bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col`}
          >
            {/* Header */}
            <div className="p-6 bg-cyan-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot size={24} />
                <h3 className="font-semibold">David's Portfolio Assistant</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize2 size={20} />
                  ) : (
                    <Maximize2 size={20} />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  title="Close chat"
                >
                  <X size={20} />
                </button>
              </div>
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
                    <ReactMarkdown 
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          a: ({node, ...props}) => <a className="text-cyan-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                          strong: ({node, ...props}) => <span className="font-bold" {...props} />
                        }}
                      >
                        {message.content}
                    </ReactMarkdown>
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
