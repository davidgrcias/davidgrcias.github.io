/**
 * Natural Language Understanding (NLU) Parser
 * Extracts intents, entities, and context from voice utterances
 */

// Entity types and their patterns
const ENTITY_PATTERNS = {
  // Numbers
  number: /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\b/gi,
  
  // Percentages
  percentage: /\b(\d+)\s*(?:percent|%)\b/gi,
  
  // Colors
  color: /\b(red|blue|green|yellow|orange|purple|pink|black|white|gray|grey|cyan|magenta|brown|dark|light)\b/gi,
  
  // Time expressions
  time: /\b(\d{1,2}:\d{2}(?:\s*(?:am|pm))?|morning|afternoon|evening|night|noon|midnight)\b/gi,
  
  // Dates
  date: /\b(today|tomorrow|yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday|this week|next week|last week)\b/gi,
  
  // File extensions
  fileExtension: /\.(js|jsx|ts|tsx|html|css|json|md|txt|pdf|png|jpg|jpeg|gif|svg|mp3|mp4|zip|tar|gz)$/gi,
  
  // URLs
  url: /https?:\/\/[^\s]+/gi,
  
  // Email
  email: /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi,
};

// App name synonyms and variations
const APP_NAMES = {
  terminal: ['terminal', 'console', 'command line', 'cmd', 'shell', 'bash'],
  vscode: ['vscode', 'vs code', 'code editor', 'editor', 'ide'],
  filemanager: ['file manager', 'files', 'explorer', 'finder', 'file browser'],
  notes: ['notes', 'note', 'notepad', 'text editor'],
  messenger: ['messenger', 'messages', 'chat', 'messaging'],
  settings: ['settings', 'preferences', 'config', 'configuration'],
  aboutme: ['about me', 'about', 'profile', 'bio', 'portfolio'],
  blog: ['blog', 'articles', 'posts', 'writing'],
};

// Theme synonyms
const THEME_NAMES = {
  dark: ['dark', 'dark mode', 'night', 'night mode'],
  light: ['light', 'light mode', 'day', 'day mode'],
  cyberpunk: ['cyberpunk', 'cyber', 'neon', 'futuristic'],
  forest: ['forest', 'green', 'nature'],
  ocean: ['ocean', 'blue', 'sea', 'water'],
  sunset: ['sunset', 'orange', 'warm'],
  nord: ['nord', 'arctic', 'cool'],
  gruvbox: ['gruvbox', 'retro'],
  dracula: ['dracula', 'vampire', 'purple'],
  monokai: ['monokai', 'classic'],
};

// Number word to digit conversion
const NUMBER_WORDS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90, hundred: 100,
};

/**
 * Convert number words to digits
 */
function parseNumberWord(word) {
  const lower = word.toLowerCase();
  if (NUMBER_WORDS[lower] !== undefined) {
    return NUMBER_WORDS[lower];
  }
  const num = parseInt(word, 10);
  return isNaN(num) ? null : num;
}

/**
 * Extract entities from utterance
 */
export function extractEntities(utterance) {
  const entities = {};
  
  // Extract numbers
  const numberMatches = utterance.match(ENTITY_PATTERNS.number);
  if (numberMatches) {
    const numbers = numberMatches.map(parseNumberWord).filter(n => n !== null);
    if (numbers.length > 0) {
      entities.number = numbers[0];
      entities.numbers = numbers;
    }
  }
  
  // Extract percentages
  const percentageMatches = utterance.match(ENTITY_PATTERNS.percentage);
  if (percentageMatches) {
    entities.percentage = parseInt(percentageMatches[0], 10);
  }
  
  // Extract colors
  const colorMatches = utterance.match(ENTITY_PATTERNS.color);
  if (colorMatches) {
    entities.color = colorMatches[0].toLowerCase();
  }
  
  // Extract time
  const timeMatches = utterance.match(ENTITY_PATTERNS.time);
  if (timeMatches) {
    entities.time = timeMatches[0].toLowerCase();
  }
  
  // Extract date
  const dateMatches = utterance.match(ENTITY_PATTERNS.date);
  if (dateMatches) {
    entities.date = dateMatches[0].toLowerCase();
  }
  
  // Extract file extensions
  const fileMatches = utterance.match(ENTITY_PATTERNS.fileExtension);
  if (fileMatches) {
    entities.fileExtension = fileMatches[0].toLowerCase();
  }
  
  // Extract URLs
  const urlMatches = utterance.match(ENTITY_PATTERNS.url);
  if (urlMatches) {
    entities.url = urlMatches[0];
  }
  
  // Extract email
  const emailMatches = utterance.match(ENTITY_PATTERNS.email);
  if (emailMatches) {
    entities.email = emailMatches[0].toLowerCase();
  }
  
  // Extract app names
  const lowerUtterance = utterance.toLowerCase();
  for (const [appId, synonyms] of Object.entries(APP_NAMES)) {
    if (synonyms.some(synonym => lowerUtterance.includes(synonym))) {
      entities.appName = appId;
      break;
    }
  }
  
  // Extract theme names
  for (const [themeId, synonyms] of Object.entries(THEME_NAMES)) {
    if (synonyms.some(synonym => lowerUtterance.includes(synonym))) {
      entities.theme = themeId;
      break;
    }
  }
  
  return entities;
}

/**
 * Calculate confidence score based on match quality
 */
