# Remaining Tasks - Terminal & Voice Control Implementation

**Last Updated:** February 10, 2026  
**Branch:** feature/responsivity  
**Progress:** 20/40 Tasks Completed (50%)  
**Status:** Terminal ✅ Complete | Voice Control ⏳ In Progress

---

## 📊 Overall Progress

### ✅ COMPLETED (Tasks 1-20)

#### Terminal Implementation (100% Complete)
- [x] **Task 1-5:** Core Infrastructure
  - Command Registry System (`commandRegistry.js`)
  - Command Parser (`commandParser.js`)
  - Virtual Filesystem (`virtualFS.js`)
  - Output Formatter (`outputFormatter.js`)
  - Terminal Themes (`terminalThemes.js`)

- [x] **Task 6:** Documentation
  - Comprehensive PRD/PDD (`docs/PRD-Terminal-VoiceControl.md`)

- [x] **Task 7-16:** Command Modules (70+ commands total)
  - Filesystem Commands: `ls`, `cd`, `pwd`, `cat`, `mkdir`, `touch`, `find`, `tree`, `file`, `head`, `tail`, `wc`, `du`
  - System Commands: `whoami`, `hostname`, `uname`, `uptime`, `date`, `ps`, `kill`, `env`, `export`, `shutdown`, `reboot`, `lock`, `sleep`, `history`, `alias`, `unalias`
  - App Commands: `open`, `close`, `minimize`, `maximize`, `focus`, `apps`, `pin`, `unpin`
  - Info Commands: `about`, `skills`, `projects`, `experience`, `education`, `certifications`, `contact`, `social`, `achievements`, `funfacts`
  - Settings Commands: `theme`, `volume`, `sound`, `wallpaper`, `lang`, `cursor`, `performance`
  - Utils Commands: `echo`, `clear`, `reset`, `exit`, `which`, `type`, `calc`, `grep`, `json`, `seq`, etc.
  - Fun Commands: `neofetch`, `cowsay`, `figlet`, `fortune`, `matrix`, `lolcat`, `sl`, `rickroll`, `hack`, `sudo`, `cmatrix`, `snake`
  - Music Commands: `music play/pause/next/prev/list/vol/shuffle/repeat`
  - Navigation Commands: `help`, `man`, `version`, `credits`, `welcome`, `motd`, `readme`
  - Notification Commands: `notify`, `notifications`, `alert`, `confirm`, `prompt`

- [x] **Task 17:** Terminal Hooks
  - `useTerminal.js` - Main terminal state & command execution
  - `useCommandHistory.js` - Persistent command history
  - `useTabCompletion.js` - Tab completion for commands & paths
  - `useTerminalKeyboard.js` - Keyboard shortcuts (Ctrl+C, Ctrl+L, etc.)

- [x] **Task 18:** Terminal UI Components
  - `TerminalPrompt.jsx` - Command prompt display
  - `TerminalInput.jsx` - Input field with auto-focus
  - `TerminalOutput.jsx` - Output rendering with colors

- [x] **Task 19:** Main Terminal Component
  - `TerminalApp.jsx` - Fully refactored with all integrations

- [x] **Task 20:** Voice Command Registry
  - `voice/voiceCommandRegistry.js` - Registry for voice intents

---

## ⏳ REMAINING TASKS (Tasks 21-40)

### 🎤 Voice Control System (Tasks 21-37)

#### Phase 1: Core Voice Infrastructure (Tasks 21-22)

**Task 21: Create NLU Parser** ⚠️ HIGH PRIORITY
- **File:** `src/voice/nluParser.js`
- **Purpose:** Natural Language Understanding parser
- **Features Required:**
  - Entity extraction (app names, numbers, dates, etc.)
  - Intent classification
  - Context awareness (multi-turn conversations)
  - Slot filling for required parameters
  - Confidence scoring
- **Examples:**
  ```javascript
  parseUtterance("open the terminal app")
  // Returns: { intent: "OPEN_APP", entities: { appName: "terminal" }, confidence: 0.95 }
  
  parseUtterance("set volume to 50")
  // Returns: { intent: "SET_VOLUME", entities: { level: 50 }, confidence: 0.92 }
  ```

**Task 22: Create Intent Matcher** ⚠️ HIGH PRIORITY
- **File:** `src/voice/intentMatcher.js`
- **Purpose:** Match parsed utterances to registered voice commands
- **Features Required:**
  - Fuzzy matching for similar phrases
  - Synonym handling (e.g., "open" = "launch" = "start")
  - Multi-language support (EN, ID)
  - Confidence threshold filtering
  - Fallback strategies for low confidence
- **Algorithm:**
  1. Tokenize input
  2. Match against registered patterns
  3. Score each match with confidence
  4. Return best match or suggest alternatives

---

