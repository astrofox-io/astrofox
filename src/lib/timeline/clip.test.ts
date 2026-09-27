import { describe, expect, it } from 'vitest';
import {
  clipEnd,
  clipEnvelope,
  isClipActive,
  MAX_CLIP_TIME,
  mergeClip,
  normalizeClip,
  snapToFrame,
  validateClipPatch,
} from './clip';

describe('normalizeClip', () => {
  it('returns null for non-objects and for the "always on" clip', () => {
    expect(normalizeClip(undefined)).toBeNull();
    expect(normalizeClip(null)).toBeNull();
    expect(normalizeClip('4')).toBeNull();
    expect(normalizeClip([1, 2])).toBeNull();
    expect(normalizeClip({})).toBeNull();
    expect(normalizeClip({ start: 0, end: null, fadeIn: 0, fadeOut: 0 })).toBeNull();
  });

  it('fills defaults and clamps values', () => {
    expect(normalizeClip({ start: 4 })).toEqual({ start: 4, end: null, fadeIn: 0, fadeOut: 0 });
    expect(normalizeClip({ start: -3, end: 2 })).toEqual({
      start: 0,
      end: 2,
      fadeIn: 0,
      fadeOut: 0,
    });
    expect(normalizeClip({ start: 1e9 })?.start).toBe(MAX_CLIP_TIME);
  });

  it('drops an end that is not after the start', () => {
    expect(normalizeClip({ start: 5, end: 5 })?.end).toBeNull();
    expect(normalizeClip({ start: 5, end: 2 })?.end).toBeNull();
    expect(normalizeClip({ start: 5, end: Number.NaN })?.end).toBeNull();
    expect(normalizeClip({ start: 5, end: 'soon' })?.end).toBeNull();
  });

  it('ignores non-finite fades', () => {
    expect(normalizeClip({ fadeIn: Number.POSITIVE_INFINITY, fadeOut: 1 })).toEqual({
      start: 0,
      end: null,
      fadeIn: 0,
      fadeOut: 1,
    });
  });
});

describe('mergeClip', () => {
  it('keeps omitted fields and resets null fields', () => {
    const current = { start: 2, end: 8, fadeIn: 0.5, fadeOut: 0.25 };
    expect(mergeClip(current, { end: 10 })).toEqual({ ...current, end: 10 });
    expect(mergeClip(current, { end: null })).toEqual({ ...current, end: null });
    expect(mergeClip(current, { fadeIn: null, fadeOut: null })).toEqual({
      start: 2,
      end: 8,
      fadeIn: 0,
      fadeOut: 0,
    });
  });

  it('starts from an empty clip when there is none', () => {
    expect(mergeClip(null, { end: 3 })).toEqual({ start: 0, end: 3, fadeIn: 0, fadeOut: 0 });
    expect(mergeClip(undefined, { start: null })).toBeNull();
  });
});

describe('validateClipPatch', () => {
  it('accepts valid patches', () => {
    expect(() => validateClipPatch({ start: 1, end: 2, fadeIn: 0, fadeOut: null })).not.toThrow();
    expect(() => validateClipPatch({}, 30)).not.toThrow();
  });

  it('rejects invalid values', () => {
    expect(() => validateClipPatch({ start: Number.NaN })).toThrow(/finite/);
    expect(() => validateClipPatch({ fadeIn: -1 })).toThrow(/>= 0/);
    expect(() => validateClipPatch({ end: MAX_CLIP_TIME + 1 })).toThrow(/exceeds/);
    expect(() => validateClipPatch({ start: 5, end: 5 })).toThrow(/later than/);
    expect(() => validateClipPatch({ start: 30 }, 30)).toThrow(/project end/);
  });
});

describe('activity', () => {
  const clip = { start: 2, end: 6, fadeIn: 1, fadeOut: 2 };

  it('treats a missing clip as always active', () => {
    expect(isClipActive(null, 123)).toBe(true);
    expect(clipEnvelope(undefined, 0)).toBe(1);
  });

  it('uses a half-open interval', () => {
    expect(isClipActive(clip, 1.999)).toBe(false);
    expect(isClipActive(clip, 2)).toBe(true);
    expect(isClipActive(clip, 5.999)).toBe(true);
    expect(isClipActive(clip, 6)).toBe(false);
  });

  it('resolves an open end against the project duration', () => {
    const open = { start: 2, end: null, fadeIn: 0, fadeOut: 0 };
    expect(clipEnd(open)).toBe(Number.POSITIVE_INFINITY);
    expect(clipEnd(open, 10)).toBe(10);
    expect(isClipActive(open, 50)).toBe(true);
    expect(isClipActive(open, 50, 10)).toBe(false);
  });

  it('fades linearly at both ends and is zero outside', () => {
    expect(clipEnvelope(clip, 1)).toBe(0);
    expect(clipEnvelope(clip, 2)).toBe(0);
    expect(clipEnvelope(clip, 2.5)).toBeCloseTo(0.5);
    expect(clipEnvelope(clip, 3)).toBe(1);
    expect(clipEnvelope(clip, 4)).toBe(1);
    expect(clipEnvelope(clip, 5)).toBeCloseTo(0.5);
    expect(clipEnvelope(clip, 6)).toBe(0);
  });

  it('takes the smaller of overlapping fades', () => {
    const short = { start: 0, end: 1, fadeIn: 1, fadeOut: 1 };
    expect(clipEnvelope(short, 0.25)).toBeCloseTo(0.25);
    expect(clipEnvelope(short, 0.5)).toBeCloseTo(0.5);
    expect(clipEnvelope(short, 0.75)).toBeCloseTo(0.25);
  });

  it('applies a fade out to an open clip only once the duration is known', () => {
    const open = { start: 0, end: null, fadeIn: 0, fadeOut: 2 };
    expect(clipEnvelope(open, 9)).toBe(1);
    expect(clipEnvelope(open, 9, 10)).toBeCloseTo(0.5);
  });
});

describe('snapToFrame', () => {
  it('rounds to the nearest frame', () => {
    expect(snapToFrame(1.016, 30)).toBeCloseTo(1);
    expect(snapToFrame(1.02, 30)).toBeCloseTo(1.0333333);
    expect(snapToFrame(1.01, 60)).toBeCloseTo(1.0166667);
    expect(snapToFrame(2, 0)).toBe(2);
  });
});
