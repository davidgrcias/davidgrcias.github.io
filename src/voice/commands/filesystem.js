/**
 * Voice Filesystem Commands
 * Handles virtual filesystem operations via voice
 */

export function registerFilesystemVoiceCommands(registry, getContext) {
  // LIST_FILES
  registry.registerCommand({
    intent: 'LIST_FILES',
    patterns: [
      'list files',
      'show files',
      'what files',
      'show directory',
      'list directory',
    ],
    examples: [
      'list files',
      'show files',
      'what files',
    ],
    category: 'filesystem',
    description: 'List files in current directory',
    responses: {
      success: 'Listing files',
      error: 'Failed to list files',
    },
    async action(entities) {
      const { os } = getContext();
      
      // Open file manager
      os.openWindow({
        id: `filemanager-${Date.now()}`,
        type: 'filemanager',
        title: 'File Manager',
      });
      
      return { success: true };
    },
  });

  // OPEN_FILE
  registry.registerCommand({
    intent: 'OPEN_FILE',
    patterns: [
      'open file {fileName}',
      'open {fileName}',
      'show file {fileName}',
      'display file {fileName}',
    ],
    examples: [
      'open file index.html',
      'open readme.md',
      'show file package.json',
    ],
    entities: {
      fileName: {
        type: 'string',
        required: true,
      },
    },
    category: 'filesystem',
    description: 'Open a file',
    responses: {
      success: 'Opening file {fileName}',
      error: 'Failed to open file {fileName}',
    },
    async action(entities) {
      const { os } = getContext();
      
      // Open VSCode with the file
      os.openWindow({
        id: `vscode-${Date.now()}`,
        type: 'vscode',
        title: 'VS Code',
        initialFile: entities.fileName,
      });
      
      return { success: true, fileName: entities.fileName };
    },
  });

  // CREATE_FOLDER
  registry.registerCommand({
    intent: 'CREATE_FOLDER',
    patterns: [
      'create folder {folderName}',
      'make folder {folderName}',
      'new folder {folderName}',
      'create directory {folderName}',
    ],
    examples: [
      'create folder projects',
      'make folder docs',
      'new folder images',
    ],
    entities: {
      folderName: {
        type: 'string',
        required: true,
      },
    },
    category: 'filesystem',
    description: 'Create a new folder',
    responses: {
      success: 'Created folder {folderName}',
      error: 'Failed to create folder {folderName}',
    },
    async action(entities) {
      const { notification } = getContext();
      
      notification.addNotification({
        title: 'Folder Created',
        message: `Folder "${entities.folderName}" has been created`,
        type: 'success',
      });
      
      return { success: true, folderName: entities.folderName };
    },
  });

  // DELETE_FILE
  registry.registerCommand({
    intent: 'DELETE_FILE',
    patterns: [
      'delete file {fileName}',
      'remove file {fileName}',
      'delete {fileName}',
    ],
    examples: [
      'delete file temp.txt',
      'remove file old.js',
      'delete backup',
    ],
    entities: {
      fileName: {
        type: 'string',
        required: true,
      },
    },
    category: 'filesystem',
    description: 'Delete a file',
    responses: {
      success: 'Deleted file {fileName}',
      error: 'Failed to delete file {fileName}',
    },
    async action(entities) {
      const { notification } = getContext();
      
      notification.addNotification({
        title: 'File Deleted',
        message: `File "${entities.fileName}" has been deleted`,
        type: 'warning',
      });
      
      return { success: true, fileName: entities.fileName };
    },
  });

  // NAVIGATE_TO
  registry.registerCommand({
    intent: 'NAVIGATE_TO_PATH',
    patterns: [
      'navigate to {path}',
      'go to {path}',
      'change directory to {path}',
      'cd {path}',
    ],
    examples: [
      'navigate to documents',
      'go to projects',
      'change directory to home',
    ],
    entities: {
      path: {
        type: 'string',
        required: true,
      },
    },
    category: 'filesystem',
    description: 'Navigate to directory',
    responses: {
      success: 'Navigated to {path}',
      error: 'Failed to navigate to {path}',
    },
    async action(entities) {
      const { notification } = getContext();
      
      notification.addNotification({
        title: 'Directory Changed',
        message: `Now in ${entities.path}`,
        type: 'info',
      });
      
      return { success: true, path: entities.path };
    },
  });
}

export default registerFilesystemVoiceCommands;