#### Phase 2: Voice Command Modules (Tasks 23-32)

**Task 23: Voice System Commands**
- **File:** `src/voice/commands/system.js`
- **Intents:** `CHANGE_THEME`, `SET_VOLUME`, `SHUTDOWN`, `LOCK`, `REBOOT`, `OPEN_SETTINGS`, `MUTE`, `UNMUTE`
- **Patterns:**
  - "change theme to {theme}"
  - "set volume to {number}"
  - "turn off the system"
  - "lock my screen"
- **Integration:** ThemeContext, SoundContext, OSContext

**Task 24: Voice App Commands**
- **File:** `src/voice/commands/apps.js`
- **Intents:** `OPEN_APP`, `CLOSE_APP`, `SWITCH_APP`, `MINIMIZE_APP`, `MAXIMIZE_APP`, `LIST_APPS`
- **Patterns:**
  - "open {appName}"
  - "close {appName}"
  - "switch to {appName}"
  - "minimize all windows"
- **Integration:** OSContext (window management)

**Task 25: Voice Navigation Commands**
- **File:** `src/voice/commands/navigation.js`
- **Intents:** `SCROLL_UP`, `SCROLL_DOWN`, `GO_BACK`, `GO_HOME`, `SEARCH`, `GO_TO_SECTION`
- **Patterns:**
  - "scroll down"
  - "go back"
  - "take me home"
  - "search for {query}"

**Task 26: Voice Info Commands**
- **File:** `src/voice/commands/info.js`
- **Intents:** `SHOW_SKILLS`, `SHOW_PROJECTS`, `SHOW_EXPERIENCE`, `SHOW_EDUCATION`, `SHOW_CONTACT`
- **Patterns:**
  - "show my skills"
  - "what are my projects"
  - "tell me about my experience"

**Task 27: Voice Media Commands**
- **File:** `src/voice/commands/media.js`
- **Intents:** `PLAY_MUSIC`, `PAUSE_MUSIC`, `NEXT_TRACK`, `PREV_TRACK`, `VOLUME_UP`, `VOLUME_DOWN`, `SHUFFLE`, `REPEAT`
- **Patterns:**
  - "play music"
  - "next song"
  - "volume up"
- **Integration:** MusicPlayerContext

**Task 28: Voice Search Commands**
- **File:** `src/voice/commands/search.js`
- **Intents:** `SEARCH_PROJECTS`, `SEARCH_SKILLS`, `FIND_FILE`, `SEARCH_GLOBAL`
- **Patterns:**
  - "search for {query} in projects"
  - "find skill {skillName}"

**Task 29: Voice Filesystem Commands**
- **File:** `src/voice/commands/filesystem.js`
- **Intents:** `LIST_FILES`, `OPEN_FILE`, `CREATE_FOLDER`, `DELETE_FILE`, `NAVIGATE_TO`
- **Patterns:**
  - "list files"
  - "open file {fileName}"
  - "create folder {folderName}"

**Task 30: Voice Notification Commands**
- **File:** `src/voice/commands/notifications.js`
- **Intents:** `SHOW_NOTIFICATIONS`, `CLEAR_NOTIFICATIONS`, `READ_NOTIFICATION`
- **Patterns:**
  - "show notifications"
  - "clear all notifications"

**Task 31: Voice Social Commands**
- **File:** `src/voice/commands/social.js`
- **Intents:** `SHOW_SOCIAL`, `OPEN_GITHUB`, `OPEN_LINKEDIN`, `OPEN_TWITTER`, `SEND_EMAIL`
- **Patterns:**
  - "show social links"
  - "open my GitHub"

**Task 32: Voice Fun Commands**
- **File:** `src/voice/commands/fun.js`
- **Intents:** `TELL_JOKE`, `FUN_FACT`, `EASTER_EGG`, `COMPLIMENT`
- **Patterns:**
  - "tell me a joke"
  - "give me a fun fact"
  - "do something fun"

---

#### Phase 3: Voice Response & Feedback (Tasks 33-34)

**Task 33: Voice Response Generator**
- **File:** `src/voice/responseGenerator.js`
- **Purpose:** Generate natural, contextual voice responses
- **Features:**
  - Dynamic response templates
  - Personality injection (casual, professional, funny)
  - Context-aware responses (time of day, user history)
  - Multi-language support
  - TTS (Text-to-Speech) integration
- **Example:**
  ```javascript
  generateResponse({
    intent: "OPEN_APP",
    entities: { appName: "terminal" },
    success: true
  })
  // Returns: "Opening Terminal for you!" or "Terminal is now open"
  ```

**Task 34: Voice Feedback System**
- **File:** `src/voice/voiceFeedback.js`
- **Purpose:** Audio/visual feedback during voice interaction
- **Features:**
  - Listening indicator (pulsing animation)
  - Transcription display (real-time)
  - Success/error sound effects
  - Visual confirmation (toast/notification)
  - Loading states during command execution

