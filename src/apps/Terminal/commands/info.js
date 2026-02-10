/**
 * Info Commands
 * Commands for displaying user information, portfolio data, and achievements
 */

import { error, success, text, colored, divider, link } from '../outputFormatter.js';
import { getUserProfile } from '../../../data/userProfile.js';
import { getSkills } from '../../../data/skills.js';
import { getProjects } from '../../../data/projects.js';
import { getExperiences } from '../../../data/experiences.js';
import { getEducation } from '../../../data/education.js';
import { getCertifications } from '../../../data/certifications.js';
import { getFunFacts } from '../../../data/funFacts.js';

export function registerInfoCommands(registry, getContext) {
  // about - Display detailed info from userProfile
  registry.registerCommand('about', {
    description: 'Display detailed information about David Garcia',
    usage: 'about',
    category: 'info',
    examples: ['about'],
    async execute() {
      try {
        const profile = await getUserProfile();
        
        const output = [
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          colored(`  ${profile.name}`, 'success'),
          text(`  ${profile.headline || profile.title}`),
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          text(''),
          colored('About:', 'info'),
          text(`  ${profile.aboutText || profile.bio}`),
          text(''),
          colored('Status:', 'info'),
          text(`  ${profile.status === 'open' ? '🟢 Open to opportunities' : profile.status === 'employed' ? '🔵 Employed' : '🟡 Busy'}`),
          text(`  Available for: ${profile.availableFor?.join(', ') || 'N/A'}`),
          text(''),
          colored('Location:', 'info'),
          text(`  📍 ${profile.location || profile.contact?.location}`),
          text(''),
          colored('Website:', 'info'),
          text(`  🌐 ${profile.website}`),
          text(''),
          text('Type "contact" for contact information'),
          text('Type "social" for social media links'),
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
        ];
        
        return output;
      } catch (err) {
        return [error(`Failed to load profile: ${err.message}`)];
      }
    },
  });

  // skills - List skills with proficiency
  registry.registerCommand('skills', {
    description: 'Display technical and soft skills',
    usage: 'skills [technical|soft]',
    category: 'info',
    examples: ['skills', 'skills technical', 'skills soft'],
    async execute(args) {
      try {
        const skills = await getSkills();
        const filter = args[0]?.toLowerCase();
        
        const output = [
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          colored('  Skills & Technologies', 'success'),
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          text(''),
        ];

        // Technical Skills
        if (!filter || filter === 'technical') {
          output.push(colored('Technical Skills:', 'info'));
          output.push(text(''));
          
          skills.technical?.forEach(category => {
            output.push(colored(`  ${category.category}:`, 'warning'));
            category.skills.forEach(skill => {
              output.push(text(`    • ${skill}`));
            });
            output.push(text(''));
          });
        }

        // Soft Skills
        if (!filter || filter === 'soft') {
          output.push(colored('Soft Skills:', 'info'));
          output.push(text(''));
          
          const skillsPerRow = 3;
          const softSkills = skills.soft || [];
          for (let i = 0; i < softSkills.length; i += skillsPerRow) {
            const row = softSkills.slice(i, i + skillsPerRow);
            output.push(text(`  • ${row.join('  • ')}`));
          }
          output.push(text(''));
        }

        output.push(colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'));

        return output;
      } catch (err) {
        return [error(`Failed to load skills: ${err.message}`)];
      }
    },
  });

  // projects - List projects
  registry.registerCommand('projects', {
    description: 'Display portfolio projects',
    usage: 'projects [number]',
    category: 'info',
    examples: ['projects', 'projects 3'],
    async execute(args) {
      try {
        const projects = await getProjects();
        const limit = args[0] ? parseInt(args[0]) : projects.length;
        const displayProjects = projects.slice(0, limit);
        
        const output = [
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          colored('  Portfolio Projects', 'success'),
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          text(''),
        ];

        displayProjects.forEach((project, index) => {
          output.push(colored(`${index + 1}. ${project.name}`, 'info'));
          output.push(text(`   Role: ${project.role}`));
          output.push(text(`   ${project.description}`));
          output.push(text(`   Tech: ${project.tech?.join(', ')}`));
          
          if (project.highlights && project.highlights.length > 0) {
            output.push(text('   Highlights:'));
            project.highlights.forEach(highlight => {
              output.push(text(`     • ${highlight}`));
            });
          }
          
          if (project.link && project.link !== '#') {
            output.push(link(`   🔗 ${project.link}`, project.link));
          }
          
          if (project.date) {
            output.push(text(`   📅 ${project.date}`));
          }
          
          output.push(text(''));
        });

        output.push(colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'));

        return output;
      } catch (err) {
        return [error(`Failed to load projects: ${err.message}`)];
      }
    },
  });

  // experience - Show work experience
  registry.registerCommand('experience', {
    description: 'Display work experience history',
    usage: 'experience',
    category: 'info',
    examples: ['experience'],
    async execute() {
      try {
        const experiences = await getExperiences();
        
        const output = [
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          colored('  Work Experience', 'success'),
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          text(''),
        ];

        experiences.forEach((exp, index) => {
          const period = exp.endDate === 'present' 
            ? `${exp.startDate} - Present` 
            : `${exp.startDate} - ${exp.endDate}`;
          
          output.push(colored(`${index + 1}. ${exp.role}`, 'info'));
          output.push(text(`   ${exp.company} · ${exp.type}`));
          output.push(text(`   ${exp.location} (${exp.locationType})`));
          output.push(text(`   📅 ${period}`));
          output.push(text(''));
          output.push(text(`   ${exp.description}`));
          
          if (exp.skills && exp.skills.length > 0) {
            output.push(text(`   Skills: ${exp.skills.join(', ')}`));
          }
          
          output.push(text(''));
        });

        output.push(colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'));

        return output;
      } catch (err) {
        return [error(`Failed to load experience: ${err.message}`)];
      }
    },
  });

  // education - Show education history
  registry.registerCommand('education', {
    description: 'Display education history',
    usage: 'education',
    category: 'info',
    examples: ['education'],
    async execute() {
      try {
        const education = await getEducation();
        
        const output = [
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          colored('  Education', 'success'),
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          text(''),
        ];

        education.forEach((edu, index) => {
          output.push(colored(`${index + 1}. ${edu.degree}`, 'info'));
          output.push(text(`   ${edu.institution}`));
          output.push(text(`   📅 ${edu.period}`));
          
          if (edu.grade) {
            output.push(text(`   GPA: ${edu.grade}`));
          }
          
          output.push(text(''));
        });

        output.push(colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'));

        return output;
      } catch (err) {
        return [error(`Failed to load education: ${err.message}`)];
      }
    },
  });

  // certifications - Show certifications
  registry.registerCommand('certifications', {
    description: 'Display certifications and courses',
    usage: 'certifications',
    category: 'info',
    examples: ['certifications'],
    async execute() {
      try {
        const certifications = await getCertifications();
        
        const output = [
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          colored('  Certifications & Courses', 'success'),
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          text(''),
        ];

        certifications.forEach((cert, index) => {
          output.push(text(`${index + 1}. ${cert.name}`));
          output.push(text(`   Provider: ${cert.provider}`));
          output.push(text(`   Date: ${cert.date}`));
          output.push(text(''));
        });

        output.push(colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'));

        return output;
      } catch (err) {
        return [error(`Failed to load certifications: ${err.message}`)];
      }
    },
  });

  // contact - Show contact information
  registry.registerCommand('contact', {
    description: 'Display contact information',
    usage: 'contact',
    category: 'info',
    examples: ['contact'],
    async execute() {
      try {
        const profile = await getUserProfile();
        
        const output = [
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          colored('  Contact Information', 'success'),
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          text(''),
          text(`  Email:     ${profile.email || profile.contact?.email}`),
          text(`  Location:  ${profile.location || profile.contact?.location}`),
          text(`  WhatsApp:  ${profile.contact?.whatsapp || 'N/A'}`),
          text(`  Website:   ${profile.website}`),
          text(''),
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
        ];

        return output;
      } catch (err) {
        return [error(`Failed to load contact info: ${err.message}`)];
      }
    },
  });

  // social - Show social media links
  registry.registerCommand('social', {
    description: 'Display social media links',
    usage: 'social',
    category: 'info',
    examples: ['social'],
    async execute() {
      try {
        const profile = await getUserProfile();
        const socials = profile.socials || {};
        
        const output = [
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          colored('  Social Media', 'success'),
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          text(''),
        ];

        if (socials.youtube) {
          output.push(text(`  YouTube:    ${socials.youtube.handle}`));
          output.push(link(`              ${socials.youtube.url}`, socials.youtube.url));
        }
        
        if (socials.github) {
          output.push(text(`  GitHub:     ${socials.github.handle}`));
          output.push(link(`              ${socials.github.url}`, socials.github.url));
        }
        
        if (socials.linkedin) {
          output.push(text(`  LinkedIn:   ${socials.linkedin.handle}`));
          output.push(link(`              ${socials.linkedin.url}`, socials.linkedin.url));
        }
        
        if (socials.tiktok) {
          output.push(text(`  TikTok:     ${socials.tiktok.handle}`));
          output.push(link(`              ${socials.tiktok.url}`, socials.tiktok.url));
        }
        
        if (socials.instagram) {
          output.push(text(`  Instagram:  ${socials.instagram.handle}`));
          output.push(link(`              ${socials.instagram.url}`, socials.instagram.url));
        }

        output.push(text(''));
        output.push(colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'));

        return output;
      } catch (err) {
        return [error(`Failed to load social links: ${err.message}`)];
      }
    },
  });

  // achievements - Show unlocked achievements
  registry.registerCommand('achievements', {
    description: 'Display unlocked achievements',
    usage: 'achievements',
    category: 'info',
    examples: ['achievements'],
    async execute() {
      try {
        const { os } = getContext();
        const achievements = os?.achievements || {};
        const unlocked = Object.entries(achievements).filter(([_, data]) => data.unlocked);
        
        const output = [
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          colored('  Achievements', 'success'),
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          text(''),
        ];

        if (unlocked.length === 0) {
          output.push(text('  No achievements unlocked yet.'));
          output.push(text('  Keep exploring to unlock achievements!'));
        } else {
          const totalPoints = unlocked.reduce((sum, [_, data]) => sum + (data.points || 0), 0);
          
          output.push(text(`  Total Unlocked: ${unlocked.length}`));
          output.push(text(`  Total Points: ${totalPoints}`));
          output.push(text(''));
          
          unlocked.forEach(([id, data]) => {
            const rarity = data.rarity || 'common';
            const rarityColor = rarity === 'legendary' ? 'warning' : rarity === 'rare' ? 'info' : 'success';
            
            output.push(colored(`  🏆 ${data.title}`, rarityColor));
            output.push(text(`     ${data.description}`));
            output.push(text(`     ${data.points} points · ${rarity}`));
            output.push(text(''));
          });
        }

        output.push(colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'));

        return output;
      } catch (err) {
        return [error(`Failed to load achievements: ${err.message}`)];
      }
    },
  });

  // funfacts - Display random fun fact
  registry.registerCommand('funfacts', {
    description: 'Display a random fun fact',
    usage: 'funfacts',
    category: 'info',
    examples: ['funfacts'],
    async execute() {
      try {
        const funFacts = await getFunFacts();
        const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
        
        const output = [
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          colored('  Fun Fact', 'success'),
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          text(''),
          colored(`  ${randomFact.title}`, 'info'),
          text(`  ${randomFact.text}`),
          text(''),
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
        ];

        return output;
      } catch (err) {
        return [error(`Failed to load fun facts: ${err.message}`)];
      }
    },
  });
}
