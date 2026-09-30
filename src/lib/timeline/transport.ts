import { player, renderer } from '@/app/global';
import { playerOutput } from '@/lib/audio/playerOutput';
import { createTransport } from './createTransport';
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

// The app's Transport, playing through the Web Audio Player. The behaviour
// lives in createTransport.ts; this module wires it up. Saved settings are
// edited through the Document (setTimeline), which calls applyTimelineSettings.

export type { TransportState } from './createTransport';
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

// `renderer` is read when called, not now: this module loads while
// `@/app/global` is still being evaluated.
const transport = createTransport({ requestRender: () => renderer.requestRender() });

let attached = false;

export const getTransportState = transport.getState;
export const applyTimelineSettings = transport.applySettings;
export const seekTransport = transport.seek;
export const stepTransport = transport.step;
export const playTransport = transport.play;
export const pauseTransport = transport.pause;
export const toggleTransport = transport.toggle;
export const stopTransport = transport.stop;
export const setTransportLoop = transport.setLoop;
export const tickTransport = transport.tick;

export function getProjectDuration() {
  return transport.getState().duration;
}

export function getProjectFps() {
  return transport.getState().fps;
}

export function getTransportTime() {
  return transport.getState().time;
}

export function isTransportPlaying() {
  return transport.getState().playing;
}

/** Play through the app's audio player from now on. Safe to call more than once. */
export function initTransport() {
  if (attached) {
    return;
  }

  attached = true;
  transport.attach(playerOutput(player));
}

export default transport.store;
