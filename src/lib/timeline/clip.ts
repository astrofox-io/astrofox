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
  const rawEnd = clampTime(finiteOr(raw.end, 0));
  const end = rawEnd > start ? rawEnd : null;
  const fadeIn = clampTime(finiteOr(raw.fadeIn, 0));
  const fadeOut = clampTime(finiteOr(raw.fadeOut, 0));

  if (start === 0 && end === null && fadeIn === 0 && fadeOut === 0) {
    return null;
  }

  return { start, end, fadeIn, fadeOut };
}

function patchedClip(current: Clip | null | undefined, patch: ClipPatch): Clip {
  const base = current ?? EMPTY_CLIP;

  return {
    start: patch.start === undefined ? base.start : (patch.start ?? 0),
    end: patch.end === undefined ? base.end : patch.end,
    fadeIn: patch.fadeIn === undefined ? base.fadeIn : (patch.fadeIn ?? 0),
    fadeOut: patch.fadeOut === undefined ? base.fadeOut : (patch.fadeOut ?? 0),
  };
}

/**
 * Check that every field is a known clip field holding null or a number of
 * seconds in range. Says nothing about how the fields relate; project files
 * rely on normalizeClip for that.
 */
export function validateClipFields(input: unknown): asserts input is ClipPatch {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Invalid timeline clip.');
  }

  for (const [key, value] of Object.entries(input)) {
    if (!Object.hasOwn(EMPTY_CLIP, key)) {
      throw new Error(`Unsupported clip field: ${key}`);
    }

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
}

/**
 * Throw a descriptive error for an edit that normalizeClip would silently fix.
 * The patch is checked against the clip it applies to, so a lone `end` is
 * compared with the existing start. An explicit end may lie past the project
 * end (shortening a project keeps authored timing), but an edited start must
 * fall before it.
 */
export function validateClipPatch(
  patch: unknown,
  current?: Clip | null,
  duration?: number,
): asserts patch is ClipPatch {
  validateClipFields(patch);

  const next = patchedClip(current, patch);

  if (next.end !== null && next.end <= next.start) {
    throw new Error('clip.end must be later than clip.start.');
  }

  if (duration !== undefined && patch.start !== undefined && next.start >= duration) {
    throw new Error(`clip.start must be before the project end (${duration}s).`);
  }
}

/**
 * Apply an edit to a clip (or none): omitted fields are kept, null resets a
 * field. Throws like validateClipPatch instead of repairing a bad edit.
 */
export function mergeClip(
  current: Clip | null | undefined,
  patch: ClipPatch,
  duration?: number,
): Clip | null {
  validateClipPatch(patch, current, duration);

  return normalizeClip(patchedClip(current, patch));
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

/**
 * Whether a layer is drawn at a project time: enabled and inside its clip.
 * Derived from the frame alone, never from an earlier evaluation.
 */
export function isVisibleAt(
  layer: { enabled?: boolean; clip?: Clip | null } | null | undefined,
  time: number,
  duration?: number,
): boolean {
  return !!layer && layer.enabled !== false && isClipActive(layer.clip, time, duration);
}

/**
 * The part of a clip that lies inside the project, as the timeline draws and
 * edits it. `openEnd` is true when the clip runs to the project end.
 */
export function clipRange(clip: Clip | null | undefined, duration: number) {
  const end = Math.max(0, Math.min(duration, clip?.end ?? duration));

  return { start: Math.min(clip?.start ?? 0, end), end, openEnd: !clip || clip.end === null };
}

/** Distance within which a dragged edge snaps to another edge, in px. */
export const SNAP_DISTANCE = 6;

/**
 * Snap a time to the nearest candidate (other clip edges, the playhead)
 * within SNAP_DISTANCE pixels, otherwise to a whole frame when frame
 * snapping is on.
 */
export function snapTime(
  time: number,
  candidates: readonly number[],
  pixelsPerSecond: number,
  snapFrames: boolean,
  fps: number,
) {
  let best = Number.POSITIVE_INFINITY;
  let snapped = time;

  for (const candidate of candidates) {
    const distance = Math.abs(candidate - time) * pixelsPerSecond;

    if (distance <= SNAP_DISTANCE && distance < best) {
      best = distance;
      snapped = candidate;
    }
  }

  if (best < Number.POSITIVE_INFINITY) {
    return snapped;
  }

  return snapFrames ? snapToFrame(time, fps) : time;
}

/**
 * An edit made on the timeline. `move` shifts the clip by `delta` seconds;
 * the trims put one edge at `time`.
 */
export type ClipEdit =
  | { type: 'move'; delta: number }
  | { type: 'trim-start'; time: number }
  | { type: 'trim-end'; time: number };

export interface ClipEditOptions {
  duration: number;
  fps: number;
  /** Applied to the edited edge before the limits, e.g. snapTime. */
  snap?: (time: number) => number;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Turn a timeline edit into the patch that satisfies the editing rules, for
 * pointer drags and typed values alike:
 *
 * - edges stay inside the project and a clip keeps at least one frame;
 * - a move keeps a closed clip's length, snapping whichever edge is nearer a
 *   target;
 * - an open clip keeps ending at the project end, so a move shifts its start;
 * - trimming the end to the project end makes the clip open again.
 *
 * The result always passes validateClipPatch for the same clip and duration.
 */
export function editClip(
  clip: Clip | null | undefined,
  edit: ClipEdit,
  { duration, fps, snap = time => time }: ClipEditOptions,
): ClipPatch {
  const { start, end, openEnd } = clipRange(clip, duration);
  const frame = Math.min(duration, fps > 0 ? 1 / fps : 1 / 30);

  if (edit.type === 'trim-start') {
    return { start: clamp(snap(edit.time), 0, Math.max(0, end - frame)) };
  }

  if (edit.type === 'trim-end') {
    const next = clamp(snap(edit.time), Math.min(duration, start + frame), duration);

    return { end: next >= duration - 1e-6 ? null : next };
  }

  if (openEnd || !clip || clip.end === null) {
    return { start: clamp(snap(start + edit.delta), 0, Math.max(0, duration - frame)) };
  }

  // The real length, even when part of the clip lies past the project end.
  const length = clip.end - clip.start;
  let next = snap(clip.start + edit.delta);
  const snappedEnd = snap(next + length);

  if (snappedEnd !== next + length) {
    next = snappedEnd - length;
  }

  next = clamp(next, 0, Math.max(0, duration - length));

  return { start: next, end: next + length };
}
