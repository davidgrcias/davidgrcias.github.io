/**
 * App Management Commands
 * Commands for controlling applications
 */

import { error, success, text, table as tableFormat } from '../outputFormatter.js';

export function registerAppCommands(registry, getContext) {
  // open - launch application
  registry.registerCommand('open', {
    description: 'Launch an application',
    usage: 'open <app-name>',
    category: 'apps',
    requiresArgs: true,
    examples: ['open vscode', 'open terminal', 'open messenger'],
    async execute(args) {
      const { os } = getContext();
      const appName = args[0]?.toLowerCase();
      
      if (!appName) {
        return [error('open: missing app name')];
      }

      // App ID mapping
      const appMap = {
        'vscode': 'vscode',
        'vs': 'vscode',
        'code': 'vscode',
        'terminal': 'terminal',
        'term': 'terminal',
        'messenger': 'messenger',
        'chat': 'messenger',
        'message': 'messenger',
        'settings': 'settings',
        'config': 'settings',
        'about': 'about-me',
        'profile': 'about-me',
        'files': 'file-manager',
        'file': 'file-manager',
        'explorer': 'file-manager',
        'blog': 'blog',
        'notes': 'notes',
        'note': 'notes',
      };

      const appId = appMap[appName] || appName;

      try {
        os.openApp(appId);
        return [success(`Opened ${appId}`)];
      } catch (err) {
        return [error(`open: cannot open '${appName}': ${err.message}`)];
      }
    },
  });

  // close - close application
  registry.registerCommand('close', {
    description: 'Close an application',
    usage: 'close <app-name>',
    category: 'apps',
    requiresArgs: true,
    examples: ['close vscode', 'close terminal'],
    async execute(args) {
      const { os } = getContext();
      const appName = args[0]?.toLowerCase();
      
      if (!appName) {
        return [error('close: missing app name')];
      }

      // Use same app mapping as open
      const appMap = {
        'vscode': 'vscode',
        'vs': 'vscode',
        'code': 'vscode',
        'terminal': 'terminal',
        'term': 'terminal',
        'messenger': 'messenger',
        'chat': 'messenger',
        'settings': 'settings',
        'about': 'about-me',
        'files': 'file-manager',
        'file': 'file-manager',
        'blog': 'blog',
        'notes': 'notes',
      };

      const appId = appMap[appName] || appName;

      try {
        os.closeApp(appId);
        return [success(`Closed ${appId}`)];
      } catch (err) {
        return [error(`close: ${err.message}`)];
      }
    },
  });

  // minimize - minimize application
  registry.registerCommand('minimize', {
    description: 'Minimize an application',
    usage: 'minimize <app-name>',
    category: 'apps',
    requiresArgs: true,
    examples: ['minimize vscode', 'minimize terminal'],
    async execute(args) {
      const { os } = getContext();
      const appName = args[0]?.toLowerCase();
      
      if (!appName) {
        return [error('minimize: missing app name')];
      }

      const appMap = {
        'vscode': 'vscode',
        'terminal': 'terminal',
        'messenger': 'messenger',
        'settings': 'settings',
        'about': 'about-me',
        'files': 'file-manager',
        'blog': 'blog',
        'notes': 'notes',
      };

      const appId = appMap[appName] || appName;

      try {
        os.minimizeApp(appId);
        return [success(`Minimized ${appId}`)];
      } catch (err) {
        return [error(`minimize: ${err.message}`)];
      }
    },
  });

  // maximize - maximize application
  registry.registerCommand('maximize', {
    description: 'Maximize/fullscreen an application',
    usage: 'maximize <app-name>',
    category: 'apps',
    requiresArgs: true,
    examples: ['maximize vscode', 'maximize terminal'],
    async execute(args) {
      const { os } = getContext();
      const appName = args[0]?.toLowerCase();
      
      if (!appName) {
        return [error('maximize: missing app name')];
      }

      const appMap = {
        'vscode': 'vscode',
        'terminal': 'terminal',
        'messenger': 'messenger',
        'settings': 'settings',
        'about': 'about-me',
        'files': 'file-manager',
        'blog': 'blog',
        'notes': 'notes',
      };

      const appId = appMap[appName] || appName;

      try {
        os.maximizeApp(appId);
        return [success(`Maximized ${appId}`)];
      } catch (err) {
        return [error(`maximize: ${err.message}`)];
      }
    },
  });

  // focus - bring app to front
  registry.registerCommand('focus', {
    description: 'Bring app to front',
    usage: 'focus <app-name>',
    category: 'apps',
    requiresArgs: true,
    examples: ['focus vscode'],
    async execute(args) {
      const { os } = getContext();
      const appName = args[0]?.toLowerCase();
      
      if (!appName) {
        return [error('focus: missing app name')];
      }

      const appMap = {
        'vscode': 'vscode',
        'terminal': 'terminal',
        'messenger': 'messenger',
        'settings': 'settings',
        'about': 'about-me',
        'files': 'file-manager',
        'blog': 'blog',
        'notes': 'notes',
      };

      const appId = appMap[appName] || appName;

      try {
        os.focusWindow(appId);
        return [success(`Focused ${appId}`)];
      } catch (err) {
        return [error(`focus: ${err.message}`)];
      }
    },
  });

  // apps - list applications
  registry.registerCommand('apps', {
    description: 'List all available apps',
    usage: 'apps [--running]',
    category: 'apps',
    flags: [
      { flag: 'running', description: 'Show only running apps' },
    ],
    examples: ['apps', 'apps --running'],
    async execute(args, flags) {
      const { os } = getContext();

      if (flags.running) {
        const windows = os?.windows || [];
        
        if (windows.length === 0) {
          return [text('No apps running')];
        }

        const output = [text('Running Apps:')];
        windows.forEach(window => {
          const status = window.minimized ? ' (minimized)' : '';
          output.push(text(`  • ${window.id}${status}`));
        });

        return output;
      }

      // List all available apps
      const apps = [
        'vscode - VS Code / Portfolio',
        'terminal - Terminal',
        'messenger - AI Chatbot',
        'file-manager - File Manager',
        'about-me - About Me',
        'notes - Quick Notes',
        'settings - Settings',
        'blog - Blog',
      ];

      const output = [text('Available Apps:')];
      apps.forEach(app => {
        output.push(text(`  • ${app}`));
      });

      return output;
    },
  });

  // pin - pin app to dock
  registry.registerCommand('pin', {
    description: 'Pin app to dock',
    usage: 'pin <app-name>',
    category: 'apps',
    requiresArgs: true,
    examples: ['pin vscode', 'pin terminal'],
    async execute(args) {
      const { os } = getContext();
      const appName = args[0]?.toLowerCase();
      
      if (!appName) {
        return [error('pin: missing app name')];
      }

      const appMap = {
        'vscode': 'vscode',
        'terminal': 'terminal',
        'messenger': 'messenger',
        'settings': 'settings',
        'about': 'about-me',
        'files': 'file-manager',
        'blog': 'blog',
        'notes': 'notes',
      };

      const appId = appMap[appName] || appName;

      try {
        os.pinApp(appId);
        return [success(`Pinned ${appId} to dock`)];
      } catch (err) {
        return [error(`pin: ${err.message}`)];
      }
    },
  });

  // unpin - unpin app from dock
  registry.registerCommand('unpin', {
    description: 'Unpin app from dock',
    usage: 'unpin <app-name>',
    category: 'apps',
    requiresArgs: true,
    examples: ['unpin vscode'],
    async execute(args) {
      const { os } = getContext();
      const appName = args[0]?.toLowerCase();
      
      if (!appName) {
        return [error('unpin: missing app name')];
      }

      const appMap = {
        'vscode': 'vscode',
        'terminal': 'terminal',
        'messenger': 'messenger',
        'settings': 'settings',
        'about': 'about-me',
        'files': 'file-manager',
        'blog': 'blog',
        'notes': 'notes',
      };

      const appId = appMap[appName] || appName;

      try {
        os.unpinApp(appId);
        return [success(`Unpinned ${appId} from dock`)];
      } catch (err) {
        return [error(`unpin: ${err.message}`)];
      }
    },
  });
}
