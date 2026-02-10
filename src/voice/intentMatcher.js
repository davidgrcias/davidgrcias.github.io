/**
 * Intent Matcher
 * Matches parsed utterances to registered voice commands
 * Supports fuzzy matching, synonyms, and multi-language
 */

import {
  extractEntities,
  calculateConfidence,
  tokenize,
  calculateSimilarity,
  ConversationContext,
} from './nluParser';

// Synonym mappings for common verbs
const VERB_SYNONYMS = {
  open: ['open', 'launch', 'start', 'run', 'begin', 'execute', 'fire up', 'boot'],
  close: ['close', 'exit', 'quit', 'shut', 'terminate', 'kill', 'stop'],
  show: ['show', 'display', 'view', 'see', 'reveal', 'present'],
  hide: ['hide', 'conceal', 'dismiss', 'remove'],
  set: ['set', 'change', 'update', 'modify', 'adjust', 'configure'],
  get: ['get', 'fetch', 'retrieve', 'obtain', 'find', 'search'],
  play: ['play', 'start', 'resume', 'continue'],
  pause: ['pause', 'stop', 'halt', 'freeze'],
  next: ['next', 'skip', 'forward', 'advance'],
  previous: ['previous', 'back', 'prev', 'rewind'],
  increase: ['increase', 'raise', 'boost', 'up', 'add', 'more'],
  decrease: ['decrease', 'lower', 'reduce', 'down', 'less'],
  enable: ['enable', 'turn on', 'activate', 'switch on'],
  disable: ['disable', 'turn off', 'deactivate', 'switch off'],
  maximize: ['maximize', 'fullscreen', 'expand', 'enlarge'],
  minimize: ['minimize', 'collapse', 'shrink', 'reduce'],
};

// Multi-language pattern support
const LANGUAGE_PATTERNS = {
  en: {
    greetings: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
    farewells: ['goodbye', 'bye', 'see you', 'farewell', 'later'],
    thanks: ['thank you', 'thanks', 'appreciate it', 'cheers'],
    yes: ['yes', 'yeah', 'yep', 'sure', 'okay', 'ok', 'alright', 'affirmative'],
    no: ['no', 'nope', 'nah', 'negative', 'not really'],
  },
  id: {
    greetings: ['halo', 'hai', 'selamat pagi', 'selamat siang', 'selamat malam'],
    farewells: ['sampai jumpa', 'dadah', 'bye', 'selamat tinggal'],
    thanks: ['terima kasih', 'makasih', 'thanks'],
    yes: ['ya', 'iya', 'oke', 'baik', 'siap'],
    no: ['tidak', 'nggak', 'enggak', 'gak'],
  },
};

/**
 * Intent Matcher class
 */
export class IntentMatcher {
  constructor(commandRegistry) {
    this.registry = commandRegistry;
    this.conversationContext = new ConversationContext();
    this.confidenceThreshold = 0.6;
    this.language = 'en';
  }
  
  /**
   * Set language for multi-language support
   */
  setLanguage(lang) {
    this.language = lang;
  }
  
  /**
   * Set confidence threshold
   */
  setConfidenceThreshold(threshold) {
    this.confidenceThreshold = threshold;
  }
  
  /**
   * Convert pattern to regex with entity placeholders
   */
  patternToRegex(pattern) {
    // Escape special regex characters except {}
    let regex = pattern.replace(/[.*+?^$()[\]\\]/g, '\\$&');
    
    // Convert {entity} to named capture groups
    regex = regex.replace(/\{(\w+)\}/g, '(?<$1>[\\w\\s-]+?)');
    
    // Allow flexible whitespace
    regex = regex.replace(/\s+/g, '\\s+');
    
    return new RegExp(`^${regex}$`, 'i');
  }
  
  /**
   * Expand synonyms in utterance
   */
  expandSynonyms(utterance) {
    const tokens = tokenize(utterance);
    const expandedTokens = tokens.map(token => {
      for (const [canonical, synonyms] of Object.entries(VERB_SYNONYMS)) {
        if (synonyms.includes(token)) {
          return canonical;
        }
      }
      return token;
    });
    return expandedTokens.join(' ');
  }
  
  /**
   * Match utterance against a single pattern
   */
  matchPattern(utterance, pattern) {
    const regex = this.patternToRegex(pattern);
    const match = utterance.match(regex);
    
    if (match) {
      const entities = match.groups || {};
      return { matched: true, entities };
    }
    
    return { matched: false, entities: {} };
  }
  
  /**
   * Calculate match score between utterance and command
   */
  calculateMatchScore(utterance, command) {
    const expandedUtterance = this.expandSynonyms(utterance);
    const entities = extractEntities(utterance);
    
    let bestScore = 0;
    let bestPattern = null;
    let bestEntities = {};
    
    // Try each pattern in the command
    for (const pattern of command.patterns) {
      const expandedPattern = this.expandSynonyms(pattern);
      
      // Try exact regex match first
      const patternMatch = this.matchPattern(expandedUtterance, expandedPattern);
      if (patternMatch.matched) {
        const confidence = calculateConfidence(expandedUtterance, expandedPattern, {
          ...entities,
          ...patternMatch.entities,
        });
        
        if (confidence > bestScore) {
          bestScore = confidence;
          bestPattern = pattern;
          bestEntities = { ...entities, ...patternMatch.entities };
        }
        continue;
      }
      
      // Fuzzy matching for partial matches
      const similarity = calculateSimilarity(expandedUtterance, expandedPattern);
      const fuzzyConfidence = similarity * 0.85; // Penalize fuzzy matches slightly
      
      if (fuzzyConfidence > bestScore) {
        bestScore = fuzzyConfidence;
        bestPattern = pattern;
        bestEntities = entities;
      }
    }
    
    return {
      score: bestScore,
      pattern: bestPattern,
      entities: bestEntities,
    };
  }
  
