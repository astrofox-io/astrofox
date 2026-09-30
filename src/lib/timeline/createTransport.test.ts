import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeAudioOutput, type FakeAudioOutput } from './audioOutput';
import { createTransport, type Transport } from './createTransport';
import { DEFAULT_PROJECT_DURATION } from './settings';

let ms: number;
let transport: Transport;
let output: FakeAudioOutput;
const requestRender = vi.fn();

function advance(seconds: number) {
  ms += seconds * 1000;
  return transport.tick();
}

function state() {
  return transport.getState();
}

beforeEach(() => {
  ms = 1000;
  requestRender.mockClear();
  transport = createTransport({ requestRender, now: () => ms });
  output = createFakeAudioOutput(() => ms);
  transport.attach(output);
});

describe('without audio', () => {
  it('runs on the wall clock for the default duration', () => {
    expect(state().duration).toBe(DEFAULT_PROJECT_DURATION);

    transport.play();
    expect(state().playing).toBe(true);
    expect(advance(2.5)).toBeCloseTo(2.5);
    expect(state().time).toBeCloseTo(2.5);
  });

  it('stops at the project end', () => {
    transport.play();
    expect(advance(DEFAULT_PROJECT_DURATION + 5)).toBe(DEFAULT_PROJECT_DURATION);
    expect(state()).toMatchObject({ time: DEFAULT_PROJECT_DURATION, playing: false });
  });

  it('plays from the start when the playhead is at the end', () => {
    transport.seek(DEFAULT_PROJECT_DURATION);
    transport.play();
    expect(state().time).toBe(0);
  });

  it('keeps the time it reached when paused', () => {
    transport.play();
    ms += 4000;
    transport.pause();
    expect(state()).toMatchObject({ time: 4, playing: false });
    expect(advance(10)).toBe(4);
  });

  it('rewinds on stop', () => {
    transport.play();
    advance(3);
    transport.stop();
    expect(state()).toMatchObject({ time: 0, playing: false });
  });

  it('steps by whole frames', () => {
    transport.seek(1.01);
    transport.step(1);
    expect(state().time).toBeCloseTo(31 / 30);
    transport.step(-2);
    expect(state().time).toBeCloseTo(29 / 30);
  });
});

describe('with an audio file', () => {
  beforeEach(() => {
    output.setSource({ duration: 10 });
  });

  it('follows the audio length unless the duration is explicit', () => {
    expect(state()).toMatchObject({ duration: 10, explicitDuration: false });

    transport.applySettings({ duration: 20, fps: 30 });
    output.setSource({ duration: 5 });
    expect(state()).toMatchObject({ duration: 20, explicitDuration: true });

    transport.applySettings({ duration: null, fps: 30 });
    expect(state().duration).toBe(5);
  });

  it('plays the audio from the playhead', () => {
    transport.seek(4);
    transport.play();
    expect(output.sounding).toBe(true);
    expect(output.currentTime()).toBe(4);
    expect(advance(1)).toBeCloseTo(5);
  });

  it('moves the audio when seeking while playing, but not while paused', () => {
    transport.seek(2);
    expect(output.sounding).toBe(false);

    transport.play();
    transport.seek(7);
    expect(output.currentTime()).toBe(7);
    expect(advance(0.5)).toBeCloseTo(7.5);
  });

  it('pauses the audio with the transport', () => {
    transport.play();
    advance(1);
    transport.pause();
    expect(output.sounding).toBe(false);
    expect(state().playing).toBe(false);
  });

  it('carries on past the end of the audio on the wall clock', () => {
    transport.applySettings({ duration: 15, fps: 30 });
    transport.seek(9);
    transport.play();

    expect(advance(1.5)).toBeCloseTo(10.5);
    expect(output.sounding).toBe(false);
    expect(state().playing).toBe(true);
    expect(advance(2)).toBeCloseTo(12.5);
    expect(advance(5)).toBe(15);
    expect(state().playing).toBe(false);
  });

  it('plays the audio again when seeking back before its end', () => {
    transport.applySettings({ duration: 15, fps: 30 });
    transport.seek(12);
    transport.play();
    expect(output.sounding).toBe(false);

    transport.seek(3);
    expect(output.sounding).toBe(true);
    expect(advance(1)).toBeCloseTo(4);
  });

  it('loops to the start and restarts the audio', () => {
    transport.setLoop(true);
    transport.seek(9.5);
    transport.play();

    expect(advance(1)).toBe(0);
    expect(state()).toMatchObject({ time: 0, playing: true });
    expect(output.currentTime()).toBe(0);
    expect(advance(2)).toBeCloseTo(2);
  });

  it('pauses when the source changes and keeps the playhead', () => {
    transport.seek(6);
    transport.play();
    advance(1);

    output.setSource({ duration: 20 });
    expect(state()).toMatchObject({ time: 7, playing: false, duration: 20 });
    expect(output.sounding).toBe(false);
  });

  it('clamps the playhead to a shorter source', () => {
    transport.seek(8);
    output.setSource({ duration: 5 });
    expect(state()).toMatchObject({ time: 5, duration: 5 });
  });
});

describe('with a live input', () => {
  beforeEach(() => {
    output.setSource({ live: true });
  });

  it('listens while playing', () => {
    transport.play();
    expect(output.sounding).toBe(true);

    transport.pause();
    expect(output.sounding).toBe(false);

    transport.play();
    transport.stop();
    expect(output.sounding).toBe(false);
  });

  it('never reaches an end: the clock loops and listening continues', () => {
    transport.play();
    expect(advance(DEFAULT_PROJECT_DURATION + 1)).toBe(0);
    expect(state().playing).toBe(true);
    expect(output.sounding).toBe(true);
  });

  it('stops listening when the input is disconnected', () => {
    transport.play();
    output.setSource({});
    expect(state().playing).toBe(false);
    expect(output.sounding).toBe(false);
  });
});

describe('settings', () => {
  it('clamps the playhead to a shorter duration', () => {
    transport.seek(20);
    transport.applySettings({ duration: 12, fps: 60 });
    expect(state()).toMatchObject({ time: 12, duration: 12, fps: 60 });
  });

  it('renders after a change and ignores settings that change nothing', () => {
    transport.applySettings({ duration: 12, fps: 30 });
    expect(requestRender).toHaveBeenCalled();

    requestRender.mockClear();
    transport.applySettings({ duration: 12, fps: 30 });
    expect(requestRender).not.toHaveBeenCalled();
  });
});

describe('attach', () => {
  it('pauses the old output and plays through the new one', () => {
    output.setSource({ duration: 10 });
    transport.play();

    const next = createFakeAudioOutput(() => ms, { duration: 8 });
    transport.attach(next);
    expect(output.sounding).toBe(false);
    expect(state()).toMatchObject({ playing: false, duration: 8 });

    transport.play();
    expect(next.sounding).toBe(true);
  });

  it('stops listening to a detached output', () => {
    const detach = transport.attach(createFakeAudioOutput(() => ms, { duration: 8 }));
    detach();
    output.setSource({ duration: 3 });
    expect(state().duration).toBe(8);
  });
});
