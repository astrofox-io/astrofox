import { create } from 'zustand';
import { type AudioOutput, SILENT_OUTPUT } from './audioOutput';
import { DEFAULT_PROJECT_DURATION, normalizeTimelineSettings, type TimelineFps } from './settings';

/**
 * The project clock and the only owner of playback. Rendering, scrubbing,
 * previews and export read time from here, and play, pause, seek and loop all
 * go through here. The audio output is told what to do; it never reports
 * back except for its clock.
 *
 * While an audio file is sounding its clock is authoritative (no drift). Past
 * the end of the audio, or without audio, the transport advances on the wall
 * clock until the project end. A live input has no end, so the project loops
 * while one is the source.
 *
 * Time is always absolute seconds from the project start.
 */

export interface TransportState {
  /** Playhead in seconds. */
  time: number;
  /** Effective project duration in seconds. */
  duration: number;
  /** True when the duration was set explicitly instead of following the audio. */
  explicitDuration: boolean;
  fps: TimelineFps;
  /** The one answer to "is it playing?". */
  playing: boolean;
  /** Start again from zero at the project end. */
  loop: boolean;
}

export interface TransportDeps {
  requestRender(): void;
  /** Milliseconds, for the wall clock. */
  now?(): number;
}

const EPSILON = 1e-6;

function defaultNow() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

export function createTransport({ requestRender, now = defaultNow }: TransportDeps) {
  const store = create<TransportState>(() => ({
    time: 0,
    duration: DEFAULT_PROJECT_DURATION,
    explicitDuration: false,
    fps: 30,
    playing: false,
    loop: false,
  }));

  let output: AudioOutput = SILENT_OUTPUT;
  let detachOutput: (() => void) | null = null;
  // Wall-clock anchor used when the audio clock is not driving playback.
  let anchorTime = 0;
  let anchorNow = 0;

  function get() {
    return store.getState();
  }

  function set(partial: Partial<TransportState>) {
    store.setState(partial);
  }

  function anchor(time: number) {
    anchorTime = time;
    anchorNow = now();
  }

  function clamp(time: number, duration = get().duration) {
    if (!Number.isFinite(time)) {
      return 0;
    }

    return Math.max(0, Math.min(duration, time));
  }

  function resolveDuration(explicit: number | null) {
    return explicit ?? (output.duration() || DEFAULT_PROJECT_DURATION);
  }

  /**
   * Apply saved settings from the Document (load, undo, setTimeline). The
   * playhead stays where it is, clamped to the new duration.
   */
  function applySettings(settings?: unknown) {
    const { duration, fps } = normalizeTimelineSettings(settings);
    const next = resolveDuration(duration);
    const current = get();

    if (
      current.duration === next &&
      current.explicitDuration === (duration !== null) &&
      current.fps === fps
    ) {
      return;
    }

    set({ duration: next, explicitDuration: duration !== null, fps });

    if (current.time > next) {
      seek(next);
    }

    requestRender();
  }

  function seek(time: number) {
    const next = clamp(time);

    anchor(next);
    set({ time: next });

    if (get().playing) {
      output.play(next);
    }

    requestRender();
  }

  /** Step the playhead by whole frames (negative steps backwards). */
  function step(frames: number) {
    const { time, fps } = get();

    seek((Math.round(time * fps) + frames) / fps);
  }

  /** Play from the playhead, or from the start when it is at the end. */
  function play() {
    const current = get();

    if (current.playing) {
      return;
    }

    const time = current.time >= current.duration - EPSILON ? 0 : current.time;

    anchor(time);
    set({ time, playing: true });
    output.play(time);
    requestRender();
  }

  function pause() {
    if (!get().playing) {
      return;
    }

    tick();
    set({ playing: false });
    output.pause();
    requestRender();
  }

  function toggle() {
    if (get().playing) {
      pause();
    } else {
      play();
    }
  }

  /** Pause and return to the start. */
  function stop() {
    anchor(0);
    set({ time: 0, playing: false });
    output.pause();
    requestRender();
  }

  function setLoop(loop: boolean) {
    set({ loop });
  }

  /**
   * Advance the clock for the frame being rendered and return the current
   * time. Called once per frame by the renderer.
   */
  function tick(): number {
    const current = get();

    if (!current.playing) {
      return current.time;
    }

    const audioTime = output.currentTime();
    let time: number;

    if (audioTime !== null) {
      time = audioTime;
      anchor(time);

      if (audioTime >= output.duration()) {
        // The audio ran out; the wall clock carries on from here.
        output.pause();
      }
    } else {
      time = anchorTime + (now() - anchorNow) / 1000;
    }

    if (time >= current.duration) {
      if (current.loop || output.isLive()) {
        anchor(0);
        set({ time: 0 });
        output.play(0);
        return 0;
      }

      set({ time: current.duration, playing: false });
      output.pause();
      return current.duration;
    }

    if (time !== current.time) {
      set({ time });
    }

    return time;
  }

  /**
   * A new source (audio loaded or unloaded, a live input connected) pauses
   * playback. The duration follows the new audio unless it was set
   * explicitly, and the playhead stays where it is.
   */
  function handleSourceChange() {
    const current = get();
    const duration = current.explicitDuration ? current.duration : resolveDuration(null);
    const time = clamp(current.time, duration);

    anchor(time);
    set({ duration, time, playing: false });
    output.pause();
    requestRender();
  }

  /** Play through `next` from now on. Returns a function that detaches it again. */
  function attach(next: AudioOutput) {
    output.pause();
    detachOutput?.();
    output = next;

    const unsubscribe = next.onSourceChange(handleSourceChange);

    handleSourceChange();

    detachOutput = () => {
      unsubscribe();

      if (output === next) {
        output = SILENT_OUTPUT;
        detachOutput = null;
      }
    };

    return detachOutput;
  }

  return {
    store,
    getState: get,
    applySettings,
    seek,
    step,
    play,
    pause,
    toggle,
    stop,
    setLoop,
    tick,
    attach,
  };
}

export type Transport = ReturnType<typeof createTransport>;
