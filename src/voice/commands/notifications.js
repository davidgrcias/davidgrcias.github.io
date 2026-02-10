/**
 * Voice Notification Commands
 * Handles notification system operations
 */

export function registerNotificationVoiceCommands(registry, getContext) {
  // SHOW_NOTIFICATIONS
  registry.registerCommand({
    intent: 'SHOW_NOTIFICATIONS',
    patterns: [
      'show notifications',
      'notifications',
      'show alerts',
      'what notifications',
      'check notifications',
    ],
    examples: [
      'show notifications',
      'notifications',
      'check notifications',
    ],
    category: 'notifications',
    description: 'Show notifications',
    responses: {
      success: 'Showing notifications',
      error: 'Failed to show notifications',
    },
    async action(entities) {
      const { notification, os } = getContext();
      
      // Toggle notification center
      os.setNotificationCenterOpen(true);
      
      return { success: true };
    },
  });

  // CLEAR_NOTIFICATIONS
  registry.registerCommand({
    intent: 'CLEAR_NOTIFICATIONS',
    patterns: [
      'clear notifications',
      'clear all notifications',
      'dismiss notifications',
      'remove notifications',
      'delete notifications',
    ],
    examples: [
      'clear notifications',
      'clear all notifications',
      'dismiss notifications',
    ],
    category: 'notifications',
    description: 'Clear all notifications',
    responses: {
      success: 'Notifications cleared',
      error: 'Failed to clear notifications',
    },
    async action(entities) {
      const { notification } = getContext();
      
      notification.clearAllNotifications();
      
      return { success: true };
    },
  });

  // READ_NOTIFICATION
  registry.registerCommand({
    intent: 'READ_NOTIFICATION',
    patterns: [
      'read notification',
      'read notifications',
      'what are my notifications',
      'tell me notifications',
    ],
    examples: [
      'read notification',
      'what are my notifications',
      'tell me notifications',
    ],
    category: 'notifications',
    description: 'Read notifications aloud',
    responses: {
      success: 'Reading notifications',
      error: 'No notifications to read',
    },
    async action(entities) {
      const { notification } = getContext();
      
      const notifications = notification.notifications || [];
      
      if (notifications.length === 0) {
        throw new Error('No notifications');
      }
      
      return { 
        success: true, 
        notifications,
        count: notifications.length,
      };
    },
  });

  // CREATE_NOTIFICATION
  registry.registerCommand({
    intent: 'CREATE_NOTIFICATION',
    patterns: [
      'notify me {message}',
      'create notification {message}',
      'remind me {message}',
      'alert me {message}',
    ],
    examples: [
      'notify me meeting at 3pm',
      'remind me call john',
      'alert me finish project',
    ],
    entities: {
      message: {
        type: 'string',
        required: true,
      },
    },
    category: 'notifications',
    description: 'Create a notification',
    responses: {
      success: 'Notification created',
      error: 'Failed to create notification',
    },
    async action(entities) {
      const { notification } = getContext();
      
      notification.addNotification({
        title: 'Voice Reminder',
        message: entities.message,
        type: 'info',
      });
      
      return { success: true, message: entities.message };
    },
  });

  // ALERT
  registry.registerCommand({
    intent: 'ALERT',
    patterns: [
      'alert {message}',
      'show alert {message}',
    ],
    examples: [
      'alert important task',
      'show alert deadline',
    ],
    entities: {
      message: {
        type: 'string',
        required: true,
      },
    },
    category: 'notifications',
    description: 'Show an alert',
    responses: {
      success: 'Alert shown',
      error: 'Failed to show alert',
    },
    async action(entities) {
      const { notification } = getContext();
      
      notification.addNotification({
        title: 'Alert',
        message: entities.message,
        type: 'warning',
      });
      
      return { success: true, message: entities.message };
    },
  });

  // COUNT_NOTIFICATIONS
  registry.registerCommand({
    intent: 'COUNT_NOTIFICATIONS',
    patterns: [
      'how many notifications',
      'count notifications',
      'notification count',
      'number of notifications',
    ],
    examples: [
      'how many notifications',
      'count notifications',
      'notification count',
    ],
    category: 'notifications',
    description: 'Get notification count',
    responses: {
      success: 'You have {count} notifications',
      error: 'Failed to count notifications',
    },
    async action(entities) {
      const { notification } = getContext();
      
      const notifications = notification.notifications || [];
      const count = notifications.length;
      
      return { success: true, count };
    },
  });
}

export default registerNotificationVoiceCommands;