---

#### Phase 4: Integration & Enhancement (Tasks 35-37)

**Task 35: Refactor VoiceContext** ⚠️ CRITICAL
- **File:** `src/contexts/VoiceContext.jsx`
- **Current State:** Basic Web Speech API integration
- **Required Changes:**
  1. Integrate VoiceCommandRegistry
  2. Add NLU Parser for utterance processing
  3. Implement Intent Matcher
  4. Add command execution pipeline
  5. Store conversation history
  6. Add context tracking (multi-turn)
  7. Improve error handling
- **New Methods:**
  - `registerVoiceCommand(config)`
  - `executeVoiceCommand(intent, entities)`
  - `getConversationHistory()`
  - `setContext(key, value)`
  - `trainCustomCommand(utterances, action)`

**Task 36: Voice Assistant Component**
- **File:** `src/components/VoiceAssistant.jsx`
- **Purpose:** Improved UI for voice interactions
- **Features:**
  - Animated listening state (waveform/ripple)
  - Live transcription display
  - Command confirmation
  - Response display with TTS
  - Voice history panel
  - Quick actions (retry, cancel)
- **Design:**
  - Floating button with expand/collapse
  - Dark/light mode support
  - Accessibility (ARIA labels)

**Task 37: Voice Training Mode**
- **File:** `src/voice/trainingMode.js`
- **Purpose:** Let users train custom voice commands
- **Features:**
  - Record multiple utterances for same command
  - Test command recognition
  - Adjust confidence thresholds
  - Import/export voice profiles
  - Analytics (command usage, accuracy)

---

### 🧪 Testing Phase (Tasks 38-40)

**Task 38: Test Terminal Features**
- **Coverage Required:**
  - All 70+ commands execute correctly
  - Filesystem navigation works (cd, ls, tree)
  - Command chaining (`&&`, `||`, `;`)
  - Pipes work (`|`)
  - Aliases persist and expand correctly
  - History navigation (up/down arrows)
  - Tab completion for commands & paths
  - Keyboard shortcuts (Ctrl+C, Ctrl+L, etc.)
  - Theme switching
  - Context integration (OS, Theme, Sound, etc.)
- **Test Files:**
  - `src/apps/Terminal/__tests__/commands.test.js`
  - `src/apps/Terminal/__tests__/parser.test.js`
  - `src/apps/Terminal/__tests__/filesystem.test.js`

**Task 39: Test Voice Features**
- **Coverage Required:**
  - All 30+ voice command categories
  - NLU accuracy (intent classification)
  - Entity extraction correctness
  - Confidence scoring reliability
  - Multi-turn context handling
  - Multi-language support (EN, ID)
  - Fallback strategies
  - Error handling (no match, low confidence)
- **Test Files:**
  - `src/voice/__tests__/nluParser.test.js`
  - `src/voice/__tests__/intentMatcher.test.js`
  - `src/voice/__tests__/commands.test.js`

**Task 40: Integration Testing**
- **Coverage Required:**
  - Terminal commands via voice (e.g., "run ls command")
  - Voice commands via terminal (e.g., `voice "open terminal"`)
  - Cross-context interactions (Theme, Sound, Music, etc.)
  - Performance under load
  - Memory leaks check
  - Accessibility (keyboard-only, screen readers)
  - Mobile responsiveness
- **Test Files:**
  - `src/__tests__/integration.test.js`

---

## 📁 File Structure Reference

```
src/
├── apps/
│   └── Terminal/
│       ├── TerminalApp.jsx ✅
│       ├── commandRegistry.js ✅
│       ├── commandParser.js ✅
│       ├── virtualFS.js ✅
│       ├── outputFormatter.js ✅
│       ├── terminalThemes.js ✅
│       ├── commands/
│       │   ├── filesystem.js ✅
│       │   ├── system.js ✅
│       │   ├── apps.js ✅
│       │   ├── info.js ✅
│       │   ├── settings.js ✅
│       │   ├── utils.js ✅
│       │   ├── fun.js ✅
│       │   ├── music.js ✅
│       │   ├── navigation.js ✅
│       │   └── notifications.js ✅
│       ├── hooks/
│       │   ├── useTerminal.js ✅
│       │   ├── useCommandHistory.js ✅
│       │   ├── useTabCompletion.js ✅
│       │   └── useTerminalKeyboard.js ✅
│       └── components/
│           ├── TerminalPrompt.jsx ✅
│           ├── TerminalInput.jsx ✅
│           └── TerminalOutput.jsx ✅
│
├── voice/
│   ├── voiceCommandRegistry.js ✅
│   ├── nluParser.js ⏳ TODO (Task 21)
│   ├── intentMatcher.js ⏳ TODO (Task 22)
│   ├── responseGenerator.js ⏳ TODO (Task 33)
│   ├── voiceFeedback.js ⏳ TODO (Task 34)
│   ├── trainingMode.js ⏳ TODO (Task 37)
│   └── commands/
│       ├── system.js ⏳ TODO (Task 23)
│       ├── apps.js ⏳ TODO (Task 24)
│       ├── navigation.js ⏳ TODO (Task 25)
│       ├── info.js ⏳ TODO (Task 26)
│       ├── media.js ⏳ TODO (Task 27)
│       ├── search.js ⏳ TODO (Task 28)
│       ├── filesystem.js ⏳ TODO (Task 29)
│       ├── notifications.js ⏳ TODO (Task 30)
│       ├── social.js ⏳ TODO (Task 31)
│       └── fun.js ⏳ TODO (Task 32)
│
├── contexts/
│   └── VoiceContext.jsx ⏳ TODO (Task 35 - Refactor)
│
├── components/
│   └── VoiceAssistant.jsx ⏳ TODO (Task 36)
│
└── __tests__/ ⏳ TODO (Tasks 38-40)
```

