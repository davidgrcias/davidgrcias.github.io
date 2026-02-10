/**
 * Terminal Command Parser
 * Parses command line input into structured command objects
 */

/**
 * Parse command input into structured object
 * @param {string} input - Raw command input
 * @returns {Object} Parsed command object
 */
export function parseCommand(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  // Check for command chaining (&&, ;)
  if (trimmed.includes('&&') || trimmed.includes(';')) {
    return parseChainedCommands(trimmed);
  }

  // Check for piping (|)
  if (trimmed.includes('|')) {
    return parsePipedCommands(trimmed);
  }

  // Parse single command
  return parseSingleCommand(trimmed);
}

/**
 * Parse chained commands (&&, ;)
 */
function parseChainedCommands(input) {
  const segments = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const nextChar = input[i + 1];

    if ((char === '"' || char === "'") && input[i - 1] !== '\\') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
      }
      current += char;
      continue;
    }

    if (!inQuotes) {
      if (char === '&' && nextChar === '&') {
        segments.push({ command: parseSingleCommand(current.trim()), chain: '&&' });
        current = '';
        i++; // Skip next &
        continue;
      }
      if (char === ';') {
        segments.push({ command: parseSingleCommand(current.trim()), chain: ';' });
        current = '';
        continue;
      }
    }

    current += char;
  }

  // Add last segment
  if (current.trim()) {
    segments.push({ command: parseSingleCommand(current.trim()), chain: null });
  }

  return {
    type: 'chained',
    segments,
  };
}

/**
 * Parse piped commands (|)
 */
function parsePipedCommands(input) {
  const parts = splitByPipe(input);
  const commands = parts.map(part => parseSingleCommand(part.trim()));

  return {
    type: 'piped',
    commands,
  };
}

/**
 * Split by pipe while respecting quotes
 */
function splitByPipe(input) {
  const parts = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if ((char === '"' || char === "'") && input[i - 1] !== '\\') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
      }
      current += char;
      continue;
    }

    if (!inQuotes && char === '|') {
      parts.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  if (current) {
    parts.push(current);
  }

  return parts;
}

/**
 * Parse a single command with arguments and flags
 */
function parseSingleCommand(input) {
  const tokens = tokenize(input);
  
  if (tokens.length === 0) {
    return null;
  }

  const command = tokens[0];
  const args = [];
  const flags = {};
  let rawFlags = [];

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.startsWith('--')) {
      // Long flag: --flag or --flag=value
      const flagName = token.slice(2);
      if (flagName.includes('=')) {
        const [key, value] = flagName.split('=');
        flags[key] = value;
        rawFlags.push(`--${key}`);
      } else {
        flags[flagName] = true;
        rawFlags.push(`--${flagName}`);
      }
    } else if (token.startsWith('-') && token.length > 1 && !token.match(/^-\d/)) {
      // Short flags: -a, -la, -l -a
      const flagChars = token.slice(1);
      for (const char of flagChars) {
        flags[char] = true;
        rawFlags.push(`-${char}`);
      }
    } else {
      // Argument
      args.push(token);
    }
  }

  return {
    type: 'single',
    command,
    args,
    flags,
    rawFlags,
    raw: input,
  };
}

/**
 * Tokenize input string while respecting quotes
 */
function tokenize(input) {
  const tokens = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    // Handle quotes
    if ((char === '"' || char === "'") && input[i - 1] !== '\\') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
        continue;
      } else if (char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
        continue;
      }
    }

    // Handle spaces
    if (char === ' ' && !inQuotes) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    // Handle escape sequences
    if (char === '\\' && i + 1 < input.length) {
      const nextChar = input[i + 1];
      if (nextChar === 'n') {
        current += '\n';
        i++;
        continue;
      } else if (nextChar === 't') {
        current += '\t';
        i++;
        continue;
      } else if (nextChar === '\\' || nextChar === '"' || nextChar === "'") {
        current += nextChar;
        i++;
        continue;
      }
    }

    current += char;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

/**
 * Expand environment variables in a string
 * @param {string} str - String with potential $VAR references
 * @param {Object} env - Environment variables object
 * @returns {string} Expanded string
 */
export function expandVariables(str, env = {}) {
  return str.replace(/\$(\w+)/g, (match, varName) => {
    return env[varName] !== undefined ? env[varName] : match;
  });
}

/**
 * Expand tilde (~) to home directory
 * @param {string} path - Path string
 * @param {string} home - Home directory path
 * @returns {string} Expanded path
 */
export function expandTilde(path, home = '~') {
  if (path === '~') return home;
  if (path.startsWith('~/')) return home + path.slice(1);
  return path;
}

export default parseCommand;
