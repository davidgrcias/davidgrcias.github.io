/**
 * Agent Memory Manager
 * 
 * Provides multi-turn conversation memory with:
 * 1. Short-term memory (recent messages in context window)
 * 2. Long-term memory (conversation summary & user profile tracking)
 * 3. User profiling (detects visitor intent, language preference, tone)
 * 4. Topic tracking (what has been discussed)
 */

// ============================================================
// MEMORY STORE — In-memory per session
// ============================================================

class AgentMemory {
  constructor(sessionId = null) {
    this.sessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.messages = [];
    this.userProfile = {
      name: null,
      role: null,       // recruiter, developer, student, casual visitor
      interests: [],    // topics they've asked about
      language: 'en',   // detected language
      tone: 'neutral',  // casual, professional, slang
    };
    this.topicsDiscussed = new Set();
    this.summary = '';
    this.turnCount = 0;
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
    
    // Restore from sessionStorage if available
    this._restore();
  }

  // ============================================================
  // MESSAGE MANAGEMENT
  // ============================================================

  /**
   * Add a message to memory
   */
  addMessage(type, content, metadata = {}) {
    const message = {
      type, // 'user' | 'bot'
      content,
      timestamp: new Date().toISOString(),
      turnNumber: this.turnCount,
      ...metadata,
    };
    
    this.messages.push(message);
    this.lastActivity = Date.now();

    if (type === 'user') {
      this.turnCount++;
      this._analyzeUserMessage(content);
    }

    // Auto-summarize every 8 turns to keep context manageable
    if (this.turnCount > 0 && this.turnCount % 8 === 0) {
      this._updateSummary();
    }

    // Persist to sessionStorage
    this._persist();

    return message;
  }

  /**
   * Get recent messages for the context window
   * Returns the last N messages (optimized for token limits)
   */
  getRecentMessages(count = 10) {
    return this.messages.slice(-count);
  }

  /**
   * Get the full memory context for prompt building
   */
  getMemoryContext() {
    return {
      sessionId: this.sessionId,
      summary: this.summary,
      userProfile: { ...this.userProfile },
      topicsDiscussed: Array.from(this.topicsDiscussed),
      turnCount: this.turnCount,
      messageCount: this.messages.length,
    };
  }

  // ============================================================
  // USER PROFILING — Detects who is visiting & their intent
  // ============================================================

  _analyzeUserMessage(content) {
    const lower = content.toLowerCase();

    // 1. Detect Language
    this._detectLanguage(lower);

    // 2. Detect Tone
    this._detectTone(lower);

    // 3. Detect User Role/Intent
    this._detectUserRole(lower);

    // 4. Track Topics
    this._trackTopics(lower);

    // 5. Extract User Name
    this._extractUserName(content);
  }

  _detectLanguage(text) {
    // Indonesian markers
    const idMarkers = [
      'apa', 'siapa', 'dimana', 'kapan', 'kenapa', 'bagaimana', 'gimana',
      'gw', 'gue', 'lu', 'kamu', 'saya', 'dia', 'mereka', 'bisa', 'mau',
      'yang', 'dan', 'atau', 'tapi', 'dengan', 'untuk', 'dari', 'ini', 'itu',
      'banget', 'dong', 'nih', 'sih', 'loh', 'deh', 'yah', 'kan', 'kok',
      'tolong', 'mohon', 'kasih', 'tahu', 'ceritain', 'jelasin',
      'keren', 'gokil', 'mantap', 'anjir', 'wkwk', 'hehe',
    ];

    // English markers
    const enMarkers = [
      'what', 'who', 'where', 'when', 'why', 'how',
      'the', 'is', 'are', 'was', 'were', 'have', 'has',
      'can', 'could', 'would', 'should', 'will',
      'tell', 'show', 'give', 'help', 'please',
      'about', 'with', 'from', 'this', 'that',
      'experience', 'project', 'skill', 'portfolio',
    ];

    const words = text.split(/\s+/);
    let idScore = 0;
    let enScore = 0;

    words.forEach(word => {
      if (idMarkers.includes(word)) idScore++;
      if (enMarkers.includes(word)) enScore++;
    });

    // Only update if we have a clear signal
    if (idScore > enScore && idScore >= 2) {
      this.userProfile.language = 'id';
    } else if (enScore > idScore || (idScore === 0 && enScore === 0)) {
      this.userProfile.language = 'en';
    }
  }

  _detectTone(text) {
    const casualMarkers = ['bro', 'dude', 'yo', 'lol', 'haha', 'cool', 'sick', 'lit', 'ngl', 'tbh', 'fr',
      'gw', 'lu', 'wkwk', 'anjir', 'gokil', 'kocak', 'mantap', 'gacor', 'parah'];
    const formalMarkers = ['could you', 'would you', 'kindly', 'regarding', 'inquire', 'professional',
      'mohon', 'dengan hormat', 'perkenalkan', 'apakah'];

    const hasCasual = casualMarkers.some(m => text.includes(m));
    const hasFormal = formalMarkers.some(m => text.includes(m));

    if (hasCasual && !hasFormal) {
      this.userProfile.tone = 'casual';
    } else if (hasFormal && !hasCasual) {
      this.userProfile.tone = 'professional';
    } else {
      this.userProfile.tone = 'neutral';
    }
  }

