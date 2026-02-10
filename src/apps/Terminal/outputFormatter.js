/**
 * Terminal Output Formatter
 * Formats command output with colors, tables, ASCII art, etc.
 */

export const OutputTypes = {
  TEXT: 'text',
  COLORED: 'colored',
  TABLE: 'table',
  TREE: 'tree',
  ASCII: 'ascii',
  PROGRESS: 'progress',
  LINK: 'link',
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info',
  DIVIDER: 'divider',
  GROUP: 'group',
  JSON: 'json',
};

/**
 * Create text output
 */
export function text(content) {
  return { type: OutputTypes.TEXT, content };
}

/**
 * Create colored text output
 */
export function colored(content, color) {
  return { type: OutputTypes.COLORED, content, color };
}

/**
 * Create error output
 */
export function error(message) {
  return { type: OutputTypes.ERROR, content: `✗ ${message}` };
}

/**
 * Create success output
 */
export function success(message) {
  return { type: OutputTypes.SUCCESS, content: `✓ ${message}` };
}

/**
 * Create warning output
 */
export function warning(message) {
  return { type: OutputTypes.WARNING, content: `⚠ ${message}` };
}

/**
 * Create info output
 */
export function info(message) {
  return { type: OutputTypes.INFO, content: `ℹ ${message}` };
}

/**
 * Create table output
 */
export function table(headers, rows) {
  return {
    type: OutputTypes.TABLE,
    headers,
    rows,
  };
}

/**
 * Create tree output
 */
export function tree(lines) {
  return {
    type: OutputTypes.TREE,
    lines,
  };
}

/**
 * Create ASCII art output
 */
export function ascii(content) {
  return {
    type: OutputTypes.ASCII,
    content,
  };
}

/**
 * Create progress bar output
 */
export function progress(percent, label = '') {
  return {
    type: OutputTypes.PROGRESS,
    percent: Math.min(100, Math.max(0, percent)),
    label,
  };
}

/**
 * Create link output
 */
export function link(text, url) {
  return {
    type: OutputTypes.LINK,
    text,
    url,
  };
}

/**
 * Create divider output
 */
export function divider() {
  return {
    type: OutputTypes.DIVIDER,
  };
}

/**
 * Create JSON output
 */
export function json(data) {
  return {
    type: OutputTypes.JSON,
    content: JSON.stringify(data, null, 2),
  };
}

/**
 * Create group output
 */
export function group(title, items) {
  return {
    type: OutputTypes.GROUP,
    title,
    items,
  };
}

/**
 * Format table data into aligned columns
 */
export function formatTable(headers, rows, options = {}) {
  const { padding = 2, headerDivider = true } = options;

  // Calculate column widths
  const colWidths = headers.map((header, i) => {
    const headerWidth = header.length;
    const maxRowWidth = Math.max(
      ...rows.map(row => (row[i]?.toString() || '').length)
    );
    return Math.max(headerWidth, maxRowWidth);
  });

  // Format header
  const headerRow = headers
    .map((header, i) => header.padEnd(colWidths[i] + padding))
    .join('');

  const lines = [headerRow];

  // Add divider
  if (headerDivider) {
    const divider = colWidths
      .map(width => '-'.repeat(width + padding))
      .join('');
    lines.push(divider);
  }

  // Format rows
  rows.forEach(row => {
    const formattedRow = row
      .map((cell, i) => (cell?.toString() || '').padEnd(colWidths[i] + padding))
      .join('');
    lines.push(formattedRow);
  });

  return lines.join('\n');
}

/**
 * Create progress bar string
 */
export function formatProgressBar(percent, width = 30, options = {}) {
  const { filled = '█', empty = '░', showPercent = true } = options;
  
  const filledWidth = Math.round((percent / 100) * width);
  const emptyWidth = width - filledWidth;
  
  const bar = filled.repeat(filledWidth) + empty.repeat(emptyWidth);
  
  if (showPercent) {
    return `[${bar}] ${percent}%`;
  }
  
  return `[${bar}]`;
}

/**
 * Wrap text to fit terminal width
 */
export function wrapText(text, width = 80) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > width) {
      if (currentLine) {
        lines.push(currentLine.trim());
      }
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });

  if (currentLine) {
    lines.push(currentLine.trim());
  }

  return lines;
}

/**
 * Pad string to center it
 */
export function center(text, width) {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(padding) + text;
}

/**
 * Create box around text
 */
export function box(lines, options = {}) {
  const { padding = 1, style = 'single' } = options;
  
  const styles = {
    single: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
    double: { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
    rounded: { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
    bold: { tl: '┏', tr: '┓', bl: '┗', br: '┛', h: '━', v: '┃' },
  };

  const chars = styles[style] || styles.single;
  const maxWidth = Math.max(...lines.map(l => l.length));
  const innerWidth = maxWidth + (padding * 2);

  const result = [];
  
  // Top border
  result.push(chars.tl + chars.h.repeat(innerWidth) + chars.tr);
  
  // Content with padding
  lines.forEach(line => {
    const padded = line.padEnd(maxWidth);
    result.push(chars.v + ' '.repeat(padding) + padded + ' '.repeat(padding) + chars.v);
  });
  
  // Bottom border
  result.push(chars.bl + chars.h.repeat(innerWidth) + chars.br);

  return result.join('\n');
}

/**
 * Pretty print JSON with syntax highlighting markers
 */
export function formatJSON(data, indent = 2) {
  const json = typeof data === 'string' ? data : JSON.stringify(data, null, indent);
  return json;
}

/**
 * Format file size in human readable format
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format duration in human readable format
 */
export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Create loading spinner animation frames
 */
export function spinner() {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  return {
    frames,
    interval: 80,
  };
}

export default {
  OutputTypes,
  text,
  colored,
  error,
  success,
  warning,
  info,
  table,
  tree,
  ascii,
  progress,
  link,
  divider,
  group,
  json,
  formatTable,
  formatProgressBar,
  wrapText,
  center,
  box,
  formatJSON,
  formatBytes,
  formatDuration,
  spinner,
};
