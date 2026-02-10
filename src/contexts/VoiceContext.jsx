import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useOS } from './OSContext';
import { useTheme } from './ThemeContext';
import { useSound } from './SoundContext';
import { useTranslation } from './TranslationContext';
import { useNotification } from './NotificationContext';
import { useMusicPlayer } from './MusicPlayerContext';

// Import voice systems
import { VoiceCommandRegistry } from '../voice/voiceCommandRegistry';
import { createIntentMatcher } from '../voice/intentMatcher';
import { ResponseGenerator } from '../voice/responseGenerator';
import { createVoiceFeedback } from '../voice/voiceFeedback';

// Import command modules
import registerSystemVoiceCommands from '../voice/commands/system';
import registerAppVoiceCommands from '../voice/commands/apps';
import registerNavigationVoiceCommands from '../voice/commands/navigation';
import registerInfoVoiceCommands from '../voice/commands/info';
import registerMediaVoiceCommands from '../voice/commands/media';
import registerSearchVoiceCommands from '../voice/commands/search';
import registerFilesystemVoiceCommands from '../voice/commands/filesystem';
import registerNotificationVoiceCommands from '../voice/commands/notifications';
import registerSocialVoiceCommands from '../voice/commands/social';
import registerFunVoiceCommands from '../voice/commands/fun';

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
  const os = useOS();
  const theme = useTheme();
  const sound = useSound();
  const translation = useTranslation();
  const notification = useNotification();
  const music = useMusicPlayer();
  
  // State
  const [isSupported, setIsSupported] = useState(false);
  const [voiceState, setVoiceState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [keyboardInput, setKeyboardInput] = useState('');
  const [showKeyboardInput, setShowKeyboardInput] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentCommand, setCurrentCommand] = useState(null);
  const [confidence, setConfidence] = useState(1.0);
  
  // Refs
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const commandRegistryRef = useRef(null);
  const intentMatcherRef = useRef(null);
  const responseGeneratorRef = useRef(null);
  const voiceFeedbackRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition && 'speechSynthesis' in window);
    if (window.speechSynthesis) synthRef.current = window.speechSynthesis;
  }, []);
  
  // Initialize voice systems
  useEffect(() => {
    // Create command registry
    const registry = new VoiceCommandRegistry();
    
    // Get context provider
    const getContext = () => ({
      os,
      theme,
      sound,
      translation,
      notification,
      music,
    });
    
    // Register all command modules
    registerSystemVoiceCommands(registry, getContext);
    registerAppVoiceCommands(registry, getContext);
    registerNavigationVoiceCommands(registry, getContext);
    registerInfoVoiceCommands(registry, getContext);
    registerMediaVoiceCommands(registry, getContext);
    registerSearchVoiceCommands(registry, getContext);
    registerFilesystemVoiceCommands(registry, getContext);
    registerNotificationVoiceCommands(registry, getContext);
    registerSocialVoiceCommands(registry, getContext);
    registerFunVoiceCommands(registry, getContext);
    
    commandRegistryRef.current = registry;
    
    // Create intent matcher
    const matcher = createIntentMatcher(registry, {
      confidenceThreshold: 0.6,
      language: selectedLanguage.startsWith('id') ? 'id' : 'en',
    });
    intentMatcherRef.current = matcher;
    
    // Create response generator
    const generator = new ResponseGenerator({
      personality: 'casual',
      language: selectedLanguage.startsWith('id') ? 'id' : 'en',
    });
    responseGeneratorRef.current = generator;
    
    // Create voice feedback
    const feedback = createVoiceFeedback({
      soundEnabled: sound.enabled,
      visualEnabled: true,
    });
    voiceFeedbackRef.current = feedback;
    
  }, [os, theme, sound, translation, notification, music, selectedLanguage]);

  const getLang = useCallback(() => {
    return VOICE_LANGUAGES[selectedLanguage] || VOICE_LANGUAGES['en-US'];
  }, [selectedLanguage]);

  const speak = useCallback((text) => {
    if (!synthRef.current || !text) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage || 'en-US';
    utterance.rate = 1.0;
    
    if (voiceFeedbackRef.current) {
      voiceFeedbackRef.current.onSpeaking();
    }
    
    synthRef.current.speak(utterance);
  }, [selectedLanguage]);
  
  const resetState = useCallback((delay = 2000) => {
    setTimeout(() => {
      setVoiceState('idle');
      setTranscript('');
      setResponse('');
      setCurrentCommand(null);
      
      if (voiceFeedbackRef.current) {
        voiceFeedbackRef.current.onIdle();
      }
    }, delay);
  }, []);
  
  // Execute matched command
  const executeCommand = useCallback(async (matchResult) => {
    try {
      const { command, entities, intent } = matchResult;
      
      setVoiceState('processing');
      setCurrentCommand(command);
      
      if (voiceFeedbackRef.current) {
        voiceFeedbackRef.current.onProcessing();
      }
      
      // Execute the command action
      const result = await command.action(entities);
      
      // Generate response
      const responseText = responseGeneratorRef.current?.generate({
        intent,
        entities,
        success: result.success,
        command,
      });
      
      if (result.success) {
        setResponse(responseText.text);
        speak(responseText.text);
        setVoiceState('success');
        
        if (voiceFeedbackRef.current) {
          voiceFeedbackRef.current.onSuccess(responseText);
        }
        
        // Add to conversation history
        setConversationHistory(prev => [...prev.slice(-9), {
          utterance: transcript,
          intent,
          entities,
          success: true,
          timestamp: Date.now(),
        }]);
        
        resetState();
      } else {
        throw new Error(result.error || 'Command execution failed');
      }
    } catch (error) {
      console.error('Command execution error:', error);
      
      const errorResponse = responseGeneratorRef.current?.error({
        error: error.message,
        intent: matchResult.intent,
      });
      
      setResponse(errorResponse.text);
      setVoiceState('error');
      
      if (voiceFeedbackRef.current) {
        voiceFeedbackRef.current.onError(errorResponse);
      }
      
      resetState(3000);
    }
  }, [transcript, speak, resetState]);
  
  // Process voice command with NLU
  const processCommand = useCallback(async (text) => {
    if (!intentMatcherRef.current) return false;
    
    try {
      // Match intent
      const matchResult = intentMatcherRef.current.match(text);
      
      if (!matchResult.matched) {
        // No match found - show suggestions
        const suggestionResponse = responseGeneratorRef.current?.suggest({
          utterance: text,
          suggestions: matchResult.suggestions || [],
        });
        
        setResponse(suggestionResponse.text);
        speak(suggestionResponse.voice);
        setVoiceState('error');
        
        if (voiceFeedbackRef.current) {
          voiceFeedbackRef.current.onError({ text: suggestionResponse.text });
        }
        
        resetState(3000);
        return false;
      }
      
      // Check confidence
      setConfidence(matchResult.confidence);
      
      if (matchResult.confidence < 0.7) {
        // Low confidence - ask for confirmation
        const confirmResponse = responseGeneratorRef.current?.confirm({
          intent: matchResult.intent,
          entities: matchResult.entities,
          command: matchResult.command,
          confidence: matchResult.confidence,
        });
        
        setResponse(confirmResponse.text);
        speak(confirmResponse.voice);
        setVoiceState('confirming');
        
        // For now, proceed anyway (could add confirmation flow)
        await executeCommand(matchResult);
        return true;
      }
      
      // High confidence - execute directly
      await executeCommand(matchResult);
      return true;
      
    } catch (error) {
      console.error('Command processing error:', error);
      
      const lang = getLang();
      setResponse(lang.responses.error);
      setVoiceState('error');
      resetState(3000);
      return false;
    }
  }, [executeCommand, speak, getLang, resetState]);

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
      
      if (voiceFeedbackRef.current) {
        voiceFeedbackRef.current.onStart();
      }
    };
    
    recognition.onresult = (event) => {
      const results = event.results[0];
      const text = results[0].transcript;
      setTranscript(text);
      
      if (voiceFeedbackRef.current) {
        voiceFeedbackRef.current.onTranscription(text);
      }
      
      if (results.isFinal) {
        retryCountRef.current = 0; // Reset retry on success
        setVoiceState('processing');
        
        console.log('Voice heard:', text);
        
        // Process with NLU/Intent Matcher
        setTimeout(() => processCommand(text), 200);
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
          
          if (voiceFeedbackRef.current) {
            voiceFeedbackRef.current.onError({ text: lang.responses.networkError });
          }
          
          setTimeout(() => {
            setVoiceState('idle');
            setResponse('');
          }, 4000);
        }
      } else if (event.error === 'no-speech') {
        setResponse('No speech detected');
        setVoiceState('error');
        
        if (voiceFeedbackRef.current) {
          voiceFeedbackRef.current.onError({ text: 'No speech detected' });
        }
        
        resetState(2000);
      } else if (event.error === 'aborted') {
        setVoiceState('idle');
      } else {
        setResponse(lang.responses.error);
        setVoiceState('error');
        
        if (voiceFeedbackRef.current) {
          voiceFeedbackRef.current.onError({ text: lang.responses.error });
        }
        
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
  }, [processCommand, resetState]);

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
    conversationHistory,
    currentCommand,
    confidence,
    languages: VOICE_LANGUAGES,
    currentLanguage: getLang(),
    commandRegistry: commandRegistryRef.current,
    intentMatcher: intentMatcherRef.current,
    responseGenerator: responseGeneratorRef.current,
    voiceFeedback: voiceFeedbackRef.current,
    startListening,
    stopListening,
    selectLanguage,
    setShowLanguageSelector,
    setKeyboardInput,
    setShowKeyboardInput,
    handleKeyboardSubmit,
    switchToKeyboard,
    speak,
    executeCommand,
    processCommand,
    registerCommand: (command) => commandRegistryRef.current?.registerCommand(command),
    getConversationHistory: () => conversationHistory,
    getContext: () => intentMatcherRef.current?.getContext(),
    setContext: (key, value) => intentMatcherRef.current?.setContext(key, value),
    clearContext: () => intentMatcherRef.current?.clearContext(),
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
