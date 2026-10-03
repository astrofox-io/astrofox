import { describe, expect, it } from 'vitest';
import {
  checkKeyframes,
  checkTracks,
  EASINGS,
  ease,
  evaluateTrack,
  type Keyframe,
  keyIndexAt,
  mixColors,
  moveKeys,
  pasteKeys,
  removeKeys,
  setEasing,
  setKey,
  shiftTracks,
  type Track,
  trackTypeFor,
} from './tracks';

const key = (time: number, value: number | string, easing: Keyframe['easing'] = 'linear') => ({
  time,
  value,
  easing,
});

const numbers: Track = { type: 'number', keyframes: [key(2, 0), key(4, 10)] };

describe('evaluateTrack', () => {
  it('holds the first value before the first key and the last after the last', () => {
    expect(evaluateTrack(numbers, 0)).toBe(0);
    expect(evaluateTrack(numbers, 2)).toBe(0);
    expect(evaluateTrack(numbers, 4)).toBe(10);
    expect(evaluateTrack(numbers, 100)).toBe(10);
  });

  it('blends between keys with the left key easing', () => {
    expect(evaluateTrack(numbers, 3)).toBe(5);
    const easeIn: Track = { type: 'number', keyframes: [key(0, 0, 'ease-in'), key(1, 8)] };
    expect(evaluateTrack(easeIn, 0.5)).toBe(1);
  });

  it('holds the left value until the next key', () => {
    const hold: Track = { type: 'number', keyframes: [key(0, 1, 'hold'), key(1, 5), key(2, 9)] };
    expect(evaluateTrack(hold, 0.999)).toBe(1);
    expect(evaluateTrack(hold, 1)).toBe(5);
    expect(evaluateTrack(hold, 1.5)).toBe(7);
  });

  it('finds the right segment among many keys', () => {
    const keys = Array.from({ length: 50 }, (_, i) => key(i, i * 2));
    const track: Track = { type: 'number', keyframes: keys };
    expect(evaluateTrack(track, 31.5)).toBe(63);
  });

  it('blends colours in linear light', () => {
    const track: Track = { type: 'color', keyframes: [key(0, '#ff0000'), key(1, '#00ff00')] };
    expect(evaluateTrack(track, 0)).toBe('#ff0000');
    expect(evaluateTrack(track, 1)).toBe('#00ff00');
    // Halfway in linear light is brighter than the sRGB average (#808000).
    expect(evaluateTrack(track, 0.5)).toBe('#bcbc00');
  });

  it('is a function of time alone', () => {
    const times = [3.7, 0.2, 3.7, 9, 3.7];
    expect(new Set(times.filter(t => t === 3.7).map(t => evaluateTrack(numbers, t))).size).toBe(1);
  });
});

