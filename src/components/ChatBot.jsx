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
import { sendWidgetMessage } from "../services/aiAgent";
import { useTranslation } from "../contexts/TranslationContext";

const ChatBot = () => {
  const { currentLanguage, translateText } = useTranslation();

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

  // ============================================
  // AI Agent — Generate Response via Agent Service
  // ============================================
  const generateResponse = async (input) => {
    try {
      setIsTyping(true);

      const result = await sendWidgetMessage(input, {
        language: currentLanguage,
        conversationHistory: messages.slice(-8),
        onActionExecuted: (action, result) => {
          console.log("🤖 Widget Action:", action.label);
        },
      });

      // Update suggested replies based on conversation context
      const inputLower = input.toLowerCase();
      let responseContext = "welcome";
      if (inputLower.includes("youtube") || inputLower.includes("video")) responseContext = "youtube";
      else if (inputLower.includes("project") || inputLower.includes("work")) responseContext = "projects";
      else if (inputLower.includes("skill") || inputLower.includes("tech")) responseContext = "skills";
      else if (inputLower.includes("contact") || inputLower.includes("email") || inputLower.includes("hire")) responseContext = "contact";
      else if (inputLower.includes("experience") || inputLower.includes("job")) responseContext = "experience";
      else if (inputLower.includes("education") || inputLower.includes("university")) responseContext = "education";
      
      updateSuggestedReplies(responseContext);

      return result.text;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I'm having a bit of trouble connecting to my brain right now! 🧠 Please try asking again in a moment.";
    }
  };

  const updateSuggestedReplies = (context) => {
    const repliesMap = {
      welcome: [
        "What's David's age and background?",
        "Show me his technical skills",
        "Tell me about his YouTube journey",
        "What projects is he working on?",
        "How can I contact him?",
      ],
      skills: [
        "What's he currently learning?",
        "Show me his work experience",
        "Tell me about his certifications",
        "How proficient is he in React?",
      ],
      education: [
        "What's his GPA?",
        "Tell me about his work experience",
        "What certifications does he have?",
      ],
      experience: [
        "Tell me about his business ventures",
        "What are his technical strengths?",
        "How many followers does he have?",
      ],
      contact: [
        "Check out his YouTube channel",
        "Download his complete CV",
        "Show me his latest projects",
      ],
      youtube: [
        "What type of content does he create?",
        "Show me his other social platforms",
        "Tell me about his technical skills",
      ],
      projects: [
        "What's his role in UMN Festival?",
        "Show me his technical expertise",
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
