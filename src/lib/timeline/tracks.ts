import { MAX_CLIP_TIME } from './clip';

/**
 * Keyframe tracks: how a layer's property changes over project time.
 *
 * - A property without a track is static (its authored value).
 * - Keys are at absolute project seconds, sorted, at most one per time.
 * - Before the first key the track holds the first value; after the last key,
 *   the last value.
 * - Between two keys the value eases from one to the next with the left key's
 *   easing. `hold` keeps the left value until the next key.
 * - Colours blend in linear light, so a red to green fade does not go muddy.
 *
 * Everything here is a pure function of its arguments, so a time evaluates to
 * the same value live, in a preview and in an export.
 */

export const EASINGS = ['linear', 'hold', 'ease-in', 'ease-out', 'ease-in-out'] as const;
export type Easing = (typeof EASINGS)[number];
export const DEFAULT_EASING: Easing = 'linear';

/** What a track animates, decided by the property's control. */
export type TrackType = 'number' | 'color';

export interface Keyframe {
  time: number;
  value: number | string;
  easing: Easing;
}

export interface Track {
  type: TrackType;
  keyframes: Keyframe[];
}

/** A layer's tracks by property name. */
export type Tracks = Record<string, Track>;

/** At most this many keys per track. */
export const MAX_KEYFRAMES = 1000;

/** Keys closer than this are at the same time (float error from frame snapping). */
export const KEY_EPSILON = 1e-6;

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** The parts of a layer type that decide which properties can be animated. */
export interface AnimatableConfig {
  defaultProperties: Record<string, unknown>;
  controls?: Record<string, Record<string, unknown>>;
}

/**
 * The kind of track a property takes, or null when it cannot be animated.
 * Number and range controls animate as numbers, colour controls as colours;
 * a control can opt out with `animatable: false`.
 */
export function trackTypeFor(config: AnimatableConfig, property: string): TrackType | null {
  const control = config.controls?.[property];
  const value = config.defaultProperties[property];

  if (!control || control.animatable === false) {
    return null;
  }

  if ((control.type === 'number' || control.type === 'range') && typeof value === 'number') {
    return 'number';
  }

  if (control.type === 'color' && typeof value === 'string') {
    return 'color';
  }

  return null;
}

// ---- Easing -------------------------------------------------------------------

/** Progress 0..1 through a segment, eased. */
export function ease(easing: Easing, u: number): number {
  const t = Math.max(0, Math.min(1, u));

  switch (easing) {
    case 'hold':
      return t >= 1 ? 1 : 0;
    case 'ease-in':
      return t * t * t;
    case 'ease-out':
      return 1 - (1 - t) ** 3;
    case 'ease-in-out':
      return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
    default:
      return t;
  }
}

// ---- Colour ---------------------------------------------------------------------

function parseHex(color: string): [number, number, number] {
  let hex = color.slice(1);

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(c => c + c)
      .join('');
  }

  return [0, 2, 4].map(i => Number.parseInt(hex.slice(i, i + 2), 16) / 255) as [
    number,
    number,
    number,
  ];
}

function toLinear(c: number) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function toSrgb(c: number) {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
}

function toHexByte(c: number) {
  return Math.round(Math.max(0, Math.min(1, c)) * 255)
    .toString(16)
    .padStart(2, '0');
}

/** Blend two hex colours in linear light. Returns `#rrggbb`. */
export function mixColors(from: string, to: string, amount: number): string {
  const a = parseHex(from);
  const b = parseHex(to);

  return `#${a
    .map((channel, i) => {
      const linear = toLinear(channel) + (toLinear(b[i]) - toLinear(channel)) * amount;
      return toHexByte(toSrgb(linear));
    })
    .join('')}`;
}

export function isTrackColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR.test(value);
}

// ---- Evaluation -----------------------------------------------------------------

