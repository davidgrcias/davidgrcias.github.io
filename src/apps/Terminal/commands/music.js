/**
 * Music Commands
 * Commands for controlling the music player
 */

import { error, success, text, colored } from '../outputFormatter.js';

export function registerMusicCommands(registry, getContext) {
  // music - Music player control
  registry.registerCommand('music', {
    description: 'Control the music player',
    usage: 'music [play|pause|next|prev|list|vol <0-100>]',
    category: 'music',
    examples: [
      'music',
      'music play',
      'music pause',
      'music next',
      'music prev',
      'music list',
      'music vol 50'
    ],
    async execute(args) {
      const { music } = getContext();
      
      if (!music) {
        return [error('Music player not available')];
      }

      const action = args[0]?.toLowerCase();

      // Show current status
      if (!action) {
        const isPlaying = music.isPlaying ?? false;
        const currentTrack = music.currentTrack || music.currentSong || null;
        const volume = music.volume ?? 50;
        
        const output = [
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          colored('  Music Player', 'success'),
          colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
          text(''),
          text(`Status: ${isPlaying ? '▶️  Playing' : '⏸️  Paused'}`),
        ];

        if (currentTrack) {
          output.push(text(`Track: ${currentTrack.title || currentTrack.name || 'Unknown'}`));
          if (currentTrack.artist) {
            output.push(text(`Artist: ${currentTrack.artist}`));
          }
          if (currentTrack.album) {
            output.push(text(`Album: ${currentTrack.album}`));
          }
        } else {
          output.push(text('Track: No track loaded'));
        }

        output.push(text(''));
        output.push(text(`Volume: ${volume}%`));
        output.push(colored(`[${'█'.repeat(Math.floor(volume / 5))}${'░'.repeat(20 - Math.floor(volume / 5))}]`, 'info'));
        output.push(text(''));
        output.push(text('Commands:'));
        output.push(text('  music play   - Play/resume'));
        output.push(text('  music pause  - Pause'));
        output.push(text('  music next   - Next track'));
        output.push(text('  music prev   - Previous track'));
        output.push(text('  music list   - List all tracks'));
        output.push(text('  music vol N  - Set volume (0-100)'));
        output.push(colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'));

        return output;
      }

      // Handle actions
      try {
        switch (action) {
          case 'play':
          case 'resume':
            if (music.play) {
              music.play();
              return [success('Music playing')];
            } else if (music.resume) {
              music.resume();
              return [success('Music resumed')];
            }
            return [error('Play function not available')];

          case 'pause':
          case 'stop':
            if (music.pause) {
              music.pause();
              return [success('Music paused')];
            }
            return [error('Pause function not available')];

          case 'next':
          case 'skip':
            if (music.next) {
              music.next();
              const nextTrack = music.currentTrack || music.currentSong;
              const trackName = nextTrack?.title || nextTrack?.name || 'next track';
              return [success(`Skipped to: ${trackName}`)];
            } else if (music.nextTrack) {
              music.nextTrack();
              return [success('Skipped to next track')];
            }
            return [error('Next function not available')];

          case 'prev':
          case 'previous':
          case 'back':
            if (music.prev) {
              music.prev();
              const prevTrack = music.currentTrack || music.currentSong;
              const trackName = prevTrack?.title || prevTrack?.name || 'previous track';
              return [success(`Skipped to: ${trackName}`)];
            } else if (music.prevTrack || music.previousTrack) {
              (music.prevTrack || music.previousTrack)();
              return [success('Skipped to previous track')];
            }
            return [error('Previous function not available')];

          case 'list':
          case 'playlist':
          case 'tracks':
            const tracks = music.tracks || music.playlist || music.songs || [];
            
            if (tracks.length === 0) {
              return [text('No tracks available')];
            }

            const output = [
              colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
              colored('  Playlist', 'success'),
              colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'),
              text(''),
            ];

            const currentIndex = music.currentIndex ?? music.currentTrackIndex ?? 0;

            tracks.forEach((track, index) => {
              const isCurrent = index === currentIndex;
              const prefix = isCurrent ? '▶ ' : '  ';
              const trackName = track.title || track.name || `Track ${index + 1}`;
              const artist = track.artist ? ` - ${track.artist}` : '';
              const line = `${prefix}${index + 1}. ${trackName}${artist}`;
              
              if (isCurrent) {
                output.push(colored(line, 'success'));
              } else {
                output.push(text(line));
              }
            });

            output.push(text(''));
            output.push(text(`Total tracks: ${tracks.length}`));
            output.push(colored('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'primary'));

            return output;

          case 'vol':
          case 'volume':
            if (args.length < 2) {
              const currentVolume = music.volume ?? 50;
              return [
                text(`Current volume: ${currentVolume}%`),
                colored(`[${'█'.repeat(Math.floor(currentVolume / 5))}${'░'.repeat(20 - Math.floor(currentVolume / 5))}]`, 'info'),
              ];
            }

            const newVolume = parseInt(args[1]);
            
            if (isNaN(newVolume) || newVolume < 0 || newVolume > 100) {
              return [error('Volume must be a number between 0 and 100')];
            }

            if (music.setVolume) {
              music.setVolume(newVolume);
            } else if (music.volume !== undefined) {
              music.volume = newVolume;
            } else {
              return [error('Volume setter not available')];
            }

            return [
              success(`Music volume set to: ${newVolume}%`),
              colored(`[${'█'.repeat(Math.floor(newVolume / 5))}${'░'.repeat(20 - Math.floor(newVolume / 5))}]`, 'info'),
            ];

          case 'shuffle':
            if (music.shuffle || music.toggleShuffle) {
              if (music.toggleShuffle) {
                music.toggleShuffle();
              } else {
                music.shuffle = !music.shuffle;
              }
              const isShuffled = music.shuffle ?? music.isShuffled ?? false;
              return [success(`Shuffle: ${isShuffled ? 'ON' : 'OFF'}`)];
            }
            return [error('Shuffle function not available')];

          case 'repeat':
          case 'loop':
            if (music.repeat || music.toggleRepeat) {
              if (music.toggleRepeat) {
                music.toggleRepeat();
              } else {
                music.repeat = !music.repeat;
              }
              const isRepeating = music.repeat ?? music.isRepeating ?? false;
              return [success(`Repeat: ${isRepeating ? 'ON' : 'OFF'}`)];
            }
            return [error('Repeat function not available')];

          default:
            return [
              error(`Unknown music command: ${action}`),
              text('Available commands: play, pause, next, prev, list, vol'),
            ];
        }
      } catch (err) {
        return [error(`Music player error: ${err.message}`)];
      }
    },
  });

  // Shorthand aliases
  registry.registerCommand('play', {
    description: 'Play/resume music',
    usage: 'play',
    category: 'music',
    examples: ['play'],
    async execute() {
      const { music } = getContext();
      
      if (!music) {
        return [error('Music player not available')];
      }

      try {
        if (music.play) {
          music.play();
          return [success('Music playing')];
        } else if (music.resume) {
          music.resume();
          return [success('Music resumed')];
        }
        return [error('Play function not available')];
      } catch (err) {
        return [error(`Failed to play music: ${err.message}`)];
      }
    },
  });

  registry.registerCommand('pause', {
    description: 'Pause music',
    usage: 'pause',
    category: 'music',
    examples: ['pause'],
    async execute() {
      const { music } = getContext();
      
      if (!music) {
        return [error('Music player not available')];
      }

      try {
        if (music.pause) {
          music.pause();
          return [success('Music paused')];
        }
        return [error('Pause function not available')];
      } catch (err) {
        return [error(`Failed to pause music: ${err.message}`)];
      }
    },
  });
}
