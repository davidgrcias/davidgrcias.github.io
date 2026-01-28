import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, Loader, Sparkles } from 'lucide-react';
import { generateAIResponse } from '../../../api/gemini';

// Minimal Mock Data Imports (Since we are inside an "App", we might not have access to Context easily without passing it down. 
// For simplicity in this extraction, I'll simplify the knowledge base access or rely on imports if they work relatively)
// In a real app, I'd pass these as props or use a global store. 
// For now, I will use a simplified "Copilot" personality that knows about the system.

const CopilotSidebar = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hello! I'm your Portfolio Copilot. \n\nI can help you navigate David's projects, explain his code, or tell you about his skills. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { type: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
        // Construct a context-aware prompt for "Copilot" persona
        const prompt = `
        You are an AI Copilot integrated into David Garcia's Portfolio VS Code environment.
        Your persona: Professional, helpful, slightly technical but accessible (like GitHub Copilot Chat).
        
        System Context:
        - The user is browsing a "Virtual VS Code" portfolio.
        - You are in the sidebar.
        - You have access to information about David Garcia (Full Stack Developer).
        
        User Query: "${input}"
        
        Answer based on David's general profile (React, Firebase, Three.js developer). 
        Keep answers concise and formatted in Markdown.
        `;
        
        // Use the existing API utility
        const response = await generateAIResponse(prompt);
        
        setMessages(prev => [...prev, { type: 'bot', content: response }]);
    } catch (error) {
        setMessages(prev => [...prev, { type: 'bot', content: "Connection error. Please check your API key in .env.local" }]);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <div className="w-80 bg-[#252526] text-white flex flex-col border-r border-[#1e1e1e] h-full font-sans">
        {/* Header */}
        <div className="p-3 border-b border-[#1e1e1e] flex items-center justify-between bg-[#252526]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#BBBBBB]">Portfolio Copilot</span>
            <Sparkles size={14} className="text-blue-400" />
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-md p-3 text-sm ${
                        msg.type === 'user' 
                        ? 'bg-[#0e639c] text-white' 
                        : 'bg-[#3c3c3c] text-gray-200'
                    }`}>
                        {msg.type === 'bot' && (
                             <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] uppercase font-bold tracking-wider">
                                <Bot size={12} /> Copilot
                             </div>
                        )}
                        <div className="prose prose-invert prose-xs max-w-none">
                            <ReactMarkdown>
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                     <div className="bg-[#3c3c3c] p-2 rounded-md">
                        <Loader size={16} className="animate-spin text-blue-400" />
                     </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-[#1e1e1e] bg-[#252526]">
            <form onSubmit={handleSend} className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Copilot..."
                    className="w-full bg-[#3c3c3c] text-white border border-[#3c3c3c] rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#007acc] placeholder-gray-500"
                />
                <button 
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white disabled:opacity-50"
                >
                    <Send size={14} />
                </button>
            </form>
            <div className="mt-2 text-[10px] text-gray-500 text-center">
                AI can make mistakes. Please check important info.
            </div>
        </div>
    </div>
  );
};

export default CopilotSidebar;
