/**
 * Voice Info Commands
 * Handles displaying various information about the portfolio/user
 */

export function registerInfoVoiceCommands(registry, getContext) {
  // SHOW_SKILLS
  registry.registerCommand({
    intent: 'SHOW_SKILLS',
    patterns: [
      'show skills',
      'show my skills',
      'what are my skills',
      'tell me about skills',
      'list skills',
      'display skills',
    ],
    examples: [
      'show skills',
      'what are my skills',
      'list skills',
    ],
    category: 'info',
    description: 'Display skills information',
    responses: {
      success: 'Here are the skills',
      error: 'Failed to show skills',
    },
    async action(entities) {
      const sectionElement = document.getElementById('skills');
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      return { success: true, section: 'skills' };
    },
  });

  // SHOW_PROJECTS
  registry.registerCommand({
    intent: 'SHOW_PROJECTS',
    patterns: [
      'show projects',
      'show my projects',
      'what are my projects',
      'tell me about projects',
      'list projects',
      'display projects',
    ],
    examples: [
      'show projects',
      'what are my projects',
      'list projects',
    ],
    category: 'info',
    description: 'Display projects information',
    responses: {
      success: 'Here are the projects',
      error: 'Failed to show projects',
    },
    async action(entities) {
      const sectionElement = document.getElementById('projects');
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      return { success: true, section: 'projects' };
    },
  });

  // SHOW_EXPERIENCE
  registry.registerCommand({
    intent: 'SHOW_EXPERIENCE',
    patterns: [
      'show experience',
      'show my experience',
      'what is my experience',
      'tell me about experience',
      'work experience',
      'display experience',
    ],
    examples: [
      'show experience',
      'what is my experience',
      'work experience',
    ],
    category: 'info',
    description: 'Display work experience',
    responses: {
      success: 'Here is the experience',
      error: 'Failed to show experience',
    },
    async action(entities) {
      const sectionElement = document.getElementById('experience');
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      return { success: true, section: 'experience' };
    },
  });

  // SHOW_EDUCATION
  registry.registerCommand({
    intent: 'SHOW_EDUCATION',
    patterns: [
      'show education',
      'show my education',
      'what is my education',
      'tell me about education',
      'educational background',
      'display education',
    ],
    examples: [
      'show education',
      'what is my education',
      'educational background',
    ],
    category: 'info',
    description: 'Display education information',
    responses: {
      success: 'Here is the education',
      error: 'Failed to show education',
    },
    async action(entities) {
      const sectionElement = document.getElementById('education');
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      return { success: true, section: 'education' };
    },
  });

  // SHOW_CERTIFICATIONS
  registry.registerCommand({
    intent: 'SHOW_CERTIFICATIONS',
    patterns: [
      'show certifications',
      'show my certifications',
      'what are my certifications',
      'tell me about certifications',
      'list certifications',
      'display certifications',
      'show certificates',
    ],
    examples: [
      'show certifications',
      'what are my certifications',
      'list certifications',
    ],
    category: 'info',
    description: 'Display certifications',
    responses: {
      success: 'Here are the certifications',
      error: 'Failed to show certifications',
    },
    async action(entities) {
      const sectionElement = document.getElementById('certifications');
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      return { success: true, section: 'certifications' };
    },
  });

  // SHOW_CONTACT
  registry.registerCommand({
    intent: 'SHOW_CONTACT',
    patterns: [
      'show contact',
      'contact info',
      'contact information',
      'how to contact',
      'get in touch',
      'reach me',
    ],
    examples: [
      'show contact',
      'contact info',
      'how to contact',
    ],
    category: 'info',
    description: 'Display contact information',
    responses: {
      success: 'Here is the contact information',
      error: 'Failed to show contact info',
    },
    async action(entities) {
      const sectionElement = document.getElementById('contact');
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      return { success: true, section: 'contact' };
    },
  });

  // SHOW_SOCIAL
  registry.registerCommand({
    intent: 'SHOW_SOCIAL',
    patterns: [
      'show social',
      'social links',
      'social media',
      'show social media',
      'social profiles',
    ],
    examples: [
      'show social',
      'social links',
      'social media',
    ],
    category: 'info',
    description: 'Display social media links',
    responses: {
      success: 'Here are the social media links',
      error: 'Failed to show social links',
    },
    async action(entities) {
      const sectionElement = document.getElementById('contact') || document.getElementById('social');
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      return { success: true, section: 'social' };
    },
  });

  // SHOW_ABOUT
  registry.registerCommand({
    intent: 'SHOW_ABOUT',
    patterns: [
      'about',
      'about me',
      'who are you',
      'tell me about yourself',
      'show about',
      'your story',
    ],
    examples: [
      'about me',
      'who are you',
      'tell me about yourself',
    ],
    category: 'info',
    description: 'Display about information',
    responses: {
      success: 'Here is the about section',
      error: 'Failed to show about',
    },
    async action(entities) {
      const sectionElement = document.getElementById('about');
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      return { success: true, section: 'about' };
    },
  });

  // FUN_FACTS
  registry.registerCommand({
    intent: 'FUN_FACTS',
    patterns: [
      'fun facts',
      'tell me fun facts',
      'interesting facts',
      'show fun facts',
      'give me a fun fact',
    ],
    examples: [
      'fun facts',
      'tell me fun facts',
      'give me a fun fact',
    ],
    category: 'info',
    description: 'Display fun facts',
    responses: {
      success: 'Here is a fun fact',
      error: 'Failed to show fun facts',
    },
    async action(entities) {
      const { notification } = getContext();
      
      // Show fun fact notification
      notification.addNotification({
        title: 'Fun Fact',
        message: 'Check out the fun facts section for interesting tidbits!',
        type: 'info',
      });
      
      return { success: true, section: 'funfacts' };
    },
  });

  // ACHIEVEMENTS
  registry.registerCommand({
    intent: 'SHOW_ACHIEVEMENTS',
    patterns: [
      'achievements',
      'show achievements',
      'my achievements',
      'what have i achieved',
      'accomplishments',
    ],
    examples: [
      'achievements',
      'show achievements',
      'my achievements',
    ],
    category: 'info',
    description: 'Display achievements',
    responses: {
      success: 'Here are the achievements',
      error: 'Failed to show achievements',
    },
    async action(entities) {
      const sectionElement = document.getElementById('achievements');
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      return { success: true, section: 'achievements' };
    },
  });

  // SHOW_BLOG
  registry.registerCommand({
    intent: 'SHOW_BLOG',
    patterns: [
      'show blog',
      'blog',
      'blog posts',
      'articles',
      'show articles',
      'read blog',
    ],
    examples: [
      'show blog',
      'blog posts',
      'articles',
    ],
    category: 'info',
    description: 'Open blog',
    responses: {
      success: 'Opening blog',
      error: 'Failed to open blog',
    },
    async action(entities) {
      const { os } = getContext();
      
      os.openWindow({
        id: `blog-${Date.now()}`,
        type: 'blog',
        title: 'Blog',
      });
      
      return { success: true, app: 'blog' };
    },
  });
}

export default registerInfoVoiceCommands;
