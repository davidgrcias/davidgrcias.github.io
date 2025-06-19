import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  X,
  Bot,
  Loader,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { generateAIResponse } from "../api/gemini";
import { getUserProfile } from "../data/userProfile";
import { getExperiences } from "../data/experiences";
import { getSkills } from "../data/skills";
import { getProjects } from "../data/projects";
import { getInsights } from "../data/insights";
import { getEducation } from "../data/education";
import { getCertifications } from "../data/certifications";
import { getFunFacts } from "../data/funFacts";
import personalInfo from "../data/personalInfo";
import { useTranslation } from "../contexts/TranslationContext";

const ChatBot = () => {
  const { currentLanguage, translateText } = useTranslation();

  // Get translated data based on current language
  const userProfile = getUserProfile(currentLanguage);
  const experiences = getExperiences(currentLanguage);
  const skills = getSkills(currentLanguage);
  const projects = getProjects(currentLanguage);
  const insights = getInsights(currentLanguage);
  const education = getEducation(currentLanguage);
  const certifications = getCertifications(currentLanguage);
  const funFacts = getFunFacts(currentLanguage);

  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content: translateText(
        "👋 Hi! I'm David's assistant. How can I help you?",
        currentLanguage
      ),
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState([
    translateText("What's David's age and background?", currentLanguage),
    translateText("Show me his technical skills", currentLanguage),
    translateText("Tell me about his YouTube journey", currentLanguage),
    translateText("What projects is he working on?", currentLanguage),
    translateText("How can I contact him?", currentLanguage),
  ]);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Create knowledge base
  const personalityInsights = {
    funFacts: funFacts.map((fact) => `${fact.title}: ${fact.text}`).join("\n"),
    insights: insights
      .map((insight) => `${insight.title}: ${insight.text}`)
      .join("\n"),
  };

  // Enhanced knowledge base with personal information
  const knowledge = {
    personal: {
      name: userProfile.name,
      headline: userProfile.headline,
      about: userProfile.aboutText,
      location: userProfile.contact.location,
      basic: personalInfo.basic,
      interests: personalInfo.interests,
      personality: {
        ...personalityInsights,
        traits: personalInfo.personality.traits,
        workStyle: personalInfo.personality.workStyle,
        strengths: personalInfo.personality.strengths,
      },
      goals: personalInfo.goals,
      faq: personalInfo.faq,
    },
    contact: {
      email: userProfile.contact.email,
      whatsapp: userProfile.contact.whatsapp,
      location: userProfile.contact.location,
      socials: Object.entries(userProfile.socials)
        .map(([platform, data]) => `${platform}: ${data.url}`)
        .join("\n"),
    },
    personality: personalityInsights,
    professional: {
      skills: skills
        .map((skill) => `${skill.name} (Proficiency: ${skill.level}%)`)
        .join("\n"),
      certifications: certifications
        .map((cert) => `${cert.name} from ${cert.provider} (${cert.date})`)
        .join("\n"),
      education: education
        .map(
          (edu) =>
            `${edu.degree} at ${edu.institution} (${edu.period})` +
            (edu.grade ? ` - GPA: ${edu.grade}` : "")
        )
        .join("\n"),
      experience: experiences
        .map(
          (exp) =>
            `${exp.role} at ${exp.company} (${exp.type}) - ${
              exp.startDate
            } to ${exp.endDate}\nSkills used: ${exp.skills.join(", ")}`
        )
        .join("\n\n"),
    },
  };

  const findBestMatch = (input, keywords) => {
    const inputWords = input.toLowerCase().split(" ");
    return keywords.some((keyword) =>
      inputWords.some(
        (word) =>
          word.length > 3 &&
          (keyword.includes(word) ||
            word.includes(keyword) ||
            levenshteinDistance(word, keyword) <= 2)
      )
    );
  };

  const levenshteinDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  };
  const generateResponse = async (input) => {
    try {
      const inputLower = input.toLowerCase().trim();

      // Get the last bot message to understand context
      const lastBotMessage = messages
        .filter((m) => m.type === "bot")
        .slice(-1)[0];
      const lastBotContent = lastBotMessage
        ? lastBotMessage.content.toLowerCase()
        : "";

      // Enhanced conversational response detection
      const isConversationalResponse = (input, lastBotMessage) => {
        const conversationalKeywords = [
          "yes",
          "yeah",
          "yep",
          "yup",
          "right",
          "correct",
          "exactly",
          "true",
          "definitely",
          "absolutely",
          "sure",
          "of course",
          "indeed",
          "totally",
          "no",
          "nope",
          "not really",
          "disagree",
          "wrong",
          "false",
          "incorrect",
          "thanks",
          "thank you",
          "appreciate",
          "helpful",
          "great",
          "awesome",
          "cool",
          "nice",
          "good job",
          "amazing",
          "wow",
          "impressive",
        ];

        const inputWords = input.toLowerCase().trim().split(" ");
        const isShortResponse = inputWords.length <= 3;
        const containsConversationalWord = conversationalKeywords.some(
          (keyword) =>
            inputWords.includes(keyword) ||
            input.toLowerCase().includes(keyword)
        );

        // Check if the last bot message was asking a question or making a statement
        const botAskedQuestion =
          lastBotMessage &&
          (lastBotMessage.content.includes("?") ||
            lastBotMessage.content.includes("right?") ||
            lastBotMessage.content.includes("isn't he?") ||
            lastBotMessage.content.includes("isn't it?") ||
            lastBotMessage.content.includes("don't you think?") ||
            lastBotMessage.content.includes("wouldn't you say?"));

        return (
          isShortResponse && containsConversationalWord && botAskedQuestion
        );
      };

      // Handle conversational responses and feedback
      if (isConversationalResponse(inputLower, lastBotMessage)) {
        // Handle affirmative responses
        if (
          findBestMatch(inputLower, [
            "yes",
            "yeah",
            "yep",
            "yup",
            "right",
            "correct",
            "exactly",
            "true",
            "definitely",
            "absolutely",
            "sure",
            "of course",
            "indeed",
            "totally",
          ])
        ) {
          const affirmativeResponses = [
            "I'm so glad you agree! 😊 David really is exceptional. What else would you like to explore about his journey?",
            "Absolutely! 🎉 His achievements at just 19 are truly remarkable. Any specific area you'd like to dive deeper into?",
            "Exactly! � It's amazing what he's accomplished. What other aspects of his profile interest you?",
            "Right?! 🚀 His combination of technical skills and entrepreneurship is impressive. Want to know more about any particular area?",
            "That's what I think too! ✨ There's so much more to discover about David. What would you like to explore next?",
          ];
          const response =
            affirmativeResponses[
              Math.floor(Math.random() * affirmativeResponses.length)
            ];
          updateSuggestedReplies("affirmative");
          return response;
        }

        // Handle negative responses
        if (
          findBestMatch(inputLower, [
            "no",
            "nope",
            "not really",
            "disagree",
            "wrong",
            "false",
            "incorrect",
          ])
        ) {
          const clarifyResponses = [
            "I understand! 🤔 What specific aspect would you like to know more about instead?",
            "No worries at all! 😊 Is there something particular about David that interests you more?",
            "Fair enough! 💭 What would you like me to focus on regarding David's background?",
            "Got it! 🎯 What other information about David would be helpful for you?",
          ];
          const response =
            clarifyResponses[
              Math.floor(Math.random() * clarifyResponses.length)
            ];
          updateSuggestedReplies("clarify");
          return response;
        }

        // Handle appreciation responses
        if (
          findBestMatch(inputLower, [
            "thanks",
            "thank you",
            "appreciate",
            "helpful",
            "great",
            "awesome",
            "cool",
            "nice",
            "good job",
            "amazing",
            "wow",
            "impressive",
          ])
        ) {
          const thankResponses = [
            "You're very welcome! � I love sharing David's story. What else would you like to discover?",
            "Thank you! 🌟 It's my pleasure to help you learn about David. Any other questions?",
            "I'm so glad you found it helpful! 🎉 Feel free to ask me anything else about David's journey.",
            "Awesome! 💙 David's story is truly inspiring. What other aspects would you like to explore?",
          ];
          const response =
            thankResponses[Math.floor(Math.random() * thankResponses.length)];
          updateSuggestedReplies("thanks");
          return response;
        }
      }

      // Handle greetings (only if not a conversational response)
      if (
        findBestMatch(inputLower, [
          "hi",
          "hello",
          "hey",
          "good morning",
          "good afternoon",
          "good evening",
          "greetings",
        ]) &&
        !isConversationalResponse(inputLower, lastBotMessage)
      ) {
        const greetingResponses = [
          "Hello! � I'm here to tell you all about David Garcia Saragih. What would you like to know?",
          "Hey there! 😊 Ready to learn about David's amazing journey? What interests you most?",
          "Hi! � I'm David's AI assistant. Ask me anything about his skills, experience, or projects!",
          "Greetings! 🎉 I know everything about David. What aspect of his profile would you like to explore?",
        ];
        const response =
          greetingResponses[
            Math.floor(Math.random() * greetingResponses.length)
          ];
        updateSuggestedReplies("greeting");
        return response;
      }

      // Check if user is asking for CV
      if (findBestMatch(inputLower, ["cv", "resume", "curriculum"])) {
        const cvResponse = [
          "📄 Here's David's comprehensive CV!",
          "",
          "You can download his full CV (PDF format) here:",
          `🔗 ${window.location.origin}/CV-DavidGarciaSaragih.pdf`,
          "",
          "The CV includes:",
          "• Complete professional experience",
          "• Technical skills and certifications",
          "• Educational background",
          "• Notable achievements and projects",
          "",
          "Would you like me to tell you about any specific aspect of his background? 😊",
        ].join("\n");
        updateSuggestedReplies("cv");
        return cvResponse;
      }

      // Create COMPREHENSIVE context using ALL data sources
      const comprehensiveContext = `
COMPLETE PROFILE OF DAVID GARCIA SARAGIH:

=== BASIC INFORMATION ===
Name: ${userProfile.name}
Headline: ${userProfile.headline}
Age: 19 years old (born September 13, 2005)
Location: ${userProfile.contact.location}
Religion: Christian
Email: ${userProfile.contact.email}
WhatsApp: ${userProfile.contact.whatsapp}
Portfolio: davidgrcias.github.io

About: ${userProfile.aboutText}

=== TECHNICAL SKILLS ===
${skills
  .map((skill) => `• ${skill.name}: ${skill.level}% proficiency`)
  .join("\n")}

=== PROFESSIONAL EXPERIENCE ===
${experiences
  .map(
    (exp) =>
      `• ${exp.role} at ${exp.company} (${exp.type}) - ${exp.startDate} to ${
        exp.endDate
      }
    Skills used: ${exp.skills.join(", ")}`
  )
  .join("\n\n")}

=== EDUCATION ===
${education
  .map(
    (edu) =>
      `• ${edu.degree} at ${edu.institution} (${edu.period})${
        edu.grade ? ` - GPA: ${edu.grade}` : ""
      }`
  )
  .join("\n")}

=== CERTIFICATIONS ===
${certifications
  .map((cert) => `• ${cert.name} from ${cert.provider} (${cert.date})`)
  .join("\n")}

=== PERSONALITY INSIGHTS ===
${insights.map((insight) => `• ${insight.title}: ${insight.text}`).join("\n")}

=== FUN FACTS ===
${funFacts.map((fact) => `• ${fact.title}: ${fact.text}`).join("\n")}

=== SOCIAL MEDIA PRESENCE ===
• YouTube: ${userProfile.socials.youtube.url} (${
        userProfile.socials.youtube.handle
      })
• TikTok: ${userProfile.socials.tiktok.url} (${
        userProfile.socials.tiktok.handle
      })
• GitHub: ${userProfile.socials.github.url} (${
        userProfile.socials.github.handle
      })
• LinkedIn: ${userProfile.socials.linkedin.url} (${
        userProfile.socials.linkedin.handle
      })
• Instagram: ${userProfile.socials.instagram.url} (${
        userProfile.socials.instagram.handle
      })

=== CONTENT CREATION ACHIEVEMENTS ===
• 7.7K+ YouTube subscribers with 1.8M+ total views
• 17.2K+ TikTok followers
• Creates tech content teaching programming in practical ways
• Started content creation in March 2021

=== ENTREPRENEURSHIP ===
• Founder of Rental Mobil City Park (June 2024 - Present)
• Built frontend platform and digital presence for the business
• Digital strategist and web developer for the company

=== CURRENT PROJECTS & ROLES ===
• Informatics student at Universitas Multimedia Nusantara (GPA: 3.87)
• Coordinator of Web Development for UMN Festival 2025
• Content Creator on YouTube and TikTok
• Entrepreneur running Rental Mobil City Park

=== WORK STYLE & PERSONALITY ===
• Most productive during late night hours
• Fueled by ambition, not afraid to fail
• Endlessly curious about how things work
• Loves meeting and chatting with new people (despite seeming reserved)
• Ambitious and analytical, always striving to improve
• Expert in Jakarta's public transport routes
• Philosophy: "Every setback is a setup for the next level"

=== TECHNICAL EXPERTISE DETAILS ===
• Frontend: HTML5, CSS3, Tailwind CSS, JavaScript, TypeScript, React.js
• Backend: PHP, Laravel, MySQL, Python, REST API development
• DevOps: Git, GitHub, Firebase, Vercel, cPanel Hosting
• SEO and optimization tools
• UI/UX implementation and design-to-code conversion
• Mobile-first development approach
`;
      const contextPrompt = `You are David Garcia Saragih's AI assistant. Using the comprehensive information below, answer this question: "${input}"

${comprehensiveContext}

CONVERSATION CONTEXT:
Recent messages in this conversation:
${messages
  .slice(-3)
  .map((m) => `${m.type}: ${m.content}`)
  .join("\n")}

IMPORTANT INSTRUCTIONS:
- Answer based ONLY on the provided information about David
- Be friendly, conversational, and enthusiastic about David's achievements
- Use specific details and numbers from the context
- If the user gives a simple response like "yes", "right", "cool", "thanks" - treat it as conversational feedback, not a question
- For affirmative responses (yes/right/correct), acknowledge their agreement and offer to share more interesting facts
- For appreciation (thanks/cool/awesome), acknowledge gratefully and suggest related topics
- If asked about technical skills, mention specific proficiency levels
- If asked about experience, reference specific companies and roles
- If asked about personality, use the insights and fun facts
- Keep responses engaging but not too long (2-4 sentences max unless specifically asked for details)
- Use emojis sparingly for personality
- Always sound knowledgeable about all aspects of David's profile
- Adapt your response style based on the conversation flow
- If the user seems interested in a topic, offer to dive deeper into related areas

RESPONSE STYLE:
- Conversational and natural
- Enthusiastic but not overwhelming
- Context-aware of previous messages
- Encourage further exploration with relevant follow-up suggestions`; // Get AI response with FULL comprehensive context and conversation awareness
      const aiResponse = await generateAIResponse(contextPrompt);

      // Detect response type for better suggested replies
      let responseContext = "welcome";
      if (
        inputLower.includes("youtube") ||
        inputLower.includes("content") ||
        inputLower.includes("subscriber")
      ) {
        responseContext = "youtube";
      } else if (
        inputLower.includes("project") ||
        inputLower.includes("working")
      ) {
        responseContext = "projects";
      } else if (
        inputLower.includes("skill") ||
        inputLower.includes("technical") ||
        inputLower.includes("programming")
      ) {
        responseContext = "skills";
      } else if (
        inputLower.includes("business") ||
        inputLower.includes("entrepreneur")
      ) {
        responseContext = "business";
      } else if (
        inputLower.includes("education") ||
        inputLower.includes("university") ||
        inputLower.includes("gpa")
      ) {
        responseContext = "education";
      } else if (
        inputLower.includes("contact") ||
        inputLower.includes("email") ||
        inputLower.includes("connect")
      ) {
        responseContext = "contact";
      } else if (
        inputLower.includes("age") ||
        inputLower.includes("background") ||
        inputLower.includes("personal")
      ) {
        responseContext = "personal";
      }

      updateSuggestedReplies(responseContext);
      return aiResponse;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return handleFallbackResponse(input.toLowerCase());
    }
  };
  const handleFallbackResponse = (input) => {
    // Enhanced creative fallback responses using updated personalInfo
    const lowercaseInput = input.toLowerCase();

    // CV/Resume requests
    if (findBestMatch(lowercaseInput, ["cv", "resume", "curriculum"])) {
      const response = [
        "📄 You can download David's comprehensive CV here:",
        `🔗 ${window.location.origin}/CV-DavidGarciaSaragih.pdf`,
        "",
        "His CV includes complete details about:",
        "• Professional experience (6+ roles)",
        "• Technical skills across full-stack development",
        "• Educational background (GPA: 3.87)",
        "• Notable achievements and certifications",
        "",
        "What specific aspect would you like to know more about? 😊",
      ].join("\n");
      updateSuggestedReplies("cv");
      return response;
    }

    // Age/Personal info queries
    if (findBestMatch(lowercaseInput, ["age", "old", "born", "birth"])) {
      const response = [
        `David is currently ${personalInfo.basic.age} years old! 🎂`,
        `Born on September 13, 2005, in ${personalInfo.basic.birthPlace}.`,
        "",
        "Despite his young age, he's already achieved remarkable things:",
        `• Maintaining a ${personalInfo.educationalBackground[0].gpa} GPA in Informatics`,
        `• Building a YouTube audience of 7.7K+ subscribers`,
        `• Running his own business (Rental Mobil City Park)`,
        `• Leading web development for major university events`,
        "",
        "Pretty impressive for a 19-year-old, right? 🚀",
      ].join("\n");
      updateSuggestedReplies("personal");
      return response;
    }

    // Religion queries
    if (
      findBestMatch(lowercaseInput, [
        "religion",
        "faith",
        "belief",
        "christian",
      ])
    ) {
      const response = [
        `David is a ${personalInfo.basic.religion}. ✝️`,
        "",
        "His faith influences his approach to life and work, particularly his philosophy:",
        `"${personalInfo.basic.philosophy}"`,
        "",
        "This positive mindset shows in how he handles challenges in both his studies and business ventures.",
        "",
        "Would you like to know more about his goals or achievements? 😊",
      ].join("\n");
      updateSuggestedReplies("personal");
      return response;
    }

    // Goals and aspirations
    if (
      findBestMatch(lowercaseInput, [
        "goals",
        "future",
        "aspirations",
        "plans",
        "ambitions",
      ])
    ) {
      const response = [
        "🎯 David has some exciting goals ahead!",
        "",
        "**Short-term goals:**",
        personalInfo.goals.shortTerm.map((goal) => `• ${goal}`).join("\n"),
        "",
        "**Long-term vision:**",
        personalInfo.goals.longTerm.map((goal) => `• ${goal}`).join("\n"),
        "",
        "His ultimate aim is to be at the intersection of innovation, education, and community-building! 🚀",
        "",
        "What aspect of his journey interests you most?",
      ].join("\n");
      updateSuggestedReplies("goals");
      return response;
    }

    // Technical skills
    if (
      findBestMatch(lowercaseInput, [
        "skills",
        "technical",
        "programming",
        "tech",
        "expertise",
      ])
    ) {
      const response = [
        "💻 David's technical skills are quite impressive!",
        "",
        "**Frontend:** " + personalInfo.technicalSkills.frontend.join(", "),
        "**Backend:** " + personalInfo.technicalSkills.backend.join(", "),
        "**DevOps:** " + personalInfo.technicalSkills.devops.join(", "),
        "",
        "**Currently mastering:** " +
          personalInfo.interests.programming.currentlyLearning.join(", "),
        "",
        `He's particularly strong in full-stack development and has real-world experience through his ${personalInfo.professionalExperience.length} different roles!`,
        "",
        "Want to know about specific projects or his learning approach? 🤔",
      ].join("\n");
      updateSuggestedReplies("skills");
      return response;
    }

    // Education queries
    if (
      findBestMatch(lowercaseInput, [
        "education",
        "study",
        "university",
        "school",
        "gpa",
      ])
    ) {
      const current = personalInfo.educationalBackground[0];
      const previous = personalInfo.educationalBackground[1];
      const response = [
        "🎓 David's educational journey is quite impressive!",
        "",
        `**Currently:** ${current.level} at ${current.institution}`,
        `📊 GPA: ${current.gpa} (${current.period})`,
        "",
        `**Previously:** ${previous.level} at ${previous.institution}`,
        `🏆 Achievement: ${previous.achievement}`,
        "",
        "He's balancing academics with content creation and entrepreneurship - talk about time management skills! ⏰",
        "",
        "Curious about his projects or achievements? �",
      ].join("\n");
      updateSuggestedReplies("education");
      return response;
    }

    // Contact information
    if (
      findBestMatch(lowercaseInput, [
        "contact",
        "reach",
        "email",
        "phone",
        "connect",
      ])
    ) {
      const contact = personalInfo.basic.contactInfo;
      const social = personalInfo.socialMediaPresence;
      const response = [
        "📱 Here's how you can connect with David:",
        "",
        `📧 Email: ${contact.email}`,
        `� Phone: ${contact.phone}`,
        `🌐 Portfolio: ${contact.portfolio}`,
        "",
        "**Social Media:**",
        `• GitHub: ${social.github}`,
        `• Instagram: ${social.instagram}`,
        `• YouTube: ${social.youtube}`,
        `• TikTok: ${social.tiktok}`,
        "",
        "He's most active on YouTube and TikTok where he shares tech content! 🎥",
        "",
        "What's your preferred way to connect? 😊",
      ].join("\n");
      updateSuggestedReplies("contact");
      return response;
    }

    // Default welcome response
    const welcomeResponse = [
      "👋 Hey there! I'm David's AI assistant!",
      "",
      "I know everything about David Garcia Saragih - from his technical skills to his entrepreneurial journey. Here's what I can tell you about:",
      "",
      "🎯 **Personal Info:** Age, background, goals, philosophy",
      "💻 **Technical Skills:** Full-stack development expertise",
      "🎓 **Education:** Current studies and achievements",
      "💼 **Experience:** 6+ professional roles and projects",
      "🚀 **Entrepreneurship:** His business ventures",
      "🎥 **Content Creation:** YouTube/TikTok success",
      "📱 **Contact Info:** How to connect with him",
      "📄 **CV Download:** Get his complete resume",
      "",
      "What would you like to know about David? 😊",
    ].join("\n");

    updateSuggestedReplies("welcome");
    return welcomeResponse;
  }; // Update suggested replies with more comprehensive options
  const updateSuggestedReplies = (context) => {
    const repliesMap = {
      welcome: [
        "What's David's age and background?",
        "Show me his technical skills",
        "Tell me about his YouTube journey",
        "What projects is he working on?",
        "How can I contact him?",
      ],
      greeting: [
        "Tell me about his achievements",
        "What makes him unique?",
        "Show me his technical expertise",
        "His content creation journey",
        "What's his educational background?",
      ],
      affirmative: [
        "Tell me about his business ventures",
        "What programming languages does he know?",
        "Show me his social media stats",
        "What certifications does he have?",
        "How did he achieve all this at 19?",
      ],
      clarify: [
        "His technical skills breakdown",
        "Educational achievements and GPA",
        "Content creation statistics",
        "Professional work experience",
        "Personal interests and hobbies",
      ],
      thanks: [
        "What's his biggest achievement?",
        "Tell me about his learning approach",
        "Show me his future goals",
        "How can I connect with him?",
        "What inspired his career path?",
      ],
      personal: [
        "What are his biggest achievements?",
        "Tell me about his entrepreneurship",
        "Show me his educational background",
        "What are his future goals?",
        "How did he start content creation?",
      ],
      skills: [
        "What's he currently learning?",
        "Show me his work experience",
        "Tell me about his certifications",
        "What tools does he master?",
        "How proficient is he in React?",
      ],
      education: [
        "What's his GPA and achievements?",
        "Tell me about his work experience",
        "Show me his content creation stats",
        "What certifications does he have?",
        "How does he balance everything?",
      ],
      goals: [
        "What are his biggest achievements?",
        "Tell me about his current projects",
        "How can I work with him?",
        "Show me his business ventures",
        "What's his content creation like?",
      ],
      experience: [
        "Tell me about his business ventures",
        "What are his technical strengths?",
        "Show me his educational journey",
        "How many followers does he have?",
        "What programming languages does he know?",
      ],
      contact: [
        "Check out his YouTube channel",
        "Tell me about his business",
        "Download his complete CV",
        "What are his social media stats?",
        "Show me his latest projects",
      ],
      cv: [
        "What are his main technical skills?",
        "Tell me about his work experience",
        "How can I connect with David?",
        "Show me his content creation journey",
        "What are his educational achievements?",
      ],
      content: [
        "How many YouTube subscribers?",
        "Tell me about his TikTok success",
        "What type of content does he create?",
        "When did he start creating content?",
        "Show me his technical skills",
      ],
      business: [
        "What business does he run?",
        "Tell me about his technical roles",
        "How does he balance everything?",
        "Show me his educational background",
        "What are his future business plans?",
      ],
      youtube: [
        "How many total views does he have?",
        "What type of content does he create?",
        "When did he start his channel?",
        "Show me his other social platforms",
        "Tell me about his technical skills",
      ],
      projects: [
        "What's his role in UMN Festival?",
        "Tell me about his business",
        "Show me his technical expertise",
        "What are his current goals?",
        "How can I collaborate with him?",
      ],
    };

    setSuggestedReplies(repliesMap[context] || repliesMap.welcome);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Get response from chatbot
      const response = await generateResponse(inputMessage.trim());

      // Add bot message
      const botMessage = {
        type: "bot",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      // Add error message if something goes wrong
      const errorMessage = {
        type: "bot",
        content:
          "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedReply = async (reply) => {
    const userMessage = {
      type: "user",
      content: reply,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await generateResponse(reply);
      const botMessage = {
        type: "bot",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        type: "bot",
        content:
          "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const pulseAnimation = {
    initial: { scale: 1, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" },
    animate: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        "0 8px 12px -1px rgba(0, 0, 0, 0.2)",
        "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      ],
    },
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse",
    },
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-cyan-500 text-white shadow-lg hover:bg-cyan-600 transition-colors duration-300 flex items-center justify-center z-40 ${
          isOpen ? "hidden" : ""
        } md:bottom-6 md:right-6 md:w-14 md:h-14 bottom-4 right-4 w-12 h-12 sm:bottom-4 sm:right-4 sm:w-12 sm:h-12`}
        initial={pulseAnimation.initial}
        animate={pulseAnimation.animate}
        transition={pulseAnimation.transition}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Bot size={24} />
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className={`fixed z-50 transition-all duration-300
        ${
          isFullscreen
            ? "inset-4 w-auto h-auto"
            : "bottom-2 left-16 right-2 w-auto max-w-full h-[70vh] sm:bottom-6 sm:right-6 sm:left-auto sm:w-96 sm:h-[600px]"
        }
        bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col`}
          >
            {/* Header */}
            <div className="p-6 bg-cyan-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot size={24} />
                <h3 className="font-semibold">David's Portfolio Assistant</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize2 size={20} />
                  ) : (
                    <Maximize2 size={20} />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  title="Close chat"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 p-6 overflow-y-auto scroll-smooth"
            >
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  } mb-4`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.type === "user"
                        ? "bg-cyan-500 text-white rounded-br-none"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none"
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start mb-4"
                >
                  <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-2xl rounded-bl-none">
                    <Loader className="w-4 h-4 animate-spin" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Quick Replies */}
            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {suggestedReplies.map((reply, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSuggestedReply(reply)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full text-sm whitespace-nowrap hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    {reply}
                  </motion.button>
                ))}
              </div>
            </div>
            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-6 border-t border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="p-3 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
                >
                  <Send size={20} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