describe('ease', () => {
  it('starts at 0 and ends at 1 for every easing', () => {
    for (const easing of EASINGS) {
      expect(ease(easing, 0)).toBe(0);
      expect(ease(easing, 1)).toBe(1);
    }
  });

  it('never overshoots, so values between keys stay between them', () => {
    for (const easing of EASINGS) {
      for (let u = 0; u <= 1; u += 0.05) {
        expect(ease(easing, u)).toBeGreaterThanOrEqual(0);
        expect(ease(easing, u)).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('mixColors', () => {
  it('expands short hex colours', () => {
    expect(mixColors('#f00', '#f00', 0.5)).toBe('#ff0000');
  });
});

describe('trackTypeFor', () => {
  const config = {
    defaultProperties: { size: 1, amount: 0.5, color: '#ffffff', text: 'a', mode: 'a', hidden: 2 },
    controls: {
      size: { type: 'number' },
      amount: { type: 'range' },
      color: { type: 'color' },
      text: { type: 'text' },
      mode: { type: 'select' },
      hidden: { type: 'number', animatable: false },
    },
  };

  it('animates numbers and colours, and nothing else', () => {
    expect(trackTypeFor(config, 'size')).toBe('number');
    expect(trackTypeFor(config, 'amount')).toBe('number');
    expect(trackTypeFor(config, 'color')).toBe('color');
    expect(trackTypeFor(config, 'text')).toBeNull();
    expect(trackTypeFor(config, 'mode')).toBeNull();
    expect(trackTypeFor(config, 'missing')).toBeNull();
  });

  it('lets a control opt out', () => {
    expect(trackTypeFor(config, 'hidden')).toBeNull();
  });
});

describe('checkKeyframes', () => {
  it.each([
    ['an empty list', []],
    ['keys out of order', [key(2, 0), key(1, 0)]],
    ['two keys at one time', [key(1, 0), key(1, 2)]],
    ['a negative time', [key(-1, 0)]],
    ['a non-finite value', [key(0, Number.NaN)]],
    ['an unknown easing', [{ time: 0, value: 0, easing: 'bounce' }]],
    ['an unknown field', [{ time: 0, value: 0, easing: 'linear', id: 'x' }]],
    ['a missing easing', [{ time: 0, value: 0 }]],
  ])('refuses %s', (_what, keyframes) => {
    expect(() => checkKeyframes(keyframes, 'number')).toThrow();
  });

  it('refuses colours that are not hex', () => {
    expect(() => checkKeyframes([key(0, 'red')], 'color')).toThrow(/hex/);
    expect(() => checkKeyframes([key(0, 3)], 'color')).toThrow(/hex/);
    expect(() => checkKeyframes([key(0, '#123abc')], 'color')).not.toThrow();
  });
});

describe('checkTracks', () => {
  const typeOf = (property: string) =>
    property === 'size' ? 'number' : property === 'color' ? 'color' : null;

  it('accepts tracks matching the property types', () => {
    expect(() =>
      checkTracks(
        {
          size: { type: 'number', keyframes: [key(0, 1)] },
          color: { type: 'color', keyframes: [key(0, '#000000')] },
        },
        typeOf,
      ),
    ).not.toThrow();
  });

  it('refuses a property that cannot be animated or a wrong track type', () => {
    expect(() => checkTracks({ text: { type: 'number', keyframes: [key(0, 1)] } }, typeOf)).toThrow(
      /cannot be animated/,
    );
    expect(() =>
      checkTracks({ size: { type: 'color', keyframes: [key(0, '#000000')] } }, typeOf),
    ).toThrow(/type number/);
  });

  it('checks only the shape when the property types are unknown', () => {
    expect(() =>
      checkTracks({ anything: { type: 'number', keyframes: [key(0, 1)] } }),
    ).not.toThrow();
    expect(() => checkTracks({ anything: { type: 'string', keyframes: [key(0, 1)] } })).toThrow();
  });
});

describe('editing', () => {
  const keys = [key(1, 10), key(2, 20), key(3, 30)];

  it('sets a key, replacing one at the same time and keeping its easing', () => {
    expect(setKey(keys, { time: 1.5, value: 15 }).map(k => k.time)).toEqual([1, 1.5, 2, 3]);
    const eased = setKey([key(1, 10, 'hold')], { time: 1 + 1e-9, value: 99 });
    expect(eased).toEqual([key(1, 99, 'hold')]);
    expect(setKey(undefined, { time: 0, value: 1 })).toEqual([key(0, 1)]);
  });

  it('removes keys and changes easing by time', () => {
    expect(removeKeys(keys, [2]).map(k => k.time)).toEqual([1, 3]);
    expect(setEasing(keys, [1, 3], 'hold').map(k => k.easing)).toEqual(['hold', 'linear', 'hold']);
    expect(keyIndexAt({ type: 'number', keyframes: keys }, 3)).toBe(2);
    expect(keyIndexAt(null, 3)).toBe(-1);
  });

  it('moves selected keys together inside the limits', () => {
    expect(moveKeys(keys, [1, 2], 0.5).map(k => k.time)).toEqual([1.5, 2.5, 3]);
    expect(moveKeys(keys, [1, 2], -5).map(k => k.time)).toEqual([0, 1, 3]);
    expect(moveKeys(keys, [3], 10, 4).map(k => k.time)).toEqual([1, 2, 4]);
  });

  it('replaces a key that a moved key lands on', () => {
    expect(moveKeys(keys, [1], 1)).toEqual([key(2, 10), key(3, 30)]);
  });
});

describe('shiftTracks', () => {
  const tracks = {
    size: { type: 'number' as const, keyframes: [key(2, 0), key(4, 1)] },
    color: { type: 'color' as const, keyframes: [key(3, '#000000')] },
  };

  it('moves every key of every track by the same amount', () => {
    const { tracks: moved, shift } = shiftTracks(tracks, 1.5);
    expect(shift).toBe(1.5);
    expect(moved.size.keyframes.map(k => k.time)).toEqual([3.5, 5.5]);
    expect(moved.color.keyframes.map(k => k.time)).toEqual([4.5]);
    expect(tracks.size.keyframes[0].time).toBe(2);
  });

  it('keeps every key inside the time limits, together', () => {
    expect(shiftTracks(tracks, -10).shift).toBe(-2);
    expect(shiftTracks(tracks, 10, 6).shift).toBe(2);
    expect(shiftTracks({}, 5).shift).toBe(0);
  });
});

describe('pasteKeys', () => {
  const copied = [key(0, 5, 'hold'), key(0.5, 6)];

  it('lands the first copied key at the paste time and keeps the spacing', () => {
    expect(pasteKeys([key(0, 1)], copied, 2)).toEqual([key(0, 1), key(2, 5, 'hold'), key(2.5, 6)]);
  });

  it('replaces keys at the same times, easing included', () => {
    expect(pasteKeys([key(2, 1, 'ease-in')], copied, 2)).toEqual([key(2, 5, 'hold'), key(2.5, 6)]);
  });

  it('leaves out keys past the time limit', () => {
    expect(pasteKeys(undefined, copied, 10, 10.2)).toEqual([key(10, 5, 'hold')]);
  });
});
