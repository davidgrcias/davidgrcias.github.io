// src/data/index.js - Re-export all data modules
export { getProjects, default as projectsBase } from './projects';
export { getExperiences, getExperiencesSync, default as experiencesBase } from './experiences';
export { getEducation, getEducationSync, default as educationBase } from './education';
export { getCertifications, getCertificationsSync, default as certificationsBase } from './certifications';
export { getSkills, getSkillsSync, default as skillsBase } from './skills';
export { getUserProfile, default as userProfileBase } from './userProfile';
export { getFunFacts, getFunFactsSync, default as funFactsBase } from './funFacts';
export { getInsights, getInsightsSync, default as insightsBase } from './insights';
export { getAdditionalInfo, getAdditionalInfoSync, default as additionalInfoBase } from './additionalInfo';
export { getPosts } from './posts';
