// Migration Script - Convert existing knowledge to Firestore with embeddings
import { getUserProfile } from '../data/userProfile';
import { getExperiences } from '../data/experiences';
import { getSkills } from '../data/skills';
import { getProjects } from '../data/projects';
import { getInsights } from '../data/insights';
import { getEducation } from '../data/education';
import { getCertifications } from '../data/certifications';
import { getFunFacts } from '../data/funFacts';
import { batchImportKnowledge } from '../services/vectorStore';

// Extract knowledge from existing data structures
export const extractKnowledgeBase = (language = 'en') => {
  const userProfile = getUserProfile(language);
  const experiences = getExperiences(language);
  const skills = getSkills(language);
  const projects = getProjects(language);
  const insights = getInsights(language);
  const education = getEducation(language);
  const certifications = getCertifications(language);
  const funFacts = getFunFacts(language);

  const knowledgeEntries = [];

  // 1. Personal Information
  knowledgeEntries.push({
    title: `About ${userProfile.name}`,
    content: `${userProfile.name} - ${userProfile.headline}\n\n${userProfile.aboutText}\n\nLocation: ${userProfile.contact.location}`,
    type: 'portfolio',
    category: 'personal',
    tags: ['about', 'bio', 'introduction', 'personal'],
    language
  });

  // 2. Contact Information
  knowledgeEntries.push({
    title: 'Contact Information',
    content: `You can reach David through:\n\nEmail: ${userProfile.contact.email}\nWhatsApp: ${userProfile.contact.whatsapp}\nLocation: ${userProfile.contact.location}\n\nSocial Media:\n${Object.entries(userProfile.socials).map(([platform, data]) => `- ${platform}: ${data.url} (${data.handle})`).join('\n')}`,
    type: 'portfolio',
    category: 'contact',
    tags: ['contact', 'email', 'social media', 'whatsapp'],
    language
  });

  // 3. Skills - Technical
  if (skills.technical && skills.technical.length > 0) {
    skills.technical.forEach(category => {
      knowledgeEntries.push({
        title: `Technical Skills - ${category.category}`,
        content: `${category.category} skills:\n\n${category.skills.map(skill => `- ${skill}`).join('\n')}\n\nDavid is proficient in these ${category.category.toLowerCase()} technologies and uses them regularly in his projects.`,
        type: 'portfolio',
        category: 'skills',
        tags: ['technical skills', category.category.toLowerCase(), ...category.skills.slice(0, 5)],
        language
      });
    });
  }

  // 4. Skills - Soft Skills
  if (skills.soft && skills.soft.length > 0) {
    knowledgeEntries.push({
      title: 'Soft Skills',
      content: `David's soft skills include:\n\n${skills.soft.map(skill => `- ${skill}`).join('\n')}\n\nThese interpersonal skills complement his technical abilities and make him an effective team player and communicator.`,
      type: 'portfolio',
      category: 'skills',
      tags: ['soft skills', 'interpersonal', 'communication'],
      language
    });
  }

  // 5. Professional Experience
  experiences.forEach((exp, idx) => {
    knowledgeEntries.push({
      title: `${exp.role} at ${exp.company}`,
      content: `**Position:** ${exp.role}\n**Company:** ${exp.company} (${exp.type})\n**Period:** ${exp.startDate} to ${exp.endDate}\n\n**Description:**\n${exp.description || 'Professional experience in this role.'}\n\n**Technologies & Skills Used:**\n${exp.skills.map(skill => `- ${skill}`).join('\n')}\n\n${exp.achievements ? `**Achievements:**\n${exp.achievements.map(a => `- ${a}`).join('\n')}` : ''}`,
      type: 'portfolio',
      category: 'experience',
      tags: ['experience', 'work', exp.company.toLowerCase(), exp.role.toLowerCase(), ...exp.skills.slice(0, 3)],
      language
    });
  });

  // 6. Education
  education.forEach(edu => {
    knowledgeEntries.push({
      title: `${edu.degree} at ${edu.institution}`,
      content: `**Degree:** ${edu.degree}\n**Institution:** ${edu.institution}\n**Period:** ${edu.period}\n${edu.grade ? `**GPA:** ${edu.grade}` : ''}\n\n${edu.description || 'Educational background and academic achievements.'}`,
      type: 'portfolio',
      category: 'education',
      tags: ['education', edu.institution.toLowerCase(), edu.degree.toLowerCase()],
      language
    });
  });

  // 7. Certifications
  certifications.forEach(cert => {
    knowledgeEntries.push({
      title: cert.name,
      content: `**Certification:** ${cert.name}\n**Provider:** ${cert.provider}\n**Date:** ${cert.date}\n\nThis certification validates David's expertise and commitment to continuous learning.`,
      type: 'portfolio',
      category: 'certifications',
      tags: ['certification', cert.provider.toLowerCase(), ...cert.name.toLowerCase().split(' ').slice(0, 3)],
      language
    });
  });

  // 8. Projects
  projects.forEach(project => {
    knowledgeEntries.push({
      title: project.title,
      content: `**Project:** ${project.title}\n**Category:** ${project.category}\n\n**Description:**\n${project.description}\n\n**Technologies Used:**\n${project.technologies?.map(tech => `- ${tech}`).join('\n') || 'Various technologies'}\n\n${project.features ? `**Key Features:**\n${project.features.map(f => `- ${f}`).join('\n')}` : ''}\n\n${project.github ? `**GitHub:** ${project.github}` : ''}\n${project.demo ? `**Demo:** ${project.demo}` : ''}`,
      type: 'portfolio',
      category: 'projects',
      tags: ['project', project.category?.toLowerCase(), ...project.technologies?.slice(0, 3) || []],
      language
    });
  });

  // 9. Insights & Personality
  insights.forEach(insight => {
    knowledgeEntries.push({
      title: insight.title,
      content: `${insight.title}\n\n${insight.text}`,
      type: 'portfolio',
      category: 'personality',
      tags: ['insight', 'personality', 'about'],
      language
    });
  });

  // 10. Fun Facts
  funFacts.forEach(fact => {
    knowledgeEntries.push({
      title: fact.title,
      content: `${fact.title}\n\n${fact.text}`,
      type: 'portfolio',
      category: 'fun-facts',
      tags: ['fun fact', 'personal', 'trivia'],
      language
    });
  });

  // 11. Additional portfolio info from userProfile
  if (userProfile.stats) {
    knowledgeEntries.push({
      title: 'Statistics & Achievements',
      content: `David's key statistics and achievements:\n\n${Object.entries(userProfile.stats || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}`,
      type: 'portfolio',
      category: 'personal',
      tags: ['stats', 'achievements', 'metrics'],
      language
    });
  }

  return knowledgeEntries;
};

// Migrate knowledge to Firestore
export const migrateKnowledgeToFirestore = async (language = 'en') => {
  try {
    console.log(`Starting migration for language: ${language}`);
    
    const knowledgeEntries = extractKnowledgeBase(language);
    console.log(`Extracted ${knowledgeEntries.length} knowledge entries`);
    
    const results = await batchImportKnowledge(knowledgeEntries);
    
    console.log('Migration complete!');
    console.log(`Success: ${results.success.length}`);
    console.log(`Failed: ${results.failed.length}`);
    
    if (results.failed.length > 0) {
      console.error('Failed entries:', results.failed);
    }
    
    return results;
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

// Migrate both languages
export const migrateAllLanguages = async () => {
  const results = {
    en: null,
    id: null
  };
  
  try {
    // English
    console.log('Migrating English knowledge...');
    results.en = await migrateKnowledgeToFirestore('en');
    
    // Indonesian
    console.log('Migrating Indonesian knowledge...');
    results.id = await migrateKnowledgeToFirestore('id');
    
    console.log('All migrations complete!');
    return results;
  } catch (error) {
    console.error('Migration error:', error);
    return results;
  }
};
