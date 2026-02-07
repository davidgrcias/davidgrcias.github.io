/**
 * Agent Actions System
 * 
 * Handles parsing, executing, and managing AI agent actions.
 * The agent can trigger real UI actions on the portfolio website.
 */

// ============================================================
// ACTION REGISTRY — All actions the agent can perform
// ============================================================

const ACTION_REGISTRY = {
  // Navigation Actions — open apps in WebOS and switch to relevant tab
  NAVIGATE_PROJECTS: {
    id: 'NAVIGATE_PROJECTS',
    type: 'navigation',
    label: 'View Projects',
    execute: () => openWebOSApp('about-me', { tab: 'projects' }),
  },
  NAVIGATE_SKILLS: {
    id: 'NAVIGATE_SKILLS',
    type: 'navigation',
    label: 'View Skills',
    execute: () => openWebOSApp('about-me', { tab: 'skills' }),
  },
  NAVIGATE_EXPERIENCE: {
    id: 'NAVIGATE_EXPERIENCE',
    type: 'navigation',
    label: 'View Experience',
    execute: () => openWebOSApp('about-me', { tab: 'experience' }),
  },
  NAVIGATE_EDUCATION: {
    id: 'NAVIGATE_EDUCATION',
    type: 'navigation',
    label: 'View Education',
    execute: () => openWebOSApp('about-me', { tab: 'education' }),
  },
  NAVIGATE_CERTIFICATIONS: {
    id: 'NAVIGATE_CERTIFICATIONS',
    type: 'navigation',
    label: 'View Certifications',
    execute: () => openWebOSApp('about-me', { tab: 'education' }),
  },
  NAVIGATE_CONTACT: {
    id: 'NAVIGATE_CONTACT',
    type: 'navigation',
    label: 'View Contact',
    execute: () => openWebOSApp('about-me', { tab: 'contact' }),
  },
  NAVIGATE_ABOUT: {
    id: 'NAVIGATE_ABOUT',
    type: 'navigation',
    label: 'About David',
    execute: () => openWebOSApp('about-me', { tab: 'personal' }),
  },
  NAVIGATE_BLOG: {
    id: 'NAVIGATE_BLOG',
    type: 'navigation',
    label: 'View Blog',
    execute: () => openWebOSApp('blog'),
  },

  // External Link Actions
  OPEN_CV: {
    id: 'OPEN_CV',
    type: 'external',
    label: 'Download CV',
    execute: () => {
      const cvBtn = document.querySelector('button[title="Preview CV"]');
      if (cvBtn) cvBtn.click();
      else window.open('/CV_DavidGarciaSaragih.pdf', '_blank');
    },
  },
  OPEN_WHATSAPP: {
    id: 'OPEN_WHATSAPP',
    type: 'external',
    label: 'Open WhatsApp',
    execute: () => window.open('https://wa.me/6287776803957', '_blank'),
  },
  OPEN_EMAIL: {
    id: 'OPEN_EMAIL',
    type: 'external',
    label: 'Send Email',
    execute: () => window.open('mailto:davidgarciasaragih7@gmail.com', '_blank'),
  },
  OPEN_GITHUB: {
    id: 'OPEN_GITHUB',
    type: 'external',
    label: 'View GitHub',
    execute: () => window.open('https://github.com/davidgrcias', '_blank'),
  },
  OPEN_LINKEDIN: {
    id: 'OPEN_LINKEDIN',
    type: 'external',
    label: 'View LinkedIn',
    execute: () => window.open('https://www.linkedin.com/in/davidgrcias/', '_blank'),
  },
  OPEN_YOUTUBE: {
    id: 'OPEN_YOUTUBE',
    type: 'external',
    label: 'View YouTube',
    execute: () => window.open('https://www.youtube.com/c/DavidGTech', '_blank'),
  },
  OPEN_TIKTOK: {
    id: 'OPEN_TIKTOK',
    type: 'external',
    label: 'View TikTok',
    execute: () => window.open('https://www.tiktok.com/@davidgtech', '_blank'),
  },
  OPEN_INSTAGRAM: {
    id: 'OPEN_INSTAGRAM',
    type: 'external',
    label: 'View Instagram',
    execute: () => window.open('https://www.instagram.com/davidgrcias/', '_blank'),
  },
  OPEN_PROJECT: {
    id: 'OPEN_PROJECT',
    type: 'external',
    label: 'Open Project',
    execute: (url) => {
      if (url && url !== '#') window.open(url, '_blank');
    },
  },

  // Clipboard Actions
  COPY_EMAIL: {
    id: 'COPY_EMAIL',
    type: 'clipboard',
    label: 'Copy Email',
    execute: async () => {
      try {
        await navigator.clipboard.writeText('davidgarciasaragih7@gmail.com');
        return { success: true, message: 'Email copied to clipboard!' };
      } catch {
        return { success: false, message: 'Could not copy email' };
      }
    },
  },

  // UI Actions
  PLAY_MUSIC: {
    id: 'PLAY_MUSIC',
    type: 'ui',
    label: 'Play Music',
    execute: () => {
      window.dispatchEvent(new CustomEvent('WEBOS_PLAY_MUSIC'));
    },
  },
  DARK_MODE: {
    id: 'DARK_MODE',
    type: 'ui',
    label: 'Dark Mode',
    execute: () => {
      document.documentElement.classList.add('dark');
      window.dispatchEvent(new CustomEvent('WEBOS_THEME_CHANGE', { detail: { theme: 'dark' } }));
    },
  },
  LIGHT_MODE: {
    id: 'LIGHT_MODE',
    type: 'ui',
    label: 'Light Mode',
    execute: () => {
      document.documentElement.classList.remove('dark');
      window.dispatchEvent(new CustomEvent('WEBOS_THEME_CHANGE', { detail: { theme: 'light' } }));
    },
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Open a WebOS app and optionally switch to a specific tab.
 * Uses the VOICE_OPEN_APP event (already listened to by Desktop.jsx)
 * and WEBOS_APP_ACTION for tab switching within apps.
 */
function openWebOSApp(appId, options = {}) {
  // Open the app (reuses existing VOICE_OPEN_APP listener in Desktop.jsx)
  window.dispatchEvent(new CustomEvent('VOICE_OPEN_APP', {
    detail: { appId }
  }));

  // If a specific tab is requested, dispatch tab switch after app is mounted
  if (options.tab) {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('WEBOS_APP_ACTION', {
        detail: {
          appId,
          action: 'switch-tab',
          payload: { tab: options.tab }
        }
      }));
    }, 300);
  }
}

