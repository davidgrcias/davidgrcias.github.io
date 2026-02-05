import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useOS } from './OSContext';

const VoiceContext = createContext(null);

// Supported languages
export const VOICE_LANGUAGES = {
  'id-ID': {
    code: 'id-ID',
    name: 'Bahasa Indonesia',
    flag: '🇮🇩',
    commands: {
      open: ['buka', 'open', 'jalankan', 'tampilkan', 'bukak', 'bukan', 'buko', 'bukalah'],
      close: ['tutup', 'close', 'keluar', 'tutuplah', 'tutupin', 'matikan', 'matiin'],
      minimize: ['minimize', 'kecilkan', 'sembunyikan', 'minimise', 'minimalkan'],
      maximize: ['maximize', 'besarkan', 'perbesar', 'maximise', 'fullscreen'],
    },
    responses: {
      listening: 'Bicara sekarang...',
      notUnderstood: 'Perintah tidak dikenali.',
      opening: (app) => `Membuka ${app}`,
      closing: (app) => `Menutup ${app}`,
      noApp: 'Aplikasi tidak ditemukan.',
      error: 'Terjadi kesalahan.',
      networkError: 'Gagal konek ke server voice. Coba lagi atau pakai Chrome/Edge.',
      tryKeyboard: 'Ketik perintah:',
      retrying: 'Mencoba lagi...',
    }
  },
  'en-US': {
    code: 'en-US',
    name: 'English',
    flag: '🇬🇧',
    commands: {
      open: ['open', 'launch', 'start', 'show', 'run', 'opens', 'opened'],
      close: ['close', 'exit', 'quit', 'shut', 'closed', 'closes'],
      minimize: ['minimize', 'hide', 'minimise', 'mini'],
      maximize: ['maximize', 'fullscreen', 'maximise', 'max', 'full'],
    },
    responses: {
      listening: 'Speak now...',
      notUnderstood: "Command not recognized.",
      opening: (app) => `Opening ${app}`,
      closing: (app) => `Closing ${app}`,
      noApp: 'Application not found.',
      error: 'An error occurred.',
      networkError: 'Voice server connection failed. Try again or use Chrome/Edge.',
      tryKeyboard: 'Type command:',
      retrying: 'Retrying...',
    }
  }
};

// Extended app aliases
const APP_ALIASES = {
  terminal: [
    'terminal', 'cmd', 'command', 'konsol', 'console', 'shell', 'bash',
    'termina', 'terminál', 'terminol', 'termin', 'term', 'komando',
    'prompt', 'cli', 'powershell', 'power shell'
  ],
  vscode: [
    'vscode', 'vs code', 'visual studio', 'code', 'editor', 'kode',
    'vs', 'visual', 'studio', 'coding', 'vsc', 'vs kode', 'biskod',
    'vis code', 'viskod', 'visual studio code', 'teks editor'
  ],
  messenger: [
    'messenger', 'chat', 'message', 'pesan', 'obrolan', 'mesenger',
    'messanger', 'msg', 'chatting', 'inbox', 'dm', 'direct message',
    'percakapan', 'ngobrol', 'massage', 'mesej'
  ],
  settings: [
    'settings', 'setting', 'preferences', 'pengaturan', 'setelan', 'config'
  ],
  'about-me': [
    'about', 'about me', 'profil', 'profile', 'tentang', 'tentang saya'
  ],
  'file-manager': [
    'files', 'file manager', 'file', 'folder', 'berkas', 'dokumen'
  ],
  blog: [
    'blog', 'artikel', 'post', 'posts', 'tulisan'
  ],
  notes: [
    'notes', 'note', 'catatan', 'memo'
  ],
  'cv-download': [
    'cv', 'resume', 'curriculum vitae', 'my cv', 'riwayat hidup'
  ],
};

// Similarity check
function similarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  const costs = [];
  for (let i = 0; i <= shorter.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= longer.length; j++) {
      if (i === 0) costs[j] = j;
      else if (j > 0) {
        let newValue = costs[j - 1];
        if (shorter.charAt(i - 1) !== longer.charAt(j - 1))
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[longer.length] = lastValue;
  }
  return (longer.length - costs[longer.length]) / longer.length;
}

