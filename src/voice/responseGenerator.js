/**
 * Voice Response Generator
 * Generates natural, contextual voice responses with personality
 */

// Response personalities
const PERSONALITIES = {
  casual: {
    success: [
      "Done!",
      "Got it!",
      "No problem!",
      "Sure thing!",
      "You got it!",
      "Easy!",
    ],
    error: [
      "Oops, something went wrong",
      "Hmm, that didn't work",
      "Sorry, I couldn't do that",
      "That didn't go as planned",
    ],
  },
  professional: {
    success: [
      "Command executed successfully",
      "Task completed",
      "Operation successful",
      "Request processed",
    ],
    error: [
      "Command execution failed",
      "Unable to complete task",
      "Operation unsuccessful",
      "Request could not be processed",
    ],
  },
  friendly: {
    success: [
      "There you go! 😊",
      "All set! 👍",
      "Done and done! ✨",
      "Happy to help! 🎉",
    ],
    error: [
      "Oh no! Something went wrong 😕",
      "Whoops! That didn't work 😅",
      "Sorry about that! 🙏",
      "Uh oh! Let me try again 🔄",
    ],
  },
  funny: {
    success: [
      "Boom! Nailed it! 💥",
      "Ez pz lemon squeezy! 🍋",
      "Like a boss! 😎",
      "Achievement unlocked! 🏆",
    ],
    error: [
      "Houston, we have a problem 🚀",
      "Well, that escalated quickly 😬",
      "Task failed successfully 🤷",
      "Have you tried turning it off and on again? 🔌",
    ],
  },
};

