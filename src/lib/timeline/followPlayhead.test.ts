import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { followPlayhead } from './followPlayhead';

let clock = 0;
const now = () => clock;

function advance(ms: number) {
  clock += ms;
  vi.advanceTimersByTime(ms);
}

beforeEach(() => {
  vi.useFakeTimers();
  clock = 0;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('followPlayhead', () => {
  it('reports the time at once, then at most once per interval while playing', () => {
    const store = createStore(() => ({ time: 0, playing: true }));
    const times: number[] = [];
    followPlayhead(store, time => times.push(time), 66, now);

    expect(times).toEqual([0]);

    // 60 fps for a quarter of a second: about four updates instead of fifteen.
    for (let frame = 1; frame <= 15; frame += 1) {
      advance(1000 / 60);
      store.setState({ time: frame / 60 });
    }

    expect(times.length).toBeGreaterThanOrEqual(4);
    expect(times.length).toBeLessThanOrEqual(5);
  });

  it('ends on the latest time after playback goes quiet', () => {
    const store = createStore(() => ({ time: 0, playing: true }));
    const times: number[] = [];
    followPlayhead(store, time => times.push(time), 66, now);

    advance(10);
    store.setState({ time: 1 });
    advance(10);
    store.setState({ time: 2 });
    advance(100);

    expect(times.at(-1)).toBe(2);
  });

  it('reports paused and scrubbed times immediately', () => {
    const store = createStore(() => ({ time: 0, playing: true }));
    const times: number[] = [];
    followPlayhead(store, time => times.push(time), 66, now);

    advance(5);
    store.setState({ time: 3, playing: false });
    expect(times.at(-1)).toBe(3);

    store.setState({ time: 7 });
    store.setState({ time: 8 });
    expect(times.slice(-2)).toEqual([7, 8]);
  });

  it('ignores changes that do not move the playhead, and stops when told', () => {
    const store = createStore(() => ({ time: 0, playing: false, loop: false }));
    const times: number[] = [];
    const stop = followPlayhead(store, time => times.push(time), 66, now);

    store.setState({ loop: true });
    expect(times).toEqual([0]);

    stop();
    store.setState({ time: 5 });
    advance(200);
    expect(times).toEqual([0]);
  });
});
