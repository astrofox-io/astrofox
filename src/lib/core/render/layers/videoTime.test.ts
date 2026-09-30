import { describe, expect, it } from 'vitest';
import { videoTimeAt } from './videoTime';

describe('videoTimeAt', () => {
  it('plays the media from the project start', () => {
    expect(videoTimeAt(3, { duration: 10 })).toBe(3);
  });

  it('loops the trimmed range', () => {
    expect(videoTimeAt(7, { startTime: 2, endTime: 5, loop: true, duration: 10 })).toBe(3);
    expect(videoTimeAt(25, { loop: true, duration: 10 })).toBe(5);
  });

  it('holds the last frame when not looping', () => {
    expect(videoTimeAt(7, { startTime: 2, endTime: 5, loop: false, duration: 10 })).toBe(5);
    expect(videoTimeAt(25, { loop: false, duration: 10 })).toBe(10);
  });

  it('starts at the trim start before metadata is loaded', () => {
    expect(videoTimeAt(4, { startTime: 1.5, loop: true })).toBe(5.5);
    expect(videoTimeAt(Number.NaN, { startTime: 1.5 })).toBe(1.5);
  });
});
