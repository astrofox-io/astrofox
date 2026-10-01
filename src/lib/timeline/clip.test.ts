import { describe, expect, it } from 'vitest';
import {
  type Clip,
  type ClipEditOptions,
  type ClipPatch,
  clipEnd,
  clipEnvelope,
  clipRange,
  editClip,
  isClipActive,
  isVisibleAt,
  MAX_CLIP_TIME,
  mergeClip,
  normalizeClip,
  SNAP_DISTANCE,
  snapTime,
  snapToFrame,
  validateClipFields,
  validateClipPatch,
} from './clip';

function clip(start: number, end: number | null, fadeIn = 0, fadeOut = 0): Clip {
  return { start, end, fadeIn, fadeOut };
}

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

  it('throws instead of repairing a bad edit', () => {
    expect(() => mergeClip(clip(2, 8), { end: 1 })).toThrow(/later than/);
    expect(() => mergeClip(clip(2, null), { start: 12 }, 10)).toThrow(/project end/);
  });
});

describe('validateClipFields', () => {
  it('accepts known fields holding null or seconds', () => {
    expect(() => validateClipFields({ start: 1, end: null, fadeIn: 0 })).not.toThrow();
    // Only the fields are checked; normalizeClip repairs how they relate.
    expect(() => validateClipFields({ start: 5, end: 2 })).not.toThrow();
  });

  it('rejects anything that is not a clip', () => {
    expect(() => validateClipFields(null)).toThrow(/Invalid/);
    expect(() => validateClipFields([1])).toThrow(/Invalid/);
    expect(() => validateClipFields({ length: 2 })).toThrow(/Unsupported clip field: length/);
    expect(() => validateClipFields({ start: '1' })).toThrow(/finite/);
  });
});

