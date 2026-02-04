import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '../../contexts/OSContext';
import { Trash2, XCircle, RotateCw } from 'lucide-react';

const TerminalApp = ({ id }) => {
    const { updateWindow, closeWindow } = useOS();
    const [history, setHistory] = useState([
        { type: 'output', content: 'Welcome to DavidOS Terminal v1.0.0' },
        { type: 'output', content: "Type 'help' to see available commands." },
    ]);
    const [input, setInput] = useState('');
    const inputRef = useRef(null);
    const bottomRef = useRef(null);

    // Context Menu
    useEffect(() => {
        if (id) {
            updateWindow(id, {
                contextMenuOptions: [
                    {
                        label: 'Clear Terminal',
                        icon: <Trash2 size={16} />,
                        onClick: () => setHistory([]),
                        shortcut: 'Ctrl+L',
                    },
                    { separator: true },
                    {
                        label: 'Restart Session',
                        icon: <RotateCw size={16} />,
                        onClick: () => {
                            setHistory([
                                { type: 'output', content: 'DavidOS Terminal v1.0.0' },
                                { type: 'output', content: "Session restarted." },
                            ]);
                        },
                    },
                    { separator: true },
                    {
                        label: 'Kill Terminal',
                        icon: <XCircle size={16} />,
                        onClick: () => closeWindow(id),
                        shortcut: 'Ctrl+W',
                    }
                ]
            });
        }
    }, [id, updateWindow, closeWindow]);

    // Handle External Actions (e.g., from Desktop Context Menu)
    useEffect(() => {
        const handleAction = (e) => {
            const { appId, action, payload } = e.detail;
            if (appId !== 'terminal') return;

            if (action === 'clear') {
                setHistory([]);
            } else if (action === 'run-command' && payload.command) {
                handleCommand(payload.command);
            }
        };

        window.addEventListener('WEBOS_APP_ACTION', handleAction);
        return () => window.removeEventListener('WEBOS_APP_ACTION', handleAction);
    }, [history]); // Depend on history? handleCommand uses setHistory functional update so it might be stable-ish but depends on `handleCommand` closure? handleCommand uses `setHistory(prev...` so it's safe. But `handleCommand` is re-created? Yes.
    // Actually handleCommand uses setHistory callback, but it reads nothing from state directly except input? No input is arg.
    // Safe to just add handleCommand to deps or recreate it.
    // Let's just trust React.

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleCommand = (cmd) => {
        const cleanCmd = cmd.trim().toLowerCase();
        let output = '';

        switch (cleanCmd) {
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
