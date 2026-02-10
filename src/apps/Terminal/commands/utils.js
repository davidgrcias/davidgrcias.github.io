/**
 * Utility Commands
 * Essential utility commands for the terminal
 */

import { error, success, text, colored, json } from '../outputFormatter.js';

export function registerUtilsCommands(registry, getContext) {
  // echo - Print text
  registry.registerCommand('echo', {
    description: 'Print text to the terminal',
    usage: 'echo <text>',
    category: 'utils',
    examples: ['echo Hello World', 'echo $USER', 'echo "Multiple words"'],
    async execute(args) {
      if (args.length === 0) {
        return [text('')];
      }

      const { env } = getContext();
      let output = args.join(' ');

      // Replace environment variables
      if (env) {
        output = output.replace(/\$(\w+)/g, (match, varName) => {
          return env[varName] || match;
        });
      }

      return [text(output)];
    },
  });

  // clear - Clear screen
  registry.registerCommand('clear', {
    description: 'Clear the terminal screen',
    usage: 'clear',
    category: 'utils',
    examples: ['clear'],
    async execute() {
      // Return special marker for terminal to clear
      return [{ type: 'CLEAR' }];
    },
  });

  // reset - Reset terminal
  registry.registerCommand('reset', {
    description: 'Reset the terminal to initial state',
    usage: 'reset',
    category: 'utils',
    examples: ['reset'],
    async execute() {
      const { fs } = getContext();
      
      // Reset to home directory
      if (fs && fs.cd) {
        fs.cd('~');
      }

      // Return special marker for terminal to reset
      return [
        { type: 'CLEAR' },
        success('Terminal reset to initial state'),
      ];
    },
  });

  // exit - Exit/close terminal
  registry.registerCommand('exit', {
    description: 'Exit the terminal',
    usage: 'exit',
    category: 'utils',
    examples: ['exit'],
    async execute() {
      const { os } = getContext();
      
      // Close terminal app
      if (os && os.closeApp) {
        os.closeApp('terminal');
      }

      return [
        text('Goodbye!'),
        { type: 'EXIT' },
      ];
    },
  });

  // which - Show if command exists
  registry.registerCommand('which', {
    description: 'Show the path of a command',
    usage: 'which <command>',
    category: 'utils',
    requiresArgs: true,
    examples: ['which ls', 'which help'],
    async execute(args) {
      if (args.length === 0) {
        return [error('which: missing command operand')];
      }

      const commandName = args[0];
      const commands = registry.commands || registry.getCommands?.() || {};
      
      if (commands[commandName]) {
        return [text(`/usr/bin/${commandName}`)];
      }

      return [error(`which: no ${commandName} in (/usr/bin)`)];
    },
  });

  // type - Show command type
  registry.registerCommand('type', {
    description: 'Display information about command type',
    usage: 'type <command>',
    category: 'utils',
    requiresArgs: true,
    examples: ['type ls', 'type echo'],
    async execute(args) {
      if (args.length === 0) {
        return [error('type: missing command operand')];
      }

      const commandName = args[0];
      const commands = registry.commands || registry.getCommands?.() || {};
      const command = commands[commandName];
      
      if (!command) {
        return [error(`type: ${commandName}: not found`)];
      }

      return [
        text(`${commandName} is a shell builtin`),
        text(`  Category: ${command.category || 'general'}`),
        text(`  Description: ${command.description || 'N/A'}`),
      ];
    },
  });

  // calc - Calculator
  registry.registerCommand('calc', {
    description: 'Perform mathematical calculations',
    usage: 'calc <expression>',
    category: 'utils',
    requiresArgs: true,
    examples: ['calc 2 + 2', 'calc 10 * 5', 'calc (3 + 4) * 2'],
    async execute(args) {
      if (args.length === 0) {
        return [error('calc: missing expression')];
      }

      const expression = args.join(' ');
      
      try {
        // Safe evaluation using Function constructor with limited scope
        // Only allow basic math operations
        const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
        
        if (sanitized !== expression) {
          return [error('calc: invalid characters in expression. Only numbers and +, -, *, /, (, ) are allowed.')];
        }

        // Use Function constructor for safer evaluation
        const result = new Function(`return ${sanitized}`)();
        
        if (typeof result !== 'number' || !isFinite(result)) {
          return [error('calc: invalid result')];
        }

        return [
          colored(`${expression} =`, 'info'),
          colored(`${result}`, 'success'),
        ];
      } catch (err) {
        return [error(`calc: ${err.message}`)];
      }
    },
  });

  // grep - Search text
  registry.registerCommand('grep', {
    description: 'Search for a pattern in text',
    usage: 'grep <pattern> <input>',
    category: 'utils',
    requiresArgs: true,
    examples: ['grep error logfile.txt', 'grep "hello" text.txt'],
    async execute(args, flags, { history = [] } = {}) {
      if (args.length === 0) {
        return [error('grep: missing pattern')];
      }

      const pattern = args[0];
      const input = args.slice(1).join(' ');
      
      // If input is a file, try to read it
      if (input && !input.includes(' ')) {
        const { fs } = getContext();
        if (fs && fs.cat) {
          const result = fs.cat(input);
          if (result.success) {
            input = result.content;
          }
        }
      }

      try {
        const regex = new RegExp(pattern, 'gi');
        const lines = input.split('\n');
        const matches = [];

        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push(text(`${index + 1}: ${line}`));
          }
        });

        if (matches.length === 0) {
          return [text('No matches found')];
        }

        return matches;
      } catch (err) {
        return [error(`grep: ${err.message}`)];
      }
    },
  });

  // json - Pretty-print JSON
  registry.registerCommand('json', {
    description: 'Format and display JSON data',
    usage: 'json <file|text>',
    category: 'utils',
    requiresArgs: true,
    examples: ['json data.json', 'json \'{"name": "value"}\''],
    async execute(args) {
      if (args.length === 0) {
        return [error('json: missing input')];
      }

      let input = args.join(' ');
      
      // If input looks like a filename, try to read it
      if (input.match(/\.json$/i) && !input.includes('{')) {
        const { fs } = getContext();
        if (fs && fs.cat) {
          const result = fs.cat(input);
          if (result.success) {
            input = result.content;
          } else {
            return [error(result.error)];
          }
        }
      }

      try {
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, 2);
        
        return [
          json(parsed),
        ];
      } catch (err) {
        return [error(`json: ${err.message}`)];
      }
    },
  });

  // date - Display current date (additional utility)
  registry.registerCommand('date', {
    description: 'Display current date and time',
    usage: 'date [format]',
    category: 'utils',
    examples: ['date', 'date iso', 'date unix'],
    async execute(args) {
      const now = new Date();
      const format = args[0]?.toLowerCase();

      switch (format) {
        case 'iso':
          return [text(now.toISOString())];
        case 'unix':
          return [text(Math.floor(now.getTime() / 1000).toString())];
        case 'utc':
          return [text(now.toUTCString())];
        case 'local':
          return [text(now.toLocaleString())];
        default:
          return [text(now.toString())];
      }
    },
  });

  // sleep - Pause execution
  registry.registerCommand('sleep', {
    description: 'Pause for specified seconds',
    usage: 'sleep <seconds>',
    category: 'utils',
    requiresArgs: true,
    examples: ['sleep 2', 'sleep 0.5'],
    async execute(args) {
      if (args.length === 0) {
        return [error('sleep: missing operand')];
      }

      const seconds = parseFloat(args[0]);
      
      if (isNaN(seconds) || seconds < 0) {
        return [error('sleep: invalid time interval')];
      }

      await new Promise(resolve => setTimeout(resolve, seconds * 1000));
      return [];
    },
  });

  // seq - Generate sequence of numbers
  registry.registerCommand('seq', {
    description: 'Generate sequence of numbers',
    usage: 'seq <start> [end] [step]',
    category: 'utils',
    examples: ['seq 5', 'seq 1 10', 'seq 0 10 2'],
    async execute(args) {
      if (args.length === 0) {
        return [error('seq: missing operand')];
      }

      let start = 1;
      let end = 1;
      let step = 1;

      if (args.length === 1) {
        end = parseInt(args[0]);
      } else if (args.length === 2) {
        start = parseInt(args[0]);
        end = parseInt(args[1]);
      } else {
        start = parseInt(args[0]);
        end = parseInt(args[1]);
        step = parseInt(args[2]);
      }

      if (isNaN(start) || isNaN(end) || isNaN(step)) {
        return [error('seq: invalid number')];
      }

      const output = [];
      for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
        output.push(text(i.toString()));
      }

      return output;
    },
  });
}
