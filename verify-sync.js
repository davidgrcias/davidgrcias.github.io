// Quick Verification Script - Paste in Browser Console
// This tests all data modules and Firestore connection

console.log('🧪 Starting Verification...\n');

const testResults = {
  passed: [],
  failed: []
};

// Test 1: Firestore Service
try {
  const { firestoreService } = await import('/src/services/firestore.js');
  const requiredFunctions = [
    'getCollection',
    'getDocument',
    'addDocument',
    'updateDocument',
    'deleteDocument',
    'setDocument',
    'getPublishedCollection',
    'invalidateCache',
    'clearCache',
    'updateOrder'
  ];
  
  const missing = requiredFunctions.filter(fn => !firestoreService[fn]);
  if (missing.length === 0) {
    testResults.passed.push('✅ firestoreService: All functions exported');
  } else {
    testResults.failed.push(`❌ firestoreService: Missing ${missing.join(', ')}`);
  }
} catch (e) {
  testResults.failed.push(`❌ firestoreService: Import failed - ${e.message}`);
}

// Test 2: Projects Data Module
try {
  const { getProjects } = await import('/src/data/projects.js');
  const projects = await getProjects('en');
  if (Array.isArray(projects) && projects.length > 0) {
    testResults.passed.push(`✅ getProjects: Loaded ${projects.length} projects`);
  } else {
    testResults.failed.push('❌ getProjects: Empty or invalid data');
  }
} catch (e) {
  testResults.failed.push(`❌ getProjects: ${e.message}`);
}

// Test 3: Experiences Data Module
try {
  const { getExperiences } = await import('/src/data/experiences.js');
  const experiences = await getExperiences('en');
  if (Array.isArray(experiences) && experiences.length > 0) {
    testResults.passed.push(`✅ getExperiences: Loaded ${experiences.length} experiences`);
  } else {
    testResults.failed.push('❌ getExperiences: Empty or invalid data');
  }
} catch (e) {
  testResults.failed.push(`❌ getExperiences: ${e.message}`);
}

// Test 4: User Profile Data Module
try {
  const { getUserProfile } = await import('/src/data/userProfile.js');
  const profile = await getUserProfile('en');
  if (profile && profile.name) {
    testResults.passed.push(`✅ getUserProfile: Loaded profile for ${profile.name}`);
  } else {
    testResults.failed.push('❌ getUserProfile: Invalid profile data');
  }
} catch (e) {
  testResults.failed.push(`❌ getUserProfile: ${e.message}`);
}

// Test 5: Skills Data Module
try {
  const { getSkills } = await import('/src/data/skills.js');
  const skills = await getSkills('en');
  if (skills && skills.technical && skills.soft) {
    testResults.passed.push(`✅ getSkills: Loaded ${skills.technical.length} technical + ${skills.soft.length} soft skills`);
  } else {
    testResults.failed.push('❌ getSkills: Invalid skills data');
  }
} catch (e) {
  testResults.failed.push(`❌ getSkills: ${e.message}`);
}

// Test 6: Education Data Module
try {
  const { getEducation } = await import('/src/data/education.js');
  const education = await getEducation('en');
  if (Array.isArray(education) && education.length > 0) {
    testResults.passed.push(`✅ getEducation: Loaded ${education.length} entries`);
  } else {
    testResults.failed.push('❌ getEducation: Empty or invalid data');
  }
} catch (e) {
  testResults.failed.push(`❌ getEducation: ${e.message}`);
}

// Test 7: Certifications Data Module
try {
  const { getCertifications } = await import('/src/data/certifications.js');
  const certifications = await getCertifications('en');
  if (Array.isArray(certifications) && certifications.length > 0) {
    testResults.passed.push(`✅ getCertifications: Loaded ${certifications.length} certifications`);
  } else {
    testResults.failed.push('❌ getCertifications: Empty or invalid data');
  }
} catch (e) {
  testResults.failed.push(`❌ getCertifications: ${e.message}`);
}

// Test 8: Fun Facts Data Module
try {
  const { getFunFacts } = await import('/src/data/funFacts.js');
  const funFacts = await getFunFacts('en');
  if (Array.isArray(funFacts) && funFacts.length > 0) {
    testResults.passed.push(`✅ getFunFacts: Loaded ${funFacts.length} fun facts`);
  } else {
    testResults.failed.push('❌ getFunFacts: Empty or invalid data');
  }
} catch (e) {
  testResults.failed.push(`❌ getFunFacts: ${e.message}`);
}

// Test 9: Insights Data Module
try {
  const { getInsights } = await import('/src/data/insights.js');
  const insights = await getInsights('en');
  if (Array.isArray(insights) && insights.length > 0) {
    testResults.passed.push(`✅ getInsights: Loaded ${insights.length} insights`);
  } else {
    testResults.failed.push('❌ getInsights: Empty or invalid data');
  }
} catch (e) {
  testResults.failed.push(`❌ getInsights: ${e.message}`);
}

// Print Results
console.log('\n📊 VERIFICATION RESULTS:\n');
console.log('✅ PASSED:');
testResults.passed.forEach(msg => console.log(`   ${msg}`));
console.log(`\n❌ FAILED:`);
if (testResults.failed.length === 0) {
  console.log('   None! All tests passed! 🎉');
} else {
  testResults.failed.forEach(msg => console.log(`   ${msg}`));
}

console.log(`\n📈 Summary: ${testResults.passed.length}/${testResults.passed.length + testResults.failed.length} tests passed`);

if (testResults.failed.length === 0) {
  console.log('\n🚀 Status: READY FOR DEPLOYMENT');
} else {
  console.log('\n⚠️ Status: NEEDS FIXING');
}