// Time-based greetings
function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return "Good morning";
  } else if (hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

// Get contextual prefix based on time and usage
function getContextualPrefix(context = {}) {
  const { consecutiveCommands = 0, lastCommandTime } = context;
  
  // If user is on a roll (multiple commands quickly)
  if (consecutiveCommands > 5) {
    return ["You're on fire!", "Killing it!", "Keep going!", "Awesome!"][Math.floor(Math.random() * 4)];
  }
  
  // If it's been a while since last command
  if (lastCommandTime && Date.now() - lastCommandTime > 60000) {
    return "Welcome back!";
  }
  
  return null;
}

/**
 * Generate response from template with entity substitution
 */
function fillTemplate(template, entities = {}) {
  let result = template;
  
  // Replace {entity} placeholders
  for (const [key, value] of Object.entries(entities)) {
    const placeholder = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(placeholder, value);
  }
  
  return result;
}

/**
 * Get random item from array
 */
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate response for command result
 */
export function generateResponse(options = {}) {
  const {
    intent,
    entities = {},
    success = true,
    command = {},
    personality = 'casual',
    context = {},
    error = null,
  } = options;
  
  // Get response template from command
  const responseTemplates = command.responses || {};
  let baseResponse = success 
    ? responseTemplates.success || "Done"
    : responseTemplates.error || "Failed";
  
  // Fill template with entities
  baseResponse = fillTemplate(baseResponse, entities);
  
  // Add personality wrapper
  const personalitySet = PERSONALITIES[personality] || PERSONALITIES.casual;
  const personalityPrefix = success 
    ? randomChoice(personalitySet.success)
    : randomChoice(personalitySet.error);
  
  // Add contextual prefix
  const contextualPrefix = getContextualPrefix(context);
  
  // Construct final response
  let response = baseResponse;
  
  if (contextualPrefix) {
    response = `${contextualPrefix} ${response}`;
  }
  
  // For errors, add helpful tip
  if (!success && error) {
    response += `. ${error}`;
  }
  
  return {
    text: response,
    voice: response, // Same for voice (could be different for TTS)
    personality,
    timestamp: Date.now(),
  };
}

/**
 * Generate confirmation request
 */
export function generateConfirmation(options = {}) {
  const {
    intent,
    entities = {},
    command = {},
    confidence,
  } = options;
  
  const confirmations = [
    `Did you want to ${command.description}?`,
    `Just to confirm, you want to ${command.description}?`,
    `Are you sure you want to ${command.description}?`,
    `Should I ${command.description}?`,
  ];
  
  let confirmation = randomChoice(confirmations);
  
  // Add confidence caveat for low confidence
  if (confidence < 0.7) {
    confirmation = `I'm not entirely sure, but ${confirmation.toLowerCase()}`;
  }
  
  return {
    text: confirmation,
    voice: confirmation,
    requiresConfirmation: true,
    timestamp: Date.now(),
  };
}

/**
 * Generate suggestion response when no match found
 */
export function generateSuggestion(options = {}) {
  const {
    utterance,
    suggestions = [],
    personality = 'casual',
  } = options;
  
  if (suggestions.length === 0) {
    return {
      text: "I didn't quite catch that. Could you try rephrasing?",
      voice: "I didn't quite catch that. Could you try rephrasing?",
      suggestions: [],
    };
  }
  
  const suggestionTexts = suggestions.slice(0, 3).map((s, i) => 
    `${i + 1}. ${s.command.description}`
  );
  
  const response = {
    text: "I'm not sure what you meant. Did you mean:\n" + suggestionTexts.join('\n'),
    voice: `I'm not sure what you meant. Did you mean ${suggestions[0].command.description}?`,
    suggestions: suggestions.slice(0, 3),
  };
  
  return response;
}

/**
 * Generate help response
 */
export function generateHelp(options = {}) {
  const {
    category = null,
    commands = [],
  } = options;
  
  if (category) {
    const categoryCommands = commands.filter(c => c.category === category);
    const examples = categoryCommands
      .slice(0, 5)
      .map(c => `- ${c.examples[0]}`)
      .join('\n');
    
    return {
      text: `Here are some ${category} commands you can try:\n${examples}`,
      voice: `Here are some ${category} commands you can try`,
      examples: categoryCommands.slice(0, 5).map(c => c.examples[0]),
    };
  }
  
  // General help
  return {
    text: "Try saying things like:\n- Open terminal\n- Change theme to dark\n- Play music\n- Tell me a joke",
    voice: "Try saying things like: Open terminal, Change theme to dark, Play music, or Tell me a joke",
  };
}

/**
 * Generate error response with recovery suggestion
 */
export function generateError(options = {}) {
  const {
    error,
    intent,
    personality = 'casual',
  } = options;
  
  const personalitySet = PERSONALITIES[personality] || PERSONALITIES.casual;
  const prefix = randomChoice(personalitySet.error);
  
  let recovery = "Please try again.";
  
  // Specific error recovery suggestions
  if (error.includes('not found')) {
    recovery = "Make sure the name is correct and try again.";
  } else if (error.includes('not open')) {
    recovery = "Try opening it first.";
  } else if (error.includes('required')) {
    recovery = "Make sure to include all required information.";
  }
  
  return {
    text: `${prefix}. ${error}. ${recovery}`,
    voice: `${prefix}. ${recovery}`,
    error: true,
    timestamp: Date.now(),
  };
}

/**
 * Generate progress update
 */
export function generateProgress(options = {}) {
  const {
    action,
    progress = 0,
  } = options;
  
  const progressText = [
    "Working on it...",
    "Almost there...",
    "Just a moment...",
    "Processing...",
  ];
  
  return {
    text: randomChoice(progressText),
    voice: randomChoice(progressText),
    progress,
    timestamp: Date.now(),
  };
}

/**
 * Generate multi-language response
 */
export function generateMultiLanguage(response, language = 'en') {
  if (language === 'id') {
    // Simple translation map for common responses
    const translations = {
      'Done': 'Selesai',
      'Failed': 'Gagal',
      'Success': 'Berhasil',
      'Error': 'Error',
      'Opening': 'Membuka',
      'Closing': 'Menutup',
      'Playing': 'Memutar',
      'Paused': 'Dijeda',
    };
    
    let translated = response.text;
    for (const [en, id] of Object.entries(translations)) {
      translated = translated.replace(new RegExp(en, 'g'), id);
    }
    
    return {
      ...response,
      text: translated,
      voice: translated,
      language: 'id',
    };
  }
  
  return response;
}

/**
 * Main response generator
 */
export class ResponseGenerator {
  constructor(options = {}) {
    this.personality = options.personality || 'casual';
    this.language = options.language || 'en';
    this.context = {
      consecutiveCommands: 0,
      lastCommandTime: null,
    };
  }
  
  setPersonality(personality) {
    this.personality = personality;
  }
  
  setLanguage(language) {
    this.language = language;
  }
  
  updateContext(success) {
    if (success) {
      this.context.consecutiveCommands++;
    } else {
      this.context.consecutiveCommands = 0;
    }
    this.context.lastCommandTime = Date.now();
  }
  
  generate(options) {
    const response = generateResponse({
      ...options,
      personality: this.personality,
      context: this.context,
    });
    
    this.updateContext(options.success);
    
    return generateMultiLanguage(response, this.language);
  }
  
  confirm(options) {
    return generateConfirmation(options);
  }
  
  suggest(options) {
    return generateSuggestion({
      ...options,
      personality: this.personality,
    });
  }
  
  help(options) {
    return generateHelp(options);
  }
  
  error(options) {
    return generateError({
      ...options,
      personality: this.personality,
    });
  }
  
  progress(options) {
    return generateProgress(options);
  }
}

export default {
  generateResponse,
  generateConfirmation,
  generateSuggestion,
  generateHelp,
  generateError,
  generateProgress,
  generateMultiLanguage,
  ResponseGenerator,
};
