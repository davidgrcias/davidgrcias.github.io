/**
 * Notifications Commands
 * Commands for managing system notifications
 */

import { error, success, text, colored } from '../outputFormatter.js';

export function registerNotificationCommands(registry, getContext) {
  // notify - Send notification
  registry.registerCommand('notify', {
    description: 'Send a system notification',
    usage: 'notify <title> [message]',
    category: 'system',
    flags: {
      '-t': 'notification type (success/error/info/warning)',
      '-d': 'duration in ms (default: 3000)',
    },
    examples: [
      'notify "Task Complete"',
      'notify "Build Finished" "Your build completed successfully"',
      'notify -t success "Success!" "Everything worked"',
      'notify -t error "Error" "Something went wrong" -d 5000',
    ],
    async execute(args, flags) {
      const { notification } = getContext();
      
      if (!notification) {
        return [error('Notification context not available')];
      }

      if (args.length === 0) {
        return [error('Usage: notify <title> [message]')];
      }

      const title = args[0];
      const message = args.slice(1).join(' ') || '';
      const type = flags.t || 'info';
      const duration = parseInt(flags.d, 10) || 3000;

      // Validate type
      const validTypes = ['success', 'error', 'info', 'warning'];
      if (!validTypes.includes(type)) {
        return [error(`Invalid type: ${type}. Use: ${validTypes.join(', ')}`)];
      }

      try {
        notification.show({
          title,
          message,
          type,
          duration,
        });

        return [success(`Notification sent: ${title}`)];
      } catch (err) {
        return [error(`Failed to send notification: ${err.message}`)];
      }
    },
  });

  // notifications - List notification history
  registry.registerCommand('notifications', {
    description: 'List notification history',
    usage: 'notifications [-c|--clear]',
    category: 'system',
    flags: {
      '-c, --clear': 'clear notification history',
    },
    examples: ['notifications', 'notifications -c', 'notifications --clear'],
    async execute(args, flags) {
      const { notification } = getContext();
      
      if (!notification) {
        return [error('Notification context not available')];
      }

      // Clear history
      if (flags.c || flags.clear) {
        try {
          notification.clearHistory();
          return [success('Notification history cleared')];
        } catch (err) {
          return [error(`Failed to clear history: ${err.message}`)];
        }
      }

      // Show history
      try {
        const history = notification.getHistory() || [];

        if (history.length === 0) {
          return [text('No notifications yet')];
        }

        const output = [
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info'),
          colored('  Notification History', 'success'),
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info'),
          text(''),
        ];

        history.forEach((notif, index) => {
          const typeColor = {
            success: 'success',
            error: 'error',
            warning: 'warning',
            info: 'info',
          }[notif.type] || 'info';

          output.push(
            colored(`${index + 1}. [${notif.type.toUpperCase()}] ${notif.title}`, typeColor)
          );
          
          if (notif.message) {
            output.push(text(`   ${notif.message}`));
          }
          
          output.push(text(`   ${new Date(notif.timestamp).toLocaleString()}`));
          output.push(text(''));
        });

        output.push(colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info'));

        return output;
      } catch (err) {
        return [error(`Failed to get history: ${err.message}`)];
      }
    },
  });

  // alert - System alert (browser alert)
  registry.registerCommand('alert', {
    description: 'Show browser alert dialog',
    usage: 'alert <message>',
    category: 'system',
    examples: ['alert "Hello World!"', 'alert "Important Message"'],
    async execute(args) {
      if (args.length === 0) {
        return [error('Usage: alert <message>')];
      }

      const message = args.join(' ');

      try {
        window.alert(message);
        return [success('Alert shown')];
      } catch (err) {
        return [error(`Failed to show alert: ${err.message}`)];
      }
    },
  });

  // confirm - Browser confirm dialog
  registry.registerCommand('confirm', {
    description: 'Show browser confirm dialog',
    usage: 'confirm <message>',
    category: 'system',
    examples: ['confirm "Are you sure?"', 'confirm "Delete file?"'],
    async execute(args) {
      if (args.length === 0) {
        return [error('Usage: confirm <message>')];
      }

      const message = args.join(' ');

      try {
        const result = window.confirm(message);
        return result 
          ? [success('User confirmed')] 
          : [text('User cancelled')];
      } catch (err) {
        return [error(`Failed to show confirm: ${err.message}`)];
      }
    },
  });

  // prompt - Browser prompt dialog
  registry.registerCommand('prompt', {
    description: 'Show browser prompt dialog',
    usage: 'prompt <message> [default]',
    category: 'system',
    examples: ['prompt "Enter your name"', 'prompt "Enter value" "default"'],
    async execute(args) {
      if (args.length === 0) {
        return [error('Usage: prompt <message> [default]')];
      }

      const message = args[0];
      const defaultValue = args.slice(1).join(' ') || '';

      try {
        const result = window.prompt(message, defaultValue);
        return result !== null
          ? [success(`User entered: ${result}`)]
          : [text('User cancelled')];
      } catch (err) {
        return [error(`Failed to show prompt: ${err.message}`)];
      }
    },
  });
}
