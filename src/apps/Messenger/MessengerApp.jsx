import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, Loader, Trash2, MessageCircle, Download, ThumbsUp, ThumbsDown, Sparkles, Zap, AlertCircle, X, Mic, MicOff, Volume2, VolumeX, Brain, ExternalLink, ChevronDown, User, Users, Heart, GraduationCap, History } from 'lucide-react';
import { useOS } from '../../contexts/OSContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { sendAgentMessage, getAgentMemory, resetAgentMemory } from '../../services/aiAgent';
import { updateChatFeedback } from '../../services/chatAnalytics';
import ThinkingProcess from '../../components/ThinkingProcess';
import { generateThinkingSteps } from '../../utils/thinkingSteps';
import ChatHistorySidebar from '../../components/ChatHistorySidebar';
import {
  getConversations,
  createConversation,
  updateConversation,
  deleteConversation,
  deserializeMessages,
  generateTitle,
} from '../../services/chatHistoryService';

const MessengerApp = ({ id }) => {
    const { updateWindow } = useOS();
    const { currentLanguage, translateText } = useTranslation();
    const agentMemory = useRef(getAgentMemory());
    const abortRef = useRef(null);
    // ============================================
    // Persona System
    // ============================================
    const PERSONAS = [
        { id: 'assistant', name: "David's Assistant", icon: <Bot size={12} />, description: 'Professional AI assistant' },
        { id: 'david', name: 'David', icon: <User size={12} />, description: 'Speaks as David himself' },
        { id: 'bestfriend', name: 'Best Friend', icon: <Users size={12} />, description: 'Casual bro perspective' },
        { id: 'girlfriend', name: 'Girlfriend', icon: <Heart size={12} />, description: 'Warm partner perspective' },
        { id: 'teacher', name: 'Professor', icon: <GraduationCap size={12} />, description: 'Academic mentor perspective' },
    ];

    const WELCOME_MESSAGES = {
        assistant: "Hello! \ud83d\udc4b I'm David's AI Assistant.\n\nAsk me about his projects, skills, or just say hi! I can tell you all about his journey.",
        david: "Hey! \ud83d\udc4b I'm David. Feel free to ask me anything about my projects, skills, or background. I'll answer as myself!",
        bestfriend: "Yo! \ud83d\udc4b I'm David's best friend. I know this guy inside out \u2014 ask me anything about him!",
        girlfriend: "\ud83d\udc95 Hi there! I know David pretty well. Ask me anything about him \u2014 I'd love to share!",
        teacher: "\ud83c\udf93 Hello! I'm David's professor at UMN. I'd be happy to discuss his academic journey and potential.",
    };

    const [activePersona, setActivePersona] = useState('assistant');
    const [showPersonaMenu, setShowPersonaMenu] = useState(false);
    const personaMenuRef = useRef(null);

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

    // Utility: pick N random items from an array
    const getRandomQuestions = useCallback((pool, count = 4) => {
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }, []);

    const getPersonaQuestions = useCallback((persona = 'assistant') => {
        const pool = WELCOME_QUESTIONS[persona] || WELCOME_QUESTIONS.assistant;
        return getRandomQuestions(pool, 4);
    }, [getRandomQuestions]);

    const getTranslatedQuestions = useCallback((pool, count = 4) => {
        const random = getRandomQuestions(pool, count);
        return random.map(q => translateText(q, currentLanguage));
    }, [translateText, currentLanguage, getRandomQuestions]);

    // Thinking Process states
    const [isThinkingProcess, setIsThinkingProcess] = useState(false);
    const [thinkingSteps, setThinkingSteps] = useState([]);
    const [thinkingResponseReady, setThinkingResponseReady] = useState(false);
    const pendingResponseRef = useRef(null);
    const isThinkingRef = useRef(false);
    const pendingStreamChunks = useRef('');
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            content: "Hello! 👋 I'm David's AI Assistant.\n\nAsk me about his projects, skills, or just say hi! I can tell you all about his journey.",
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [useRAG, setUseRAG] = useState(true);
    const [suggestedQuestions, setSuggestedQuestions] = useState(() => {
        const pool = WELCOME_QUESTIONS.assistant;
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const random = shuffled.slice(0, 4);
        return random.map(q => {
            if (currentLanguage === 'id') {
                // Inline minimal translation for initial render
                const translations = {
                    "Who is David and what does he do?": "Siapa David dan apa yang dia lakukan?",
                    "What are David's main technical skills?": "Apa saja keterampilan teknis utama David?",
                    "Tell me about David's projects": "Ceritakan tentang proyek-proyek David",
                    "What's David's educational background?": "Apa latar belakang pendidikan David?",
                    "How can I contact David?": "Bagaimana cara menghubungi David?",
                    "What programming languages does David know?": "Bahasa pemrograman apa yang David kuasai?",
                    "Does David have work experience?": "Apakah David memiliki pengalaman kerja?",
                    "Tell me about David's achievements": "Ceritakan tentang pencapaian David",
                    "What's David's YouTube channel about?": "Apa yang ada di saluran YouTube David?",
                    "Is David available for freelance work?": "Apakah David tersedia untuk pekerjaan freelance?",
                    "What certifications does David have?": "Sertifikasi apa yang dimiliki David?",
                    "What makes David unique as a developer?": "Apa yang membuat David unik sebagai developer?",
                    "Show me David's recent work": "Tunjukkan pekerjaan terbaru David",
                    "What frameworks does David specialize in?": "Framework apa yang David kuasai?",
                    "Tell me about David's journey in tech": "Ceritakan tentang perjalanan David di bidang teknis",
                };
                return translations[q] || q;
            }
            return q;
        });
    });
    const [error, setError] = useState(null);
    const [streamingText, setStreamingText] = useState('');
    const [enableStreaming, setEnableStreaming] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [actionBadges, setActionBadges] = useState([]);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(null);

    // ============================================
    // Chat History State
    // ============================================
    const [showHistory, setShowHistory] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const saveTimeoutRef = useRef(null);

    // Close persona menu when clicking outside
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

    // Safety timeout for thinking process
    useEffect(() => {
        if (isThinkingProcess) {
            const timeout = setTimeout(() => {
                const result = pendingResponseRef.current;
                if (result) {
                    finalizeBotMessage(result);
                }
                isThinkingRef.current = false;
                setIsThinkingProcess(false);
                setThinkingSteps([]);
                setThinkingResponseReady(false);
                pendingResponseRef.current = null;
                pendingStreamChunks.current = '';
            }, 30000);
            return () => clearTimeout(timeout);
        }
    }, [isThinkingProcess]);

    // Persona change handler
    const handlePersonaChange = (newPersona) => {
        setActivePersona(newPersona);
        setShowPersonaMenu(false);
        // Start a fresh new conversation with new persona
        setActiveConversationId(null);
        resetAgentMemory();
        agentMemory.current = getAgentMemory();
        setMessages([{
            type: 'bot',
            content: WELCOME_MESSAGES[newPersona] || WELCOME_MESSAGES.assistant,
        }]);
        setSuggestedQuestions(getTranslatedQuestions(WELCOME_QUESTIONS[newPersona] || WELCOME_QUESTIONS.assistant, 4));
        setActionBadges([]);
        // Clear thinking state
        isThinkingRef.current = false;
        setIsThinkingProcess(false);
        setThinkingSteps([]);
        setThinkingResponseReady(false);
        pendingResponseRef.current = null;
        pendingStreamChunks.current = '';
    };

    // Re-translate suggested questions when language or persona changes
    useEffect(() => {
        setSuggestedQuestions(
            getTranslatedQuestions(WELCOME_QUESTIONS[activePersona] || WELCOME_QUESTIONS.assistant, 4)
        );
    }, [currentLanguage, activePersona, getTranslatedQuestions]);

    // Context Menu
    useEffect(() => {
        if (id) {
            updateWindow(id, {
                contextMenuOptions: [
                    {
                        label: 'New Chat',
                        icon: <MessageCircle size={16} />,
                        onClick: () => {
                            resetAgentMemory();
                            agentMemory.current = getAgentMemory();
                            setMessages([{
                                type: 'bot',
                                content: WELCOME_MESSAGES[activePersona] || WELCOME_MESSAGES.assistant,
                            }]);
                            setSuggestedQuestions(getTranslatedQuestions(WELCOME_QUESTIONS[activePersona] || WELCOME_QUESTIONS.assistant, 4));
                            setActionBadges([]);
                        },
                        shortcut: 'Ctrl+N',
                    },
                    { separator: true },
                    {
                        label: 'Clear History',
                        icon: <Trash2 size={16} />,
                        onClick: () => {
                            resetAgentMemory();
                            agentMemory.current = getAgentMemory();
                            setMessages([]);
                            setActionBadges([]);
                        },
                    },
                    {
                        label: 'Export Chat',
                        icon: <Download size={16} />,
                        onClick: () => {
                            const chatText = messages.map(m => `${m.type.toUpperCase()}: ${m.content}`).join('\n\n');
                            const blob = new Blob([chatText], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'chat-history.txt';
                            a.click();
                            URL.revokeObjectURL(url);
                        },
                    }
                ]
            });
        }
    }, [id, messages, updateWindow]);

    // Handle External Actions
    useEffect(() => {
        const handleAction = (e) => {
            const { appId, action, payload } = e.detail;
            if (appId !== 'messenger') return;

            if (action === 'new-chat') {
                setMessages([{
                    type: 'bot',
                    content: "Hello! 👋 I'm David's AI Assistant.\n\nAsk me about his projects, skills, or just say hi! I can tell you all about his journey.",
                }]);
            } else if (action === 'set-status') {
                const statusMsg = payload.status === 'online' ? "Status set to Online 🟢" : "Status set to Do Not Disturb 🔴";
                setMessages(prev => [...prev, {
                    type: 'bot',
                    content: statusMsg,
                }]);
            }
        };

        window.addEventListener('WEBOS_APP_ACTION', handleAction);
        return () => window.removeEventListener('WEBOS_APP_ACTION', handleAction);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingText]);

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
                console.error('[ChatHistory] Failed to save:', error.message);
            }
        }, 1500);
    }, []);

    // Load conversation history on mount
    useEffect(() => {
        loadConversations();
    }, []);

    // Auto-save conversation after each interaction (debounced)
    useEffect(() => {
        const hasUserMsg = messages.some(m => m.type === 'user');
        if (hasUserMsg && messages.length > 1) {
            debouncedSave(messages, activePersona, activeConversationId);
        }
    }, [messages, activePersona, activeConversationId, debouncedSave]);

    const handleSelectConversation = (conversationId) => {
        const convo = conversations.find(c => c.id === conversationId);
        if (!convo) return;

        const loadedMessages = deserializeMessages(convo.messages);
        setMessages(loadedMessages.length > 0 ? loadedMessages : [{
            type: 'bot',
            content: WELCOME_MESSAGES[convo.persona] || WELCOME_MESSAGES.assistant,
        }]);
        setActivePersona(convo.persona || 'assistant');
        setActiveConversationId(conversationId);

        // Reset state
        isThinkingRef.current = false;
        setIsThinkingProcess(false);
        setThinkingSteps([]);
        setThinkingResponseReady(false);
        pendingResponseRef.current = null;
        pendingStreamChunks.current = '';
        setSuggestedQuestions(getTranslatedQuestions(WELCOME_QUESTIONS[convo.persona || 'assistant'] || WELCOME_QUESTIONS.assistant, 4));
    };

    const handleNewChat = () => {
        setActiveConversationId(null);
        resetAgentMemory();
        agentMemory.current = getAgentMemory();
        setMessages([{
            type: 'bot',
            content: WELCOME_MESSAGES[activePersona] || WELCOME_MESSAGES.assistant,
        }]);
        isThinkingRef.current = false;
        setIsThinkingProcess(false);
        setThinkingSteps([]);
        setThinkingResponseReady(false);
        pendingResponseRef.current = null;
        pendingStreamChunks.current = '';
        setSuggestedQuestions(getTranslatedQuestions(WELCOME_QUESTIONS[activePersona] || WELCOME_QUESTIONS.assistant, 4));
        setActionBadges([]);
    };

    const handleDeleteConversation = async (conversationId) => {
        const success = await deleteConversation(conversationId);
        if (success) {
            setConversations(prev => prev.filter(c => c.id !== conversationId));
            if (conversationId === activeConversationId) {
                handleNewChat();
            }
        }
    };

    // Cleanup Speech on unmount
    useEffect(() => {
        return () => {
            if (abortRef.current) {
                abortRef.current();
                abortRef.current = null;
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    // Initialize Speech Recognition and Synthesis
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = currentLanguage === 'id' ? 'id-ID' : 'en-US';

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
                // Auto-send after voice input
                setTimeout(() => {
                    handleSend(null, transcript);
                }, 100);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        if (window.speechSynthesis) {
            synthRef.current = window.speechSynthesis;
        }
    }, [currentLanguage]);

    const toggleVoiceInput = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const speakText = (text) => {
        if (!synthRef.current || !text) return;

        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = currentLanguage === 'id' ? 'id-ID' : 'en-US';
        utterance.rate = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synthRef.current.speak(utterance);
    };

    const toggleSpeech = () => {
        if (!synthRef.current) {
            alert('Text-to-speech not supported in this browser.');
            return;
        }

        if (isSpeaking) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        } else {
            const lastBotMessage = [...messages].reverse().find(m => m.type === 'bot');
            if (lastBotMessage) {
                speakText(lastBotMessage.content);
            }
        }
    };

    // ============================================
    // Thinking Process Complete Callback
    // ============================================
    const onThinkingComplete = useCallback(() => {
        isThinkingRef.current = false;
        setIsThinkingProcess(false);
        setThinkingSteps([]);
        setThinkingResponseReady(false);

        const result = pendingResponseRef.current;
        if (result) {
            // For non-streaming: add the message
            if (typeof result === 'object' && result.text) {
                finalizeBotMessage(result);
            }
            pendingResponseRef.current = null;
        }

        // For streaming mode: flush buffered stream content
        if (pendingStreamChunks.current) {
            setStreamingText(pendingStreamChunks.current);
            setIsTyping(true);
        }
    }, []);

    const handleSend = async (e, quickQuestion = null) => {
        if (e) e.preventDefault();
        const question = quickQuestion || input;
        if (!question.trim() || isThinkingProcess) return;

        const userMsg = { type: 'user', content: question, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setError(null);
        setStreamingText('');
        setActionBadges([]);

        // Start thinking process
        const steps = generateThinkingSteps(question);
        setThinkingSteps(steps);
        setIsThinkingProcess(true);
        setThinkingResponseReady(false);
        isThinkingRef.current = true;
        pendingResponseRef.current = null;
        pendingStreamChunks.current = '';
        setIsTyping(false);

        // Abort any existing stream
        if (abortRef.current) {
            abortRef.current();
            abortRef.current = null;
        }

        try {
            if (enableStreaming) {
                // Streaming mode via AI Agent
                let isStreamCompleted = false;

                await sendAgentMessage(question, {
                    language: currentLanguage,
                    useRAG,
                    useHybrid: true,
                    streaming: true,
                    persona: activePersona,
                    onChunk: (chunk, fullText) => {
                        if (isStreamCompleted) return;
                        
                        pendingStreamChunks.current = fullText;
                        // If thinking already completed, show stream directly
                        if (!isThinkingRef.current) {
                            setStreamingText(fullText);
                            setIsTyping(true);
                        } else {
                            // Signal thinking to fast-forward
                            setThinkingResponseReady(true);
                        }
                    },
                    onDone: (result) => {
                        isStreamCompleted = true;
                        pendingStreamChunks.current = '';
                        if (!isThinkingRef.current) {
                            // Thinking already done, finalize directly
                            finalizeBotMessage(result);
                        } else {
                            // Store result, thinking will finalize when complete
                            pendingResponseRef.current = result;
                            setThinkingResponseReady(true);
                        }
                    },
                    onError: (error) => {
                        isStreamCompleted = true;
                        console.error('Stream error:', error);
                        setError(error.message || 'Streaming failed');
                        isThinkingRef.current = false;
                        setIsThinkingProcess(false);
                        setIsTyping(false);
                        setStreamingText('');
                        setThinkingSteps([]);
                        setThinkingResponseReady(false);
                    },
                    onActionExecuted: (action, result) => {
                        console.log('🤖 Agent Action:', action.label);
                    },
                });
            } else {
                // Non-streaming mode via AI Agent
                const result = await sendAgentMessage(question, {
                    language: currentLanguage,
                    useRAG,
                    useHybrid: true,
                    streaming: false,
                    persona: activePersona,
                    onActionExecuted: (action, result) => {
                        console.log('🤖 Agent Action:', action.label);
                    },
                });
                pendingResponseRef.current = result;
                setThinkingResponseReady(true);
                // ThinkingProcess onComplete will call finalizeBotMessage
            }
        } catch (error) {
            console.error('Chat error:', error);

            let errorMessage = "Sorry, I encountered an error. Please try again.";
            let userMessage = error.message || "Unknown error";

            if (error.message?.includes('Failed to fetch')) {
                errorMessage = "⚠️ API connection failed. Please check your network and try again.";
                userMessage = "API connection failed";
            } else if (error.message?.includes('embedding')) {
                errorMessage = "Could not process your question. Try rephrasing it.";
            }

            setError(userMessage);
            setMessages(prev => [...prev, {
                type: 'bot',
                content: errorMessage,
                timestamp: new Date(),
                isError: true
            }]);
            isThinkingRef.current = false;
            setIsThinkingProcess(false);
            setIsTyping(false);
            setStreamingText('');
            setThinkingSteps([]);
            setThinkingResponseReady(false);
        }
    };

    const finalizeBotMessage = (result) => {
        const botMsg = {
            type: 'bot',
            content: result.text,
            sources: result.sources || [],
            timestamp: new Date(),
            id: `msg_${Date.now()}`,
            feedback: null,
            actions: result.actions || [],
            actionSuggestions: result.actionSuggestions || [],
            responseTime: result.responseTime,
        };

        setMessages(prev => [...prev, botMsg]);
        setStreamingText('');
        setIsTyping(false);

        // Update suggested questions from agent (AI-generated or memory-based)
        if (result.suggestions && result.suggestions.length > 0) {
            setSuggestedQuestions(result.suggestions.slice(0, 4));
        } else {
            // Client-side smart fallback based on conversation context
            const fallbackSuggestions = generateFallbackSuggestions(result.text, messages);
            if (fallbackSuggestions && fallbackSuggestions.length > 0) {
                setSuggestedQuestions(fallbackSuggestions);
            } else {
                setSuggestedQuestions(getTranslatedQuestions(WELCOME_QUESTIONS[activePersona] || WELCOME_QUESTIONS.assistant, 4));
            }
        }

        // Show action badges if any were executed
        if (result.actions && result.actions.length > 0) {
            setActionBadges(result.actions.map(a => a.label));
            setTimeout(() => setActionBadges([]), 3000);
        }

        // Auto-speak response if voice is enabled
        if (voiceEnabled && synthRef.current) {
            speakText(result.text);
        }
    };

    const handleFeedback = async (messageId, feedback) => {
        // Update UI immediately
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, feedback } : msg
        ));

        // Update in analytics if we have the ID
        const message = messages.find(m => m.id === messageId);
        if (message?.analyticsId) {
            try {
                await updateChatFeedback(message.analyticsId, feedback);
            } catch (error) {
                console.error('Failed to update feedback:', error);
            }
        }
    };

    // Smart fallback suggestions when AI doesn't provide structured ones
    const generateFallbackSuggestions = (lastBotText, allMessages) => {
        const text = (lastBotText || '').toLowerCase();
        const discussed = allMessages.map(m => (m.content || '').toLowerCase()).join(' ');

        const pool = {
            projects: [
                "Tell me more about the UMN Festival project",
                "What's David's most impressive project?",
                "Show me David's project portfolio",
            ],
            skills: [
                "How proficient is David in React?",
                "What programming languages does David know?",
                "What's David's strongest technical skill?",
            ],
            experience: [
                "How much professional experience does he have?",
                "What companies has David worked at?",
                "Tell me about his work experience",
            ],
            education: [
                "Tell me about his university",
                "What did David study?",
                "What's his educational background?",
            ],
            personal: [
                "What are David's hobbies?",
                "Tell me a fun fact about David",
                "What music does David listen to?",
            ],
            contact: [
                "How can I contact David?",
                "Is David available for hire?",
                "Can I see David's CV?",
            ],
        };

        const suggestions = [];

        // 1. Context-aware: related to last answer
        if (text.includes('react') || text.includes('project')) {
            suggestions.push("What tech stack did he use?");
        } else if (text.includes('skill') || text.includes('proficient')) {
            suggestions.push("Show me projects using those skills");
        } else if (text.includes('experience') || text.includes('work')) {
            suggestions.push("What did he learn from that role?");
        } else {
            suggestions.push("Tell me more about that");
        }

        // 2. Strategic: always highlight best assets
        if (!discussed.includes('umn festival')) {
            suggestions.push("Tell me about the UMN Festival project");
        } else if (!discussed.includes('contact') && !discussed.includes('hire')) {
            suggestions.push("How can I contact or hire David?");
        } else {
            suggestions.push("What's David's most impressive achievement?");
        }

        // 3. Adaptive: pick undiscussed topic
        const topics = Object.keys(pool);
        const undiscussed = topics.filter(t => !discussed.includes(t));
        const exploreTopic = undiscussed.length > 0 ? undiscussed[0] : topics[Math.floor(Math.random() * topics.length)];
        const topicQuestions = pool[exploreTopic];
        suggestions.push(topicQuestions[Math.floor(Math.random() * topicQuestions.length)]);

        // 4. Explore: different undiscussed topic
        const exploreTopic2 = undiscussed.length > 1 ? undiscussed[1] : topics[Math.floor(Math.random() * topics.length)];
        const topicQuestions2 = pool[exploreTopic2];
        suggestions.push(topicQuestions2[Math.floor(Math.random() * topicQuestions2.length)]);

        return suggestions.slice(0, 4);
    };

    return (
        <div className="flex flex-col h-full w-full bg-zinc-900 text-white font-sans relative">
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
                isFullscreen={false}
            />

            {/* Error Banner */}
            {error && (
                <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto hover:text-red-300">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-800/50">
                {/* Action Badges (show when agent performs actions) */}
                {actionBadges.length > 0 && (
                    <div className="flex gap-2 justify-center animate-pulse">
                        {actionBadges.map((label, i) => (
                            <span key={i} className="px-3 py-1 text-[11px] bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30 flex items-center gap-1">
                                <ExternalLink size={10} />
                                {label}
                            </span>
                        ))}
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} group`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm transition-all ${msg.type === 'user'
                            ? 'bg-blue-500 text-white rounded-br-sm'
                            : msg.isError
                                ? 'bg-red-500/20 border border-red-500/30 text-red-300 rounded-bl-sm'
                                : 'bg-zinc-700 text-white border border-zinc-600 rounded-bl-sm'
                            }`}>
                            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 text-inherit">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>

                        {/* Sources */}
                        {msg.sources && msg.sources.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap max-w-[70%]">
                                {msg.sources.slice(0, 3).map((source, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full border border-zinc-700 hover:bg-zinc-750 transition-colors">
                                        📚 {source.title}
                                    </span>
                                ))}
                                {msg.responseTime && (
                                    <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-500 rounded-full border border-zinc-700">
                                        ⚡ {(msg.responseTime / 1000).toFixed(1)}s
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Action Suggestion Badges */}
                        {msg.actionSuggestions && msg.actionSuggestions.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap max-w-[70%]">
                                {msg.actionSuggestions.map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            import('../../services/agentActions').then(mod => {
                                                mod.executeAgentActions([action]);
                                            });
                                        }}
                                        className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                        <ExternalLink size={10} />
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Feedback Buttons */}
                        {msg.type === 'bot' && !msg.isError && msg.id && (
                            <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleFeedback(msg.id, 'thumbs_up')}
                                    className={`p-1 rounded transition-colors ${msg.feedback === 'thumbs_up'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-zinc-800 text-zinc-500 hover:bg-green-500/10 hover:text-green-400'
                                        }`}
                                    title="Good response"
                                >
                                    <ThumbsUp size={14} />
                                </button>
                                <button
                                    onClick={() => handleFeedback(msg.id, 'thumbs_down')}
                                    className={`p-1 rounded transition-colors ${msg.feedback === 'thumbs_down'
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-zinc-800 text-zinc-500 hover:bg-red-500/10 hover:text-red-400'
                                        }`}
                                    title="Poor response"
                                >
                                    <ThumbsDown size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {/* Thinking Process Visualization */}
                {isThinkingProcess && thinkingSteps.length > 0 && (
                    <ThinkingProcess
                        steps={thinkingSteps}
                        responseReady={thinkingResponseReady}
                        onComplete={onThinkingComplete}
                        compact={false}
                    />
                )}

                {/* Typing Indicator with Streaming (only when not in thinking process) */}
                {isTyping && !isThinkingProcess && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-700 px-4 py-3 rounded-2xl rounded-bl-sm border border-zinc-600 shadow-sm">
                            {streamingText ? (
                                <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 text-white">
                                    <ReactMarkdown>{streamingText}</ReactMarkdown>
                                    <span className="inline-block w-1.5 h-4 bg-blue-400 ml-1 animate-pulse"></span>
                                </div>
                            ) : (
                                <div className="flex gap-1 items-center">
                                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Suggested Questions */}
                {!isTyping && !isThinkingProcess && messages.length >= 1 && messages[messages.length - 1]?.type === 'bot' && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {suggestedQuestions.map((question, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(null, question)}
                                className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full border border-zinc-700 hover:border-blue-500/50 transition-all flex items-center gap-1"
                            >
                                <Zap size={12} className="text-blue-400" />
                                {question}
                            </button>
                        ))}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-700">
                {/* RAG Toggle & Mode Controls */}
                <div className="flex items-center gap-3 mb-2 text-xs text-zinc-400 flex-wrap">
                    {/* Persona Selector */}
                    <div className="relative" ref={personaMenuRef}>
                        <button
                            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30 transition-all hover:bg-indigo-500/30"
                        >
                            {PERSONAS.find(p => p.id === activePersona)?.icon}
                            <span>{PERSONAS.find(p => p.id === activePersona)?.name}</span>
                            <ChevronDown size={10} className={`transition-transform ${showPersonaMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showPersonaMenu && (
                            <div className="absolute bottom-full left-0 mb-1 w-[calc(100vw-3rem)] sm:w-56 bg-zinc-800 rounded-lg shadow-xl border border-zinc-700 overflow-hidden z-50">
                                {PERSONAS.map((persona) => (
                                    <button
                                        key={persona.id}
                                        onClick={() => handlePersonaChange(persona.id)}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                                            activePersona === persona.id
                                                ? 'bg-indigo-500/20 text-indigo-400'
                                                : 'text-zinc-300 hover:bg-zinc-700'
                                        }`}
                                    >
                                        <span className="flex-shrink-0">{persona.icon}</span>
                                        <div className="min-w-0">
                                            <div className="font-medium">{persona.name}</div>
                                            <div className="text-[10px] text-zinc-500 truncate">{persona.description}</div>
                                        </div>
                                        {activePersona === persona.id && (
                                            <span className="ml-auto text-indigo-400 flex-shrink-0">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${
                            showHistory
                                ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30'
                                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-750'
                        }`}
                        title="Chat history"
                    >
                        <History size={12} />
                        <span className="hidden sm:inline">History</span>
                    </button>

                    <span className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30">
                        <Brain size={12} />
                        <span className="hidden sm:inline">AI Agent</span>
                    </span>

                    <button
                        onClick={() => setUseRAG(!useRAG)}
                        className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${useRAG ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-750'
                            }`}
                    >
                        <Sparkles size={12} />
                        <span className="hidden sm:inline">{useRAG ? 'Smart Mode (RAG)' : 'Basic Mode'}</span>
                    </button>

                    <button
                        onClick={() => setEnableStreaming(!enableStreaming)}
                        className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${enableStreaming ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-750'
                            }`}
                        title={enableStreaming ? 'Streaming enabled (word-by-word)' : 'Streaming disabled (instant reply)'}
                    >
                        <Zap size={12} />
                        <span className="hidden sm:inline">{enableStreaming ? 'Streaming' : 'Instant'}</span>
                    </button>
                </div>

                <form onSubmit={handleSend} className="relative flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleVoiceInput}
                        className={`p-2 rounded-full transition-all ${isListening
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                            }`}
                        title={isListening ? 'Listening... (click to stop)' : 'Voice input'}
                        disabled={isTyping}
                    >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isListening ? "Listening..." : isThinkingProcess ? "Thinking..." : "Message..."}
                        disabled={isTyping || isListening || isThinkingProcess}
                        className="flex-1 bg-zinc-800 text-white border-0 rounded-full py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:bg-zinc-700 transition-all outline-none placeholder-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    />

                    <button
                        type="button"
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className={`p-2 rounded-full transition-all ${voiceEnabled
                            ? 'bg-green-500 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                            }`}
                        title={voiceEnabled ? 'Auto-speak enabled' : 'Auto-speak disabled'}
                    >
                        {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>

                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping || isListening || isThinkingProcess}
                        className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                        {(isTyping || isThinkingProcess) ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MessengerApp;
