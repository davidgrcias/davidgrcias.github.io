/**
 * Thinking Steps Generator
 * 
 * Generates contextual "thinking process" steps based on the user's query.
 * These steps create a visualization of the AI analyzing the question
 * before delivering the response — making the experience feel more intelligent.
 */

export function generateThinkingSteps(query) {
  const q = query.toLowerCase();
  const steps = [];

  // Always start with analysis
  steps.push({ icon: '🔄', text: 'Analyzing your question...' });

  // Pattern-based contextual steps
  const patterns = [
    {
      regex: /project|portfolio|work|built|create|develop|app|website|platform|komilet|umn\s?festival/,
      steps: [
        { icon: '🔍', text: "Searching through David's projects..." },
        { icon: '📊', text: 'Analyzing project details & tech stacks...' },
      ],
    },
    {
      regex: /skill|tech|programming|framework|language|stack|tool|proficien|react|next\.?js|laravel|typescript|python|javascript/,
      steps: [
        { icon: '🔍', text: 'Scanning technical skill database...' },
        { icon: '📊', text: 'Mapping proficiency & real-world usage...' },
      ],
    },
    {
      regex: /experience|job|career|company|role|position|intern|profession|coordinator/,
      steps: [
        { icon: '🔍', text: "Reviewing David's work experiences..." },
        { icon: '📊', text: 'Analyzing career growth & achievements...' },
      ],
    },
    {
      regex: /education|university|school|degree|gpa|study|college|academic|umn|nusantara/,
      steps: [
        { icon: '🔍', text: 'Looking up educational background...' },
        { icon: '📊', text: 'Retrieving academic records...' },
      ],
    },
    {
      regex: /youtube|video|content|channel|tiktok|social|creator|subscriber|instagram/,
      steps: [
        { icon: '🔍', text: 'Fetching content creation data...' },
        { icon: '📊', text: 'Compiling platform statistics...' },
      ],
    },
    {
      regex: /contact|hire|email|whatsapp|reach|connect|collaborat/,
      steps: [
        { icon: '🔍', text: 'Retrieving contact information...' },
      ],
    },
    {
      regex: /cert|course|training|credential|badge|progate|dicoding/,
      steps: [
        { icon: '🔍', text: 'Scanning certification records...' },
      ],
    },
    {
      regex: /compare|vs|versus|difference|better|between/,
      steps: [
        { icon: '⚖️', text: 'Running comparison analysis...' },
      ],
    },
    {
      regex: /recommend|suggest|advice|should|best|help|guide/,
      steps: [
        { icon: '💡', text: 'Generating personalized insights...' },
      ],
    },
    {
      regex: /who|about|background|personal|bio|introduction|tell me about/,
      steps: [
        { icon: '🔍', text: "Compiling David's profile data..." },
      ],
    },
    {
      regex: /hobby|fun\s?fact|interest|music|game|personal/,
      steps: [
        { icon: '🔍', text: 'Exploring personal interests & fun facts...' },
      ],
    },
    {
      regex: /age|born|birthday|old/,
      steps: [
        { icon: '🔍', text: 'Looking up personal details...' },
      ],
    },
  ];

  let matched = false;
  for (const pattern of patterns) {
    if (pattern.regex.test(q)) {
      steps.push(...pattern.steps);
      matched = true;
    }
  }

  // Fallback for unmatched queries
  if (!matched) {
    steps.push({ icon: '🔍', text: "Searching David's knowledge base..." });
  }

  // Always end with composing + complete
  steps.push({ icon: '🧠', text: 'Composing comprehensive response...' });
  steps.push({ icon: '✅', text: 'Analysis complete!' });

  return steps;
}

export default { generateThinkingSteps };