  _detectUserRole(text) {
    const recruiterKeywords = ['hiring', 'recruit', 'position', 'vacancy', 'candidate',
      'resume', 'cv', 'salary', 'interview', 'full-time', 'part-time', 'remote',
      'looking for', 'available for'];
    const developerKeywords = ['code', 'api', 'framework', 'library', 'architecture',
      'stack', 'deploy', 'backend', 'frontend', 'database', 'algorithm',
      'git', 'repository', 'pull request'];
    const studentKeywords = ['learn', 'study', 'university', 'course', 'beginner',
      'how to start', 'tips', 'advice', 'career path', 'intern'];

    if (recruiterKeywords.some(kw => text.includes(kw))) {
      this.userProfile.role = 'recruiter';
    } else if (developerKeywords.some(kw => text.includes(kw))) {
      this.userProfile.role = 'developer';
    } else if (studentKeywords.some(kw => text.includes(kw))) {
      this.userProfile.role = 'student';
    } else if (!this.userProfile.role) {
      this.userProfile.role = 'visitor';
    }
  }

  _trackTopics(text) {
    const topicMap = {
      'projects': ['project', 'built', 'created', 'portfolio', 'app', 'website', 'platform'],
      'skills': ['skill', 'technology', 'tech', 'programming', 'framework', 'language', 'stack'],
      'experience': ['experience', 'job', 'work', 'career', 'company', 'role', 'position'],
      'education': ['education', 'university', 'school', 'degree', 'gpa', 'study', 'college'],
      'certifications': ['certification', 'certificate', 'course', 'training', 'credential'],
      'contact': ['contact', 'email', 'whatsapp', 'hire', 'reach', 'connect'],
      'personality': ['hobby', 'fun fact', 'personality', 'interest', 'motivation', 'insight'],
      'youtube': ['youtube', 'video', 'channel', 'subscriber', 'content creator'],
      'social media': ['tiktok', 'instagram', 'linkedin', 'github', 'social media'],
      'code help': ['code', 'help me', 'write', 'generate', 'snippet', 'example', 'how to'],
    };

    for (const [topic, keywords] of Object.entries(topicMap)) {
      if (keywords.some(kw => text.includes(kw))) {
        this.topicsDiscussed.add(topic);
        if (!this.userProfile.interests.includes(topic)) {
          this.userProfile.interests.push(topic);
        }
      }
    }
  }

  _extractUserName(text) {
    // Try to detect when user introduces themselves
    const namePatterns = [
      /(?:my name is|i'm|i am|call me|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /(?:nama (?:saya|gw|gue|ku))\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Sanity check — not a common word
        const commonWords = ['david', 'the', 'not', 'just', 'here', 'good', 'bad'];
        if (!commonWords.includes(name.toLowerCase()) && name.length > 1) {
          this.userProfile.name = name;
        }
      }
    }
  }

  // ============================================================
  // CONVERSATION SUMMARY — Compresses old messages
  // ============================================================

  _updateSummary() {
    // Build a simple summary from message history
    const topics = Array.from(this.topicsDiscussed).join(', ');
    const messageCount = this.messages.length;
    const userMessages = this.messages
      .filter(m => m.type === 'user')
      .map(m => m.content.slice(0, 100));

    this.summary = `Conversation has ${messageCount} messages over ${this.turnCount} turns. `;
    this.summary += `Topics discussed: ${topics || 'general'}. `;
    
    if (this.userProfile.name) {
      this.summary += `Visitor name: ${this.userProfile.name}. `;
    }
    if (this.userProfile.role && this.userProfile.role !== 'visitor') {
      this.summary += `Visitor appears to be a ${this.userProfile.role}. `;
    }
    
    // Include key questions asked
    if (userMessages.length > 3) {
      const keyQuestions = userMessages.slice(-5);
      this.summary += `Recent questions: "${keyQuestions.join('", "')}"`;
    }
  }

  // ============================================================
  // SMART SUGGESTIONS — Based on memory context
  // ============================================================

