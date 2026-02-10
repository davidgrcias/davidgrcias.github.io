/**
 * Voice Media Commands
 * Handles music player and media controls
 */

export function registerMediaVoiceCommands(registry, getContext) {
  // PLAY_MUSIC
  registry.registerCommand({
    intent: 'PLAY_MUSIC',
    patterns: [
      'play music',
      'play',
      'start music',
      'resume music',
      'continue music',
      'play song',
    ],
    examples: [
      'play music',
      'play',
      'start music',
    ],
    category: 'media',
    description: 'Play music',
    responses: {
      success: 'Playing music',
      error: 'Failed to play music',
    },
    async action(entities) {
      const { music } = getContext();
      
      if (!music) {
        throw new Error('Music player not available');
      }
      
      music.play();
      
      return { success: true, playing: true };
    },
  });

  // PAUSE_MUSIC
  registry.registerCommand({
    intent: 'PAUSE_MUSIC',
    patterns: [
      'pause music',
      'pause',
      'stop music',
      'halt music',
    ],
    examples: [
      'pause music',
      'pause',
      'stop music',
    ],
    category: 'media',
    description: 'Pause music',
    responses: {
      success: 'Music paused',
      error: 'Failed to pause music',
    },
    async action(entities) {
      const { music } = getContext();
      
      if (!music) {
        throw new Error('Music player not available');
      }
      
      music.pause();
      
      return { success: true, playing: false };
    },
  });

  // NEXT_TRACK
  registry.registerCommand({
    intent: 'NEXT_TRACK',
    patterns: [
      'next song',
      'next track',
      'skip song',
      'next',
      'skip',
      'play next',
    ],
    examples: [
      'next song',
      'next track',
      'skip',
    ],
    category: 'media',
    description: 'Play next song',
    responses: {
      success: 'Playing next song',
      error: 'Failed to skip song',
    },
    async action(entities) {
      const { music } = getContext();
      
      if (!music) {
        throw new Error('Music player not available');
      }
      
      music.next();
      
      return { success: true };
    },
  });

  // PREVIOUS_TRACK
  registry.registerCommand({
    intent: 'PREVIOUS_TRACK',
    patterns: [
      'previous song',
      'previous track',
      'last song',
      'previous',
      'back',
      'play previous',
    ],
    examples: [
      'previous song',
      'previous track',
      'last song',
    ],
    category: 'media',
    description: 'Play previous song',
    responses: {
      success: 'Playing previous song',
      error: 'Failed to go back',
    },
    async action(entities) {
      const { music } = getContext();
      
      if (!music) {
        throw new Error('Music player not available');
      }
      
      music.previous();
      
      return { success: true };
    },
  });

  // MUSIC_VOLUME_UP
  registry.registerCommand({
    intent: 'MUSIC_VOLUME_UP',
    patterns: [
      'music volume up',
      'increase music volume',
      'louder music',
      'turn up music',
    ],
    examples: [
      'music volume up',
      'increase music volume',
      'louder music',
    ],
    category: 'media',
    description: 'Increase music volume',
    responses: {
      success: 'Music volume increased',
      error: 'Failed to increase music volume',
    },
    async action(entities) {
      const { music } = getContext();
      
      if (!music) {
        throw new Error('Music player not available');
      }
      
      const currentVolume = music.volume || 0.5;
      const newVolume = Math.min(1, currentVolume + 0.1);
      music.setVolume(newVolume);
      
      return { success: true, volume: Math.round(newVolume * 100) };
    },
  });

  // MUSIC_VOLUME_DOWN
  registry.registerCommand({
    intent: 'MUSIC_VOLUME_DOWN',
    patterns: [
      'music volume down',
      'decrease music volume',
      'quieter music',
      'turn down music',
    ],
    examples: [
      'music volume down',
      'decrease music volume',
      'quieter music',
    ],
    category: 'media',
    description: 'Decrease music volume',
    responses: {
      success: 'Music volume decreased',
      error: 'Failed to decrease music volume',
    },
    async action(entities) {
      const { music } = getContext();
      
      if (!music) {
        throw new Error('Music player not available');
      }
      
      const currentVolume = music.volume || 0.5;
      const newVolume = Math.max(0, currentVolume - 0.1);
      music.setVolume(newVolume);
      
      return { success: true, volume: Math.round(newVolume * 100) };
    },
  });

  // SET_MUSIC_VOLUME
  registry.registerCommand({
    intent: 'SET_MUSIC_VOLUME',
    patterns: [
      'set music volume to {number}',
      'music volume {number}',
      'change music volume to {number}',
    ],
    examples: [
      'set music volume to 50',
      'music volume 75',
    ],
    entities: {
      number: {
        type: 'number',
        required: true,
        min: 0,
        max: 100,
      },
    },
    category: 'media',
    description: 'Set music volume',
    responses: {
      success: 'Music volume set to {number}%',
      error: 'Failed to set music volume',
    },
    async action(entities) {
      const { music } = getContext();
      
      if (!music) {
        throw new Error('Music player not available');
      }
      
      const volume = Math.max(0, Math.min(100, entities.number));
      music.setVolume(volume / 100);
      
      return { success: true, volume };
    },
  });

  // SHUFFLE_MUSIC
  registry.registerCommand({
    intent: 'SHUFFLE_MUSIC',
    patterns: [
      'shuffle',
      'shuffle music',
      'turn on shuffle',
      'enable shuffle',
      'play random',
    ],
    examples: [
      'shuffle',
      'shuffle music',
      'turn on shuffle',
    ],
    category: 'media',
    description: 'Enable shuffle mode',
    responses: {
      success: 'Shuffle enabled',
      error: 'Failed to enable shuffle',
    },
    async action(entities) {
      const { music } = getContext();
      
      if (!music) {
        throw new Error('Music player not available');
      }
      
      music.setShuffle(true);
      
      return { success: true, shuffle: true };
    },
  });

  // REPEAT_MUSIC
  registry.registerCommand({
    intent: 'REPEAT_MUSIC',
    patterns: [
      'repeat',
      'repeat music',
      'turn on repeat',
      'enable repeat',
      'loop music',
    ],
    examples: [
      'repeat',
      'repeat music',
      'turn on repeat',
    ],
    category: 'media',
    description: 'Enable repeat mode',
    responses: {
      success: 'Repeat enabled',
      error: 'Failed to enable repeat',
    },
    async action(entities) {
      const { music } = getContext();
      
      if (!music) {
        throw new Error('Music player not available');
      }
      
      music.setRepeat(true);
      
      return { success: true, repeat: true };
    },
  });

  // LIST_SONGS
  registry.registerCommand({
    intent: 'LIST_SONGS',
    patterns: [
      'list songs',
      'show playlist',
      'what songs',
      'show songs',
      'music list',
    ],
    examples: [
      'list songs',
      'show playlist',
      'what songs',
    ],
    category: 'media',
    description: 'Show playlist',
    responses: {
      success: 'Here is the playlist',
      error: 'Failed to show playlist',
    },
    async action(entities) {
      const { music } = getContext();
      
      if (!music) {
        throw new Error('Music player not available');
      }
      
      const playlist = music.playlist || [];
      
      return { 
        success: true, 
        playlist,
        count: playlist.length,
      };
    },
  });

  // CURRENT_SONG
  registry.registerCommand({
    intent: 'CURRENT_SONG',
    patterns: [
      'what song is this',
      'current song',
      'what is playing',
      'song name',
      'what am i listening to',
    ],
    examples: [
      'what song is this',
      'current song',
      'what is playing',
    ],
    category: 'media',
    description: 'Show current song',
    responses: {
      success: 'Currently playing: {song}',
      error: 'No song is playing',
    },
    async action(entities) {
      const { music } = getContext();
      
      if (!music) {
        throw new Error('Music player not available');
      }
      
      const currentSong = music.currentSong;
      
      if (!currentSong) {
        throw new Error('No song is currently playing');
      }
      
      return { 
        success: true, 
        song: currentSong.title || currentSong.name,
        artist: currentSong.artist,
      };
    },
  });
}

export default registerMediaVoiceCommands;