export function VoiceProvider({ children }) {
  const { closeWindow, minimizeWindow, maximizeWindow, windows } = useOS();
  
  // State
  const [isSupported, setIsSupported] = useState(false);
  const [voiceState, setVoiceState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [keyboardInput, setKeyboardInput] = useState('');
  const [showKeyboardInput, setShowKeyboardInput] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition && 'speechSynthesis' in window);
    if (window.speechSynthesis) synthRef.current = window.speechSynthesis;
  }, []);

  const getLang = useCallback(() => {
    return VOICE_LANGUAGES[selectedLanguage] || VOICE_LANGUAGES['en-US'];
  }, [selectedLanguage]);

  const speak = useCallback((text) => {
    if (!synthRef.current || !text) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage || 'en-US';
    utterance.rate = 1.0;
    synthRef.current.speak(utterance);
  }, [selectedLanguage]);

  const findApp = useCallback((text) => {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    for (const [appId, aliases] of Object.entries(APP_ALIASES)) {
      for (const alias of aliases) {
        if (lowerText.includes(alias)) return appId;
      }
    }
    
    for (const word of words) {
      if (word.length < 3) continue;
      for (const [appId, aliases] of Object.entries(APP_ALIASES)) {
        for (const alias of aliases) {
          if (similarity(word, alias) > 0.7) return appId;
        }
      }
    }
    return null;
  }, []);

  const hasCommand = useCallback((text, commandType) => {
    const lang = getLang();
    const commands = lang.commands[commandType] || [];
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    if (commands.some(cmd => lowerText.includes(cmd))) return true;
    for (const word of words) {
      for (const cmd of commands) {
        if (similarity(word, cmd) > 0.75) return true;
      }
    }
    return false;
  }, [getLang]);

  const resetState = useCallback((delay = 2000) => {
    setTimeout(() => {
      setVoiceState('idle');
      setTranscript('');
      setResponse('');
    }, delay);
  }, []);

  const processCommand = useCallback((text) => {
    const lang = getLang();
    
    if (hasCommand(text, 'open')) {
      const app = findApp(text);
      if (app) {
        window.dispatchEvent(new CustomEvent('VOICE_OPEN_APP', { detail: { appId: app } }));
        const appName = app.charAt(0).toUpperCase() + app.slice(1).replace('-', ' ');
        setResponse(lang.responses.opening(appName));
        speak(lang.responses.opening(appName));
        setVoiceState('success');
        resetState();
        return true;
      }
    }
    
    if (hasCommand(text, 'close')) {
      const app = findApp(text);
      if (app) {
        const win = windows.find(w => w.id === app);
        if (win) {
          closeWindow(win.id);
          const appName = app.charAt(0).toUpperCase() + app.slice(1).replace('-', ' ');
          setResponse(lang.responses.closing(appName));
          speak(lang.responses.closing(appName));
          setVoiceState('success');
          resetState();
          return true;
        }
      }
    }
    
    if (hasCommand(text, 'minimize')) {
      const app = findApp(text);
      if (app) {
        const win = windows.find(w => w.id === app);
        if (win) {
          minimizeWindow(win.id);
          setResponse(`Minimizing ${app}`);
          setVoiceState('success');
          resetState();
          return true;
        }
      }
    }
    
    if (hasCommand(text, 'maximize')) {
      const app = findApp(text);
      if (app) {
        const win = windows.find(w => w.id === app);
        if (win) {
          maximizeWindow(win.id);
          setResponse(`Maximizing ${app}`);
          setVoiceState('success');
          resetState();
          return true;
        }
      }
    }
    
    setResponse(`"${text}" - ${lang.responses.notUnderstood}`);
    setVoiceState('error');
    resetState(3000);
    return false;
  }, [getLang, hasCommand, findApp, closeWindow, minimizeWindow, maximizeWindow, windows, speak, resetState]);

  const handleKeyboardSubmit = useCallback((text) => {
    if (!text.trim()) return;
    setTranscript(text);
    setVoiceState('processing');
    setTimeout(() => {
      processCommand(text);
      setKeyboardInput('');
      setShowKeyboardInput(false);
    }, 200);
  }, [processCommand]);

  // Core function to start speech recognition
  const startRecognition = useCallback((langCode) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setShowKeyboardInput(true);
      setVoiceState('idle');
      return;
    }
    
    // Abort any existing
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = langCode;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;
    
    const lang = VOICE_LANGUAGES[langCode];
    
    recognition.onstart = () => {
      setVoiceState('listening');
      setTranscript('');
      setResponse(lang.responses.listening);
    };
    
    recognition.onresult = (event) => {
      const results = event.results[0];
      const text = results[0].transcript;
      setTranscript(text);
      
      if (results.isFinal) {
        retryCountRef.current = 0; // Reset retry on success
        setVoiceState('processing');
        
        console.log('Voice heard:', text);
        
        let processed = false;
        for (let i = 0; i < results.length && !processed; i++) {
          const altText = results[i].transcript;
          if (findApp(altText) && (hasCommand(altText, 'open') || hasCommand(altText, 'close'))) {
            processed = true;
            setTimeout(() => processCommand(altText), 200);
          }
        }
        if (!processed) {
          setTimeout(() => processCommand(text), 200);
        }
      }
    };
    
    recognition.onerror = (event) => {
      console.log('Speech recognition error:', event.error);
      
      if (event.error === 'network') {
        retryCountRef.current++;
        
        if (retryCountRef.current < maxRetries) {
          // Auto-retry
          setResponse(`${lang.responses.networkError} (${retryCountRef.current}/${maxRetries})`);
          setVoiceState('error');
          
          setTimeout(() => {
            setResponse(lang.responses.retrying);
            startRecognition(langCode);
          }, 1500);
        } else {
          // Show keyboard option after max retries
          setResponse(`${lang.responses.networkError}`);
          setVoiceState('error');
          setShowKeyboardInput(true);
          retryCountRef.current = 0;
          
          setTimeout(() => {
            setVoiceState('idle');
            setResponse('');
          }, 4000);
        }
      } else if (event.error === 'no-speech') {
        setResponse('No speech detected');
        setVoiceState('error');
        resetState(2000);
      } else if (event.error === 'aborted') {
        setVoiceState('idle');
      } else {
        setResponse(lang.responses.error);
        setVoiceState('error');
        resetState(2000);
      }
    };
    
    recognition.onend = () => {
      // Don't auto-reset if retrying
      if (retryCountRef.current > 0 && retryCountRef.current < maxRetries) return;
    };
    
    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setShowKeyboardInput(true);
      setVoiceState('idle');
    }
  }, [findApp, hasCommand, processCommand, resetState]);

  // Public startListening - shows language selector if needed
  const startListening = useCallback(() => {
    if (!selectedLanguage) {
      setShowLanguageSelector(true);
      return;
    }
    startRecognition(selectedLanguage);
  }, [selectedLanguage, startRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    retryCountRef.current = 0;
    setVoiceState('idle');
    setTranscript('');
    setResponse('');
    setKeyboardInput('');
  }, []);

  // Select language - called from UI, immediately starts recognition
  const selectLanguage = useCallback((langCode) => {
    setSelectedLanguage(langCode);
    setShowLanguageSelector(false);
    retryCountRef.current = 0;
    
    // Start recognition directly with the selected langCode
    // Don't call startListening() to avoid circular dependency
    setTimeout(() => {
      startRecognition(langCode);
    }, 150);
  }, [startRecognition]);

  const switchToKeyboard = useCallback(() => {
    stopListening();
    setShowKeyboardInput(true);
  }, [stopListening]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const value = {
    isSupported,
    voiceState,
    transcript,
    response,
    selectedLanguage,
    showLanguageSelector,
    keyboardInput,
    showKeyboardInput,
    languages: VOICE_LANGUAGES,
    currentLanguage: getLang(),
    startListening,
    stopListening,
    selectLanguage,
    setShowLanguageSelector,
    setKeyboardInput,
    setShowKeyboardInput,
    handleKeyboardSubmit,
    switchToKeyboard,
    speak,
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}

export default VoiceContext;