  /**
   * Generate smart follow-up suggestions based on conversation context
   */
  getSuggestedQuestions() {
    const topics = Array.from(this.topicsDiscussed);
    const allSuggestions = {
      'projects': [
        "Tell me more about the UMN Festival project",
        "What's the tech stack behind this portfolio?",
        "Which project are you most proud of?",
      ],
      'skills': [
        "How proficient is David in React?",
        "What backend technologies does he use?",
        "Is he learning any new skills?",
      ],
      'experience': [
        "What's his current role?",
        "Tell me about his internship at DAAI TV",
        "How much professional experience does he have?",
      ],
      'education': [
        "What's his GPA?",
        "Tell me about his university",
        "What did he study in high school?",
      ],
      'certifications': [
        "What Huawei certification does he have?",
        "How many certifications total?",
        "Any AI-related certifications?",
      ],
      'contact': [
        "What's the best way to reach David?",
        "Is he available for freelance work?",
        "Can I see his CV?",
      ],
      'personality': [
        "What motivates David?",
        "Tell me a fun fact about him",
        "How does he stay productive?",
      ],
      'youtube': [
        "What type of content does he create?",
        "How many subscribers does he have?",
        "When did he start his channel?",
      ],
    };

    // Get suggestions for undiscussed topics
    const undiscussedTopics = Object.keys(allSuggestions).filter(t => !topics.includes(t));
    const suggestions = [];

    // Add 1-2 from discussed topics (deeper questions)
    topics.forEach(topic => {
      if (allSuggestions[topic]) {
        const remaining = allSuggestions[topic].filter(q => 
          !this.messages.some(m => m.type === 'user' && m.content.toLowerCase().includes(q.toLowerCase().slice(0, 20)))
        );
        if (remaining.length > 0) {
          suggestions.push(remaining[Math.floor(Math.random() * remaining.length)]);
        }
      }
    });

    // Add 1-2 from undiscussed topics (explore new areas)
    undiscussedTopics.forEach(topic => {
      if (allSuggestions[topic] && suggestions.length < 4) {
        suggestions.push(allSuggestions[topic][0]);
      }
    });

    // Fallback
    if (suggestions.length === 0) {
      return [
        "What are David's key strengths?",
        "Tell me about his projects",
        "How can I contact him?",
      ];
    }

    return suggestions.slice(0, 4);
  }

  // ============================================================
  // PERSISTENCE — Save/Restore from sessionStorage
  // ============================================================

  _persist() {
    try {
      const data = {
        sessionId: this.sessionId,
        messages: this.messages.slice(-30), // Keep last 30 messages
        userProfile: this.userProfile,
        topicsDiscussed: Array.from(this.topicsDiscussed),
        summary: this.summary,
        turnCount: this.turnCount,
        createdAt: this.createdAt,
        lastActivity: this.lastActivity,
      };
      sessionStorage.setItem(`agent_memory_${this.sessionId}`, JSON.stringify(data));
      sessionStorage.setItem('agent_memory_latest', this.sessionId);
    } catch (error) {
      // sessionStorage might be full or unavailable
      console.warn('Failed to persist agent memory:', error);
    }
  }

  _restore() {
    try {
      // Try to restore latest session
      const latestId = sessionStorage.getItem('agent_memory_latest');
      const key = `agent_memory_${latestId || this.sessionId}`;
      const saved = sessionStorage.getItem(key);
      
      if (saved) {
        const data = JSON.parse(saved);
        // Only restore if session is less than 2 hours old
        if (Date.now() - data.lastActivity < 2 * 60 * 60 * 1000) {
          this.sessionId = data.sessionId;
          this.messages = data.messages || [];
          this.userProfile = data.userProfile || this.userProfile;
          this.topicsDiscussed = new Set(data.topicsDiscussed || []);
          this.summary = data.summary || '';
          this.turnCount = data.turnCount || 0;
          this.createdAt = data.createdAt || this.createdAt;
          this.lastActivity = data.lastActivity || this.lastActivity;
          console.log(`🧠 Agent memory restored: ${this.messages.length} messages, ${this.turnCount} turns`);
        }
      }
    } catch (error) {
      console.warn('Failed to restore agent memory:', error);
    }
  }

  /**
   * Reset the memory (new conversation)
   */
  reset() {
    this.messages = [];
    this.userProfile = {
      name: null,
      role: null,
      interests: [],
      language: 'en',
      tone: 'neutral',
    };
    this.topicsDiscussed = new Set();
    this.summary = '';
    this.turnCount = 0;
    this.lastActivity = Date.now();

    // Clear from sessionStorage
    try {
      sessionStorage.removeItem(`agent_memory_${this.sessionId}`);
    } catch (e) { /* ignore */ }

    // Generate new session ID
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.createdAt = Date.now();
  }

  /**
   * Get memory stats for debugging
   */
  getStats() {
    return {
      sessionId: this.sessionId,
      totalMessages: this.messages.length,
      turnCount: this.turnCount,
      topicsDiscussed: Array.from(this.topicsDiscussed),
      userProfile: this.userProfile,
      sessionDuration: Math.round((Date.now() - this.createdAt) / 1000 / 60) + ' minutes',
      lastActivity: new Date(this.lastActivity).toLocaleString(),
    };
  }
}

// ============================================================
// SINGLETON INSTANCE — Shared across the app
// ============================================================

let _globalMemory = null;

export function getAgentMemory() {
  if (!_globalMemory) {
    _globalMemory = new AgentMemory();
  }
  return _globalMemory;
}

export function resetAgentMemory() {
  if (_globalMemory) {
    _globalMemory.reset();
  } else {
    _globalMemory = new AgentMemory();
  }
  return _globalMemory;
}

export { AgentMemory };
export default AgentMemory;
