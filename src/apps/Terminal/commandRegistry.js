/**
 * Terminal Command Registry
 * Central registry for all terminal commands with metadata
 */

class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.categories = new Map();
  }

  /**
   * Register a new command
   * @param {string} name - Command name
   * @param {Object} config - Command configuration
   */
  registerCommand(name, config) {
    const command = {
      name,
      description: config.description || '',
      usage: config.usage || name,
      category: config.category || 'misc',
      flags: config.flags || [],
      examples: config.examples || [],
      execute: config.execute,
      aliases: config.aliases || [],
      manPage: config.manPage || null,
      requiresArgs: config.requiresArgs || false,
    };

    // Register main command
    this.commands.set(name, command);

    // Register aliases
    if (config.aliases) {
      config.aliases.forEach(alias => {
        this.commands.set(alias, command);
      });
    }

    // Add to category map
    if (!this.categories.has(command.category)) {
      this.categories.set(command.category, []);
    }
    // Only add unique commands (not aliases) to category
    if (!this.categories.get(command.category).find(cmd => cmd.name === name)) {
      this.categories.get(command.category).push(command);
    }
  }

  /**
   * Get a command by name
   * @param {string} name - Command name or alias
   * @returns {Object|null} Command object or null
   */
  getCommand(name) {
    return this.commands.get(name) || null;
  }

  /**
   * Get all unique commands (no duplicates from aliases)
   * @returns {Array} Array of command objects
   */
  getAllCommands() {
    const uniqueCommands = new Map();
    this.commands.forEach((command) => {
      if (!uniqueCommands.has(command.name)) {
        uniqueCommands.set(command.name, command);
      }
    });
    return Array.from(uniqueCommands.values());
  }

  /**
   * Get commands by category
   * @param {string} category - Category name
   * @returns {Array} Array of commands in that category
   */
  getCommandsByCategory(category) {
    return this.categories.get(category) || [];
  }

  /**
   * Get all categories
   * @returns {Array} Array of category names
   */
  getCategories() {
    return Array.from(this.categories.keys());
  }

  /**
   * Check if command exists
   * @param {string} name - Command name
   * @returns {boolean}
   */
  hasCommand(name) {
    return this.commands.has(name);
  }

  /**
   * Get command count
   * @returns {number}
   */
  getCommandCount() {
    return this.getAllCommands().length;
  }
}

// Create singleton instance
const registry = new CommandRegistry();

export default registry;
export { CommandRegistry };
