/**
 * Voice Social Commands
 * Handles social media and contact operations
 */

export function registerSocialVoiceCommands(registry, getContext) {
  // OPEN_GITHUB
  registry.registerCommand({
    intent: 'OPEN_GITHUB',
    patterns: [
      'open github',
      'go to github',
      'show github',
      'github profile',
      'my github',
    ],
    examples: [
      'open github',
      'go to github',
      'show github',
    ],
    category: 'social',
    description: 'Open GitHub profile',
    responses: {
      success: 'Opening GitHub',
      error: 'Failed to open GitHub',
    },
    async action(entities) {
      window.open('https://github.com/davidgrcias', '_blank');
      return { success: true, platform: 'github' };
    },
  });

  // OPEN_LINKEDIN
  registry.registerCommand({
    intent: 'OPEN_LINKEDIN',
    patterns: [
      'open linkedin',
      'go to linkedin',
      'show linkedin',
      'linkedin profile',
      'my linkedin',
    ],
    examples: [
      'open linkedin',
      'go to linkedin',
      'show linkedin',
    ],
    category: 'social',
    description: 'Open LinkedIn profile',
    responses: {
      success: 'Opening LinkedIn',
      error: 'Failed to open LinkedIn',
    },
    async action(entities) {
      window.open('https://linkedin.com/in/davidgrcias', '_blank');
      return { success: true, platform: 'linkedin' };
    },
  });

  // OPEN_TWITTER
  registry.registerCommand({
    intent: 'OPEN_TWITTER',
    patterns: [
      'open twitter',
      'go to twitter',
      'show twitter',
      'twitter profile',
      'my twitter',
      'open x',
    ],
    examples: [
      'open twitter',
      'go to twitter',
      'show twitter',
    ],
    category: 'social',
    description: 'Open Twitter/X profile',
    responses: {
      success: 'Opening Twitter',
      error: 'Failed to open Twitter',
    },
    async action(entities) {
      window.open('https://twitter.com/davidgrcias', '_blank');
      return { success: true, platform: 'twitter' };
    },
  });

  // OPEN_INSTAGRAM
  registry.registerCommand({
    intent: 'OPEN_INSTAGRAM',
    patterns: [
      'open instagram',
      'go to instagram',
      'show instagram',
      'instagram profile',
      'my instagram',
    ],
    examples: [
      'open instagram',
      'go to instagram',
      'show instagram',
    ],
    category: 'social',
    description: 'Open Instagram profile',
    responses: {
      success: 'Opening Instagram',
      error: 'Failed to open Instagram',
    },
    async action(entities) {
      window.open('https://instagram.com/davidgrcias', '_blank');
      return { success: true, platform: 'instagram' };
    },
  });

  // OPEN_TIKTOK
  registry.registerCommand({
    intent: 'OPEN_TIKTOK',
    patterns: [
      'open tiktok',
      'go to tiktok',
      'show tiktok',
      'tiktok profile',
      'my tiktok',
    ],
    examples: [
      'open tiktok',
      'go to tiktok',
      'show tiktok',
    ],
    category: 'social',
    description: 'Open TikTok profile',
    responses: {
      success: 'Opening TikTok',
      error: 'Failed to open TikTok',
    },
    async action(entities) {
      window.open('https://tiktok.com/@davidgrcias', '_blank');
      return { success: true, platform: 'tiktok' };
    },
  });

  // OPEN_YOUTUBE
  registry.registerCommand({
    intent: 'OPEN_YOUTUBE',
    patterns: [
      'open youtube',
      'go to youtube',
      'show youtube',
      'youtube channel',
      'my youtube',
    ],
    examples: [
      'open youtube',
      'go to youtube',
      'show youtube',
    ],
    category: 'social',
    description: 'Open YouTube channel',
    responses: {
      success: 'Opening YouTube',
      error: 'Failed to open YouTube',
    },
    async action(entities) {
      window.open('https://youtube.com/@davidgrcias', '_blank');
      return { success: true, platform: 'youtube' };
    },
  });

  // SEND_EMAIL
  registry.registerCommand({
    intent: 'SEND_EMAIL',
    patterns: [
      'send email',
      'email me',
      'contact via email',
      'write email',
      'compose email',
    ],
    examples: [
      'send email',
      'email me',
      'contact via email',
    ],
    category: 'social',
    description: 'Open email client',
    responses: {
      success: 'Opening email client',
      error: 'Failed to open email',
    },
    async action(entities) {
      window.location.href = 'mailto:david@davidgrcias.com';
      return { success: true };
    },
  });

  // SHOW_ALL_SOCIAL
  registry.registerCommand({
    intent: 'SHOW_ALL_SOCIAL',
    patterns: [
      'show all social',
      'all social links',
      'social media links',
      'all platforms',
      'where can i find you',
    ],
    examples: [
      'show all social',
      'all social links',
      'where can i find you',
    ],
    category: 'social',
    description: 'Show all social media links',
    responses: {
      success: 'Here are all social links',
      error: 'Failed to show social links',
    },
    async action(entities) {
      const { notification } = getContext();
      
      const socialLinks = {
        github: 'https://github.com/davidgrcias',
        linkedin: 'https://linkedin.com/in/davidgrcias',
        twitter: 'https://twitter.com/davidgrcias',
        instagram: 'https://instagram.com/davidgrcias',
        tiktok: 'https://tiktok.com/@davidgrcias',
        youtube: 'https://youtube.com/@davidgrcias',
      };
      
      notification.addNotification({
        title: 'Social Links',
        message: 'Check footer for all social media links',
        type: 'info',
      });
      
      // Scroll to footer
      const footer = document.querySelector('footer') || document.getElementById('contact');
      if (footer) {
        footer.scrollIntoView({ behavior: 'smooth' });
      }
      
      return { success: true, links: socialLinks };
    },
  });

  // COPY_EMAIL
  registry.registerCommand({
    intent: 'COPY_EMAIL',
    patterns: [
      'copy email',
      'copy my email',
      'email address',
      'what is my email',
    ],
    examples: [
      'copy email',
      'email address',
      'what is my email',
    ],
    category: 'social',
    description: 'Copy email address',
    responses: {
      success: 'Email copied to clipboard',
      error: 'Failed to copy email',
    },
    async action(entities) {
      const { notification } = getContext();
      
      const email = 'david@davidgrcias.com';
      
      try {
        await navigator.clipboard.writeText(email);
        
        notification.addNotification({
          title: 'Email Copied',
          message: email,
          type: 'success',
        });
        
        return { success: true, email };
      } catch (err) {
        throw new Error('Failed to copy to clipboard');
      }
    },
  });
}

export default registerSocialVoiceCommands;