export function calculateConfidence(utterance, pattern, entities = {}) {
  let confidence = 0.5; // Base confidence
  
  // Exact pattern match boosts confidence
  const normalizedUtterance = utterance.toLowerCase().trim();
  const normalizedPattern = pattern.toLowerCase().trim();
  
  if (normalizedUtterance === normalizedPattern) {
    confidence = 1.0;
    return confidence;
  }
  
  // Partial match scoring
  const utteranceWords = normalizedUtterance.split(/\s+/);
  const patternWords = normalizedPattern.split(/\s+/);
  
  let matchedWords = 0;
  for (const word of patternWords) {
    if (word.startsWith('{') && word.endsWith('}')) {
      // Entity placeholder - check if entity was extracted
      const entityName = word.slice(1, -1);
      if (entities[entityName]) {
        matchedWords++;
      }
    } else if (utteranceWords.includes(word)) {
      matchedWords++;
    }
  }
  
  const matchRatio = matchedWords / patternWords.length;
  confidence = 0.3 + (matchRatio * 0.7); // Scale to 0.3-1.0
  
  // Length similarity bonus
  const lengthRatio = Math.min(utteranceWords.length, patternWords.length) / 
                     Math.max(utteranceWords.length, patternWords.length);
  confidence *= (0.7 + (lengthRatio * 0.3));
  
  // Word order similarity bonus
  let orderScore = 0;
  for (let i = 0; i < Math.min(utteranceWords.length, patternWords.length); i++) {
    if (utteranceWords[i] === patternWords[i]) {
      orderScore++;
    }
  }
  const orderRatio = orderScore / Math.max(utteranceWords.length, patternWords.length);
  confidence *= (0.8 + (orderRatio * 0.2));
  
  return Math.min(confidence, 1.0);
}

/**
 * Tokenize utterance into words
 */
export function tokenize(utterance) {
  return utterance
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * Extract intent keywords from utterance
 */
export function extractIntentKeywords(utterance) {
  const tokens = tokenize(utterance);
  
  // Common intent verbs
  const intentVerbs = [
    'open', 'close', 'start', 'stop', 'play', 'pause', 'show', 'hide',
    'set', 'get', 'change', 'switch', 'toggle', 'enable', 'disable',
    'create', 'delete', 'edit', 'save', 'load', 'search', 'find',
    'navigate', 'go', 'move', 'scroll', 'zoom', 'maximize', 'minimize',
    'list', 'display', 'view', 'read', 'write', 'run', 'execute',
    'install', 'uninstall', 'update', 'refresh', 'reload', 'restart',
    'lock', 'unlock', 'shutdown', 'reboot', 'sleep', 'wake',
  ];
  
  const keywords = tokens.filter(token => intentVerbs.includes(token));
  return keywords;
}

/**
 * Fill slots for required entities
 */
export function fillSlots(utterance, requiredEntities, extractedEntities) {
  const slots = {};
  const missingSlots = [];
  
  for (const [entityName, entityConfig] of Object.entries(requiredEntities)) {
    if (extractedEntities[entityName]) {
      slots[entityName] = extractedEntities[entityName];
    } else if (entityConfig.required) {
      missingSlots.push(entityName);
    } else if (entityConfig.default) {
      slots[entityName] = entityConfig.default;
    }
  }
  
  return { slots, missingSlots };
}

/**
 * Parse utterance and extract structured information
 */
export function parseUtterance(utterance, context = {}) {
  const entities = extractEntities(utterance);
  const keywords = extractIntentKeywords(utterance);
  const tokens = tokenize(utterance);
  
  return {
    original: utterance,
    tokens,
    keywords,
    entities,
    context,
    timestamp: Date.now(),
  };
}

/**
 * Context manager for multi-turn conversations
 */
export class ConversationContext {
  constructor() {
    this.history = [];
    this.currentContext = {};
    this.maxHistory = 10;
  }
  
  addUtterance(parsed) {
    this.history.push(parsed);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    
    // Update context with new entities
    this.currentContext = {
      ...this.currentContext,
      ...parsed.entities,
      lastIntent: parsed.intent,
      lastTimestamp: parsed.timestamp,
    };
  }
  
  getContext() {
    return { ...this.currentContext };
  }
  
  setContext(key, value) {
    this.currentContext[key] = value;
  }
  
  clearContext() {
    this.currentContext = {};
  }
  
  getHistory(count = 5) {
    return this.history.slice(-count);
  }
  
  getLastUtterance() {
    return this.history[this.history.length - 1];
  }
  
  // Context carryover - use entities from previous utterances
  enrichEntities(entities) {
    // If current utterance lacks entities, try to use from context
    const enriched = { ...entities };
    
    if (!enriched.appName && this.currentContext.appName) {
      enriched.appName = this.currentContext.appName;
    }
    
    if (!enriched.theme && this.currentContext.theme) {
      enriched.theme = this.currentContext.theme;
    }
    
    if (!enriched.number && this.currentContext.number) {
      enriched.number = this.currentContext.number;
    }
    
    return enriched;
  }
}

/**
 * Levenshtein distance for fuzzy matching
 */
export function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }
  
  return dp[m][n];
}

/**
 * Calculate similarity score between two strings (0-1)
 */
export function calculateSimilarity(str1, str2) {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  return 1 - (distance / maxLength);
}

export default {
  extractEntities,
  calculateConfidence,
  tokenize,
  extractIntentKeywords,
  fillSlots,
  parseUtterance,
  ConversationContext,
  levenshteinDistance,
  calculateSimilarity,
};