  /**
   * Find best matching command for utterance
   */
  findBestMatch(utterance) {
    const commands = this.registry.getAllCommands();
    const matches = [];
    
    for (const command of commands) {
      const matchResult = this.calculateMatchScore(utterance, command);
      
      if (matchResult.score >= this.confidenceThreshold) {
        matches.push({
          command,
          score: matchResult.score,
          pattern: matchResult.pattern,
          entities: matchResult.entities,
        });
      }
    }
    
    // Sort by score (highest first)
    matches.sort((a, b) => b.score - a.score);
    
    return matches;
  }
  
  /**
   * Get suggestions for similar commands
   */
  getSuggestions(utterance, maxSuggestions = 3) {
    const commands = this.registry.getAllCommands();
    const suggestions = [];
    
    for (const command of commands) {
      // Get best example from command
      const examples = command.examples || [];
      let bestSimilarity = 0;
      
      for (const example of examples) {
        const similarity = calculateSimilarity(utterance, example);
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
        }
      }
      
      // Also check patterns
      for (const pattern of command.patterns) {
        const similarity = calculateSimilarity(utterance, pattern);
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
        }
      }
      
      if (bestSimilarity > 0.4) {
        suggestions.push({
          command,
          similarity: bestSimilarity,
        });
      }
    }
    
    // Sort and limit
    suggestions.sort((a, b) => b.similarity - a.similarity);
    return suggestions.slice(0, maxSuggestions);
  }
  
  /**
   * Check if utterance contains required entities
   */
  validateEntities(command, entities) {
    const missing = [];
    
    if (command.entities) {
      for (const [entityName, entityConfig] of Object.entries(command.entities)) {
        if (entityConfig.required && !entities[entityName]) {
          missing.push(entityName);
        }
      }
    }
    
    return { valid: missing.length === 0, missing };
  }
  
  /**
   * Main matching function
   */
  match(utterance) {
    // Normalize utterance
    const normalizedUtterance = utterance.trim().toLowerCase();
    
    // Check for empty utterance
    if (!normalizedUtterance) {
      return {
        matched: false,
        error: 'Empty utterance',
      };
    }
    
    // Find matches
    const matches = this.findBestMatch(normalizedUtterance);
    
    if (matches.length === 0) {
      // No match found, provide suggestions
      const suggestions = this.getSuggestions(normalizedUtterance);
      
      return {
        matched: false,
        utterance: normalizedUtterance,
        suggestions,
        error: 'No matching command found',
      };
    }
    
    // Get best match
    const bestMatch = matches[0];
    
    // Enrich entities with context
    const enrichedEntities = this.conversationContext.enrichEntities(bestMatch.entities);
    
    // Validate entities
    const validation = this.validateEntities(bestMatch.command, enrichedEntities);
    
    if (!validation.valid) {
      return {
        matched: true,
        confidence: bestMatch.score,
        intent: bestMatch.command.intent,
        command: bestMatch.command,
        entities: enrichedEntities,
        missingEntities: validation.missing,
        error: `Missing required entities: ${validation.missing.join(', ')}`,
      };
    }
    
    // Update conversation context
    this.conversationContext.addUtterance({
      original: utterance,
      intent: bestMatch.command.intent,
      entities: enrichedEntities,
      timestamp: Date.now(),
    });
    
    // Success!
    return {
      matched: true,
      confidence: bestMatch.score,
      intent: bestMatch.command.intent,
      command: bestMatch.command,
      entities: enrichedEntities,
      pattern: bestMatch.pattern,
      alternatives: matches.slice(1, 3), // Include top 2 alternatives
    };
  }
  
  /**
   * Get conversation context
   */
  getContext() {
    return this.conversationContext.getContext();
  }
  
  /**
   * Set context value
   */
  setContext(key, value) {
    this.conversationContext.setContext(key, value);
  }
  
  /**
   * Clear conversation context
   */
  clearContext() {
    this.conversationContext.clearContext();
  }
  
  /**
   * Get conversation history
   */
  getHistory(count) {
    return this.conversationContext.getHistory(count);
  }
}

/**
 * Create intent matcher instance
 */
export function createIntentMatcher(commandRegistry, options = {}) {
  const matcher = new IntentMatcher(commandRegistry);
  
  if (options.confidenceThreshold) {
    matcher.setConfidenceThreshold(options.confidenceThreshold);
  }
  
  if (options.language) {
    matcher.setLanguage(options.language);
  }
  
  return matcher;
}

export default {
  IntentMatcher,
  createIntentMatcher,
  VERB_SYNONYMS,
  LANGUAGE_PATTERNS,
};
