import { describe, expect, it } from 'vitest';
import { frameSeed, seededRandom } from '@/lib/utils/random';
import { MAX_CONTINUOUS_STEP, Phase } from './phase';

function play(phase: Phase, from: number, to: number, fps: number, rate: number) {
  let value = 0;
  for (let frame = Math.round(from * fps); frame <= Math.round(to * fps); frame += 1) {
    value = phase.at(frame / fps, rate);
  }
  return value;
}

describe('Phase', () => {
  it('is rate * time at a constant rate, whatever the frame rate', () => {
    expect(play(new Phase(), 0, 3, 60, 2)).toBeCloseTo(6);
    expect(play(new Phase(), 0, 3, 30, 2)).toBeCloseTo(6);
    expect(play(new Phase(), 1.5, 3, 24, 2)).toBeCloseTo(6);
  });

  it('starts at rate * time on the first frame', () => {
    expect(new Phase().at(10, 0.5)).toBe(5);
  });

  it('does not move when the same time renders again', () => {
    const phase = new Phase();
    phase.at(1, 1);
    phase.at(1.1, 1);

    expect(phase.at(1.1, 5)).toBeCloseTo(1.1);
  });

  it('restarts from rate * time after a jump or a loop', () => {
    const phase = new Phase();
    play(phase, 0, 2, 60, 3);

    expect(phase.at(10, 3)).toBe(30);
    expect(phase.at(0, 3)).toBe(0);
    expect(phase.at(MAX_CONTINUOUS_STEP * 2, 3)).toBeCloseTo(MAX_CONTINUOUS_STEP * 6);
  });

  it('integrates a changing rate smoothly', () => {
    const phase = new Phase();
    phase.at(0, 1);
    phase.at(0.1, 1);
    // The rate jumps; the value only moves by the new rate times the step.
    expect(phase.at(0.2, 10)).toBeCloseTo(0.1 + 1);
  });
});

describe('seededRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    const first = [a(), a(), a()];

    expect([b(), b(), b()]).toEqual(first);
    expect(first.every(value => value >= 0 && value < 1)).toBe(true);
    expect(seededRandom(43)()).not.toBe(first[0]);
  });

  it('seeds by frame', () => {
    expect(frameSeed(1, 30)).toBe(frameSeed(1.01, 30));
    expect(frameSeed(1, 30)).not.toBe(frameSeed(1 + 1 / 30, 30));
    expect(frameSeed(1, 30, 1)).not.toBe(frameSeed(1, 30, 2));
  });
});
