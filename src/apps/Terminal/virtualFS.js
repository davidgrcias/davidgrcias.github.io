/**
 * Virtual Filesystem
 * Wraps fileManagerData.js into a navigable filesystem
 */

class VirtualFS {
  constructor(fileManagerData) {
    this.data = fileManagerData || { name: 'Home', type: 'folder', children: [] };
    this.currentPath = '/';
    this.history = ['/'];
    this.historyIndex = 0;
    
    // Track created files/folders (not in original data)
    this.virtualNodes = new Map();
  }

  /**
   * Get current working directory
   */
  pwd() {
    return this.currentPath;
  }

  /**
   * Change directory
   */
  cd(path) {
    if (!path || path === '') {
      // cd with no args goes to home
      this.currentPath = '/';
      return { success: true, path: this.currentPath };
    }

    if (path === '-') {
      // cd - goes to previous directory
      if (this.history.length > 1) {
        this.historyIndex = Math.max(0, this.historyIndex - 1);
        this.currentPath = this.history[this.historyIndex];
      }
      return { success: true, path: this.currentPath };
    }

    const targetPath = this.resolvePath(path);
    const node = this.getNode(targetPath);

    if (!node) {
      return { success: false, error: `cd: ${path}: No such directory` };
    }

    if (node.type !== 'folder') {
      return { success: false, error: `cd: ${path}: Not a directory` };
    }

    this.currentPath = targetPath;
    this.history.push(targetPath);
    this.historyIndex = this.history.length - 1;

    return { success: true, path: this.currentPath };
  }

