import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Bot,
  Loader,
  Maximize2,
  Minimize2,
  ChevronDown,
  User,
  Users,
  Heart,
  GraduationCap,
  History,
} from "lucide-react";
import { sendWidgetMessage } from "../services/aiAgent";
import { useTranslation } from "../contexts/TranslationContext";
import ThinkingProcess from "./ThinkingProcess";
import { generateThinkingSteps } from "../utils/thinkingSteps";
import ChatHistorySidebar from "./ChatHistorySidebar";
import {
  getConversations,
  createConversation,
  updateConversation,
  deleteConversation,
  deserializeMessages,
  generateTitle,
} from "../services/chatHistoryService";

const ChatBot = () => {
  const { currentLanguage, translateText } = useTranslation();

  // ============================================
  // Persona System
  // ============================================
  const PERSONAS = [
    { id: 'assistant', name: "David's Assistant", shortName: 'Assistant', icon: <Bot size={14} />, description: 'Professional AI assistant' },
    { id: 'david', name: 'David', shortName: 'David', icon: <User size={14} />, description: 'Speaks as David himself' },
    { id: 'bestfriend', name: "Best Friend", shortName: 'Best Friend', icon: <Users size={14} />, description: 'Casual bro perspective' },
    { id: 'girlfriend', name: "Girlfriend", shortName: 'Girlfriend', icon: <Heart size={14} />, description: 'Warm partner perspective' },
    { id: 'teacher', name: "Professor", shortName: 'Professor', icon: <GraduationCap size={14} />, description: 'Academic mentor perspective' },
  ];

  const WELCOME_MESSAGES = {
    assistant: "👋 Hi! I'm David's AI assistant. Ask me anything about David's skills, projects, experience, or just say hi!",
    david: "👋 Hey there! I'm David. Feel free to ask me anything — about my projects, skills, background, or whatever you're curious about!",
    bestfriend: "👋 Yo! I'm David's best friend. Want to know what makes this guy so awesome? Just ask!",
    girlfriend: "💕 Hi! I know David pretty well. Ask me anything about him — I'd love to share!",
    teacher: "🎓 Hello! I'm David's professor at UMN. I'd be happy to discuss his academic journey and potential.",
  };

  const HEADER_TITLES = {
    assistant: "David's Portfolio Assistant",
    david: "Chat with David",
    bestfriend: "David's Best Friend",
    girlfriend: "David's Girlfriend",
    teacher: "David's Professor",
  };

  // ============================================
  // Persona-Specific Suggested Questions Pool
  // ============================================
  const WELCOME_QUESTIONS = {
    assistant: [
      "Who is David and what does he do?",
      "What are David's main technical skills?",
      "Tell me about David's projects",
      "What's David's educational background?",
      "How can I contact David?",
      "What programming languages does David know?",
      "Does David have work experience?",
      "Tell me about David's achievements",
      "What's David's YouTube channel about?",
      "Is David available for freelance work?",
      "What certifications does David have?",
      "What makes David unique as a developer?",
      "Show me David's recent work",
      "What frameworks does David specialize in?",
      "Tell me about David's journey in tech",
    ],
    david: [
      "Hey David! What are you working on right now?",
      "What got you into programming?",
      "What's your favorite project so far?",
      "Tell me about yourself!",
      "What tech stack do you enjoy most?",
      "What's your dream job or company?",
      "How did you start your YouTube channel?",
      "What motivates you as a developer?",
      "What's the hardest challenge you've faced?",
      "Do you prefer frontend or backend?",
      "What are your goals for 2026?",
      "What's something people don't know about you?",
      "How do you learn new technologies?",
      "What advice would you give to beginners?",
      "Tell me about your university life!",
    ],
    bestfriend: [
      "What's David really like as a person?",
      "Is David actually good at coding? Be honest!",
      "What's the funniest thing about David?",
      "What does David do in his free time?",
      "How did you become friends with David?",
      "What's David's biggest flex?",
      "Does David ever take a break from coding?",
      "What's David's taste in music?",
      "Is David a night owl or early bird?",
      "What's David's hidden talent?",
      "Tell me a fun story about David",
      "What games does David play?",
      "How does David handle pressure?",
      "What's David's most ambitious project?",
      "Would you recommend David as a teammate?",
    ],
    girlfriend: [
      "What do you love most about David?",
      "How does David balance work and life?",
      "What's David's most romantic quality?",
      "Is David really as nerdy as he seems?",
      "What's David like behind the scenes?",
      "Does David talk about coding at dinner?",
      "What's David's best personality trait?",
      "How does David treat the people he cares about?",
      "What's a sweet thing David has done?",
      "What's David passionate about besides tech?",
      "How supportive is David?",
      "What's your favorite memory with David?",
      "Does David have a good sense of humor?",
      "What makes David different from others?",
      "How ambitious is David really?",
    ],
    teacher: [
      "How is David performing academically?",
      "What are David's strongest subjects?",
      "Does David show leadership potential?",
      "How does David compare to other students?",
      "Is David active in campus activities?",
      "What's David's approach to problem-solving?",
      "Would you recommend David for an internship?",
      "How's David's teamwork and collaboration?",
      "What areas should David improve on?",
      "Tell me about David's academic projects",
      "Does David participate actively in class?",
      "How creative is David in his assignments?",
      "What's David's GPA like?",
      "Is David a quick learner?",
      "What potential do you see in David's career?",
    ],
  };

  const CONTEXT_QUESTIONS = {
    assistant: {
      skills: [
        "What's David currently learning?",
        "Show me his work experience",
        "Tell me about his certifications",
        "How proficient is he in React?",
        "What about his backend skills?",
      ],
      education: [
        "What's his GPA?",
        "Tell me about his work experience",
        "What certifications does he have?",
        "What did he study at UMN?",
      ],
      experience: [
        "Tell me about his business ventures",
        "What are his technical strengths?",
        "How many followers does he have?",
        "What roles has he held?",
      ],
      contact: [
        "Check out his YouTube channel",
        "Download his complete CV",
        "Show me his latest projects",
        "What's his LinkedIn?",
      ],
      youtube: [
        "What type of content does he create?",
        "Show me his other social platforms",
        "Tell me about his technical skills",
        "How many subscribers does he have?",
      ],
      projects: [
        "What's his role in UMN Festival?",
        "Show me his technical expertise",
        "How can I collaborate with him?",
        "What's his most impressive project?",
      ],
    },
    david: {
      skills: [
        "What are you learning right now?",
        "Which framework is your favorite?",
        "Do you prefer TypeScript or JavaScript?",
        "How did you learn React?",
      ],
      education: [
        "How's university going for you?",
        "What's your favorite course?",
        "Any plans for further education?",
      ],
      experience: [
        "What was your favorite job so far?",
        "Tell me about a tough project you handled",
        "Do you freelance on the side?",
      ],
      contact: [
        "Where can I follow your work?",
        "Are you open to collaborations?",
        "What's the best way to reach you?",
      ],
      youtube: [
        "What inspired your YouTube channel?",
        "How do you come up with video ideas?",
        "Any plans for new content?",
      ],
      projects: [
        "What project are you most proud of?",
        "Any open source contributions?",
        "What's your next big idea?",
      ],
    },
    bestfriend: {
      skills: [
        "Is he really that good at coding?",
        "What does he geek out about the most?",
        "Has he ever stayed up all night coding?",
        "What tech does he rant about?",
      ],
      education: [
        "Does he actually study or just code?",
        "Is he that one smart friend?",
        "How does he manage school and projects?",
      ],
      experience: [
        "Has he ever had a work disaster?",
        "What's his wildest career story?",
        "Does he actually enjoy working?",
      ],
      contact: [
        "Is he easy to get hold of?",
        "Does he reply fast to messages?",
        "What's the best way to reach him?",
      ],
      youtube: [
        "Does he obsess over video analytics?",
        "What's behind the scenes of his channel?",
        "Is he funnier on or off camera?",
      ],
      projects: [
        "Which project drove him the craziest?",
        "Does he ever finish side projects?",
        "What's the most epic thing he's built?",
      ],
    },
    girlfriend: {
      skills: [
        "Does he code more than he texts you?",
        "What skill of his impresses you most?",
        "Has he ever built something for you?",
        "How does he explain tech to you?",
      ],
      education: [
        "Does he stress about school?",
        "Do you help him study?",
        "How does he balance us and university?",
      ],
      experience: [
        "Is he happier at work or with you?",
        "How does he handle work stress?",
        "What does he want for his career?",
      ],
      contact: [
        "Good luck getting his attention while coding!",
        "He's very responsive actually!",
        "He loves connecting with new people",
      ],
      youtube: [
        "Do you appear in his videos?",
        "How much time does he spend editing?",
        "Is he more fun on camera or off?",
      ],
      projects: [
        "Which project did he put the most love into?",
        "Does he ever show you his projects?",
        "What's his most creative work?",
      ],
    },
    teacher: {
      skills: [
        "How does he compare technically to peers?",
        "What's his strongest programming area?",
        "Does he go beyond the curriculum?",
        "How quickly does he pick up new concepts?",
      ],
      education: [
        "Is he on track to graduate with honors?",
        "What courses has he excelled in?",
        "How is his thesis progressing?",
      ],
      experience: [
        "Has he had any relevant internships?",
        "How does industry experience help his studies?",
        "Would he thrive in a corporate environment?",
      ],
      contact: [
        "Is he well-connected in the industry?",
        "Does he attend conferences or events?",
        "How can employers reach him?",
      ],
      youtube: [
        "Does his YouTube show academic depth?",
        "How does content creation help his skills?",
        "Is this a viable career path for him?",
      ],
      projects: [
        "Which project best shows his capability?",
        "How does his work compare to other students?",
        "Has he won any competitions?",
      ],
    },
  };

  // Utility: pick N random items from an array
  const getRandomQuestions = (pool, count = 4) => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // Utility: get random questions translated to current language
  const getTranslatedQuestions = useCallback((pool, count = 4) => {
    const random = getRandomQuestions(pool, count);
    return random.map(q => translateText(q, currentLanguage));
  }, [translateText, currentLanguage]);

  // ============================================
  // State
  // ============================================
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePersona, setActivePersona] = useState('assistant');
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content: translateText(
        WELCOME_MESSAGES.assistant,
        currentLanguage
      ),
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [responseReady, setResponseReady] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState(() => {
    // Initial state - will be updated by useEffect
    const pool = WELCOME_QUESTIONS.assistant;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4).map(q => translateText(q, currentLanguage));
  });
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const pendingResponseRef = useRef(null);
  const personaMenuRef = useRef(null);

  // ============================================
  // Chat History State
  // ============================================
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const saveTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // ============================================
  // Chat History — Load / Save / Select / Delete
  // ============================================
  const loadConversations = async () => {
    setHistoryLoading(true);
    try {
      const convos = await getConversations();
      setConversations(convos);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  /**
   * Debounced save: waits 1.5s after last message before writing to Firestore.
   * Prevents rapid writes during active conversation.
   */
  const debouncedSave = useCallback((msgs, persona, convoId) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      const hasUserMsg = msgs.some(m => m.type === 'user');
      if (!hasUserMsg) return;

      try {
        if (convoId) {
          const firstUserMsg = msgs.find(m => m.type === 'user');
          await updateConversation(convoId, {
            messages: msgs,
            title: generateTitle(firstUserMsg?.content),
            persona,
          });
        } else {
          const result = await createConversation({ messages: msgs, persona });
          if (result?.id) {
            setActiveConversationId(result.id);
          }
        }
        const convos = await getConversations();
        setConversations(convos);
      } catch (error) {
        console.error('[ChatBot] Failed to save:', error.message);
      }
    }, 1500);
  }, []);

  // Load conversation history when chat opens
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  // Auto-save conversation after each interaction (debounced)
  useEffect(() => {
    // Only trigger if there are user messages (actual conversation)
    const hasUserMsg = messages.some(m => m.type === 'user');
    console.log('[ChatBot] Auto-save check:', { 
      messageCount: messages.length, 
      hasUserMsg, 
      isOpen,
      persona: activePersona,
      convoId: activeConversationId,
      willSave: hasUserMsg && messages.length > 1 && isOpen
    });
    if (hasUserMsg && messages.length > 1 && isOpen) {
      debouncedSave(messages, activePersona, activeConversationId);
    }
  }, [messages, activePersona, activeConversationId, isOpen, debouncedSave]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (personaMenuRef.current && !personaMenuRef.current.contains(e.target)) {
        setShowPersonaMenu(false);
      }
    };
    if (showPersonaMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPersonaMenu]);

  // Safety timeout — if thinking takes more than 30 seconds, force complete
  useEffect(() => {
    if (isThinking) {
      const timeout = setTimeout(() => {
        const response = pendingResponseRef.current;
        if (response !== null) {
          setMessages(prev => [...prev, { type: 'bot', content: response, timestamp: new Date() }]);
          pendingResponseRef.current = null;
        }
        setIsThinking(false);
        setThinkingSteps([]);
        setResponseReady(false);
      }, 30000);
      return () => clearTimeout(timeout);
    }
  }, [isThinking]);

  // Re-translate suggested replies when language changes
  useEffect(() => {
    setSuggestedReplies(getTranslatedQuestions(WELCOME_QUESTIONS[activePersona] || WELCOME_QUESTIONS.assistant, 4));
  }, [currentLanguage, activePersona, getTranslatedQuestions]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSelectConversation = (conversationId) => {
    const convo = conversations.find(c => c.id === conversationId);
    if (!convo) return;

    // Load the conversation messages
    const loadedMessages = deserializeMessages(convo.messages);
    setMessages(loadedMessages.length > 0 ? loadedMessages : [{
      type: 'bot',
      content: WELCOME_MESSAGES[convo.persona] || WELCOME_MESSAGES.assistant,
      timestamp: new Date(),
    }]);
    setActivePersona(convo.persona || 'assistant');
    setActiveConversationId(conversationId);

    // Reset thinking state
    setIsThinking(false);
    setThinkingSteps([]);
    setResponseReady(false);
    pendingResponseRef.current = null;
    updateSuggestedReplies('welcome', convo.persona || 'assistant');
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([{
      type: 'bot',
      content: WELCOME_MESSAGES[activePersona] || WELCOME_MESSAGES.assistant,
      timestamp: new Date(),
    }]);
    setIsThinking(false);
    setThinkingSteps([]);
    setResponseReady(false);
    pendingResponseRef.current = null;
    updateSuggestedReplies('welcome', activePersona);
  };

  const handleDeleteConversation = async (conversationId) => {
    const success = await deleteConversation(conversationId);
    if (success) {
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      // If we deleted the active conversation, start a new chat
      if (conversationId === activeConversationId) {
        handleNewChat();
      }
    }
  };

  // ============================================
  // AI Agent — Generate Response via Agent Service
  // ============================================
  const generateResponse = async (input) => {
    try {
      const result = await sendWidgetMessage(input, {
        language: currentLanguage,
        conversationHistory: messages.slice(-8),
        persona: activePersona,
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

  const updateSuggestedReplies = (context, persona = activePersona) => {
    if (context === 'welcome') {
      const pool = WELCOME_QUESTIONS[persona] || WELCOME_QUESTIONS.assistant;
      setSuggestedReplies(getTranslatedQuestions(pool, 4));
      return;
    }

    const personaContextMap = CONTEXT_QUESTIONS[persona] || CONTEXT_QUESTIONS.assistant;
    const contextReplies = personaContextMap[context];

    if (contextReplies && contextReplies.length > 0) {
      setSuggestedReplies(getTranslatedQuestions(contextReplies, Math.min(4, contextReplies.length)));
    } else {
      // Fallback: random welcome questions for this persona
      const pool = WELCOME_QUESTIONS[persona] || WELCOME_QUESTIONS.assistant;
      setSuggestedReplies(getTranslatedQuestions(pool, 4));
    }
  };

  // ============================================
  // Thinking Process Complete Callback
  // ============================================
  const onThinkingComplete = useCallback(() => {
    const response = pendingResponseRef.current;
    if (response !== null) {
      setMessages(prev => [...prev, { type: 'bot', content: response, timestamp: new Date() }]);
      pendingResponseRef.current = null;
    }
    setIsThinking(false);
    setThinkingSteps([]);
    setResponseReady(false);
  }, []);

  // ============================================
  // Persona Change Handler
  // ============================================
  const handlePersonaChange = (newPersona) => {
    setActivePersona(newPersona);
    setShowPersonaMenu(false);
    // Start fresh conversation with new persona
    setActiveConversationId(null);
    setMessages([{
      type: 'bot',
      content: WELCOME_MESSAGES[newPersona] || WELCOME_MESSAGES.assistant,
      timestamp: new Date(),
    }]);
    updateSuggestedReplies('welcome', newPersona);
    // Clear any in-progress thinking
    setIsThinking(false);
    setThinkingSteps([]);
    setResponseReady(false);
    pendingResponseRef.current = null;
  };

  // ============================================
  // Submit Handler with Thinking Process
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isThinking) return;

    const userInput = inputMessage.trim();

    // Add user message
    setMessages(prev => [...prev, {
      type: "user",
      content: userInput,
      timestamp: new Date(),
    }]);
    setInputMessage("");

    // Start thinking process
    const steps = generateThinkingSteps(userInput);
    setThinkingSteps(steps);
    setIsThinking(true);
    setResponseReady(false);
    pendingResponseRef.current = null;

    try {
      const response = await generateResponse(userInput);
      pendingResponseRef.current = response;
      setResponseReady(true);
    } catch (error) {
      pendingResponseRef.current = "Sorry, I'm having trouble responding right now. Please try again.";
      setResponseReady(true);
    }
  };

  const handleSuggestedReply = async (reply) => {
    if (isThinking) return;

    setMessages(prev => [...prev, {
      type: "user",
      content: reply,
      timestamp: new Date(),
    }]);

    // Start thinking process
    const steps = generateThinkingSteps(reply);
    setThinkingSteps(steps);
    setIsThinking(true);
    setResponseReady(false);
    pendingResponseRef.current = null;

    try {
      const response = await generateResponse(reply);
      pendingResponseRef.current = response;
      setResponseReady(true);
    } catch (error) {
      pendingResponseRef.current = "Sorry, I'm having trouble responding right now. Please try again.";
      setResponseReady(true);
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
        bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col relative`}
          >
            {/* Header */}
            <div className="p-4 bg-cyan-500 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot size={24} />
                  <h3 className="font-semibold text-sm">{HEADER_TITLES[activePersona] || HEADER_TITLES.assistant}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`p-1 rounded-full transition-colors ${
                      showHistory ? 'bg-white/30' : 'hover:bg-white/20'
                    }`}
                    title="Chat history"
                  >
                    <History size={20} />
                  </button>
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

              {/* Persona Selector */}
              <div className="mt-2 relative" ref={personaMenuRef}>
                <button
                  onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-lg transition-colors text-xs w-full"
                >
                  <span className="flex items-center gap-1">
                    {PERSONAS.find(p => p.id === activePersona)?.icon}
                    <span>{PERSONAS.find(p => p.id === activePersona)?.name}</span>
                  </span>
                  <ChevronDown size={12} className={`ml-auto transition-transform ${showPersonaMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showPersonaMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-600 overflow-hidden z-50"
                    >
                      {PERSONAS.map((persona) => (
                        <button
                          key={persona.id}
                          onClick={() => handlePersonaChange(persona.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                            activePersona === persona.id
                              ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span className="flex-shrink-0">{persona.icon}</span>
                          <div className="min-w-0">
                            <div className="font-medium">{persona.name}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{persona.description}</div>
                          </div>
                          {activePersona === persona.id && (
                            <span className="ml-auto text-cyan-500 flex-shrink-0">✓</span>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Chat History Sidebar */}
            <ChatHistorySidebar
              isOpen={showHistory}
              onClose={() => setShowHistory(false)}
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewChat}
              onDeleteConversation={handleDeleteConversation}
              isLoading={historyLoading}
              isFullscreen={isFullscreen}
            />

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
              {/* Thinking Process Visualization */}
              {isThinking && thinkingSteps.length > 0 && (
                <ThinkingProcess
                  steps={thinkingSteps}
                  responseReady={responseReady}
                  onComplete={onThinkingComplete}
                  compact={true}
                />
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
                    disabled={isThinking}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full text-sm whitespace-nowrap hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  placeholder={isThinking ? "Thinking..." : "Type your message..."}
                  disabled={isThinking}
                  className="flex-1 p-3 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isThinking || !inputMessage.trim()}
                  className="p-3 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
