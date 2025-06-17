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
      // Create a more concise prompt      // Create a focused context based on the query type
      let relevantContext = "";
      if (findBestMatch(input.toLowerCase(), ["personality", "hobbies"])) {
        relevantContext = `Interests: ${knowledge.personal.interests
          .slice(0, 3)
          .join(", ")}`;
      } else if (findBestMatch(input.toLowerCase(), ["contact", "reach"])) {
        relevantContext = `Contact: Email - ${knowledge.contact.email}, Location - ${knowledge.contact.location}`;
      } else if (findBestMatch(input.toLowerCase(), ["skills", "tech"])) {
        relevantContext = `Top Skills: ${knowledge.professional.skills
          .split("\n")
          .slice(0, 3)
          .join(", ")}`;
      }

      const contextPrompt = `You are David Garcia Saragih's AI assistant. Answer: "${input}"
Basic: ${knowledge.personal.basic.fullName}, ${knowledge.personal.basic.currentLocation}
${relevantContext}

Be friendly, concise, and use emojis sparingly. Reference relevant experiences when appropriate.`;

      // Get AI response with optimized context
      const aiResponse = await generateAIResponse(contextPrompt);
      updateSuggestedReplies(input.toLowerCase());
      return aiResponse;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return handleFallbackResponse(input.toLowerCase());
    }
  };

  const handleFallbackResponse = (input) => {
    // Enhanced creative fallback responses
    const lowercaseInput = input.toLowerCase();

    // Personality and behavior queries
    if (
      findBestMatch(lowercaseInput, [
        "personality",
        "behavior",
        "like",
        "person",
        "character",
      ])
    ) {
      const randomFacts = funFacts.map((fact) => fact.text);
      const randomInsights = insights.map((insight) => insight.text);
      const response = [
        "Let me share something interesting about David! 😊",
        randomFacts[Math.floor(Math.random() * randomFacts.length)],
        "And you know what's really cool about him?",
        randomInsights[Math.floor(Math.random() * randomInsights.length)],
        "\nWould you like to know more about his professional journey or his creative side? 🚀",
      ].join("\n\n");
      updateSuggestedReplies("personality");
      return response;
    }

    // Skills and expertise queries
    if (
      findBestMatch(lowercaseInput, ["skills", "can do", "expertise", "tech"])
    ) {
      const topSkills = skills.filter((skill) => skill.level >= 90);
      const recentProject = experiences[0];
      const response = [
        "🚀 David is quite the tech enthusiast! Here's what he's fantastic at:",
        topSkills
          .map((skill) => `✨ ${skill.name} (${skill.level}% proficiency)`)
          .join("\n"),
        `\nRight now, he's putting these skills to work as ${
          recentProject.role
        } at ${
          recentProject.company
        }, where he's using ${recentProject.skills.join(", ")}!`,
        "\nWhat aspect of his technical expertise would you like to know more about? 💡",
      ].join("\n");
      updateSuggestedReplies("skills");
      return response;
    }

    // Education and learning journey
    if (
      findBestMatch(lowercaseInput, [
        "education",
        "study",
        "learn",
        "certification",
      ])
    ) {
      const currentEducation = education[0];
      const recentCerts = certifications.slice(0, 3);
      const response = [
        "📚 David's learning journey is pretty inspiring!",
        `Currently pursuing ${currentEducation.degree} at ${currentEducation.institution} with an impressive GPA of ${currentEducation.grade}! 🎓`,
        "\nRecent achievements include:",
        recentCerts
          .map((cert) => `🏆 ${cert.name} from ${cert.provider}`)
          .join("\n"),
        "\nWhat would you like to know about his educational journey or latest certifications? 🤔",
      ].join("\n");
      updateSuggestedReplies("education");
      return response;
    }

    // Experience and projects
    if (findBestMatch(lowercaseInput, ["experience", "work", "project"])) {
      const currentRole = experiences[0];
      const entrepreneurialRole = experiences.find(
        (exp) => exp.type === "Entrepreneurship"
      );
      const response = [
        "💼 David's career journey is quite diverse!",
        `Currently, he's rocking it as ${currentRole.role} at ${
          currentRole.company
        }, mastering ${currentRole.skills.join(", ")}!`,
        entrepreneurialRole
          ? `\n🚀 He's also an entrepreneur, running ${entrepreneurialRole.company} since ${entrepreneurialRole.startDate}!`
          : "",
        "\nWould you like to hear about his other projects or his entrepreneurial journey? 💡",
      ].join("\n");
      updateSuggestedReplies("experience");
      return response;
    }

    // Contact and social presence
    if (
      findBestMatch(lowercaseInput, ["contact", "reach", "email", "social"])
    ) {
      const response = [
        "📱 Ready to connect with David? Here's how:",
        `📧 Email: ${userProfile.contact.email}`,
        `💬 WhatsApp: ${userProfile.contact.whatsapp}`,
        `🌐 LinkedIn: ${userProfile.socials.linkedin.url}`,
        "\nAnd if you're interested in his content:",
        `🎥 YouTube: @${userProfile.socials.youtube.handle}`,
        `📱 TikTok: @${userProfile.socials.tiktok.handle}`,
        "\nWhat's your preferred way to connect? 😊",
      ].join("\n");
      updateSuggestedReplies("contact");
      return response;
    }

    const welcomeResponse = [
      "Hey there! 👋 I'm David's AI assistant, and I'd love to tell you all about him!",
      "\nI can share:",
      "🎯 His amazing tech skills and projects",
      "🎓 Educational journey and achievements",
      "💼 Professional experiences",
      "🎮 Fun facts and personal insights",
      "📱 How to connect with him",
      "\nWhat would you like to know? 😊",
    ].join("\n");

    updateSuggestedReplies("welcome");
    return welcomeResponse;
  };

  // Update suggested replies with more personal options
  const updateSuggestedReplies = (context) => {
    const repliesMap = {
      welcome: [
        "Tell me about David's personality",
        "What are his goals?",
        "How old is David?",
      ],
      personality: [
        "What are his hobbies?",
        "Tell me about his work style",
        "What motivates him?",
      ],
      skills: [
        "What's he currently learning?",
        "His favorite technologies?",
        "Recent projects?",
      ],
      education: [
        "Why did he choose IT?",
        "Future learning goals?",
        "Certifications?",
      ],
      experience: [
        "His biggest achievement?",
        "Career goals?",
        "Side projects?",
      ],
      personal: [
        "What are his interests?",
        "His work preferences?",
        "Future aspirations?",
      ],
      contact: [
        "Check his content",
        "Professional background",
        "Current projects",
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
