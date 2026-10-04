import { describe, expect, it } from 'vitest';
import type { RenderFrameData } from '@/lib/types';
import Display from './Display';

class Box extends Display {
  static config = {
    name: 'Box',
    label: 'Box',
    type: 'display',
    defaultProperties: { size: 10, opacity: 1, color: '#000000' },
    controls: {
      size: { type: 'number' },
      opacity: { type: 'number' },
      color: { type: 'color' },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(Box, properties);
  }
}

function frame(time: number, reactors: Record<string, number> = {}): RenderFrameData {
  return {
    id: 1,
    delta: 16,
    time,
    duration: 60,
    fps: 60,
    fft: null,
    td: null,
    volume: 0,
    gain: 0,
    audioPlaying: false,
    hasUpdate: true,
    playing: true,
    offline: false,
    reactors,
  } as RenderFrameData;
}

function at(box: Box, time: number, reactors?: Record<string, number>) {
  box.evaluate(frame(time, reactors));
  return box.properties;
}

describe('evaluate', () => {
  it('renders a track over the authored value, which stays as it was', () => {
    const box = new Box();
    box.setTrack('size', 'number', [
      { time: 1, value: 0, easing: 'linear' },
      { time: 3, value: 100, easing: 'linear' },
    ]);

    expect(at(box, 2).size).toBe(50);
    expect(at(box, 0).size).toBe(0);
    expect(box.authoredProperties.size).toBe(10);

    box.setTrack('size', 'number', null);
    expect(at(box, 2).size).toBe(10);
  });

  it('animates colours', () => {
    const box = new Box();
    box.setTrack('color', 'color', [
      { time: 0, value: '#000000', easing: 'hold' },
      { time: 1, value: '#ffffff', easing: 'linear' },
    ]);

    expect(at(box, 0.5).color).toBe('#000000');
    expect(at(box, 1).color).toBe('#ffffff');
  });

  it('lets a reactor override the keyframed value', () => {
    const box = new Box();
    box.setTrack('size', 'number', [{ time: 0, value: 40, easing: 'linear' }]);

    box.setReactor('size', { id: 'r', min: 0, max: 10 });
    expect(at(box, 0, { r: 0.5 }).size).toBe(5);
  });

  it('fades opacity whatever drives it, including a reactor', () => {
    const box = new Box();
    box.setClip({ start: 0, end: 10, fadeIn: 2 });
    box.setReactor('opacity', { id: 'r', min: 0, max: 1 });

    expect(at(box, 1, { r: 0.8 }).opacity).toBeCloseTo(0.4);
    expect(at(box, 5, { r: 0.8 }).opacity).toBeCloseTo(0.8);
  });

  it('saves tracks with the layer and restores them', () => {
    const box = new Box();
    const keyframes = [{ time: 2, value: 3, easing: 'ease-in' as const }];
    box.setTrack('size', 'number', keyframes);

    const json = box.toJSON();
    expect(json.tracks).toEqual({ size: { type: 'number', keyframes } });
    expect(new Box().toJSON().tracks).toBeUndefined();

    const copy = Display.create(Box, json) as Box;
    expect(copy.tracks).toEqual(json.tracks);
    expect(copy.tracks).not.toBe(json.tracks);
  });
});
