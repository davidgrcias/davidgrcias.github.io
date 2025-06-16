import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Bot, Loader } from "lucide-react";
import userProfile from "../data/userProfile";
import experiences from "../data/experiences";
import skills from "../data/skills";
import projects from "../data/projects";
import education from "../data/education";

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

  // Knowledge base for the chatbot
  const knowledge = {
    skills: skills.map((skill) => skill.name).join(", "),
    education: education
      .map((edu) => `${edu.degree} from ${edu.institution}`)
      .join(", "),
    experience: experiences
      .map((exp) => `${exp.role} at ${exp.company}`)
      .join(", "),
    projects: projects.map((proj) => proj.name).join(", "),
    contact: userProfile.contact,
    about: userProfile.aboutText,
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

  const generateResponse = (input) => {
    const lowercaseInput = input.toLowerCase();

    // Skills related queries
    if (
      findBestMatch(lowercaseInput, [
        "skill",
        "can",
        "able",
        "capable",
        "do",
        "tech",
        "technology",
      ])
    ) {
      setSuggestedReplies([
        "Tell me about your projects",
        "What's your work experience?",
        "What technologies do you use?",
      ]);
      return `I specialize in: ${knowledge.skills}`;
    }

    // Education related queries
    if (
      findBestMatch(lowercaseInput, [
        "education",
        "study",
        "school",
        "university",
        "degree",
        "learn",
      ])
    ) {
      setSuggestedReplies([
        "What are your skills?",
        "Tell me about your experience",
        "What projects have you worked on?",
      ]);
      return `My educational background includes: ${knowledge.education}`;
    }

    // Experience related queries
    if (
      findBestMatch(lowercaseInput, [
        "experience",
        "work",
        "job",
        "company",
        "career",
        "profession",
      ])
    ) {
      setSuggestedReplies([
        "What projects did you work on?",
        "What are your skills?",
        "Tell me about your education",
      ]);
      return `My professional experience includes: ${knowledge.experience}`;
    }

    // Project related queries
    if (
      findBestMatch(lowercaseInput, [
        "project",
        "portfolio",
        "built",
        "create",
        "develop",
      ])
    ) {
      setSuggestedReplies([
        "What technologies do you use?",
        "Tell me about your experience",
        "How can I contact you?",
      ]);
      return `I've worked on various projects including: ${knowledge.projects}`;
    }

    // Contact related queries
    if (
      findBestMatch(lowercaseInput, [
        "contact",
        "reach",
        "email",
        "message",
        "call",
        "phone",
        "whatsapp",
      ])
    ) {
      setSuggestedReplies([
        "Tell me about your projects",
        "What are your skills?",
        "Looking to collaborate?",
      ]);
      return `You can reach me at ${knowledge.contact.email} or via WhatsApp at ${knowledge.contact.whatsapp}`;
    }

    // About/Introduction queries
    if (
      findBestMatch(lowercaseInput, [
        "about",
        "who",
        "introduction",
        "tell",
        "background",
      ])
    ) {
      setSuggestedReplies([
        "What are your skills?",
        "Tell me about your projects",
        "How can I contact you?",
      ]);
      return knowledge.about;
    }

    // Greetings
    if (
      findBestMatch(lowercaseInput, [
        "hello",
        "hi",
        "hey",
        "greetings",
        "morning",
        "afternoon",
        "evening",
      ])
    ) {
      setSuggestedReplies([
        "What can you do?",
        "Tell me about yourself",
        "Show me your projects",
      ]);
      return "Hello! I'm David's portfolio assistant. Feel free to ask me about his skills, experience, projects, or how to get in touch!";
    }

    // Default response with suggestions
    setSuggestedReplies([
      "What are David's skills?",
      "Show me some projects",
      "How can I contact David?",
    ]);
    return "I can tell you about David's skills, experience, projects, education, or how to contact him. What would you like to know?";
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

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = {
        type: "bot",
        content: generateResponse(inputMessage),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestedReply = (reply) => {
    const userMessage = {
      type: "user",
      content: reply,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        type: "bot",
        content: generateResponse(reply),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
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
