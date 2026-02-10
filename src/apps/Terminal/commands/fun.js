/**
 * Fun Commands
 * Easter egg commands and entertainment features
 */

import { error, success, text, colored, ascii } from '../outputFormatter.js';

export function registerFunCommands(registry, getContext) {
  // neofetch - System info in fancy format
  registry.registerCommand('neofetch', {
    description: 'Display system information',
    usage: 'neofetch',
    category: 'fun',
    examples: ['neofetch'],
    async execute() {
      const output = [
        colored('                   ', 'success'),
        colored('       ▄▄▄▄        ', 'success') + '  david@webos',
        colored('     ▄█████▄       ', 'success') + '  ─────────────',
        colored('    ▐██████▌       ', 'success') + '  OS: WebOS Portfolio',
        colored('    ▐██████▌       ', 'success') + '  Host: Browser',
        colored('    ▐██████▌       ', 'success') + '  Kernel: React 18.2',
        colored('     ▀█████▀       ', 'success') + '  Uptime: ${Math.floor(performance.now() / 1000)}s',
        colored('       ▀▀▀▀        ', 'success') + '  Shell: terminal.sh',
        colored('                   ', 'success') + '  Resolution: ${window.innerWidth}x${window.innerHeight}`,
        text(''),
        colored('███', 'error') + colored('███', 'success') + colored('███', 'warning') + colored('███', 'info'),
      ];

      return output;
    },
  });

  // cowsay - ASCII cow with message
  registry.registerCommand('cowsay', {
    description: 'Generate ASCII cow saying something',
    usage: 'cowsay <message>',
    category: 'fun',
    examples: ['cowsay Hello World!', 'cowsay Moo!'],
    async execute(args) {
      if (args.length === 0) {
        return [error('Usage: cowsay <message>')];
      }

      const message = args.join(' ');
      const border = '─'.repeat(message.length + 2);

      const output = [
        text(` ${border}`),
        text(`< ${message} >`),
        text(` ${border}`),
        text('        \\   ^__^'),
        text('         \\  (oo)\\_______'),
        text('            (__)\\       )\\/\\'),
        text('                ||----w |'),
        text('                ||     ||'),
      ];

      return output;
    },
  });

  // figlet - ASCII art text
  registry.registerCommand('figlet', {
    description: 'Generate ASCII art text',
    usage: 'figlet <text>',
    category: 'fun',
    examples: ['figlet HELLO', 'figlet WebOS'],
    async execute(args) {
      if (args.length === 0) {
        return [error('Usage: figlet <text>')];
      }

      const input = args.join(' ').toUpperCase();
      
      // Simple ASCII art generator (limited character set)
      const chars = {
        'A': ['  ▄▄  ', ' ████ ', '██  ██', '██████', '██  ██'],
        'E': ['██████', '██    ', '████  ', '██    ', '██████'],
        'H': ['██  ██', '██  ██', '██████', '██  ██', '██  ██'],
        'L': ['██    ', '██    ', '██    ', '██    ', '██████'],
        'O': [' ████ ', '██  ██', '██  ██', '██  ██', ' ████ '],
        'W': ['██   ██', '██   ██', '██ █ ██', '███ ███', '██   ██'],
        ' ': ['      ', '      ', '      ', '      ', '      '],
      };

      const lines = ['', '', '', '', ''];
      
      for (const char of input) {
        const art = chars[char] || chars[' '];
        for (let i = 0; i < 5; i++) {
          lines[i] += art[i] + ' ';
        }
      }

      return lines.map(line => colored(line, 'success'));
    },
  });

  // fortune - Random quote
  registry.registerCommand('fortune', {
    description: 'Display a random fortune/quote',
    usage: 'fortune',
    category: 'fun',
    examples: ['fortune'],
    async execute() {
      const fortunes = [
        'You will write bug-free code today... probably not, but good luck!',
        'A commit a day keeps the bugs away.',
        'The force is strong with your code.',
        'May your code compile on the first try.',
        'In the future, you will be a great developer. The future is now.',
        'Your project will go viral... on StackOverflow.',
        'Today is a good day to refactor.',
        'The bug you are looking for is on line 42.',
        'Coffee is your friend. Sleep is overrated.',
        'With great power comes great responsibility... and great bugs.',
      ];

      const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];

      return [
        text(''),
        colored(fortune, 'warning'),
        text(''),
      ];
    },
  });

  // matrix - Matrix effect
  registry.registerCommand('matrix', {
    description: 'Activate the Matrix',
    usage: 'matrix',
    category: 'fun',
    examples: ['matrix'],
    async execute() {
      const output = [
        colored('Wake up, Neo...', 'success'),
        colored('The Matrix has you...', 'success'),
        colored('Follow the white rabbit.', 'success'),
        text(''),
        colored('01010111 01100001 01101011 01100101 00100000 01110101 01110000', 'success'),
        colored('01001110 01100101 01101111 00101110 00101110 00101110', 'success'),
        text(''),
        text('(Matrix effect in terminal - feature coming soon!)'),
      ];

      return output;
    },
  });

  // lolcat - Rainbow colored text
  registry.registerCommand('lolcat', {
    description: 'Display text in rainbow colors',
    usage: 'lolcat <text>',
    category: 'fun',
    examples: ['lolcat Hello Rainbow!'],
    async execute(args) {
      if (args.length === 0) {
        return [error('Usage: lolcat <text>')];
      }

      const text = args.join(' ');
      const colors = ['error', 'warning', 'success', 'info'];
      const output = [];

      for (let i = 0; i < text.length; i++) {
        const colorIndex = i % colors.length;
        output.push(colored(text[i], colors[colorIndex]));
      }

      return [output.join('')];
    },
  });

  // sl - Steam locomotive
  registry.registerCommand('sl', {
    description: 'Display a steam locomotive (typo of ls)',
    usage: 'sl',
    category: 'fun',
    examples: ['sl'],
    async execute() {
      return [
        text(''),
        text('      ====        ________                ___________'),
        text('  _D _|  |_______/        \\__I_I_____===__|_________|'),
        text('   |(_)---  |   H\\________/ |   |        =|___ ___|      '),
        text('   /     |  |   H  |  |     |   |         ||_| |_||      '),
        text('  |      |  |   H  |__--------------------| [___] |      '),
        text('  | ________|___H__/__|_____/[][]~\\_______|       |      '),
        text('  |/ |   |-----------I_____I [][] []  D   |=======|____  '),
        text('__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__|__'),
        text(' |/-=|___|=O=====O=====O=====O   |_____/~\\___/          '),
        text('  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/              '),
        text(''),
        text('You might have meant "ls" to list files!'),
        text(''),
      ];
    },
  });

  // rickroll - Rick Astley lyrics
  registry.registerCommand('rickroll', {
    description: 'Never gonna give you up...',
    usage: 'rickroll',
    category: 'fun',
    examples: ['rickroll'],
    async execute() {
      const output = [
        text(''),
        colored('♪ Never gonna give you up ♪', 'error'),
        colored('♪ Never gonna let you down ♪', 'error'),
        colored('♪ Never gonna run around and desert you ♪', 'error'),
        colored('♪ Never gonna make you cry ♪', 'error'),
        colored('♪ Never gonna say goodbye ♪', 'error'),
        colored('♪ Never gonna tell a lie and hurt you ♪', 'error'),
        text(''),
        text('You just got rickrolled! 🕺'),
        text(''),
      ];

      return output;
    },
  });

  // hack - Fake hacking sequence
  registry.registerCommand('hack', {
    description: 'Initiate hacking sequence',
    usage: 'hack [target]',
    category: 'fun',
    examples: ['hack', 'hack nasa', 'hack pentagon'],
    async execute(args) {
      const target = args[0] || 'mainframe';
      
      const output = [
        colored('[ HACKING INITIATED ]', 'error'),
        text(''),
        text(`Target: ${target}`),
        text('Establishing connection...'),
        colored('Connection established!', 'success'),
        text(''),
        text('Bypassing firewall...'),
        text('████████████████████ 100%'),
        colored('Firewall bypassed!', 'success'),
        text(''),
        text('Extracting data...'),
        text('████████████████████ 100%'),
        colored('Data extracted!', 'success'),
        text(''),
        colored('HACK COMPLETE!', 'success'),
        text(''),
        text('Just kidding! This is fake 😄'),
        text(''),
      ];

      return output;
    },
  });

  // sudo - Fake sudo prompt
  registry.registerCommand('sudo', {
    description: 'Execute command as superuser',
    usage: 'sudo <command>',
    category: 'fun',
    examples: ['sudo rm -rf /', 'sudo hack'],
    async execute(args) {
      if (args.length === 0) {
        return [error('Usage: sudo <command>')];
      }

      const command = args.join(' ');

      // Easter eggs for specific commands
      if (command.includes('rm -rf')) {
        return [
          colored('Permission denied!', 'error'),
          text(''),
          text('Nice try! But you cannot delete the universe.'),
          text('This incident will be reported to the admin (yourself).'),
        ];
      }

      return [
        text('[sudo] password for user: '),
        text(''),
        colored('Authentication successful!', 'success'),
        text(`Executing: ${command}`),
        text(''),
        text('Just kidding! This is a read-only terminal.'),
        text('No actual commands are executed.'),
      ];
    },
  });

  // cmatrix - Matrix-style falling characters
  registry.registerCommand('cmatrix', {
    description: 'Matrix-style falling characters',
    usage: 'cmatrix',
    category: 'fun',
    examples: ['cmatrix'],
    async execute() {
      const chars = '01アイウエオカキクケコサシスセソタチツテト';
      const lines = [];

      for (let i = 0; i < 15; i++) {
        let line = '';
        for (let j = 0; j < 40; j++) {
          line += chars[Math.floor(Math.random() * chars.length)] + ' ';
        }
        lines.push(colored(line, 'success'));
      }

      return [
        ...lines,
        text(''),
        text('(Animated version coming soon!)'),
      ];
    },
  });

  // snake - ASCII snake game
  registry.registerCommand('snake', {
    description: 'Play ASCII snake game',
    usage: 'snake',
    category: 'fun',
    examples: ['snake'],
    async execute() {
      return [
        text(''),
        colored('  ╔════════════════════╗', 'success'),
        colored('  ║                    ║', 'success'),
        colored('  ║   ●●●○             ║', 'success'),
        colored('  ║                    ║', 'success'),
        colored('  ║          ◆         ║', 'success'),
        colored('  ║                    ║', 'success'),
        colored('  ╚════════════════════╝', 'success'),
        text(''),
        text('Snake game - Coming soon!'),
        text('Will be playable with keyboard controls.'),
        text(''),
      ];
    },
  });
}
