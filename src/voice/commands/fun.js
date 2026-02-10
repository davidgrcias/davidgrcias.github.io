/**
 * Voice Fun Commands
 * Handles entertaining and playful voice commands
 */

export function registerFunVoiceCommands(registry, getContext) {
  // TELL_JOKE
  registry.registerCommand({
    intent: 'TELL_JOKE',
    patterns: [
      'tell me a joke',
      'joke',
      'make me laugh',
      'funny joke',
      'say something funny',
    ],
    examples: [
      'tell me a joke',
      'joke',
      'make me laugh',
    ],
    category: 'fun',
    description: 'Tell a joke',
    responses: {
      success: 'Here is a joke',
      error: 'Failed to tell joke',
    },
    async action(entities) {
      const { notification } = getContext();
      
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs!",
        "Why do Java developers wear glasses? Because they don't C#!",
        "What's a programmer's favorite hangout place? Foo Bar!",
        "How many programmers does it take to change a light bulb? None, that's a hardware problem!",
        "Why did the developer go broke? Because he used up all his cache!",
      ];
      
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      
      notification.addNotification({
        title: '😄 Joke',
        message: randomJoke,
        type: 'info',
      });
      
      return { success: true, joke: randomJoke };
    },
  });

  // FUN_FACT
  registry.registerCommand({
    intent: 'FUN_FACT',
    patterns: [
      'fun fact',
      'tell me a fun fact',
      'interesting fact',
      'random fact',
      'give me a fact',
    ],
    examples: [
      'fun fact',
      'tell me a fun fact',
      'random fact',
    ],
    category: 'fun',
    description: 'Share a fun fact',
    responses: {
      success: 'Here is a fun fact',
      error: 'Failed to share fun fact',
    },
    async action(entities) {
      const { notification } = getContext();
      
      const facts = [
        "The first computer bug was an actual real-life bug! A moth got trapped in a computer in 1947.",
        "The first ever website is still online! It was created in 1991 by Tim Berners-Lee.",
        "The average person blinks about 15-20 times per minute!",
        "JavaScript was created in just 10 days!",
        "The first 1GB hard drive weighed over 500 pounds!",
      ];
      
      const randomFact = facts[Math.floor(Math.random() * facts.length)];
      
      notification.addNotification({
        title: '💡 Fun Fact',
        message: randomFact,
        type: 'info',
      });
      
      return { success: true, fact: randomFact };
    },
  });

  // COMPLIMENT
  registry.registerCommand({
    intent: 'COMPLIMENT',
    patterns: [
      'compliment me',
      'say something nice',
      'give me a compliment',
      'make me feel good',
    ],
    examples: [
      'compliment me',
      'say something nice',
      'give me a compliment',
    ],
    category: 'fun',
    description: 'Give a compliment',
    responses: {
      success: 'Here is a compliment',
      error: 'Failed to give compliment',
    },
    async action(entities) {
      const { notification } = getContext();
      
      const compliments = [
        "You're doing great! Keep up the amazing work!",
        "Your curiosity and willingness to explore is inspiring!",
        "You have excellent taste in portfolios!",
        "You're learning so fast! That's impressive!",
        "Your dedication to improvement is admirable!",
      ];
      
      const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
      
      notification.addNotification({
        title: '🌟 Compliment',
        message: randomCompliment,
        type: 'success',
      });
      
      return { success: true, compliment: randomCompliment };
    },
  });

  // EASTER_EGG
  registry.registerCommand({
    intent: 'EASTER_EGG',
    patterns: [
      'easter egg',
      'secret',
      'hidden feature',
      'surprise me',
      'do something cool',
    ],
    examples: [
      'easter egg',
      'secret',
      'surprise me',
    ],
    category: 'fun',
    description: 'Trigger an easter egg',
    responses: {
      success: 'Easter egg activated!',
      error: 'Failed to activate easter egg',
    },
    async action(entities) {
      const { notification } = getContext();
      
      notification.addNotification({
        title: '🥚 Easter Egg Found!',
        message: 'Try the Konami code: ↑↑↓↓←→←→BA',
        type: 'info',
      });
      
      return { success: true };
    },
  });

  // MAGIC_8_BALL
  registry.registerCommand({
    intent: 'MAGIC_8_BALL',
    patterns: [
      'magic 8 ball {question}',
      'should i {question}',
      'will i {question}',
    ],
    examples: [
      'should i learn react',
      'will i finish this project',
      'magic 8 ball will I succeed',
    ],
    entities: {
      question: {
        type: 'string',
        required: false,
      },
    },
    category: 'fun',
    description: 'Ask the magic 8 ball',
    responses: {
      success: 'The magic 8 ball says...',
      error: 'Failed to consult magic 8 ball',
    },
    async action(entities) {
      const { notification } = getContext();
      
      const answers = [
        "Yes, definitely!",
        "It is certain!",
        "Without a doubt!",
        "Reply hazy, try again",
        "Ask again later",
        "Better not tell you now",
        "Cannot predict now",
        "Don't count on it",
        "My sources say no",
        "Outlook not so good",
      ];
      
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      
      notification.addNotification({
        title: '🎱 Magic 8 Ball',
        message: randomAnswer,
        type: 'info',
      });
      
      return { success: true, answer: randomAnswer };
    },
  });

  // MOTIVATE
  registry.registerCommand({
    intent: 'MOTIVATE',
    patterns: [
      'motivate me',
      'i need motivation',
      'inspire me',
      'give me motivation',
    ],
    examples: [
      'motivate me',
      'i need motivation',
      'inspire me',
    ],
    category: 'fun',
    description: 'Get motivational message',
    responses: {
      success: 'Here is some motivation',
      error: 'Failed to motivate',
    },
    async action(entities) {
      const { notification } = getContext();
      
      const quotes = [
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Code is like humor. When you have to explain it, it's bad. - Cory House",
        "First, solve the problem. Then, write the code. - John Johnson",
        "Experience is the name everyone gives to their mistakes. - Oscar Wilde",
        "The best error message is the one that never shows up. - Thomas Fuchs",
      ];
      
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      
      notification.addNotification({
        title: '💪 Motivation',
        message: randomQuote,
        type: 'success',
      });
      
      return { success: true, quote: randomQuote };
    },
  });

  // PLAY_SNAKE
  registry.registerCommand({
    intent: 'PLAY_SNAKE',
    patterns: [
      'play snake',
      'snake game',
      'start snake',
      'play a game',
    ],
    examples: [
      'play snake',
      'snake game',
    ],
    category: 'fun',
    description: 'Play snake game',
    responses: {
      success: 'Starting snake game',
      error: 'Failed to start snake game',
    },
    async action(entities) {
      const { os } = getContext();
      
      // Trigger snake game easter egg
      const event = new KeyboardEvent('keydown', { 
        key: 's',
        ctrlKey: true,
        shiftKey: true,
      });
      document.dispatchEvent(event);
      
      return { success: true, game: 'snake' };
    },
  });

  // TIME_OF_DAY_GREETING
  registry.registerCommand({
    intent: 'GREETING',
    patterns: [
      'hello',
      'hi',
      'hey',
      'greetings',
      'good morning',
      'good afternoon',
      'good evening',
    ],
    examples: [
      'hello',
      'hi',
      'hey',
    ],
    category: 'fun',
    description: 'Greet the user',
    responses: {
      success: 'Greeting sent',
      error: 'Failed to greet',
    },
    async action(entities) {
      const { notification } = getContext();
      
      const hour = new Date().getHours();
      let greeting = 'Hello';
      
      if (hour < 12) {
        greeting = 'Good morning';
      } else if (hour < 18) {
        greeting = 'Good afternoon';
      } else {
        greeting = 'Good evening';
      }
      
      notification.addNotification({
        title: `${greeting}! 👋`,
        message: "Welcome to David's portfolio! How can I help you today?",
        type: 'info',
      });
      
      return { success: true, greeting };
    },
  });
}

export default registerFunVoiceCommands;
