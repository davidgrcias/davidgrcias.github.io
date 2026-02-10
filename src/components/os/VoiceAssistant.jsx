import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, CheckCircle, AlertCircle, Globe, Keyboard, Send } from 'lucide-react';
import { useVoice, VOICE_LANGUAGES } from '../../contexts/VoiceContext';

const VoiceAssistant = () => {
    const {
        voiceState,
        transcript,
        response,
        showLanguageSelector,
        setShowLanguageSelector,
        selectLanguage,
        selectedLanguage,
        stopListening,
        currentLanguage,
        keyboardInput,
        setKeyboardInput,
        handleKeyboardSubmit,
        showKeyboardInput,
        setShowKeyboardInput,
        switchToKeyboard,
    } = useVoice();

    const [isVisible, setIsVisible] = useState(false);
    const inputRef = useRef(null);

    // Show/hide logic
    useEffect(() => {
        if (voiceState !== 'idle' || showLanguageSelector || showKeyboardInput) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [voiceState, showLanguageSelector, showKeyboardInput]);

    // Focus keyboard input
    useEffect(() => {
        if (showKeyboardInput && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [showKeyboardInput]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (keyboardInput.trim()) {
            handleKeyboardSubmit(keyboardInput);
        }
    };

    const handleClose = () => {
        stopListening();
        setShowKeyboardInput(false);
        setShowLanguageSelector(false);
    };

    return (
        <AnimatePresence>
            {/* Language Selector Modal */}
            {showLanguageSelector && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[2147483648] flex items-center justify-center bg-black/50 backdrop-blur-sm pb-16"
                    onClick={() => setShowLanguageSelector(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-gray-900/95 border border-white/20 rounded-2xl p-6 shadow-2xl backdrop-blur-xl max-w-sm w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                                <Mic size={20} className="text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Voice Command</h3>
                                <p className="text-white/50 text-sm">Pilih bahasa / Select language</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {Object.values(VOICE_LANGUAGES).map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => selectLanguage(lang.code)}
                                    className="w-full flex items-center gap-3 p-4 rounded-xl border transition-all bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-cyan-500/50"
                                >
                                    <span className="text-2xl">{lang.flag}</span>
                                    <div className="text-left flex-1">
                                        <div className="font-medium">{lang.name}</div>
                                        <div className="text-xs text-white/50">
                                            {lang.code === 'id-ID'
                                                ? '"Buka Terminal", "Tutup VSCode"'
                                                : '"Open Terminal", "Close VSCode"'}
                                        </div>
                                    </div>
                                    <Mic size={16} className="text-cyan-400" />
                                </button>
                            ))}
                        </div>

                        <p className="text-white/40 text-xs text-center mt-4">
                            ⚡ Works best in Chrome/Edge
                        </p>
                    </motion.div>
                </motion.div>
            )}

            {/* Voice Feedback UI */}
            {isVisible && !showLanguageSelector && (voiceState !== 'idle' || showKeyboardInput) && (
                <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[10002] flex justify-center px-4">
                    <motion.div
                        layout
                        initial={{ y: -60, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -60, opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                        className={`bg-black/95 text-white flex items-center gap-3 overflow-hidden shadow-2xl border border-white/20 backdrop-blur-3xl px-4 py-3 min-w-[200px] ${showKeyboardInput ? 'rounded-2xl w-[90vw] max-w-[400px]' : 'rounded-full max-w-[400px]'
                            }`}
                    >
                        {/* Listening State */}
                        {voiceState === 'listening' && !showKeyboardInput && (
                            <>
                                <div className="flex gap-1 h-5 items-center flex-shrink-0">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <motion.div
                                            key={i}
                                            className="w-1 bg-gradient-to-t from-cyan-400 to-blue-500 rounded-full"
                                            animate={{ height: [4, 14 + Math.random() * 6, 4] }}
                                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.08, ease: 'easeInOut' }}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-white/90 truncate flex-1 min-w-0">
                                    {transcript || response || currentLanguage.responses.listening}
                                </span>
                                <button
                                    onClick={switchToKeyboard}
                                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                                    title="Switch to keyboard"
                                >
                                    <Keyboard size={14} className="text-white/60" />
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                                >
                                    <X size={14} className="text-white/60" />
                                </button>
                            </>
                        )}

                        {/* Processing State */}
                        {voiceState === 'processing' && !showKeyboardInput && (
                            <div className="flex items-center gap-3 w-full">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-cyan-400 rounded-full animate-spin flex-shrink-0" />
                                <span className="text-sm font-semibold text-white/90 truncate flex-1">
                                    {transcript || 'Processing...'}
                                </span>
                            </div>
                        )}

                        {/* Success State */}
                        {voiceState === 'success' && !showKeyboardInput && (
                            <div className="flex items-center gap-3 w-full">
                                <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                                <span className="text-sm font-medium text-white truncate flex-1">
                                    {response}
                                </span>
                            </div>
                        )}

                        {/* Error State */}
                        {voiceState === 'error' && !showKeyboardInput && (
                            <div className="flex items-center gap-3 w-full">
                                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                                <span className="text-sm text-red-300 truncate flex-1">
                                    {response || 'Error'}
                                </span>
                                <button
                                    onClick={switchToKeyboard}
                                    className="p-1.5 hover:bg-white/10 rounded transition-colors flex-shrink-0 text-xs text-yellow-400"
                                    title="Use keyboard instead"
                                >
                                    <Keyboard size={14} />
                                </button>
                            </div>
                        )}

                        {/* Keyboard Input Mode */}
                        {showKeyboardInput && (
                            <div className="flex flex-col gap-2 w-full">
                                <div className="flex items-center gap-2">
                                    <Keyboard size={14} className="text-yellow-400 flex-shrink-0" />
                                    <span className="text-xs text-white/70 flex-1">
                                        {selectedLanguage === 'id-ID' ? 'Ketik perintah:' : 'Type command:'}
                                    </span>
                                    <button
                                        onClick={handleClose}
                                        className="p-1 hover:bg-white/10 rounded transition-colors"
                                    >
                                        <X size={14} className="text-white/60" />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="flex gap-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={keyboardInput}
                                        onChange={(e) => setKeyboardInput(e.target.value)}
                                        placeholder={selectedLanguage === 'id-ID' ? 'buka terminal' : 'open terminal'}
                                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-cyan-400/50"
                                        autoComplete="off"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!keyboardInput.trim()}
                                        className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-30 text-cyan-400 rounded-lg transition-colors"
                                    >
                                        <Send size={16} />
                                    </button>
                                </form>
                                <div className="text-[10px] text-white/30 flex gap-1.5 flex-wrap">
                                    <span className="bg-white/5 px-1.5 py-0.5 rounded">terminal</span>
                                    <span className="bg-white/5 px-1.5 py-0.5 rounded">vscode</span>
                                    <span className="bg-white/5 px-1.5 py-0.5 rounded">messenger</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default VoiceAssistant;
