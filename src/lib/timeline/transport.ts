import { create } from 'zustand';
import { player, renderer } from '@/app/global';
import {
  DEFAULT_PROJECT_DURATION,
  isValidFps,
  isValidProjectDuration,
  MAX_PROJECT_DURATION,
  MIN_PROJECT_DURATION,
  normalizeTimelineSettings,
  TIMELINE_FPS_OPTIONS,
  type TimelineFps,
  type TimelineSettings,
} from './settings';

// Saved settings are edited through the Document (setTimeline), which calls
// applyTimelineSettings; the transport only plays them.

export {
  DEFAULT_PROJECT_DURATION,
  isValidFps,
  isValidProjectDuration,
  MAX_PROJECT_DURATION,
  MIN_PROJECT_DURATION,
  normalizeTimelineSettings,
  TIMELINE_FPS_OPTIONS,
  type TimelineFps,
  type TimelineSettings,
};

/**
 * The project clock. Rendering, scrubbing, previews and export all read time
 * from here. While an audio file is playing its clock is authoritative (no
 * drift); past the end of the audio, or without audio, the transport advances
 * on its own until the project duration is reached.
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
  playing: boolean;
}

const EPSILON = 1e-6;

const transportStore = create<TransportState>(() => ({
  time: 0,
  duration: DEFAULT_PROJECT_DURATION,
  explicitDuration: false,
  fps: 30,
  playing: false,
}));

// Wall-clock anchor used when the audio clock is not driving playback.
let anchorTime = 0;
let anchorNow = 0;
// Set while the transport itself is calling into the player, so the player's
// echoed events do not feed back into the transport.
let syncing = false;
// Set between the player's `ended` and the `stop` it emits right after, so a
// natural end of the audio does not rewind a project that is still playing.
let audioEnded = false;
let bound = false;

function now() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function state() {
  return transportStore.getState();
}

function setState(partial: Partial<TransportState>) {
  transportStore.setState(partial);
}

function anchor(time: number) {
  anchorTime = time;
  anchorNow = now();
}

function guarded(callback: () => void) {
  syncing = true;
  try {
    callback();
  } finally {
    syncing = false;
  }
}

function clampTime(time: number, duration = state().duration) {
  if (!Number.isFinite(time)) {
    return 0;
  }

  return Math.max(0, Math.min(duration, time));
}

function audioDuration() {
  return player.canSeek() ? player.getDuration() : 0;
}

function resolveDuration(explicit: number | null) {
  return explicit ?? (audioDuration() || DEFAULT_PROJECT_DURATION);
}

export function getTransportState() {
  return state();
}

export function getProjectDuration() {
  return state().duration;
}

export function getProjectFps() {
  return state().fps;
}

export function getTransportTime() {
  return state().time;
}

export function isTransportPlaying() {
  return state().playing;
}

/** Move the audio to match the playhead; pause it when the playhead is past its end. */
function syncAudio(time: number, playing: boolean) {
  if (!player.canSeek()) {
    return;
  }

  guarded(() => {
    if (time < audioDuration()) {
      player.seekTime(time);

      if (playing && !player.isPlaying()) {
        player.play();
      }
    } else if (player.isPlaying()) {
      player.pause();
    }
  });
}

/**
 * Apply saved settings from the Document (load, undo, setTimeline). The playhead stays where
 * it is, clamped to the new duration.
 */
export function applyTimelineSettings(settings?: unknown) {
  const { duration, fps } = normalizeTimelineSettings(settings);
  const next = resolveDuration(duration);
  const current = state();

  if (
    current.duration === next &&
    current.explicitDuration === (duration !== null) &&
    current.fps === fps
  ) {
    return;
  }

  setState({ duration: next, explicitDuration: duration !== null, fps });

  if (current.time > next) {
    seekTransport(next);
  }

  renderer.requestRender();
}

export function seekTransport(time: number) {
  const { playing } = state();
  const next = clampTime(time);

  audioEnded = false;
  anchor(next);
  setState({ time: next });
  syncAudio(next, playing);
  renderer.requestRender();
}

