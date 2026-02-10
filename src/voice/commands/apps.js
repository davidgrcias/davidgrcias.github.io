/**
 * Voice App Commands
 * Handles app operations like open, close, minimize, maximize, etc.
 */

export function registerAppVoiceCommands(registry, getContext) {
  // OPEN_APP
  registry.registerCommand({
    intent: 'OPEN_APP',
    patterns: [
      'open {appName}',
      'launch {appName}',
      'start {appName}',
      'run {appName}',
      'open the {appName} app',
      'launch the {appName} application',
      'start the {appName} program',
      'show me {appName}',
      'i want to use {appName}',
    ],
    examples: [
      'open terminal',
      'launch file manager',
      'start notes',
      'open the vscode app',
    ],
    entities: {
      appName: {
        type: 'string',
        required: true,
        values: ['terminal', 'vscode', 'filemanager', 'notes', 'messenger', 'settings', 'aboutme', 'blog'],
      },
    },
    category: 'apps',
    description: 'Open an application',
    responses: {
      success: 'Opening {appName}...',
      error: 'Failed to open {appName}. App may not exist.',
    },
    async action(entities) {
      const { os } = getContext();
      
      if (!entities.appName) {
        throw new Error('App name is required');
      }
      
      // Check if app is already open
      const existingWindow = os.windows?.find(w => w.type === entities.appName);
      if (existingWindow) {
        // Focus existing window
        os.focusWindow(existingWindow.id);
        return { 
          success: true, 
          appName: entities.appName, 
          message: `${entities.appName} is already open, focusing...` 
        };
      }
      
      // Open new window
      os.openWindow({
        id: `${entities.appName}-${Date.now()}`,
        type: entities.appName,
        title: entities.appName.charAt(0).toUpperCase() + entities.appName.slice(1),
      });
      
      return { success: true, appName: entities.appName };
    },
  });

  // CLOSE_APP
  registry.registerCommand({
    intent: 'CLOSE_APP',
    patterns: [
      'close {appName}',
      'exit {appName}',
      'quit {appName}',
      'shut {appName}',
      'close the {appName} app',
      'exit the {appName} application',
      'terminate {appName}',
      'kill {appName}',
    ],
    examples: [
      'close terminal',
      'exit file manager',
      'quit notes',
      'close the vscode app',
    ],
    entities: {
      appName: {
        type: 'string',
        required: true,
      },
    },
    category: 'apps',
    description: 'Close an application',
    responses: {
      success: '{appName} closed',
      error: 'Failed to close {appName}. App may not be open.',
    },
    async action(entities) {
      const { os } = getContext();
      
      if (!entities.appName) {
        throw new Error('App name is required');
      }
      
      // Find window by app type
      const window = os.windows?.find(w => w.type === entities.appName);
      
      if (!window) {
        throw new Error(`${entities.appName} is not currently open`);
      }
      
      os.closeWindow(window.id);
      
      return { success: true, appName: entities.appName };
    },
  });

  // CLOSE_ALL_APPS
  registry.registerCommand({
    intent: 'CLOSE_ALL',
    patterns: [
      'close all',
      'close all apps',
      'close everything',
      'quit all',
      'exit all apps',
      'close all windows',
    ],
    examples: [
      'close all',
      'close all apps',
      'close everything',
    ],
    category: 'apps',
    description: 'Close all open applications',
    responses: {
      success: 'All apps closed',
      error: 'Failed to close all apps',
    },
    async action(entities) {
      const { os } = getContext();
      
      const windows = os.windows || [];
      const count = windows.length;
      
      windows.forEach(win => {
        os.closeWindow(win.id);
      });
      
      return { success: true, count };
    },
  });

  // MINIMIZE_APP
  registry.registerCommand({
    intent: 'MINIMIZE_APP',
    patterns: [
      'minimize {appName}',
      'hide {appName}',
      'collapse {appName}',
      'minimize the {appName} window',
    ],
    examples: [
      'minimize terminal',
      'hide file manager',
      'collapse notes',
    ],
    entities: {
      appName: {
        type: 'string',
        required: true,
      },
    },
    category: 'apps',
    description: 'Minimize an application window',
    responses: {
      success: '{appName} minimized',
      error: 'Failed to minimize {appName}',
    },
    async action(entities) {
      const { os } = getContext();
      
      const window = os.windows?.find(w => w.type === entities.appName);
      
      if (!window) {
        throw new Error(`${entities.appName} is not currently open`);
      }
      
      os.minimizeWindow(window.id);
      
      return { success: true, appName: entities.appName };
    },
  });

  // MINIMIZE_ALL
  registry.registerCommand({
    intent: 'MINIMIZE_ALL',
    patterns: [
      'minimize all',
      'minimize everything',
      'hide all windows',
      'collapse all',
      'show desktop',
    ],
    examples: [
      'minimize all',
      'minimize everything',
      'show desktop',
    ],
    category: 'apps',
    description: 'Minimize all windows',
    responses: {
      success: 'All windows minimized',
      error: 'Failed to minimize all windows',
    },
    async action(entities) {
      const { os } = getContext();
      
      const windows = os.windows || [];
      
      windows.forEach(win => {
        if (!win.minimized) {
          os.minimizeWindow(win.id);
        }
      });
      
      return { success: true, count: windows.length };
    },
  });

  // MAXIMIZE_APP
  registry.registerCommand({
    intent: 'MAXIMIZE_APP',
    patterns: [
      'maximize {appName}',
      'fullscreen {appName}',
      'expand {appName}',
      'make {appName} fullscreen',
      'maximize the {appName} window',
    ],
    examples: [
      'maximize terminal',
      'fullscreen vscode',
      'expand file manager',
    ],
    entities: {
      appName: {
        type: 'string',
        required: true,
      },
    },
    category: 'apps',
    description: 'Maximize an application window',
    responses: {
      success: '{appName} maximized',
      error: 'Failed to maximize {appName}',
    },
    async action(entities) {
      const { os } = getContext();
      
      const window = os.windows?.find(w => w.type === entities.appName);
      
      if (!window) {
        throw new Error(`${entities.appName} is not currently open`);
      }
      
      os.maximizeWindow(window.id);
      
      return { success: true, appName: entities.appName };
    },
  });

  // FOCUS_APP
  registry.registerCommand({
    intent: 'FOCUS_APP',
    patterns: [
      'focus {appName}',
      'switch to {appName}',
      'go to {appName}',
      'show {appName}',
      'bring up {appName}',
      'switch to the {appName} window',
    ],
    examples: [
      'focus terminal',
      'switch to vscode',
      'go to file manager',
      'show notes',
    ],
    entities: {
      appName: {
        type: 'string',
        required: true,
      },
    },
    category: 'apps',
    description: 'Focus an application window',
    responses: {
      success: 'Switching to {appName}',
      error: 'Failed to focus {appName}',
    },
    async action(entities) {
      const { os } = getContext();
      
      const window = os.windows?.find(w => w.type === entities.appName);
      
      if (!window) {
        throw new Error(`${entities.appName} is not currently open`);
      }
      
      os.focusWindow(window.id);
      
      return { success: true, appName: entities.appName };
    },
  });

  // LIST_APPS
  registry.registerCommand({
    intent: 'LIST_APPS',
    patterns: [
      'list apps',
      'show apps',
      'what apps are open',
      'list open apps',
      'show open windows',
      'what is running',
      'show running apps',
    ],
    examples: [
      'list apps',
      'what apps are open',
      'show running apps',
    ],
    category: 'apps',
    description: 'List all open applications',
    responses: {
      success: 'Here are the open apps',
      error: 'Failed to list apps',
    },
    async action(entities) {
      const { os } = getContext();
      
      const windows = os.windows || [];
      const appList = windows.map(w => ({
        name: w.type,
        title: w.title,
        minimized: w.minimized,
        maximized: w.maximized,
      }));
      
      return { 
        success: true, 
        apps: appList,
        count: appList.length,
      };
    },
  });

  // PIN_APP
  registry.registerCommand({
    intent: 'PIN_APP',
    patterns: [
      'pin {appName}',
      'pin {appName} to dock',
      'add {appName} to dock',
      'keep {appName} in dock',
    ],
    examples: [
      'pin terminal',
      'pin vscode to dock',
      'add notes to dock',
    ],
    entities: {
      appName: {
        type: 'string',
        required: true,
      },
    },
    category: 'apps',
    description: 'Pin an app to the dock',
    responses: {
      success: '{appName} pinned to dock',
      error: 'Failed to pin {appName}',
    },
    async action(entities) {
      const { os } = getContext();
      
      os.pinToTaskbar(entities.appName);
      
      return { success: true, appName: entities.appName };
    },
  });

  // UNPIN_APP
  registry.registerCommand({
    intent: 'UNPIN_APP',
    patterns: [
      'unpin {appName}',
      'unpin {appName} from dock',
      'remove {appName} from dock',
      'take {appName} off dock',
    ],
    examples: [
      'unpin terminal',
      'unpin vscode from dock',
      'remove notes from dock',
    ],
    entities: {
      appName: {
        type: 'string',
        required: true,
      },
    },
    category: 'apps',
    description: 'Unpin an app from the dock',
    responses: {
      success: '{appName} unpinned from dock',
      error: 'Failed to unpin {appName}',
    },
    async action(entities) {
      const { os } = getContext();
      
      os.unpinFromTaskbar(entities.appName);
      
      return { success: true, appName: entities.appName };
    },
  });

  // NEXT_WINDOW
  registry.registerCommand({
    intent: 'NEXT_WINDOW',
    patterns: [
      'next window',
      'switch window',
      'next app',
      'cycle windows',
      'go to next window',
    ],
    examples: [
      'next window',
      'switch window',
      'next app',
    ],
    category: 'apps',
    description: 'Switch to next window',
    responses: {
      success: 'Switched to next window',
      error: 'No other windows open',
    },
    async action(entities) {
      const { os } = getContext();
      
      const windows = os.windows || [];
      if (windows.length === 0) {
        throw new Error('No windows open');
      }
      
      const currentIndex = windows.findIndex(w => w.focused);
      const nextIndex = (currentIndex + 1) % windows.length;
      
      os.focusWindow(windows[nextIndex].id);
      
      return { success: true, window: windows[nextIndex].type };
    },
  });

  // PREVIOUS_WINDOW
  registry.registerCommand({
    intent: 'PREVIOUS_WINDOW',
    patterns: [
      'previous window',
      'last window',
      'prev window',
      'go to previous window',
      'back to last window',
    ],
    examples: [
      'previous window',
      'last window',
      'prev window',
    ],
    category: 'apps',
    description: 'Switch to previous window',
    responses: {
      success: 'Switched to previous window',
      error: 'No other windows open',
    },
    async action(entities) {
      const { os } = getContext();
      
      const windows = os.windows || [];
      if (windows.length === 0) {
        throw new Error('No windows open');
      }
      
      const currentIndex = windows.findIndex(w => w.focused);
      const prevIndex = currentIndex <= 0 ? windows.length - 1 : currentIndex - 1;
      
      os.focusWindow(windows[prevIndex].id);
      
      return { success: true, window: windows[prevIndex].type };
    },
  });
}

export default registerAppVoiceCommands;
