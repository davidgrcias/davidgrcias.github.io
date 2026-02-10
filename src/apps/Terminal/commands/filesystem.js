/**
 * Filesystem Commands
 * Commands for file and directory operations
 */

import { error, success, text, table as tableFormat, tree as treeFormat, colored } from '../outputFormatter.js';

export function registerFilesystemCommands(registry, getContext) {
  // ls - list directory contents
  registry.registerCommand('ls', {
    description: 'List directory contents',
    usage: 'ls [path] [-l] [-a] [-h]',
    category: 'filesystem',
    flags: [
      { flag: 'l', description: 'Use long listing format' },
      { flag: 'a', description: 'Show hidden files' },
      { flag: 'h', description: 'Human-readable sizes' },
    ],
    examples: ['ls', 'ls -la', 'ls /Projects', 'ls -lh ~/Documents'],
    async execute(args, flags, context) {
      const ctx = context ? context() : getContext();
      const { fs } = ctx;
      const path = args[0] || '.';
      
      const result = fs.ls(path, flags);
      
      if (!result.success) {
        return [error(result.error)];
      }

      if (flags.l) {
        // Long format
        const output = result.items.map(item => text(item.long));
        return [text(`total ${result.total}`), ...output];
      } else {
        // Short format - multiple columns
        const names = result.items.map(item => ({
          name: item.name,
          isDir: item.isDir,
        }));
        
        return names.map(({ name, isDir }) => 
          isDir ? colored(name, 'directory') : text(name)
        );
      }
    },
  });

  // cd - change directory
  registry.registerCommand('cd', {
    description: 'Change directory',
    usage: 'cd [path]',
    category: 'filesystem',
    examples: ['cd /Projects', 'cd ..', 'cd ~', 'cd -'],
    async execute(args, flags, context) {
      const ctx = context ? context() : getContext();
      const { fs } = ctx;
      const path = args[0] || '~';
      
      const result = fs.cd(path);
      
      if (!result.success) {
        return [error(result.error)];
      }

      return [];
    },
  });

  // pwd - print working directory
  registry.registerCommand('pwd', {
    description: 'Print working directory',
    usage: 'pwd',
    category: 'filesystem',
    examples: ['pwd'],
    async execute(args, flags, context) {
      const ctx = context ? context() : getContext();
      const { fs } = ctx;
      return [text(fs.pwd())];
    },
  });

  // cat - concatenate and display file contents
  registry.registerCommand('cat', {
    description: 'Display file contents',
    usage: 'cat <file>',
    category: 'filesystem',
    requiresArgs: true,
    examples: ['cat README.md', 'cat Skills.json'],
    async execute(args, flags, context) {
      const ctx = context ? context() : getContext();
      const { fs } = ctx;
      const path = args[0];
      
      if (!path) {
        return [error('cat: missing file operand')];
      }

      const result = fs.cat(path);
      
      if (!result.success) {
        return [error(result.error)];
      }

      return [text(result.content || '(empty file)')];
    },
  });

  // mkdir - make directory
  registry.registerCommand('mkdir', {
    description: 'Create directory',
    usage: 'mkdir <name> [-p]',
    category: 'filesystem',
    flags: [
      { flag: 'p', description: 'Create parent directories as needed' },
    ],
    requiresArgs: true,
    examples: ['mkdir NewFolder', 'mkdir -p path/to/folder'],
    async execute(args, flagsArg, context) {
      const ctx = context ? context() : getContext();
      const { fs } = ctx;
      const path = args[0];
      
      if (!path) {
        return [error('mkdir: missing operand')];
      }

      const result = fs.mkdir(path, flagsArg);
      
      if (!result.success) {
        return [error(result.error)];
      }

      return [success(`Created directory: ${path}`)];
    },
  });

  // touch - create empty file
  registry.registerCommand('touch', {
    description: 'Create empty file',
    usage: 'touch <filename>',
    category: 'filesystem',
    requiresArgs: true,
    examples: ['touch newfile.txt', 'touch test.js'],
    async execute(args, flags, context) {
      const ctx = context ? context() : getContext();
      const { fs } = ctx;
      const path = args[0];
      
      if (!path) {
        return [error('touch: missing file operand')];
      }

      const result = fs.touch(path);
      
      if (!result.success) {
        return [error(result.error)];
      }

      if (result.created) {
        return [success(`Created file: ${path}`)];
      } else if (result.updated) {
        return [success(`Updated timestamp: ${path}`)];
      }

      return [];
    },
  });

  // find - search for files
  registry.registerCommand('find', {
    description: 'Search for files',
    usage: 'find [path] -name <pattern>',
    category: 'filesystem',
    flags: [
      { flag: 'name', description: 'Search by name pattern' },
      { flag: 'type', description: 'Filter by type (f=file, d=directory)' },
    ],
    examples: ['find . -name "*.js"', 'find /Projects -type d', 'find -name README'],
    async execute(args, flagsArg, context) {
      const ctx = context ? context() : getContext();
      const { fs } = ctx;
      
      let startPath = '.';
      let pattern = '*';
      
      if (flagsArg.name) {
        // find [path] -name pattern
        if (args.length > 0 && !args[0].startsWith('-')) {
          startPath = args[0];
        }
        const nameIndex = args.indexOf('-name');
        if (nameIndex !== -1 && args[nameIndex + 1]) {
          pattern = args[nameIndex + 1];
        }
      }

      const options = {};
      if (flags.type) {
        const typeIndex = args.indexOf('-type');
        if (typeIndex !== -1 && args[typeIndex + 1]) {
          options.type = args[typeIndex + 1];
        }
      }

      const result = fs.find(startPath, pattern, options);
      
      if (!result.success) {
        return [error(result.error)];
      }

      if (result.results.length === 0) {
        return [text('No matches found')];
      }

      return result.results.map(path => text(path));
    },
  });

  // tree - display directory tree
  registry.registerCommand('tree', {
    description: 'Display directory tree',
    usage: 'tree [path] [-L <level>]',
    category: 'filesystem',
    flags: [
      { flag: 'L', description: 'Max display depth' },
    ],
    examples: ['tree', 'tree /Projects', 'tree -L 2'],
    async execute(args, flagsArg, context) {
      const ctx = context ? context() : getContext();
      const { fs } = ctx;
      const path = args[0] || '.';
      let maxDepth = 10;
      
      if (flagsArg.L) {
        const depthIndex = args.indexOf('-L');
        if (depthIndex !== -1 && args[depthIndex + 1]) {
          maxDepth = parseInt(args[depthIndex + 1], 10) || 10;
        }
      }

      const result = fs.tree(path, maxDepth);
      
      if (!result.success) {
        return [error(result.error)];
      }

      const output = [text(result.root)];
      result.tree.forEach(line => {
        if (line.isDir) {
          output.push(colored(line.text, 'directory'));
        } else {
          output.push(text(line.text));
        }
      });

      return output;
    },
  });

  // file - determine file type
  registry.registerCommand('file', {
    description: 'Determine file type',
    usage: 'file <path>',
    category: 'filesystem',
    requiresArgs: true,
    examples: ['file README.md', 'file image.png'],
    async execute(args, flags, context) {
      const ctx = context ? context() : getContext();
      const { fs } = ctx;
      const path = args[0];
      
      if (!path) {
        return [error('file: missing file operand')];
      }

      const result = fs.stat(path);
      
      if (!result.success) {
        return [error(result.error)];
      }

      let typeDescription = result.type;
      if (result.subtype) {
        typeDescription += ` (${result.subtype})`;
      }

      return [text(`${path}: ${typeDescription}`)];
    },
  });

  // head - output first part of file
  registry.registerCommand('head', {
    description: 'Output the first part of file',
    usage: 'head <file> [-n lines]',
    category: 'filesystem',
    flags: [
      { flag: 'n', description: 'Number of lines to show (default: 10)' },
    ],
    requiresArgs: true,
    examples: ['head file.txt', 'head -n 20 log.txt'],
    async execute(args, flagsArg, context) {
      const ctx = context ? context() : getContext();
      const { fs } = ctx;
      const path = args[0];
      
      if (!path) {
        return [error('head: missing file operand')];
      }

      let numLines = 10;
      if (flagsArg.n) {
        const nIndex = args.indexOf('-n');
        if (nIndex !== -1 && args[nIndex + 1]) {
          numLines = parseInt(args[nIndex + 1], 10) || 10;
        }
      }

      const result = fs.cat(path);
      
      if (!result.success) {
        return [error(result.error)];
      }

      const lines = (result.content || '').split('\n');
      const output = lines.slice(0, numLines).join('\n');

      return [text(output)];
    },
  });

  // tail - output last part of file
  registry.registerCommand('tail', {
    description: 'Output the last part of file',
    usage: 'tail <file> [-n lines]',
    category: 'filesystem',
    flags: [
      { flag: 'n', description: 'Number of lines to show (default: 10)' },
    ],
    requiresArgs: true,
    examples: ['tail file.txt', 'tail -n 20 log.txt'],
    async execute(args, flagsArg, context) {
      const ctx = context ? context() : getContext();
      const { fs } = ctx;
      const path = args[0];
      
      if (!path) {
        return [error('tail: missing file operand')];
      }

      let numLines = 10;
      if (flagsArg.n) {
        const nIndex = args.indexOf('-n');
        if (nIndex !== -1 && args[nIndex + 1]) {
          numLines = parseInt(args[nIndex + 1], 10) || 10;
        }
      }

      const result = fs.cat(path);
      
      if (!result.success) {
        return [error(result.error)];
      }

      const lines = (result.content || '').split('\n');
      const output = lines.slice(-numLines).join('\n');

      return [text(output)];
    },
  });

  // wc - word count
  registry.registerCommand('wc', {
    description: 'Print line, word, and byte counts',
    usage: 'wc <file> [-l] [-w] [-c]',
    category: 'filesystem',
    flags: [
      { flag: 'l', description: 'Print line count' },
      { flag: 'w', description: 'Print word count' },
      { flag: 'c', description: 'Print character count' },
    ],
    requiresArgs: true,
    examples: ['wc file.txt', 'wc -l file.txt', 'wc -w -c file.txt'],
    async execute(args, flagsArg, context) {
      const ctx = context ? context() : getContext();
      const { fs } = ctx;
      const path = args[0];
      
      if (!path) {
        return [error('wc: missing file operand')];
      }

      const result = fs.cat(path);
      
      if (!result.success) {
        return [error(result.error)];
      }

      const content = result.content || '';
      const lines = content.split('\n').length;
      const words = content.split(/\s+/).filter(Boolean).length;
      const chars = content.length;

      // If no flags, show all
      const showAll = !flagsArg.l && !flagsArg.w && !flagsArg.c;

      const counts = [];
      if (showAll || flagsArg.l) counts.push(lines);
      if (showAll || flagsArg.w) counts.push(words);
      if (showAll || flagsArg.c) counts.push(chars);

      return [text(`${counts.join(' ')} ${path}`)];
    },
  });

  // du - disk usage
  registry.registerCommand('du', {
    description: 'Estimate file space usage',
    usage: 'du [path] [-h] [-s]',
    category: 'filesystem',
    flags: [
      { flag: 'h', description: 'Human-readable sizes' },
      { flag: 's', description: 'Display only total' },
    ],
    examples: ['du', 'du -h /Projects', 'du -sh .'],
    async execute(args, flagsArg, context) {
      const ctx = context ? context() : getContext();
      const { fs } = ctx;
      const path = args[0] || '.';

      const result = fs.stat(path);
      
      if (!result.success) {
        return [error(result.error)];
      }

      const size = result.size || 0;
      const displaySize = flagsArg.h ? fs.humanReadableSize(size) : size.toString();

      return [text(`${displaySize}\t${path}`)];
    },
  });
}
