/**
 * A clip decides when an element is active on the project timeline.
 *
 * - An element without a clip is active for the whole project.
 * - `end: null` means "until the project ends".
 * - `fadeIn` / `fadeOut` scale the element's `opacity` (when it has one) over
 *   the given number of seconds at each end of the clip.
 *
 * Times are absolute seconds from the project start.
 */
export interface Clip {
  start: number;
  end: number | null;
  fadeIn: number;
  fadeOut: number;
}

/** Partial edit: `undefined` keeps the current value, `null` resets it. */
export interface ClipPatch {
  start?: number | null;
  end?: number | null;
  fadeIn?: number | null;
  fadeOut?: number | null;
}

/** Four hours; keeps arithmetic finite for any input. */
export const MAX_CLIP_TIME = 4 * 60 * 60;

const EMPTY_CLIP: Clip = { start: 0, end: null, fadeIn: 0, fadeOut: 0 };

function finiteOr(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clampTime(value: number) {
  return Math.min(MAX_CLIP_TIME, Math.max(0, value));
}

/**
 * Coerce untrusted input (project files, MCP arguments) into a valid clip.
 * Returns null when the input is not a clip or is equivalent to "no clip".
 */
export function normalizeClip(input: unknown): Clip | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return null;
  }

  const raw = input as Record<string, unknown>;
  const start = clampTime(finiteOr(raw.start, 0));
  const rawEnd = finiteOr(raw.end, Number.NaN);
  const end = Number.isFinite(rawEnd) && rawEnd > start ? clampTime(rawEnd) : null;
  const fadeIn = clampTime(finiteOr(raw.fadeIn, 0));
  const fadeOut = clampTime(finiteOr(raw.fadeOut, 0));

  if (start === 0 && end === null && fadeIn === 0 && fadeOut === 0) {
    return null;
  }

  return { start, end, fadeIn, fadeOut };
}

/** Apply a patch to an existing clip (or none) and normalize the result. */
export function mergeClip(current: Clip | null | undefined, patch: ClipPatch): Clip | null {
  const base = current ?? EMPTY_CLIP;

  return normalizeClip({
    start: patch.start === undefined ? base.start : (patch.start ?? 0),
    end: patch.end === undefined ? base.end : patch.end,
    fadeIn: patch.fadeIn === undefined ? base.fadeIn : (patch.fadeIn ?? 0),
    fadeOut: patch.fadeOut === undefined ? base.fadeOut : (patch.fadeOut ?? 0),
  });
}

/** Throw a descriptive error for values that normalizeClip would silently fix. */
export function validateClipPatch(patch: ClipPatch, duration?: number) {
  for (const key of ['start', 'end', 'fadeIn', 'fadeOut'] as const) {
    const value = patch[key];

    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error(`clip.${key} must be a finite number of seconds.`);
    }

    if (value < 0) {
      throw new Error(`clip.${key} must be >= 0.`);
    }

    if (value > MAX_CLIP_TIME) {
      throw new Error(`clip.${key} exceeds ${MAX_CLIP_TIME} seconds.`);
    }
  }

  if (
    typeof patch.start === 'number' &&
    typeof patch.end === 'number' &&
    patch.end <= patch.start
  ) {
    throw new Error('clip.end must be later than clip.start.');
  }

  if (duration !== undefined && typeof patch.start === 'number' && patch.start >= duration) {
    throw new Error(`clip.start must be before the project end (${duration}s).`);
  }
}

/** Resolved end of a clip, using the project duration for open-ended clips. */
export function clipEnd(clip: Clip, duration?: number): number {
  if (clip.end !== null) {
    return clip.end;
  }

  return duration !== undefined && Number.isFinite(duration) ? duration : Number.POSITIVE_INFINITY;
}

/** Half-open interval: active at `start`, inactive at `end`, so cuts never overlap. */
export function isClipActive(clip: Clip | null | undefined, time: number, duration?: number) {
  if (!clip) {
    return true;
  }

  return time >= clip.start && time < clipEnd(clip, duration);
}

/** Opacity multiplier 0..1 from the clip fades; 0 outside the clip. */
export function clipEnvelope(clip: Clip | null | undefined, time: number, duration?: number) {
  if (!clip) {
    return 1;
  }

  if (!isClipActive(clip, time, duration)) {
    return 0;
  }

  const end = clipEnd(clip, duration);
  let envelope = 1;

  if (clip.fadeIn > 0) {
    envelope = Math.min(envelope, (time - clip.start) / clip.fadeIn);
  }

  if (clip.fadeOut > 0 && Number.isFinite(end)) {
    envelope = Math.min(envelope, (end - time) / clip.fadeOut);
  }

  return Math.max(0, Math.min(1, envelope));
}

/** Snap a time to the nearest frame boundary. */
export function snapToFrame(time: number, fps: number) {
  if (!(fps > 0)) {
    return time;
  }

  return Math.round(time * fps) / fps;
}
