/**
 * Voice Command Registry
 * Registry for voice commands with NLU patterns, intents, and actions
 */

export class VoiceCommandRegistry {
  constructor() {
    this.commands = new Map();
    this.intents = new Map();
    this.patterns = [];
  }

  /**
   * Register a voice command
   * @param {Object} config - Command configuration
   * @param {string} config.intent - Intent name (e.g., 'OPEN_APP')
   * @param {string[]} config.patterns - NLU patterns to match
   * @param {string[]} config.examples - Example phrases
   * @param {Object} config.entities - Required/optional entities
   * @param {Function} config.action - Action to execute
   * @param {string} config.category - Command category
   * @param {string} config.description - Command description
   * @param {Object} config.responses - Response templates
   */
  registerCommand(config) {
    const {
      intent,
      patterns,
      examples = [],
      entities = {},
      action,
      category = 'general',
      description = '',
      responses = {},
      confidence = 0.7,
    } = config;

    if (!intent || !action) {
      throw new Error('Intent and action are required');
    }

    if (!patterns || patterns.length === 0) {
      throw new Error('At least one pattern is required');
    }

    // Store command
    this.commands.set(intent, {
      intent,
      patterns,
      examples,
      entities,
      action,
      category,
      description,
      responses,
      confidence,
    });

    // Store intent mapping
    this.intents.set(intent, intent);

    // Store patterns for matching
    patterns.forEach(pattern => {
      this.patterns.push({
        pattern,
        intent,
        confidence,
      });
    });
  }

  /**
   * Get command by intent
   */
  getCommand(intent) {
    return this.commands.get(intent);
  }

  /**
   * Get all registered commands
   */
  getAllCommands() {
    return Array.from(this.commands.values());
  }

  /**
   * Get commands by category
   */
  getCommandsByCategory(category) {
    return Array.from(this.commands.values())
      .filter(cmd => cmd.category === category);
  }

  /**
   * Get all categories
   */
  getCategories() {
    const categories = new Set();
    this.commands.forEach(cmd => categories.add(cmd.category));
    return Array.from(categories);
  }

  /**
   * Get all patterns for matching
   */
  getAllPatterns() {
    return this.patterns;
  }

  /**
   * Check if intent exists
   */
  hasIntent(intent) {
    return this.intents.has(intent);
  }

  /**
   * Get command statistics
   */
  getStats() {
    const categories = this.getCategories();
    const stats = {
      totalCommands: this.commands.size,
      totalPatterns: this.patterns.length,
      categories: {},
    };

    categories.forEach(cat => {
      stats.categories[cat] = this.getCommandsByCategory(cat).length;
    });

    return stats;
  }

  /**
   * Search commands by text
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.commands.values()).filter(cmd => {
      return (
        cmd.intent.toLowerCase().includes(lowerQuery) ||
        cmd.description.toLowerCase().includes(lowerQuery) ||
        cmd.examples.some(ex => ex.toLowerCase().includes(lowerQuery)) ||
        cmd.patterns.some(p => p.toLowerCase().includes(lowerQuery))
      );
    });
  }

  /**
   * Clear all commands
   */
  clear() {
    this.commands.clear();
    this.intents.clear();
    this.patterns = [];
  }
}