  /**
   * List directory contents
   */
  ls(path = '.', flags = {}) {
    const targetPath = this.resolvePath(path);
    const node = this.getNode(targetPath);

    if (!node) {
      return { success: false, error: `ls: cannot access '${path}': No such file or directory` };
    }

    if (node.type === 'file') {
      // Listing a file just shows the file
      return {
        success: true,
        items: [this.formatLsItem(node, flags)],
        total: 1,
      };
    }

    // List directory contents
    const children = node.children || [];
    let items = children.map(child => this.formatLsItem(child, flags));

    // Add . and .. if -a flag
    if (flags.a) {
      items.unshift(
        this.formatLsItem({ name: '..', type: 'folder', size: 4096 }, flags),
        this.formatLsItem({ name: '.', type: 'folder', size: 4096 }, flags)
      );
    }

    // Sort: directories first, then alphabetically
    items.sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return a.name.localeCompare(b.name);
    });

    return {
      success: true,
      items,
      total: items.length,
    };
  }

  /**
   * Format item for ls output
   */
  formatLsItem(node, flags = {}) {
    const isDir = node.type === 'folder';
    const size = node.size || (isDir ? 4096 : 0);
    const displayName = isDir ? `${node.name}/` : node.name;

    const item = {
      name: displayName,
      rawName: node.name,
      isDir,
      size,
      type: node.type,
      subtype: node.subtype,
    };

    if (flags.l) {
      // Long format
      const permissions = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
      const links = isDir ? (node.children?.length || 2) : 1;
      const owner = 'david';
      const group = 'david';
      const sizeStr = flags.h ? this.humanReadableSize(size) : size.toString();
      const date = node.modified || 'Feb 10 2026';

      item.long = `${permissions}  ${links} ${owner} ${group} ${sizeStr.padStart(6)} ${date} ${displayName}`;
    }

    return item;
  }

  /**
   * Read file contents
   */
  cat(path) {
    const targetPath = this.resolvePath(path);
    const node = this.getNode(targetPath);

    if (!node) {
      return { success: false, error: `cat: ${path}: No such file or directory` };
    }

    if (node.type === 'folder') {
      return { success: false, error: `cat: ${path}: Is a directory` };
    }

    return {
      success: true,
      content: node.content || '',
      name: node.name,
      type: node.subtype || node.type,
    };
  }

  /**
   * Create directory
   */
  mkdir(path, flags = {}) {
    const targetPath = this.resolvePath(path);
    const parentPath = this.dirname(targetPath);
    const dirName = this.basename(targetPath);

    if (this.exists(targetPath)) {
      return { success: false, error: `mkdir: cannot create directory '${path}': File exists` };
    }

    const parent = this.getNode(parentPath);
    
    if (!parent) {
      if (flags.p) {
        // Create parent directories recursively
        const parts = targetPath.split('/').filter(Boolean);
        let currentPath = '/';
        
        for (const part of parts) {
          currentPath = currentPath === '/' ? `/${part}` : `${currentPath}/${part}`;
          if (!this.exists(currentPath)) {
            this.virtualNodes.set(currentPath, {
              name: part,
              type: 'folder',
              children: [],
              created: new Date().toISOString(),
            });
          }
        }
        
        return { success: true, path: targetPath };
      }
      return { success: false, error: `mkdir: cannot create directory '${path}': No such file or directory` };
    }

    if (parent.type !== 'folder') {
      return { success: false, error: `mkdir: cannot create directory '${path}': Not a directory` };
    }

    // Create virtual directory
    const newDir = {
      name: dirName,
      type: 'folder',
      children: [],
      created: new Date().toISOString(),
    };

    this.virtualNodes.set(targetPath, newDir);

    return { success: true, path: targetPath };
  }

  /**
   * Create empty file
   */
  touch(path) {
    const targetPath = this.resolvePath(path);
    const parentPath = this.dirname(targetPath);
    const fileName = this.basename(targetPath);

    if (this.exists(targetPath)) {
      // File exists, update modified time
      const node = this.getNode(targetPath);
      if (this.virtualNodes.has(targetPath)) {
        this.virtualNodes.get(targetPath).modified = new Date().toISOString();
      }
      return { success: true, path: targetPath, updated: true };
    }

    const parent = this.getNode(parentPath);
    
    if (!parent) {
      return { success: false, error: `touch: cannot touch '${path}': No such file or directory` };
    }

    if (parent.type !== 'folder') {
      return { success: false, error: `touch: cannot touch '${path}': Not a directory` };
    }

    // Create virtual file
    const newFile = {
      name: fileName,
      type: 'file',
      content: '',
      size: 0,
      created: new Date().toISOString(),
    };

    this.virtualNodes.set(targetPath, newFile);

    return { success: true, path: targetPath, created: true };
  }

  /**
   * Get file/directory stats
   */
  stat(path) {
    const targetPath = this.resolvePath(path);
    const node = this.getNode(targetPath);

    if (!node) {
      return { success: false, error: `stat: cannot stat '${path}': No such file or directory` };
    }

    return {
      success: true,
      path: targetPath,
      name: node.name,
      type: node.type,
      subtype: node.subtype,
      size: node.size || 0,
      created: node.created,
      modified: node.modified,
      isDir: node.type === 'folder',
    };
  }

  /**
   * Find files matching pattern
   */
  find(startPath = '.', pattern = '*', options = {}) {
    const targetPath = this.resolvePath(startPath);
    const node = this.getNode(targetPath);

    if (!node) {
      return { success: false, error: `find: '${startPath}': No such file or directory` };
    }

    const results = [];
    this.findRecursive(node, targetPath, pattern, options, results);

    return {
      success: true,
      results,
      count: results.length,
    };
  }

  /**
   * Recursive find helper
   */
  findRecursive(node, path, pattern, options, results) {
    // Check if current node matches
    if (this.matchPattern(node.name, pattern)) {
      if (options.type) {
        if (options.type === 'f' && node.type === 'file') {
          results.push(path);
        } else if (options.type === 'd' && node.type === 'folder') {
          results.push(path);
        }
      } else {
        results.push(path);
      }
    }

    // Recurse into children
    if (node.type === 'folder' && node.children) {
      for (const child of node.children) {
        const childPath = path === '/' ? `/${child.name}` : `${path}/${child.name}`;
        this.findRecursive(child, childPath, pattern, options, results);
      }
    }
  }

  /**
   * Generate directory tree
   */
  tree(startPath = '.', maxDepth = 10) {
    const targetPath = this.resolvePath(startPath);
    const node = this.getNode(targetPath);

    if (!node) {
      return { success: false, error: `tree: '${startPath}': No such file or directory` };
    }

    if (node.type !== 'folder') {
      return { success: false, error: `tree: '${startPath}': Not a directory` };
    }

    const tree = this.buildTree(node, 0, maxDepth, '', true);
    
    return {
      success: true,
      tree,
      root: node.name,
    };
  }

  /**
   * Build tree structure recursively
   */
  buildTree(node, depth, maxDepth, prefix, isLast) {
    if (depth >= maxDepth) return [];

    const lines = [];
    const children = node.children || [];
    
    children.forEach((child, index) => {
      const isLastChild = index === children.length - 1;
      const connector = isLastChild ? '└── ' : '├── ';
      const extension = isLastChild ? '    ' : '│   ';
      const name = child.type === 'folder' ? `${child.name}/` : child.name;
      
      lines.push({
        text: `${prefix}${connector}${name}`,
        isDir: child.type === 'folder',
        depth,
      });

      if (child.type === 'folder') {
        const childLines = this.buildTree(
          child,
          depth + 1,
          maxDepth,
          prefix + extension,
          false
        );
        lines.push(...childLines);
      }
    });

    return lines;
  }

  // Utility methods

  resolvePath(path) {
    if (path.startsWith('/')) {
      return this.normalize(path);
    }

    if (path === '~') {
      return '/';
    }

    if (path.startsWith('~/')) {
      return this.normalize('/' + path.slice(2));
    }

    if (path === '.') {
      return this.currentPath;
    }

    if (path === '..') {
      return this.dirname(this.currentPath);
    }

    return this.normalize(`${this.currentPath}/${path}`);
  }

  normalize(path) {
    const parts = path.split('/').filter(Boolean);
    const resolved = [];

    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        resolved.pop();
      } else {
        resolved.push(part);
      }
    }

    return '/' + resolved.join('/');
  }

  getNode(path) {
    // Check virtual nodes first
    if (this.virtualNodes.has(path)) {
      return this.virtualNodes.get(path);
    }

    // Check original data
    if (path === '/') return this.data;

    const parts = path.split('/').filter(Boolean);
    let current = this.data;

    for (const part of parts) {
      if (!current.children) return null;
      current = current.children.find(child => child.name === part);
      if (!current) return null;
    }

    return current;
  }

  exists(path) {
    return this.getNode(path) !== null;
  }

  isDirectory(path) {
    const node = this.getNode(path);
    return node?.type === 'folder';
  }

  basename(path) {
    const normalized = this.normalize(path);
    const parts = normalized.split('/').filter(Boolean);
    return parts[parts.length - 1] || '/';
  }

  dirname(path) {
    const normalized = this.normalize(path);
    if (normalized === '/') return '/';
    const parts = normalized.split('/').filter(Boolean);
    parts.pop();
    return '/' + parts.join('/');
  }

  matchPattern(name, pattern) {
    if (pattern === '*') return true;
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
    return regex.test(name);
  }

  humanReadableSize(bytes) {
    const units = ['B', 'K', 'M', 'G', 'T'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${Math.round(size)}${units[unitIndex]}`;
  }
}

export default VirtualFS;