/** Index of the last key at or before `time`, or -1 before the first key. */
function keyBefore(keyframes: readonly Keyframe[], time: number) {
  let low = 0;
  let high = keyframes.length - 1;
  let found = -1;

  while (low <= high) {
    const mid = (low + high) >> 1;

    if (keyframes[mid].time <= time) {
      found = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return found;
}

/** The track's value at project time `time`. */
export function evaluateTrack(track: Track, time: number): number | string {
  const { keyframes } = track;
  const index = keyBefore(keyframes, time);

  if (index < 0) {
    return keyframes[0].value;
  }

  if (index >= keyframes.length - 1) {
    return keyframes[keyframes.length - 1].value;
  }

  const from = keyframes[index];
  const to = keyframes[index + 1];
  const amount = ease(from.easing, (time - from.time) / (to.time - from.time));

  if (track.type === 'color') {
    return mixColors(from.value as string, to.value as string, amount);
  }

  const a = from.value as number;
  const b = to.value as number;

  return a + (b - a) * amount;
}

// ---- Validation -----------------------------------------------------------------

/**
 * Throw unless `keyframes` is a valid list of keys for a track of `type`:
 * one or more keys, times in range and strictly increasing, values of the
 * track's type, known easings.
 */
export function checkKeyframes(keyframes: unknown, type: TrackType, label = 'track') {
  if (!Array.isArray(keyframes) || keyframes.length === 0) {
    throw new Error(`${label} must have at least one keyframe.`);
  }

  if (keyframes.length > MAX_KEYFRAMES) {
    throw new Error(`${label} has more than ${MAX_KEYFRAMES} keyframes.`);
  }

  let previous = Number.NEGATIVE_INFINITY;

  for (const key of keyframes) {
    if (!key || typeof key !== 'object' || Array.isArray(key)) {
      throw new Error(`Invalid keyframe in ${label}.`);
    }

    for (const field of Object.keys(key)) {
      if (!['time', 'value', 'easing'].includes(field)) {
        throw new Error(`Unsupported keyframe field in ${label}: ${field}`);
      }
    }

    const { time, value, easing } = key as Record<string, unknown>;

    if (typeof time !== 'number' || !Number.isFinite(time) || time < 0 || time > MAX_CLIP_TIME) {
      throw new Error(`${label} keyframe times must be seconds from 0 to ${MAX_CLIP_TIME}.`);
    }

    if (time - previous < KEY_EPSILON) {
      throw new Error(`${label} keyframes must be in time order, at most one per time.`);
    }

    previous = time;

    if (type === 'number') {
      if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > 1e8) {
        throw new Error(`${label} keyframe values must be finite numbers.`);
      }
    } else if (!isTrackColor(value)) {
      throw new Error(`${label} keyframe values must be hex colors (#rrggbb).`);
    }

    if (!EASINGS.includes(easing as Easing)) {
      throw new Error(`${label} keyframe easing must be one of: ${EASINGS.join(', ')}.`);
    }
  }
}

/**
 * Throw unless `tracks` is a valid set of tracks. `typeOf` gives the track
 * type each property takes (null: not animatable); without it, as for a
 * plugin that is not installed, only the tracks' own shape is checked.
 */
export function checkTracks(
  tracks: unknown,
  typeOf?: (property: string) => TrackType | null,
): asserts tracks is Tracks {
  if (!tracks || typeof tracks !== 'object' || Array.isArray(tracks)) {
    throw new Error('Invalid keyframe tracks.');
  }

  for (const [property, track] of Object.entries(tracks)) {
    if (!track || typeof track !== 'object' || Array.isArray(track)) {
      throw new Error(`Invalid keyframe track: ${property}`);
    }

    for (const field of Object.keys(track)) {
      if (field !== 'type' && field !== 'keyframes') {
        throw new Error(`Unsupported track field in ${property}: ${field}`);
      }
    }

    const { type, keyframes } = track as Record<string, unknown>;

    if (type !== 'number' && type !== 'color') {
      throw new Error(`Track ${property} must be of type number or color.`);
    }

    if (typeOf) {
      const expected = typeOf(property);

      if (!expected) {
        throw new Error(`${property} cannot be animated.`);
      }

      if (expected !== type) {
        throw new Error(`Track ${property} must be of type ${expected}.`);
      }
    }

    checkKeyframes(keyframes, type, property);
  }
}

// ---- Editing --------------------------------------------------------------------

/** Index of the key at `time`, or -1. */
export function keyIndexAt(track: Track | null | undefined, time: number) {
  if (!track) {
    return -1;
  }

  return track.keyframes.findIndex(key => Math.abs(key.time - time) < KEY_EPSILON);
}

function sortKeys(keyframes: Keyframe[]) {
  return keyframes.sort((a, b) => a.time - b.time);
}

/**
 * The keys with one set at `key.time`: a key already there takes the new
 * value (and the new easing, when given); otherwise a key is added.
 */
export function setKey(
  keyframes: readonly Keyframe[] | undefined,
  key: { time: number; value: number | string; easing?: Easing },
): Keyframe[] {
  const next = [...(keyframes ?? [])];
  const index = next.findIndex(item => Math.abs(item.time - key.time) < KEY_EPSILON);

  if (index > -1) {
    next[index] = {
      time: next[index].time,
      value: key.value,
      easing: key.easing ?? next[index].easing,
    };
    return next;
  }

  next.push({ time: key.time, value: key.value, easing: key.easing ?? DEFAULT_EASING });

  return sortKeys(next);
}

/** The keys without those at the given times. */
export function removeKeys(keyframes: readonly Keyframe[], times: readonly number[]): Keyframe[] {
  return keyframes.filter(key => !times.some(time => Math.abs(key.time - time) < KEY_EPSILON));
}

/** The keys with the easing of those at the given times changed. */
export function setEasing(
  keyframes: readonly Keyframe[],
  times: readonly number[],
  easing: Easing,
): Keyframe[] {
  return keyframes.map(key =>
    times.some(time => Math.abs(key.time - time) < KEY_EPSILON) ? { ...key, easing } : key,
  );
}

/**
 * Shift the keys at `times` by `delta` seconds, as a drag on the timeline
 * does. The moved keys stay together: the shift is limited so none goes
 * before 0 or past `maxTime`. A moved key landing on a key that did not move
 * replaces it.
 */
export function moveKeys(
  keyframes: readonly Keyframe[],
  times: readonly number[],
  delta: number,
  maxTime = MAX_CLIP_TIME,
): Keyframe[] {
  const moving = keyframes.filter(key =>
    times.some(time => Math.abs(key.time - time) < KEY_EPSILON),
  );

  if (moving.length === 0) {
    return [...keyframes];
  }

  const first = moving[0].time;
  const last = moving[moving.length - 1].time;
  const shift = Math.max(-first, Math.min(maxTime - last, delta));
  const moved = moving.map(key => ({ ...key, time: key.time + shift }));
  const staying = keyframes.filter(
    key =>
      !moving.includes(key) && !moved.some(item => Math.abs(item.time - key.time) < KEY_EPSILON),
  );

  return sortKeys([...staying, ...moved]);
}

/** Copies of tracks from untrusted input that already passed checkTracks. */
export function cloneTracks(tracks: Tracks | null | undefined): Tracks {
  const result: Tracks = {};

  for (const [property, track] of Object.entries(tracks ?? {})) {
    result[property] = {
      type: track.type,
      keyframes: track.keyframes.map(key => ({ ...key })),
    };
  }

  return result;
}
