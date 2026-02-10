/**
 * Voice Navigation Commands
 * Handles scrolling, navigation, and page movement
 */

export function registerNavigationVoiceCommands(registry, getContext) {
  // SCROLL_DOWN
  registry.registerCommand({
    intent: 'SCROLL_DOWN',
    patterns: [
      'scroll down',
      'go down',
      'move down',
      'page down',
      'down',
    ],
    examples: [
      'scroll down',
      'go down',
      'page down',
    ],
    category: 'navigation',
    description: 'Scroll down the page',
    responses: {
      success: 'Scrolling down',
      error: 'Failed to scroll down',
    },
    async action(entities) {
      window.scrollBy({
        top: window.innerHeight * 0.8,
        behavior: 'smooth',
      });
      
      return { success: true, direction: 'down' };
    },
  });

  // SCROLL_UP
  registry.registerCommand({
    intent: 'SCROLL_UP',
    patterns: [
      'scroll up',
      'go up',
      'move up',
      'page up',
      'up',
    ],
    examples: [
      'scroll up',
      'go up',
      'page up',
    ],
    category: 'navigation',
    description: 'Scroll up the page',
    responses: {
      success: 'Scrolling up',
      error: 'Failed to scroll up',
    },
    async action(entities) {
      window.scrollBy({
        top: -window.innerHeight * 0.8,
        behavior: 'smooth',
      });
      
      return { success: true, direction: 'up' };
    },
  });

  // SCROLL_TOP
  registry.registerCommand({
    intent: 'SCROLL_TOP',
    patterns: [
      'scroll to top',
      'go to top',
      'top of page',
      'beginning',
      'start of page',
    ],
    examples: [
      'scroll to top',
      'go to top',
      'top of page',
    ],
    category: 'navigation',
    description: 'Scroll to top of page',
    responses: {
      success: 'Scrolling to top',
      error: 'Failed to scroll to top',
    },
    async action(entities) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      
      return { success: true, position: 'top' };
    },
  });

  // SCROLL_BOTTOM
  registry.registerCommand({
    intent: 'SCROLL_BOTTOM',
    patterns: [
      'scroll to bottom',
      'go to bottom',
      'bottom of page',
      'end of page',
    ],
    examples: [
      'scroll to bottom',
      'go to bottom',
      'bottom of page',
    ],
    category: 'navigation',
    description: 'Scroll to bottom of page',
    responses: {
      success: 'Scrolling to bottom',
      error: 'Failed to scroll to bottom',
    },
    async action(entities) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
      
      return { success: true, position: 'bottom' };
    },
  });

  // GO_BACK
  registry.registerCommand({
    intent: 'GO_BACK',
    patterns: [
      'go back',
      'back',
      'previous page',
      'navigate back',
    ],
    examples: [
      'go back',
      'back',
      'previous page',
    ],
    category: 'navigation',
    description: 'Go back in browser history',
    responses: {
      success: 'Going back',
      error: 'Cannot go back',
    },
    async action(entities) {
      window.history.back();
      return { success: true };
    },
  });

  // GO_FORWARD
  registry.registerCommand({
    intent: 'GO_FORWARD',
    patterns: [
      'go forward',
      'forward',
      'next page',
      'navigate forward',
    ],
    examples: [
      'go forward',
      'forward',
      'next page',
    ],
    category: 'navigation',
    description: 'Go forward in browser history',
    responses: {
      success: 'Going forward',
      error: 'Cannot go forward',
    },
    async action(entities) {
      window.history.forward();
      return { success: true };
    },
  });

  // GO_HOME
  registry.registerCommand({
    intent: 'GO_HOME',
    patterns: [
      'go home',
      'home',
      'go to home',
      'take me home',
      'main page',
    ],
    examples: [
      'go home',
      'home',
      'take me home',
    ],
    category: 'navigation',
    description: 'Go to home page',
    responses: {
      success: 'Going home',
      error: 'Failed to go home',
    },
    async action(entities) {
      // Scroll to top and close all apps
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      const { os } = getContext();
      const windows = os.windows || [];
      windows.forEach(win => os.closeWindow(win.id));
      
      return { success: true };
    },
  });

  // SEARCH
  registry.registerCommand({
    intent: 'SEARCH',
    patterns: [
      'search for {query}',
      'find {query}',
      'look for {query}',
      'search {query}',
    ],
    examples: [
      'search for projects',
      'find skills',
      'look for experience',
    ],
    entities: {
      query: {
        type: 'string',
        required: true,
      },
    },
    category: 'navigation',
    description: 'Search for content',
    responses: {
      success: 'Searching for {query}',
      error: 'Failed to search',
    },
    async action(entities) {
      const { os } = getContext();
      
      // Open command palette/spotlight with search query
      os.setSpotlightOpen(true);
      os.setSpotlightQuery(entities.query);
      
      return { success: true, query: entities.query };
    },
  });

  // GO_TO_SECTION
  registry.registerCommand({
    intent: 'GO_TO_SECTION',
    patterns: [
      'go to {section}',
      'show {section}',
      'navigate to {section}',
      'take me to {section}',
      'open {section} section',
    ],
    examples: [
      'go to projects',
      'show skills',
      'navigate to experience',
      'take me to about',
    ],
    entities: {
      section: {
        type: 'string',
        required: true,
        values: ['about', 'skills', 'projects', 'experience', 'education', 'certifications', 'contact', 'blog'],
      },
    },
    category: 'navigation',
    description: 'Navigate to a specific section',
    responses: {
      success: 'Going to {section}',
      error: 'Failed to navigate to {section}',
    },
    async action(entities) {
      const sectionElement = document.getElementById(entities.section);
      
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return { success: true, section: entities.section };
      }
      
      throw new Error(`Section ${entities.section} not found`);
    },
  });

  // REFRESH
  registry.registerCommand({
    intent: 'REFRESH',
    patterns: [
      'refresh',
      'reload',
      'refresh page',
      'reload page',
    ],
    examples: [
      'refresh',
      'reload',
      'refresh page',
    ],
    category: 'navigation',
    description: 'Refresh the page',
    responses: {
      success: 'Refreshing page',
      error: 'Failed to refresh',
    },
    async action(entities) {
      window.location.reload();
      return { success: true };
    },
  });

  // ZOOM_IN
  registry.registerCommand({
    intent: 'ZOOM_IN',
    patterns: [
      'zoom in',
      'increase zoom',
      'make bigger',
      'enlarge',
    ],
    examples: [
      'zoom in',
      'increase zoom',
      'make bigger',
    ],
    category: 'navigation',
    description: 'Zoom in (increase page scale)',
    responses: {
      success: 'Zooming in',
      error: 'Failed to zoom in',
    },
    async action(entities) {
      const currentZoom = parseFloat(document.body.style.zoom || '1');
      const newZoom = Math.min(currentZoom + 0.1, 2);
      document.body.style.zoom = newZoom.toString();
      
      return { success: true, zoom: newZoom };
    },
  });

  // ZOOM_OUT
  registry.registerCommand({
    intent: 'ZOOM_OUT',
    patterns: [
      'zoom out',
      'decrease zoom',
      'make smaller',
      'shrink',
    ],
    examples: [
      'zoom out',
      'decrease zoom',
      'make smaller',
    ],
    category: 'navigation',
    description: 'Zoom out (decrease page scale)',
    responses: {
      success: 'Zooming out',
      error: 'Failed to zoom out',
    },
    async action(entities) {
      const currentZoom = parseFloat(document.body.style.zoom || '1');
      const newZoom = Math.max(currentZoom - 0.1, 0.5);
      document.body.style.zoom = newZoom.toString();
      
      return { success: true, zoom: newZoom };
    },
  });

  // RESET_ZOOM
  registry.registerCommand({
    intent: 'RESET_ZOOM',
    patterns: [
      'reset zoom',
      'normal zoom',
      'default zoom',
      'zoom one hundred percent',
    ],
    examples: [
      'reset zoom',
      'normal zoom',
      'default zoom',
    ],
    category: 'navigation',
    description: 'Reset zoom to 100%',
    responses: {
      success: 'Zoom reset to 100%',
      error: 'Failed to reset zoom',
    },
    async action(entities) {
      document.body.style.zoom = '1';
      return { success: true, zoom: 1 };
    },
  });
}

export default registerNavigationVoiceCommands;
