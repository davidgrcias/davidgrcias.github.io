import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, Loader, MessageSquare, Trash2, MessageCircle, Download, ThumbsUp, ThumbsDown, Sparkles, Zap, AlertCircle, X, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useOS } from '../../contexts/OSContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { searchSimilarKnowledge } from '../../services/vectorStore';
import { hybridSearch } from '../../services/hybridSearch';
import { logChatAnalytics, saveChatSession, updateChatFeedback } from '../../services/chatAnalytics';

const MessengerApp = ({ id }) => {
  const { updateWindow } = useOS();
  const { currentLanguage } = useTranslation();
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hello! 👋 I'm David's AI Assistant.\n\nAsk me about his projects, skills, or just say hi! I can tell you all about his journey.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [useRAG, setUseRAG] = useState(true);
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "What are David's technical skills?",
    "Tell me about his projects",
    "What's his experience?",
    "How can I contact him?"
  ]);
  const [error, setError] = useState(null);
  const [streamingText, setStreamingText] = useState('');
  const [enableStreaming, setEnableStreaming] = useState(true);
  const [useHybridSearch, setUseHybridSearch] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef(null);
  const eventSourceRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Context Menu
  useEffect(() => {
    if (id) {
        updateWindow(id, {
            contextMenuOptions: [
                {
                    label: 'New Chat',
                    icon: <MessageCircle size={16} />,
                    onClick: () => setMessages([{
                        type: 'bot',
                        content: "Hello! 👋 I'm David's AI Assistant.\n\nAsk me about his projects, skills, or just say hi! I can tell you all about his journey.",
                    }]),
                    shortcut: 'Ctrl+N',
                },
                { separator: true },
                {
                    label: 'Clear History',
                    icon: <Trash2 size={16} />,
                    onClick: () => setMessages([]),
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // Cleanup EventSource and Speech on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
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

  const handleSend = async (e, quickQuestion = null) => {
    if (e) e.preventDefault();
    const question = quickQuestion || input;
    if (!question.trim()) return;

    const userMsg = { type: 'user', content: question, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);
    setStreamingText('');

    // Close any existing EventSource
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const startTime = Date.now();

    try {
        let response = '';
        let sources = [];
        let retrievedDocs = [];
        let analyticsId = null;

        if (useRAG) {
            // Step 1: Search for relevant knowledge using hybrid or vector search
            if (useHybridSearch) {
                retrievedDocs = await hybridSearch(question, {
                    topK: 5,
                    language: currentLanguage,
                    threshold: 0.2,
                    vectorWeight: 0.6,
                    keywordWeight: 0.4
                });
            } else {
                retrievedDocs = await searchSimilarKnowledge(question, {
                    topK: 5,
                    language: currentLanguage,
                    threshold: 0.3
                });
            }

            // Step 2: Use streaming or non-streaming based on settings
            if (enableStreaming) {
                // Streaming mode
                const streamUrl = new URL('https://davidgrcias-github-io-davidgrcias-projects-cc8794a2.vercel.app/api/chat-stream');
                streamUrl.searchParams.set('message', question);
                streamUrl.searchParams.set('language', currentLanguage);
                streamUrl.searchParams.set('useRAG', 'true');
                streamUrl.searchParams.set('context', JSON.stringify(messages.slice(-5)));
                streamUrl.searchParams.set('retrievedDocs', JSON.stringify(retrievedDocs.map(doc => ({
                    id: doc.id,
                    title: doc.title,
                    content: doc.content,
                    similarity: doc.similarity
                }))));

                const eventSource = new EventSource(streamUrl.toString());
                eventSourceRef.current = eventSource;

                eventSource.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === 'chunk') {
                        setStreamingText(prev => prev + data.chunk);
                    } else if (data.type === 'done') {
                        response = data.fullText;
                        sources = data.sources || [];
                        eventSource.close();
                        eventSourceRef.current = null;
                        
                        const responseTime = Date.now() - startTime;
                        finalizeBotMessage(response, sources, retrievedDocs, responseTime);
                    }
                };

                eventSource.onerror = (error) => {
                    console.error('EventSource error:', error);
                    eventSource.close();
                    eventSourceRef.current = null;
                    throw new Error('Streaming connection failed');
                };

                return; // Exit early for streaming mode
            } else {
                // Non-streaming mode (original RAG)
                const ragResponse = await fetch('https://davidgrcias-github-io-davidgrcias-projects-cc8794a2.vercel.app/api/chat-rag', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: question,
                        context: messages.slice(-5),
                        retrievedDocs: retrievedDocs.map(doc => ({
                            id: doc.id,
                            title: doc.title,
                            content: doc.content,
                            similarity: doc.similarity
                        })),
                        language: currentLanguage,
                        useRAG: true
                    })
                });

                if (!ragResponse.ok) {
                    throw new Error('RAG API failed');
                }

                const data = await ragResponse.json();
                response = data.response;
                sources = data.sources || [];
            }
        } else {
            // Fallback to basic chat
            const basicResponse = await fetch('https://davidgrcias-github-io-davidgrcias-projects-cc8794a2.vercel.app/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: question })
            });

            if (!basicResponse.ok) {
                throw new Error('Chat API failed');
            }

            const data = await basicResponse.json();
            response = data.text;
        }

        const responseTime = Date.now() - startTime;
        finalizeBotMessage(response, sources, retrievedDocs, responseTime);

    } catch (error) {
        console.error('Chat error:', error);
        
        // Better error messages based on error type
        let errorMessage = "Sorry, I encountered an error. Please try again.";
        let userMessage = error.message || "Unknown error";
        
        if (error.message?.includes('Failed to fetch')) {
            errorMessage = "⚠️ Development Mode: Using fallback responses.\n\nAPI connection failed (CORS or network issue). The chatbot will work with limited functionality.";
            userMessage = "API connection failed - using fallback mode";
        } else if (error.message?.includes('embedding')) {
            errorMessage = "Could not generate embeddings. Try asking in a different way.";
        }
        
        setError(userMessage);
        setMessages(prev => [...prev, { 
            type: 'bot', 
            content: errorMessage,
            timestamp: new Date(),
            isError: true
        }]);
        setIsTyping(false);
        setStreamingText('');
    }
  };

  const finalizeBotMessage = async (response, sources, retrievedDocs, responseTime) => {
    // Add bot response with metadata
    const botMsg = { 
        type: 'bot', 
        content: response,
        sources: sources,
        timestamp: new Date(),
        id: `msg_${Date.now()}`,
        feedback: null,
        analyticsId: null
    };
    
    setMessages(prev => [...prev, botMsg]);
    setStreamingText('');
    setIsTyping(false);

    // Auto-speak response if voice is enabled
    if (voiceEnabled && synthRef.current) {
        speakText(response);
    }

    // Log analytics
    const analytics = await logChatAnalytics({
        sessionId,
        question: messages[messages.length - 1]?.content || '',
        answer: response,
        retrievedDocs: retrievedDocs.map(d => d.id),
        responseTime,
        language: currentLanguage
    });

    // Update message with analytics ID for feedback
    if (analytics?.id) {
        setMessages(prev => prev.map(msg => 
            msg.id === botMsg.id ? { ...msg, analyticsId: analytics.id } : msg
        ));
    }

    // Save session
    await saveChatSession(sessionId, [...messages, botMsg], {
        language: currentLanguage,
        useRAG
    });

    // Update suggested questions based on response
    updateSuggestedQuestions(retrievedDocs);
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

  const updateSuggestedQuestions = (retrievedDocs) => {
    // Generate smart suggestions based on retrieved docs
    const suggestions = [];
    
    if (retrievedDocs.length > 0) {
      const categories = [...new Set(retrievedDocs.map(d => d.category))];
      
      const categoryQuestions = {
        'skills': "What other skills does David have?",
        'projects': "Show me more of his projects",
        'experience': "What's his work experience?",
        'education': "Tell me about his education",
        'certifications': "What certifications does he have?",
        'personal': "Tell me more about David"
      };
      
      categories.forEach(cat => {
        if (categoryQuestions[cat]) {
          suggestions.push(categoryQuestions[cat]);
        }
      });
    }
    
    // Add default suggestions if not enough
    const defaults = [
      "How can I contact David?",
      "What technologies does he use?",
      "Tell me about his achievements"
    ];
    
    while (suggestions.length < 3) {
      const random = defaults[Math.floor(Math.random() * defaults.length)];
      if (!suggestions.includes(random)) {
        suggestions.push(random);
      }
    }
    
    setSuggestedQuestions(suggestions.slice(0, 3));
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-900 text-white font-sans">
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
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} group`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm transition-all ${
                        msg.type === 'user' 
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
                        </div>
                    )}

                    {/* Feedback Buttons */}
                    {msg.type === 'bot' && !msg.isError && msg.id && (
                        <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleFeedback(msg.id, 'thumbs_up')}
                                className={`p-1 rounded transition-colors ${
                                    msg.feedback === 'thumbs_up' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-zinc-800 text-zinc-500 hover:bg-green-500/10 hover:text-green-400'
                                }`}
                                title="Good response"
                            >
                                <ThumbsUp size={14} />
                            </button>
                            <button
                                onClick={() => handleFeedback(msg.id, 'thumbs_down')}
                                className={`p-1 rounded transition-colors ${
                                    msg.feedback === 'thumbs_down' 
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

            {/* Typing Indicator with Streaming */}
            {isTyping && (
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
            {!isTyping && messages.length > 1 && messages[messages.length - 1]?.type === 'bot' && (
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
            {/* RAG Toggle & Streaming Toggle */}
            <div className="flex items-center gap-3 mb-2 text-xs text-zinc-400 flex-wrap">
                <button
                    onClick={() => setUseRAG(!useRAG)}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${
                        useRAG ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-750'
                    }`}
                >
                    <Sparkles size={12} />
                    <span>{useRAG ? 'Smart Mode (RAG)' : 'Basic Mode'}</span>
                </button>
                
                <button
                    onClick={() => setEnableStreaming(!enableStreaming)}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${
                        enableStreaming ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-750'
                    }`}
                    title={enableStreaming ? 'Streaming enabled (word-by-word)' : 'Streaming disabled (instant reply)'}
                >
                    <Zap size={12} />
                    <span>{enableStreaming ? 'Streaming' : 'Instant'}</span>
                </button>
                
                {useRAG && (
                    <button
                        onClick={() => setUseHybridSearch(!useHybridSearch)}
                        className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${
                            useHybridSearch ? 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-750'
                        }`}
                        title={useHybridSearch ? 'Hybrid search (vector + keyword)' : 'Vector search only'}
                    >
                        <Sparkles size={12} />
                        <span>{useHybridSearch ? 'Hybrid' : 'Vector'}</span>
                    </button>
                )}
                
                {useRAG && (
                    <span className="text-[10px] text-zinc-500">
                        {useHybridSearch ? 'Hybrid search enabled' : 'Vector search enabled'}
                    </span>
                )}
            </div>
            
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
                <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`p-2 rounded-full transition-all ${
                        isListening 
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
                    placeholder={isListening ? "Listening..." : "Message..."}
                    disabled={isTyping || isListening}
                    className="flex-1 bg-zinc-800 text-white border-0 rounded-full py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:bg-zinc-700 transition-all outline-none placeholder-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                
                <button
                    type="button"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`p-2 rounded-full transition-all ${
                        voiceEnabled
                        ? 'bg-green-500 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                    }`}
                    title={voiceEnabled ? 'Auto-speak enabled' : 'Auto-speak disabled'}
                >
                    {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                
                <button 
                    type="submit"
                    disabled={!input.trim() || isTyping || isListening}
                    className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                    {isTyping ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </form>
        </div>
    </div>
  );
};

export default MessengerApp;