---

## 🎯 Implementation Guidelines

### Code Patterns to Follow

#### 1. Voice Command Registration Pattern
```javascript
// Example from voice/commands/system.js
export function registerSystemVoiceCommands(registry, getContext) {
  registry.registerCommand({
    intent: 'CHANGE_THEME',
    patterns: [
      'change theme to {theme}',
      'set theme to {theme}',
      'switch to {theme} theme',
      'use {theme} mode',
    ],
    examples: [
      'change theme to dark',
      'set theme to cyberpunk',
    ],
    entities: {
      theme: { type: 'string', required: true },
    },
    category: 'system',
    description: 'Change the system theme',
    responses: {
      success: 'Theme changed to {theme}',
      error: 'Failed to change theme',
    },
    async action(entities) {
      const { theme } = getContext();
      theme.setTheme(entities.theme);
    },
  });
}
```

#### 2. NLU Pattern Matching
```javascript
// Simple pattern to regex conversion
function patternToRegex(pattern) {
  // Convert {entityName} to named capture groups
  const regex = pattern
    .replace(/\{(\w+)\}/g, '(?<$1>[\\w\\s]+)')
    .replace(/\s+/g, '\\s+');
  return new RegExp(`^${regex}$`, 'i');
}
```

#### 3. Context Integration
All voice commands should access contexts via `getContext()`:
```javascript
const { os, theme, sound, music, notification, translation } = getContext();
```

### Error Handling
- Always wrap command execution in try-catch
- Provide user-friendly error messages
- Log errors for debugging
- Fallback to suggestions when command not found

### Accessibility
- Provide keyboard alternatives for voice commands
- ARIA labels for voice UI
- Visual feedback for hearing-impaired users
- Text-based alternatives

---

## 🚀 Quick Start for Next Developer

### 1. Setup Environment
```bash
cd c:\Personal\davidgrcias.github.io
git checkout feature/responsivity
npm install
```

### 2. Review Completed Work
- Read `docs/PRD-Terminal-VoiceControl.md` for full specifications
- Check `src/apps/Terminal/` for terminal implementation
- Review `src/voice/voiceCommandRegistry.js` for voice registry pattern

### 3. Start with High Priority Tasks
1. **Task 21:** NLU Parser (critical for voice understanding)
2. **Task 22:** Intent Matcher (critical for command execution)
3. **Task 23-32:** Voice command modules (can be parallelized)
4. **Task 35:** VoiceContext refactor (integrates everything)

### 4. Testing Strategy
- Unit test each voice command module
- Integration test with existing contexts
- E2E test with real voice input

---

## 📝 Notes & Considerations

### Performance
- NLU parsing should be < 100ms for good UX
- Cache compiled regex patterns
- Debounce voice input to avoid excessive processing

### Multi-language Support
- Pattern matching should work for both EN and ID
- Use translation context for response generation
- Store language-specific patterns separately

### Privacy
- Voice recordings should NOT be stored permanently
- Only store transcriptions if user consents
- Clear voice history on logout

### Fallbacks
- When confidence < 0.7, ask for confirmation
- Suggest similar commands when no match found
- Allow manual command selection from suggestions

---

## 🔗 Related Documentation
- [PRD/PDD Document](./PRD-Terminal-VoiceControl.md) - Full specifications
- [Implementation Progress](./IMPLEMENTATION_PROGRESS.md) - Detailed progress tracking

---

**Last Updated:** February 10, 2026  
**Next Session:** Start with Task 21 (NLU Parser)  
**Estimated Remaining Time:** 15-20 hours  
**Estimated Remaining LOC:** ~5,000 lines
