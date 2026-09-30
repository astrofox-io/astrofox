/**
 * The saved half of the timeline: project duration and frame rate. Pure, so
 * the Document can validate and store it without loading the transport (which
 * needs a live AudioContext).
 */

export const TIMELINE_FPS_OPTIONS = [30, 60] as const;
export type TimelineFps = (typeof TIMELINE_FPS_OPTIONS)[number];
export const DEFAULT_PROJECT_DURATION = 30;
export const MIN_PROJECT_DURATION = 1;
export const MAX_PROJECT_DURATION = 4 * 60 * 60;

/** Saved in the project file. `duration: null` follows the loaded audio. */
export interface TimelineSettings {
  duration: number | null;
  fps: TimelineFps;
}

export function isValidFps(value: unknown): value is TimelineFps {
  return (TIMELINE_FPS_OPTIONS as readonly number[]).includes(value as number);
}

export function isValidProjectDuration(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= MIN_PROJECT_DURATION &&
    value <= MAX_PROJECT_DURATION
  );
}

/** Coerce untrusted input (project files, MCP arguments) into valid settings. */
export function normalizeTimelineSettings(input: unknown): TimelineSettings {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;

  return {
    duration: isValidProjectDuration(raw.duration) ? raw.duration : null,
    fps: isValidFps(raw.fps) ? raw.fps : 30,
  };
}
