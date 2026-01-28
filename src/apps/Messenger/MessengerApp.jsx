import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, Loader, MessageSquare } from 'lucide-react';
import { generateAIResponse } from '../../api/gemini';

const MessengerApp = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hello! 👋 I'm David's AI Assistant.\n\nAsk me about his projects, skills, or just say hi! I can tell you all about his journey.",
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
        const response = await generateAIResponse(input);
        setMessages(prev => [...prev, { type: 'bot', content: response }]);
    } catch (error) {
        setMessages(prev => [...prev, { type: 'bot', content: "Connection error. Please check your network or API key." }]);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-900 text-white font-sans">
        {/* Header - (Optional, since WindowFrame has title, but nice for app branding) */}
        {/* <div className="p-3 border-b flex items-center gap-2 bg-zinc-800">
             <MessageSquare size={18} className="text-blue-500"/>
             <span className="font-semibold text-sm">Messages</span>
        </div> */}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-800/50">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        msg.type === 'user' 
                        ? 'bg-blue-500 text-white rounded-br-sm' 
                        : 'bg-zinc-700 text-white border border-zinc-600 rounded-bl-sm'
                    }`}>
                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 text-inherit">
                             <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                     <div className="bg-zinc-700 px-4 py-3 rounded-2xl rounded-bl-sm border border-zinc-600 shadow-sm flex gap-1 items-center">
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                     </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-700">
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 bg-zinc-800 text-white border-0 rounded-full py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:bg-zinc-700 transition-all outline-none placeholder-zinc-400"
                />
                <button 
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 transition-colors"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    </div>
  );
};

export default MessengerApp;