describe('validateClipPatch', () => {
  it('accepts valid patches', () => {
    expect(() => validateClipPatch({ start: 1, end: 2, fadeIn: 0, fadeOut: null })).not.toThrow();
    expect(() => validateClipPatch({}, null, 30)).not.toThrow();
  });

  it('rejects invalid values', () => {
    expect(() => validateClipPatch({ start: Number.NaN })).toThrow(/finite/);
    expect(() => validateClipPatch({ fadeIn: -1 })).toThrow(/>= 0/);
    expect(() => validateClipPatch({ end: MAX_CLIP_TIME + 1 })).toThrow(/exceeds/);
    expect(() => validateClipPatch({ start: 5, end: 5 })).toThrow(/later than/);
    expect(() => validateClipPatch({ start: 30 }, null, 30)).toThrow(/project end/);
  });

  it('checks a partial edit against the clip it applies to', () => {
    expect(() => validateClipPatch({ end: 3 }, clip(4, 8))).toThrow(/later than/);
    expect(() => validateClipPatch({ start: 9 }, clip(4, 8))).toThrow(/later than/);
    expect(() => validateClipPatch({ end: 5 }, clip(4, 8))).not.toThrow();
    // Reopening the end makes a later start valid again.
    expect(() => validateClipPatch({ start: 9, end: null }, clip(4, 8))).not.toThrow();
  });

  it('allows an explicit end past the project end', () => {
    expect(() => validateClipPatch({ end: 40 }, clip(4, 8), 30)).not.toThrow();
    // An unchanged start that now lies past a shortened project is kept.
    expect(() => validateClipPatch({ fadeIn: 1 }, clip(35, 40), 30)).not.toThrow();
  });

  describe('with fps', () => {
    it('rejects an edit that leaves a closed clip shorter than one frame', () => {
      expect(() => validateClipPatch({ start: 1, end: 1.01 }, null, 30, 30)).toThrow(/one frame/);
      expect(() => validateClipPatch({ end: 4.02 }, clip(4, 8), 30, 30)).toThrow(/one frame/);
      expect(() => validateClipPatch({ start: 7.99 }, clip(4, 8), 30, 30)).toThrow(/one frame/);
    });

    it('accepts exactly one frame despite float error', () => {
      expect(() => validateClipPatch({ start: 4, end: 4 + 1 / 30 }, null, 30, 30)).not.toThrow();
      expect(() => validateClipPatch({ end: 4.1 }, clip(4, 8), 30, 10)).not.toThrow();
    });

    it('measures an open clip to the project end', () => {
      expect(() => validateClipPatch({ start: 29.99 }, clip(4, null), 30, 30)).toThrow(/one frame/);
      expect(() => validateClipPatch({ start: 29.9 }, clip(4, null), 30, 30)).not.toThrow();
      // Following the audio, the project end is not known yet.
      expect(() => validateClipPatch({ start: 29.99 }, clip(4, null), undefined, 30)).not.toThrow();
    });

    it('leaves clips the edit does not reshape alone', () => {
      expect(() => validateClipPatch({ fadeIn: 0.5 }, clip(4, 4.001), 30, 30)).not.toThrow();
      expect(() => validateClipPatch({ end: null }, clip(29.99, 40), 30, 30)).not.toThrow();
    });
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

describe('isVisibleAt', () => {
  const layer = { enabled: true, clip: clip(2, 6) };

  it('needs the layer enabled and inside its clip', () => {
    expect(isVisibleAt(layer, 3)).toBe(true);
    expect(isVisibleAt(layer, 6)).toBe(false);
    expect(isVisibleAt({ ...layer, enabled: false }, 3)).toBe(false);
    expect(isVisibleAt(null, 3)).toBe(false);
  });

  it('treats a layer without a clip as always there', () => {
    expect(isVisibleAt({ enabled: true }, 1000)).toBe(true);
    expect(isVisibleAt({ enabled: true, clip: null }, 1000)).toBe(true);
  });

  it('resolves an open end against the project duration', () => {
    const open = { clip: clip(2, null) };
    expect(isVisibleAt(open, 9, 10)).toBe(true);
    expect(isVisibleAt(open, 10, 10)).toBe(false);
  });
});

describe('clipRange', () => {
  it('spans the project when there is no clip', () => {
    expect(clipRange(null, 30)).toEqual({ start: 0, end: 30, openEnd: true });
  });

  it('runs an open clip to the project end', () => {
    expect(clipRange(clip(4, null), 30)).toEqual({ start: 4, end: 30, openEnd: true });
  });

  it('cuts off the part past the project end', () => {
    expect(clipRange(clip(20, 40), 30)).toEqual({ start: 20, end: 30, openEnd: false });
    expect(clipRange(clip(35, 40), 30)).toEqual({ start: 30, end: 30, openEnd: false });
  });
});

describe('snapTime', () => {
  // At 100 px/s, SNAP_DISTANCE px is SNAP_DISTANCE / 100 seconds.
  const reach = SNAP_DISTANCE / 100;

  it('snaps to the nearest target within reach', () => {
    expect(snapTime(5 + reach / 2, [5, 5 + reach], 100, false, 30)).toBe(5 + reach);
    expect(snapTime(5 + reach, [5], 100, false, 30)).toBe(5);
  });

  it('falls back to frames only when frame snapping is on', () => {
    expect(snapTime(5 + reach * 2, [5], 100, false, 30)).toBeCloseTo(5 + reach * 2);
    expect(snapTime(1.02, [5], 100, true, 30)).toBeCloseTo(1.0333333);
  });
});

describe('editClip', () => {
  const options: ClipEditOptions = { duration: 30, fps: 10 };

  describe('trim-start', () => {
    it('moves the start and keeps the end', () => {
      expect(editClip(clip(4, 8), { type: 'trim-start', time: 6 }, options)).toEqual({ start: 6 });
    });

    it('stops one frame before the end and at zero', () => {
      expect(editClip(clip(4, 8), { type: 'trim-start', time: 9 }, options)).toEqual({
        start: 7.9,
      });
      expect(editClip(clip(4, 8), { type: 'trim-start', time: -2 }, options)).toEqual({
        start: 0,
      });
    });

    it('stops one frame before the project end on an open clip', () => {
      expect(editClip(null, { type: 'trim-start', time: 40 }, options)).toEqual({ start: 29.9 });
    });
  });

  describe('trim-end', () => {
    it('moves the end and keeps the start', () => {
      expect(editClip(clip(4, 8), { type: 'trim-end', time: 10 }, options)).toEqual({ end: 10 });
    });

    it('stops one frame after the start', () => {
      expect(editClip(clip(4, 8), { type: 'trim-end', time: 1 }, options)).toEqual({ end: 4.1 });
    });

    it('reopens the clip at the project end', () => {
      expect(editClip(clip(4, 8), { type: 'trim-end', time: 30 }, options)).toEqual({ end: null });
      expect(editClip(clip(4, 8), { type: 'trim-end', time: 45 }, options)).toEqual({ end: null });
    });

    it('closes an open clip', () => {
      expect(editClip(null, { type: 'trim-end', time: 12 }, options)).toEqual({ end: 12 });
    });
  });

  describe('move', () => {
    it('keeps the length of a closed clip', () => {
      expect(editClip(clip(4, 8), { type: 'move', delta: 3 }, options)).toEqual({
        start: 7,
        end: 11,
      });
    });

    it('stops at either end of the project', () => {
      expect(editClip(clip(4, 8), { type: 'move', delta: -10 }, options)).toEqual({
        start: 0,
        end: 4,
      });
      expect(editClip(clip(4, 8), { type: 'move', delta: 50 }, options)).toEqual({
        start: 26,
        end: 30,
      });
    });

    it('moves only the start of an open clip', () => {
      expect(editClip(clip(4, null), { type: 'move', delta: 3 }, options)).toEqual({ start: 7 });
      expect(editClip(null, { type: 'move', delta: 50 }, options)).toEqual({ start: 29.9 });
    });

    it('keeps the full length of a clip that runs past the project end', () => {
      expect(editClip(clip(20, 40), { type: 'move', delta: -5 }, options)).toEqual({
        start: 10,
        end: 30,
      });
      expect(editClip(clip(35, 40), { type: 'move', delta: -1 }, options)).toEqual({
        start: 25,
        end: 30,
      });
    });

    it('snaps whichever edge reaches a target', () => {
      const snap = (time: number) => (Math.abs(time - 12) < 0.25 ? 12 : time);
      // The start lands near 12.
      expect(editClip(clip(4, 8), { type: 'move', delta: 7.9 }, { ...options, snap })).toEqual({
        start: 12,
        end: 16,
      });
      // The end lands near 12; the start follows to keep the length.
      expect(editClip(clip(4, 8), { type: 'move', delta: 3.9 }, { ...options, snap })).toEqual({
        start: 8,
        end: 12,
      });
    });
  });

  it('snaps before applying the limits', () => {
    const snap = () => 50;
    expect(editClip(clip(4, 8), { type: 'trim-end', time: 9 }, { ...options, snap })).toEqual({
      end: null,
    });
  });

  it('always produces an edit that validates', () => {
    const clips = [null, clip(0, null), clip(4, 8), clip(4, null), clip(20, 40), clip(35, 40)];
    const edits = [
      { type: 'move', delta: -100 },
      { type: 'move', delta: 0.3 },
      { type: 'move', delta: 100 },
      { type: 'trim-start', time: -5 },
      { type: 'trim-start', time: 7.99 },
      { type: 'trim-start', time: 100 },
      { type: 'trim-end', time: -5 },
      { type: 'trim-end', time: 4.01 },
      { type: 'trim-end', time: 100 },
    ] as const;

    for (const current of clips) {
      for (const edit of edits) {
        const patch: ClipPatch = editClip(current, edit, options);
        expect(() => mergeClip(current, patch, options.duration, options.fps)).not.toThrow();
      }
    }
  });
});
