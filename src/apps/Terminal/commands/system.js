/**
 * System Commands
 * System-related commands
 */

import { error, success, text, colored, table as tableFormat } from '../outputFormatter.js';

export function registerSystemCommands(registry, getContext) {
  // whoami - display current user
  registry.registerCommand('whoami', {
    description: 'Display current user',
    usage: 'whoami',
    category: 'system',
    examples: ['whoami'],
    async execute() {
      const { env } = getContext();
      return [text(env.USER || 'david')];
    },
  });

  // hostname - display system hostname
  registry.registerCommand('hostname', {
    description: 'Display system hostname',
    usage: 'hostname',
    category: 'system',
    examples: ['hostname'],
    async execute() {
      const { env } = getContext();
      return [text(env.HOSTNAME || 'david-webos')];
    },
  });

  // uname - system information
  registry.registerCommand('uname', {
    description: 'Print system information',
    usage: 'uname [-a]',
    category: 'system',
    flags: [
      { flag: 'a', description: 'Print all information' },
    ],
    examples: ['uname', 'uname -a'],
    async execute(args, flags) {
      const { env } = getContext();
      
      if (flags.a) {
        const info = [
          'WebOS',
          env.HOSTNAME || 'david-webos',
          env.VERSION || '2.0.0',
          'React 18.2',
          navigator.platform || 'Web',
          navigator.userAgent.split(' ').pop() || 'Browser',
        ];
        return [text(info.join(' '))];
      }
      
      return [text('WebOS')];
    },
  });

  // uptime - show system uptime
  registry.registerCommand('uptime', {
    description: 'Show system uptime',
    usage: 'uptime',
    category: 'system',
    examples: ['uptime'],
    async execute() {
      const { startTime } = getContext();
      const uptime = Date.now() - startTime;
      const seconds = Math.floor(uptime / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      let uptimeStr = '';
      if (days > 0) uptimeStr += `${days} day${days !== 1 ? 's' : ''}, `;
      if (hours % 24 > 0) uptimeStr += `${hours % 24}:`;
      uptimeStr += `${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

      return [text(`up ${uptimeStr}`)];
    },
  });

  // date - display current date and time
  registry.registerCommand('date', {
    description: 'Display current date and time',
    usage: 'date',
    category: 'system',
    examples: ['date'],
    async execute() {
      const now = new Date();
      return [text(now.toString())];
    },
  });

  // ps - list running processes
  registry.registerCommand('ps', {
    description: 'List running processes',
    usage: 'ps',
    category: 'system',
    examples: ['ps'],
    async execute() {
      const { os } = getContext();
      const windows = os?.windows || [];
      
      if (windows.length === 0) {
        return [text('No processes running')];
      }

      const output = [text('PID  APP               STATUS')];
      windows.forEach((window, index) => {
        const pid = (index + 1).toString().padEnd(5);
        const app = window.id.padEnd(18);
        const status = window.minimized ? 'Minimized' : 'Running';
        output.push(text(`${pid}${app}${status}`));
      });

      return output;
    },
  });

  // kill - close an app
  registry.registerCommand('kill', {
    description: 'Close an app/process',
    usage: 'kill <app-id>',
    category: 'system',
    requiresArgs: true,
    examples: ['kill terminal', 'kill vscode'],
    async execute(args) {
      const { os } = getContext();
      const appId = args[0];
      
      if (!appId) {
        return [error('kill: missing app-id')];
      }

      try {
        os.closeApp(appId);
        return [success(`Killed process: ${appId}`)];
      } catch (err) {
        return [error(`kill: ${err.message}`)];
      }
    },
  });

  // env - show environment variables
  registry.registerCommand('env', {
    description: 'Show environment variables',
    usage: 'env',
    category: 'system',
    examples: ['env'],
    async execute() {
      const { env } = getContext();
      const output = [];
      
      for (const [key, value] of Object.entries(env)) {
        output.push(text(`${key}=${value}`));
      }

      return output;
    },
  });

  // export - set environment variable
  registry.registerCommand('export', {
    description: 'Set environment variable',
    usage: 'export KEY=VALUE',
    category: 'system',
    requiresArgs: true,
    examples: ['export PATH=/usr/bin', 'export EDITOR=vim'],
    async execute(args) {
      const { env, setEnv } = getContext();
      const input = args.join(' ');
      
      if (!input.includes('=')) {
        return [error('export: invalid format. Use KEY=VALUE')];
      }

      const [key, ...valueParts] = input.split('=');
      const value = valueParts.join('=');

      setEnv(key.trim(), value.trim());
      return [success(`Exported ${key}=${value}`)];
    },
  });

  // shutdown - shutdown system
  registry.registerCommand('shutdown', {
    description: 'Shutdown system',
    usage: 'shutdown',
    category: 'system',
    examples: ['shutdown'],
    async execute() {
      const { os } = getContext();
      
      try {
        os.shutdownOS();
        return [success('Shutting down...')];
      } catch (err) {
        return [error(`shutdown: ${err.message}`)];
      }
    },
  });

  // reboot - restart system
  registry.registerCommand('reboot', {
    description: 'Restart system',
    usage: 'reboot',
    category: 'system',
    aliases: ['restart'],
    examples: ['reboot', 'restart'],
    async execute() {
      const { os } = getContext();
      
      try {
        os.restartOS();
        return [success('Restarting...')];
      } catch (err) {
        return [error(`reboot: ${err.message}`)];
      }
    },
  });

  // lock - lock the screen
  registry.registerCommand('lock', {
    description: 'Lock the screen',
    usage: 'lock',
    category: 'system',
    examples: ['lock'],
    async execute() {
      const { os } = getContext();
      
      try {
        os.lockScreen();
        return [success('Screen locked')];
      } catch (err) {
        return [error(`lock: ${err.message}`)];
      }
    },
  });

  // sleep - put system to sleep
  registry.registerCommand('sleep', {
    description: 'Put system to sleep',
    usage: 'sleep',
    category: 'system',
    examples: ['sleep'],
    async execute() {
      const { os } = getContext();
      
      try {
        os.sleepOS();
        return [success('Going to sleep...')];
      } catch (err) {
        return [error(`sleep: ${err.message}`)];
      }
    },
  });

  // history - show command history
  registry.registerCommand('history', {
    description: 'Show command history',
    usage: 'history [-c]',
    category: 'system',
    flags: [
      { flag: 'c', description: 'Clear history' },
    ],
    examples: ['history', 'history -c'],
    async execute(args, flags) {
      const { commandHistory, clearHistory } = getContext();
      
      if (flags.c) {
        clearHistory();
        return [success('History cleared')];
      }

      if (!commandHistory || commandHistory.length === 0) {
        return [text('No commands in history')];
      }

      return commandHistory.map((cmd, index) => 
        text(`${index + 1}  ${cmd}`)
      );
    },
  });

  // alias - create command alias
  registry.registerCommand('alias', {
    description: 'Create command alias',
    usage: 'alias [name=\'command\']',
    category: 'system',
    examples: ['alias ll=\'ls -la\'', 'alias'],
    async execute(args) {
      const { aliases, setAlias } = getContext();
      
      if (args.length === 0) {
        // Show all aliases
        const output = [];
        for (const [name, command] of Object.entries(aliases)) {
          output.push(text(`${name}='${command}'`));
        }
        return output.length > 0 ? output : [text('No aliases defined')];
      }

      const input = args.join(' ');
      if (!input.includes('=')) {
        return [error('alias: invalid format. Use name=\'command\'')];
      }

      const [name, ...cmdParts] = input.split('=');
      const command = cmdParts.join('=').replace(/^['"]|['"]$/g, '');

      setAlias(name.trim(), command.trim());
      return [success(`Alias created: ${name}='${command}'`)];
    },
  });

  // unalias - remove command alias
  registry.registerCommand('unalias', {
    description: 'Remove command alias',
    usage: 'unalias <name>',
    category: 'system',
    requiresArgs: true,
    examples: ['unalias ll'],
    async execute(args) {
      const { removeAlias } = getContext();
      const name = args[0];
      
      if (!name) {
        return [error('unalias: missing name')];
      }

      const removed = removeAlias(name);
      if (removed) {
        return [success(`Removed alias: ${name}`)];
      } else {
        return [error(`unalias: ${name}: not found`)];
      }
    },
  });
}
