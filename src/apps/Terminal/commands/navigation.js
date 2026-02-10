/**
 * Navigation Commands
 * Commands for help, documentation, and system information
 */

import { error, success, text, colored, divider } from '../outputFormatter.js';

export function registerNavigationCommands(registry, getContext) {
  // help - Show all commands or detailed help
  registry.registerCommand('help', {
    description: 'Display available commands and usage information',
    usage: 'help [command]',
    category: 'navigation',
    examples: ['help', 'help ls', 'help grep'],
    async execute(args) {
      const commands = registry.commands || registry.getCommands?.() || {};

      // Detailed help for specific command
      if (args.length > 0) {
        const cmdName = args[0];
        const cmd = commands[cmdName];

        if (!cmd) {
          return [error(`No help available for '${cmdName}': command not found`)];
        }

        const output = [
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          colored(`  ${cmdName}`, 'success'),
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          text(''),
          colored('Description:', 'info'),
          text(`  ${cmd.description || 'No description available'}`),
          text(''),
          colored('Usage:', 'info'),
          text(`  ${cmd.usage || cmdName}`),
        ];

        if (cmd.flags && cmd.flags.length > 0) {
          output.push(text(''));
          output.push(colored('Flags:', 'info'));
          cmd.flags.forEach(flag => {
            output.push(text(`  -${flag.flag}  ${flag.description}`));
          });
        }

        if (cmd.examples && cmd.examples.length > 0) {
          output.push(text(''));
          output.push(colored('Examples:', 'info'));
          cmd.examples.forEach(example => {
            output.push(text(`  $ ${example}`));
          });
        }

        output.push(colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'));

        return output;
      }

      // List all commands grouped by category
      const categorized = {};
      Object.entries(commands).forEach(([name, cmd]) => {
        const category = cmd.category || 'other';
        if (!categorized[category]) {
          categorized[category] = [];
        }
        categorized[category].push({ name, cmd });
      });

      const output = [
        colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
        colored('  Available Commands', 'success'),
        colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
        text(''),
      ];

      // Category order
      const categoryOrder = [
        'navigation',
        'info',
        'filesystem',
        'system',
        'apps',
        'utils',
        'settings',
        'music',
        'network',
        'other'
      ];

      categoryOrder.forEach(category => {
        const cmds = categorized[category];
        if (!cmds || cmds.length === 0) return;

        output.push(colored(`${category.toUpperCase()}:`, 'info'));
        
        cmds.sort((a, b) => a.name.localeCompare(b.name));
        
        cmds.forEach(({ name, cmd }) => {
          const desc = cmd.description || '';
          const padding = ' '.repeat(Math.max(1, 15 - name.length));
          output.push(text(`  ${name}${padding}${desc}`));
        });
        
        output.push(text(''));
      });

      output.push(text('Type "help <command>" for detailed information about a specific command.'));
      output.push(text('Type "man <command>" for the manual page.'));
      output.push(colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'));

      return output;
    },
  });

  // man - Manual page for command
  registry.registerCommand('man', {
    description: 'Display manual page for a command',
    usage: 'man <command>',
    category: 'navigation',
    requiresArgs: true,
    examples: ['man ls', 'man help'],
    async execute(args) {
      if (args.length === 0) {
        return [error('What manual page do you want?')];
      }

      const cmdName = args[0];
      const commands = registry.commands || registry.getCommands?.() || {};
      const cmd = commands[cmdName];

      if (!cmd) {
        return [error(`No manual entry for ${cmdName}`)];
      }

      const output = [
        colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
        colored(`  ${cmdName.toUpperCase()}(1)`, 'success'),
        colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
        text(''),
        colored('NAME', 'info'),
        text(`  ${cmdName} - ${cmd.description || 'no description'}`),
        text(''),
        colored('SYNOPSIS', 'info'),
        text(`  ${cmd.usage || cmdName}`),
        text(''),
        colored('DESCRIPTION', 'info'),
        text(`  ${cmd.description || 'No description available'}`),
      ];

      if (cmd.flags && cmd.flags.length > 0) {
        output.push(text(''));
        output.push(colored('OPTIONS', 'info'));
        cmd.flags.forEach(flag => {
          output.push(text(`  -${flag.flag}`));
          output.push(text(`      ${flag.description}`));
        });
      }

      if (cmd.examples && cmd.examples.length > 0) {
        output.push(text(''));
        output.push(colored('EXAMPLES', 'info'));
        cmd.examples.forEach(example => {
          output.push(text(`  $ ${example}`));
        });
      }

      output.push(text(''));
      output.push(colored('SEE ALSO', 'info'));
      output.push(text('  help(1)'));
      output.push(text(''));
      output.push(colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'));

      return output;
    },
  });

  // version - Show WebOS version
  registry.registerCommand('version', {
    description: 'Display WebOS version information',
    usage: 'version',
    category: 'navigation',
    examples: ['version'],
    async execute() {
      const { env } = getContext();
      const version = env?.VERSION || '2.0.0';
      const buildDate = env?.BUILD_DATE || 'February 2026';
      
      const output = [
        colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
        colored('  WebOS Portfolio', 'success'),
        colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
        text(''),
        text(`  Version: ${version}`),
        text(`  Build: ${buildDate}`),
        text('  Platform: Web'),
        text('  Framework: React 18.2+'),
        text(''),
        text('  Created by David Garcia Saragih'),
        text('  https://davidgrcias.github.io'),
        text(''),
        colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
      ];

      return output;
    },
  });

  // credits - Show credits
  registry.registerCommand('credits', {
    description: 'Display credits and acknowledgments',
    usage: 'credits',
    category: 'navigation',
    examples: ['credits'],
    async execute() {
      const output = [
        colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
        colored('  Credits', 'success'),
        colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
        text(''),
        colored('Designed & Developed by:', 'info'),
        text('  David Garcia Saragih'),
        text('  Full-Stack Web & Systems Engineer'),
        text(''),
        colored('Technologies:', 'info'),
        text('  • React 18.2+'),
        text('  • Tailwind CSS v4'),
        text('  • Vite'),
        text('  • Firebase'),
        text('  • Gemini AI'),
        text(''),
        colored('Special Thanks:', 'info'),
        text('  • The open source community'),
        text('  • React team for an amazing framework'),
        text('  • Everyone who visited this portfolio'),
        text(''),
        colored('Contact:', 'info'),
        text('  Email: davidgarciasaragih7@gmail.com'),
        text('  GitHub: github.com/davidgrcias'),
        text('  Website: davidgrcias.github.io'),
        text(''),
        colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
      ];

      return output;
    },
  });

  // welcome - Show welcome message/MOTD
  registry.registerCommand('welcome', {
    description: 'Display welcome message',
    usage: 'welcome',
    category: 'navigation',
    examples: ['welcome'],
    async execute() {
      const { env } = getContext();
      const user = env?.USER || 'guest';
      const hostname = env?.HOSTNAME || 'webos';
      const date = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      const output = [
        colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
        text(''),
        colored('  ██╗    ██╗███████╗██████╗  ██████╗ ███████╗', 'success'),
        colored('  ██║    ██║██╔════╝██╔══██╗██╔═══██╗██╔════╝', 'success'),
        colored('  ██║ █╗ ██║█████╗  ██████╔╝██║   ██║███████╗', 'success'),
        colored('  ██║███╗██║██╔══╝  ██╔══██╗██║   ██║╚════██║', 'success'),
        colored('  ╚███╔███╔╝███████╗██████╔╝╚██████╔╝███████║', 'success'),
        colored('   ╚══╝╚══╝ ╚══════╝╚═════╝  ╚═════╝ ╚══════╝', 'success'),
        text(''),
        colored('  Welcome to David\'s WebOS Portfolio', 'info'),
        text(''),
        colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
        text(''),
        text(`  Welcome, ${user}@${hostname}!`),
        text(`  Today is ${date}`),
        text(''),
        text('  This is an interactive web-based operating system'),
        text('  showcasing my portfolio and skills.'),
        text(''),
        colored('  Quick Start:', 'warning'),
        text('    • Type "help" to see available commands'),
        text('    • Type "about" to learn about me'),
        text('    • Type "projects" to see my work'),
        text('    • Type "skills" to view my technical skills'),
        text('    • Type "apps" to see installed applications'),
        text(''),
        text('  Have fun exploring! 🚀'),
        text(''),
        colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
      ];

      return output;
    },
  });

  // motd - Message of the day (alias for welcome)
  registry.registerCommand('motd', {
    description: 'Display message of the day',
    usage: 'motd',
    category: 'navigation',
    examples: ['motd'],
    async execute() {
      // Call welcome command
      const welcomeCmd = registry.commands?.welcome || registry.getCommands?.()?.welcome;
      if (welcomeCmd) {
        return welcomeCmd.execute([], {});
      }
      return [text('Message of the day not available')];
    },
  });

  // readme - Show README/getting started
  registry.registerCommand('readme', {
    description: 'Display getting started guide',
    usage: 'readme',
    category: 'navigation',
    examples: ['readme'],
    async execute() {
      const output = [
        colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
        colored('  Getting Started Guide', 'success'),
        colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
        text(''),
        colored('NAVIGATION', 'info'),
        text('  help              - List all available commands'),
        text('  help <command>    - Get detailed help for a command'),
        text('  man <command>     - View manual page'),
        text(''),
        colored('INFORMATION', 'info'),
        text('  about             - Learn about David Garcia'),
        text('  skills            - View technical skills'),
        text('  projects          - Browse portfolio projects'),
        text('  experience        - View work experience'),
        text('  education         - View education history'),
        text('  contact           - Get contact information'),
        text(''),
        colored('SYSTEM', 'info'),
        text('  ls                - List files and directories'),
        text('  cd <path>         - Change directory'),
        text('  cat <file>        - View file contents'),
        text('  apps              - List installed applications'),
        text(''),
        colored('UTILITIES', 'info'),
        text('  clear             - Clear terminal screen'),
        text('  echo <text>       - Print text'),
        text('  calc <expr>       - Calculate expression'),
        text(''),
        colored('SETTINGS', 'info'),
        text('  theme <name>      - Change theme'),
        text('  lang <en|id>      - Change language'),
        text('  volume <0-100>    - Set system volume'),
        text(''),
        colored('MUSIC', 'info'),
        text('  music             - Show music player status'),
        text('  music play        - Play/resume music'),
        text('  music pause       - Pause music'),
        text('  music list        - View playlist'),
        text(''),
        text('Type "help" for a complete list of commands.'),
        colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
      ];

      return output;
    },
  });
}