// ============================================================
// ACTION PARSER — Extracts actions from AI response text
// ============================================================

/**
 * Parse action tags from AI response text
 * Supports: [ACTION:NAME] and [ACTION:NAME:param]
 * Returns { cleanText, actions[] }
 */
export function parseAgentActions(responseText) {
  if (!responseText) return { cleanText: '', actions: [] };

  const actionPattern = /\[ACTION:([A-Z_]+)(?::([^\]]*))?\]/g;
  const actions = [];
  let match;

  while ((match = actionPattern.exec(responseText)) !== null) {
    const actionId = match[1];
    const param = match[2] || null;

    if (ACTION_REGISTRY[actionId]) {
      actions.push({
        id: actionId,
        param,
        type: ACTION_REGISTRY[actionId].type,
        label: ACTION_REGISTRY[actionId].label,
      });
    }
  }

  // Remove action tags from visible text
  const cleanText = responseText
    .replace(actionPattern, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up excessive newlines
    .trim();

  return { cleanText, actions };
}

// ============================================================
// ACTION EXECUTOR — Runs the parsed actions
// ============================================================

/**
 * Execute an array of parsed actions with a small delay between them
 */
export async function executeAgentActions(actions = [], options = {}) {
  const { delay = 300, onActionExecuted = null } = options;
  const results = [];

  for (const action of actions) {
    try {
      const registeredAction = ACTION_REGISTRY[action.id];
      if (!registeredAction) {
        console.warn(`Unknown action: ${action.id}`);
        continue;
      }

      // Wait a bit before executing (for smooth UX)
      await new Promise(resolve => setTimeout(resolve, delay));

      // Execute the action
      const result = await registeredAction.execute(action.param);
      
      results.push({
        id: action.id,
        success: true,
        result: result || null,
        label: action.label,
      });

      console.log(`🤖 Agent Action Executed: ${action.label}`, action.param || '');

      if (onActionExecuted) {
        onActionExecuted(action, result);
      }
    } catch (error) {
      console.error(`Agent Action Failed: ${action.id}`, error);
      results.push({
        id: action.id,
        success: false,
        error: error.message,
        label: action.label,
      });
    }
  }

  return results;
}

// ============================================================
// SMART ACTION SUGGESTIONS
// ============================================================

/**
 * Suggest possible actions based on the current conversation context
 */
export function suggestActions(userMessage, botResponse) {
  const combined = `${userMessage} ${botResponse}`.toLowerCase();
  const suggestions = [];

  const triggers = [
    { keywords: ['project', 'portfolio', 'work', 'built', 'created'], action: 'NAVIGATE_PROJECTS' },
    { keywords: ['skill', 'technology', 'tech stack', 'programming', 'framework'], action: 'NAVIGATE_SKILLS' },
    { keywords: ['experience', 'job', 'career', 'position', 'role'], action: 'NAVIGATE_EXPERIENCE' },
    { keywords: ['education', 'university', 'school', 'degree', 'gpa'], action: 'NAVIGATE_EDUCATION' },
    { keywords: ['certification', 'certificate', 'course', 'training'], action: 'NAVIGATE_CERTIFICATIONS' },
    { keywords: ['contact', 'hire', 'reach', 'connect', 'touch'], action: 'NAVIGATE_CONTACT' },
    { keywords: ['cv', 'resume', 'download'], action: 'OPEN_CV' },
    { keywords: ['whatsapp', 'wa', 'chat'], action: 'OPEN_WHATSAPP' },
    { keywords: ['email', 'mail'], action: 'OPEN_EMAIL' },
    { keywords: ['github', 'repository', 'repo', 'code'], action: 'OPEN_GITHUB' },
    { keywords: ['youtube', 'video', 'channel', 'subscribe'], action: 'OPEN_YOUTUBE' },
    { keywords: ['linkedin'], action: 'OPEN_LINKEDIN' },
    { keywords: ['tiktok'], action: 'OPEN_TIKTOK' },
    { keywords: ['instagram', 'ig'], action: 'OPEN_INSTAGRAM' },
  ];

  for (const trigger of triggers) {
    if (trigger.keywords.some(kw => combined.includes(kw))) {
      const reg = ACTION_REGISTRY[trigger.action];
      if (reg && !suggestions.find(s => s.id === trigger.action)) {
        suggestions.push({
          id: trigger.action,
          label: reg.label,
          type: reg.type,
        });
      }
    }
  }

  return suggestions.slice(0, 3); // Max 3 suggestions
}

// ============================================================
// EXPORTS
// ============================================================

export { ACTION_REGISTRY };

export default {
  parseAgentActions,
  executeAgentActions,
  suggestActions,
  ACTION_REGISTRY,
};
