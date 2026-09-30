import type { AudioOutput } from '@/lib/timeline/audioOutput';
import type Player from './Player';

/**
 * The Web Audio Player as the Transport's audio output. A loaded file plays
 * from the project time it is given; a live input (microphone, desktop audio,
 * MIDI) listens while the Transport plays.
 */
export function playerOutput(player: Player): AudioOutput {
  return {
    duration: () => (player.canSeek() ? player.getDuration() : 0),

    currentTime: () => (player.canSeek() && player.isPlaying() ? player.getCurrentTime() : null),

    isLive: () => player.isLive(),

    play(time) {
      if (player.canSeek()) {
        if (time >= player.getDuration()) {
          if (player.isPlaying()) {
            player.pause();
          }
          return;
        }

        player.seekTime(time);

        if (!player.isPlaying()) {
          player.play();
        }
        return;
      }

      if (player.hasSource() && !player.isPlaying()) {
        player.play();
      }
    },

    pause() {
      if (player.isPlaying()) {
        player.pause();
      }
    },

    onSourceChange(listener) {
      player.on('source-change', listener);

      return () => player.off('source-change', listener);
    },
  };
}