/** Step the playhead by whole frames (negative steps backwards). */
export function stepTransport(frames: number) {
  const { time, fps } = state();
  const frame = Math.round(time * fps) + frames;

  seekTransport(frame / fps);
}

export function playTransport() {
  const current = state();

  if (current.playing) {
    return;
  }

  let time = current.time;

  if (time >= current.duration - EPSILON) {
    time = 0;
  }

  audioEnded = false;
  anchor(time);
  setState({ time, playing: true });

  guarded(() => {
    if (player.canSeek()) {
      if (time < audioDuration()) {
        player.seekTime(time);

        if (!player.isPlaying()) {
          player.play();
        }
      }
    } else if (player.hasSource() && !player.isPlaying()) {
      // Live inputs (microphone, desktop audio, MIDI) run alongside the clock.
      player.play();
    }
  });

  renderer.requestRender();
}

export function pauseTransport() {
  if (!state().playing) {
    return;
  }

  tickTransport();
  setState({ playing: false });

  guarded(() => {
    if (player.isPlaying()) {
      player.pause();
    }
  });

  renderer.requestRender();
}

export function toggleTransport() {
  if (state().playing) {
    pauseTransport();
  } else {
    playTransport();
  }
}

export function stopTransport() {
  audioEnded = false;
  anchor(0);
  setState({ time: 0, playing: false });

  guarded(() => {
    if (player.hasSource()) {
      player.stop();
    }
  });

  renderer.requestRender();
}

/**
 * Advance the clock for the frame being rendered and return the current time.
 * Called once per frame by the renderer.
 */
export function tickTransport(): number {
  const current = state();

  if (!current.playing) {
    return current.time;
  }

  let time: number;

  if (player.canSeek() && player.isPlaying()) {
    time = player.getCurrentTime();
    anchor(time);
  } else {
    time = anchorTime + (now() - anchorNow) / 1000;
  }

  if (time >= current.duration) {
    if (player.isLooping()) {
      audioEnded = false;
      anchor(0);
      setState({ time: 0 });
      syncAudio(0, true);
      return 0;
    }

    setState({ time: current.duration, playing: false });

    guarded(() => {
      if (player.canSeek() && player.isPlaying()) {
        player.pause();
      }
    });

    return current.duration;
  }

  if (time !== current.time) {
    setState({ time });
  }

  return time;
}

// --- Player events (the waveform, menu actions and MCP still drive the player directly) ---

function handlePlayerPlay() {
  if (syncing) {
    return;
  }

  audioEnded = false;
  const time = player.canSeek() ? clampTime(player.getCurrentTime()) : state().time;
  anchor(time);
  setState({ time, playing: true });
  renderer.requestRender();
}

function handlePlayerPause() {
  if (syncing) {
    return;
  }

  tickTransport();
  setState({ playing: false });
  renderer.requestRender();
}

function handlePlayerStop() {
  if (syncing) {
    return;
  }

  if (audioEnded) {
    // The audio ran out but the project keeps going on the wall clock.
    audioEnded = false;
    return;
  }

  anchor(0);
  setState({ time: 0, playing: false });
  renderer.requestRender();
}

function handlePlayerSeek() {
  if (syncing) {
    return;
  }

  const time = clampTime(player.getCurrentTime());
  anchor(time);
  setState({ time });
  renderer.requestRender();
}

function handlePlayerEnded() {
  audioEnded = true;
  anchor(Math.max(state().time, audioDuration()));
}

function handleAudioChange() {
  const current = state();
  const duration = current.explicitDuration ? current.duration : resolveDuration(null);

  setState({ duration, time: clampTime(current.time, duration) });
  renderer.requestRender();
}

/** Bind the transport to the player. Safe to call more than once. */
export function initTransport() {
  if (bound) {
    return;
  }

  bound = true;
  player.transportControlled = true;
  player.on('play', handlePlayerPlay);
  player.on('pause', handlePlayerPause);
  player.on('stop', handlePlayerStop);
  player.on('seek', handlePlayerSeek);
  player.on('ended', handlePlayerEnded);
  player.on('audio-load', handleAudioChange);
  player.on('audio-unload', handleAudioChange);
}

export default transportStore;
