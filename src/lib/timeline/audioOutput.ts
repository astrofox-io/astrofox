/**
 * What the Transport plays through. The Transport is the only owner of
 * playback: it decides when sound starts, stops and where it plays from, and
 * the output just does it. Nothing else starts or stops the output.
 *
 * Two adapters: the Web Audio Player (`src/lib/audio/playerOutput.ts`) and a
 * fake one for tests (`createFakeAudioOutput` below).
 */
export interface AudioOutput {
  /** Seconds of seekable audio (a loaded file); 0 for a live input or no audio. */
  duration(): number;
  /**
   * The audio's position in seconds while a file is sounding; null when it is
   * not (paused, past its end, a live input or no audio). The Transport follows
   * this clock while there is one and the wall clock otherwise.
   */
  currentTime(): number | null;
  /** A live input (microphone, desktop audio, MIDI) is the source: it has no length or position. */
  isLive(): boolean;
  /**
   * Sound from project time `time`, moving there if already sounding. A file
   * stays silent from its end onwards; a live input starts listening.
   */
  play(time: number): void;
  /** Stop sounding. Does nothing when already silent. */
  pause(): void;
  /** Called after the source changes: audio loaded or unloaded, a live input connected. */
  onSourceChange(listener: () => void): () => void;
}

/** No audio at all: the Transport runs on the wall clock. */
export const SILENT_OUTPUT: AudioOutput = {
  duration: () => 0,
  currentTime: () => null,
  isLive: () => false,
  play: () => {},
  pause: () => {},
  onSourceChange: () => () => {},
};

export interface FakeSource {
  /** Length of a loaded file in seconds; 0 for no file. */
  duration?: number;
  live?: boolean;
}

export interface FakeAudioOutput extends AudioOutput {
  /** Whether it is sounding (a file playing, or a live input listening). */
  readonly sounding: boolean;
  /** Replace the source, like loading a file or connecting a microphone. */
  setSource(source: FakeSource): void;
}

/**
 * An output that plays an imaginary file against `clock` (milliseconds), the
 * way the Web Audio Player does: its position runs on from where it started,
 * and it goes silent at the end of the file.
 */
export function createFakeAudioOutput(
  clock: () => number,
  source: FakeSource = {},
): FakeAudioOutput {
  let fileDuration = source.live ? 0 : (source.duration ?? 0);
  let live = !!source.live;
  let listening = false;
  let startedAt: number | null = null;
  let position = 0;
  const listeners = new Set<() => void>();

  function currentPosition() {
    if (startedAt === null) {
      return position;
    }

    return position + (clock() - startedAt) / 1000;
  }

  function pause() {
    position = currentPosition();
    startedAt = null;
    listening = false;
  }

  return {
    get sounding() {
      return listening || (startedAt !== null && currentPosition() < fileDuration);
    },
    duration: () => fileDuration,
    currentTime: () => (startedAt === null ? null : currentPosition()),
    isLive: () => live,
    play(time) {
      if (live) {
        listening = true;
        return;
      }

      if (time >= fileDuration) {
        pause();
        return;
      }

      position = time;
      startedAt = clock();
    },
    pause,
    onSourceChange(listener) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
    setSource(next) {
      pause();
      position = 0;
      live = !!next.live;
      fileDuration = live ? 0 : (next.duration ?? 0);

      for (const listener of listeners) {
        listener();
      }
    },
  };
}
