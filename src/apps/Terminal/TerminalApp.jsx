import React, { useState, useRef, useEffect } from 'react';

const TerminalApp = () => {
    const [history, setHistory] = useState([
        { type: 'output', content: 'Welcome to DavidOS Terminal v1.0.0' },
        { type: 'output', content: "Type 'help' to see available commands." },
    ]);
    const [input, setInput] = useState('');
    const inputRef = useRef(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleCommand = (cmd) => {
        const cleanCmd = cmd.trim().toLowerCase();
        let output = '';

        switch(cleanCmd) {
            case 'help':
                output = "Available commands:\n  about     - Who is David?\n  projects  - List my projects\n  contact   - How to reach me\n  clear     - Clear screen\n  exit      - Close terminal";
                break;
            case 'about':
                output = "David Garcia Saragih\nCreative Developer specialized in React & Frontend Engineering.\nBased in Jakarta.";
                break;
            case 'projects':
                output = "Fetching from Firestore...\n1. WebOS Portfolio\n2. E-Commerce App\n(Check VS Code App for details)";
                break;
            case 'contact':
                output = "Email: david.garcia@umn.ac.id\nGitHub: github.com/davidgrcias";
                break;
            case 'clear':
                setHistory([]);
                return;
            case 'admin':
            case 'sudo admin':
            case 'sudo login':
                output = "🔐 Opening Admin Panel... (Requires Google Auth)";
                setTimeout(() => {
                    window.open('/admin', '_blank');
                }, 500);
                break;
            case 'exit':
                output = "Terminal session ended. (Close window to exit)";
                break;
            default:
                output = `Command not found: ${cleanCmd}`;
        }

        setHistory(prev => [
            ...prev, 
            { type: 'input', content: cmd }, 
            { type: 'output', content: output }
        ]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCommand(input);
            setInput('');
        }
    };

    return (
        <div 
            className="h-full w-full bg-black text-green-400 font-mono p-4 overflow-auto text-sm"
            onClick={() => inputRef.current?.focus()}
        >
            {history.map((line, idx) => (
                <div key={idx} className="mb-1 whitespace-pre-wrap">
                    {line.type === 'input' ? (
                        <div className="flex gap-2 text-white">
                            <span>$</span>
                            <span>{line.content}</span>
                        </div>
                    ) : (
                        <div className="opacity-80">{line.content}</div>
                    )}
                </div>
            ))}
            
            <div className="flex gap-2 text-white mt-1">
                <span>$</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent outline-none flex-1 caret-white"
                    autoFocus
                />
            </div>
            <div ref={bottomRef}></div>
        </div>
    );
};

export default TerminalApp;
