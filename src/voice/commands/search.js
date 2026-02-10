/**
 * Voice Search Commands
 * Handles search operations across different areas
 */

export function registerSearchVoiceCommands(registry, getContext) {
  // SEARCH_PROJECTS
  registry.registerCommand({
    intent: 'SEARCH_PROJECTS',
    patterns: [
      'search for {query} in projects',
      'find {query} in projects',
      'search projects for {query}',
      'look for {query} in projects',
    ],
    examples: [
      'search for react in projects',
      'find javascript in projects',
      'search projects for ai',
    ],
    entities: {
      query: {
        type: 'string',
        required: true,
      },
    },
    category: 'search',
    description: 'Search in projects',
    responses: {
      success: 'Searching for {query} in projects',
      error: 'Failed to search projects',
    },
    async action(entities) {
      const { os } = getContext();
      
      // Navigate to projects section with search
      const projectsSection = document.getElementById('projects');
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth' });
      }
      
      return { success: true, query: entities.query, section: 'projects' };
    },
  });

  // SEARCH_SKILLS
  registry.registerCommand({
    intent: 'SEARCH_SKILLS',
    patterns: [
      'search for {query} in skills',
      'find {query} in skills',
      'do i have {query} skill',
      'search skills for {query}',
    ],
    examples: [
      'search for python in skills',
      'do i have react skill',
      'find javascript in skills',
    ],
    entities: {
      query: {
        type: 'string',
        required: true,
      },
    },
    category: 'search',
    description: 'Search in skills',
    responses: {
      success: 'Searching for {query} in skills',
      error: 'Failed to search skills',
    },
    async action(entities) {
      const skillsSection = document.getElementById('skills');
      if (skillsSection) {
        skillsSection.scrollIntoView({ behavior: 'smooth' });
      }
      
      return { success: true, query: entities.query, section: 'skills' };
    },
  });

  // FIND_FILE
  registry.registerCommand({
    intent: 'FIND_FILE',
    patterns: [
      'find file {fileName}',
      'search for file {fileName}',
      'locate file {fileName}',
      'where is file {fileName}',
    ],
    examples: [
      'find file index.html',
      'search for file package.json',
      'locate file readme.md',
    ],
    entities: {
      fileName: {
        type: 'string',
        required: true,
      },
    },
    category: 'search',
    description: 'Find a file',
    responses: {
      success: 'Searching for file {fileName}',
      error: 'Failed to find file',
    },
    async action(entities) {
      const { os } = getContext();
      
      // Open file manager and search
      os.openWindow({
        id: `filemanager-${Date.now()}`,
        type: 'filemanager',
        title: 'File Manager',
      });
      
      return { success: true, fileName: entities.fileName };
    },
  });

  // SEARCH_GLOBAL
  registry.registerCommand({
    intent: 'SEARCH_GLOBAL',
    patterns: [
      'search everywhere for {query}',
      'find {query} anywhere',
      'global search {query}',
      'search all {query}',
    ],
    examples: [
      'search everywhere for react',
      'find javascript anywhere',
      'global search python',
    ],
    entities: {
      query: {
        type: 'string',
        required: true,
      },
    },
    category: 'search',
    description: 'Global search',
    responses: {
      success: 'Searching everywhere for {query}',
      error: 'Failed to perform global search',
    },
    async action(entities) {
      const { os } = getContext();
      
      // Open spotlight/command palette with search
      os.setSpotlightOpen(true);
      os.setSpotlightQuery(entities.query);
      
      return { success: true, query: entities.query };
    },
  });

  // SEARCH_EXPERIENCE
  registry.registerCommand({
    intent: 'SEARCH_EXPERIENCE',
    patterns: [
      'search for {query} in experience',
      'find {query} in experience',
      'search experience for {query}',
    ],
    examples: [
      'search for google in experience',
      'find developer in experience',
    ],
    entities: {
      query: {
        type: 'string',
        required: true,
      },
    },
    category: 'search',
    description: 'Search in experience',
    responses: {
      success: 'Searching for {query} in experience',
      error: 'Failed to search experience',
    },
    async action(entities) {
      const experienceSection = document.getElementById('experience');
      if (experienceSection) {
        experienceSection.scrollIntoView({ behavior: 'smooth' });
      }
      
      return { success: true, query: entities.query, section: 'experience' };
    },
  });
}

export default registerSearchVoiceCommands;
