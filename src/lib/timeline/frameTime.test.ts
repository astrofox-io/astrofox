import { describe, expect, it } from 'vitest';
import AudioReactor, { staticOutput } from '@/lib/audio/AudioReactor';
import DistortionEffect from '@/lib/effects/DistortionEffect';
import FilmGrainEffect from '@/lib/effects/FilmGrainEffect';
import ShockwaveEffect from '@/lib/effects/ShockwaveEffect';
import VHSEffect from '@/lib/effects/VHSEffect';
import type { RenderFrameData } from '@/lib/types';

function frame(time: number, fps: number): RenderFrameData {
  return {
    id: 1,
    delta: 1000 / fps,
    time,
    duration: 60,
    fps,
    fft: null,
    td: null,
    volume: 0,
    gain: 0,
    audioPlaying: false,
    hasUpdate: true,
    playing: true,
    offline: false,
    reactors: {},
  };
}

/** Render `target` at every frame from `from` to `to` seconds; return what it shows at `to`. */
function playTo<T>(render: (data: RenderFrameData) => T, from: number, to: number, fps: number) {
  let result: T | undefined;
  for (let index = Math.round(from * fps); index <= Math.round(to * fps); index += 1) {
    result = render(frame(index / fps, fps));
  }
  return result as T;
}

const effects = [
  ['Distortion', () => new DistortionEffect({ speed: 0.4 })],
  ['Film grain', () => new FilmGrainEffect()],
  ['Shockwave', () => new ShockwaveEffect({ speed: 0.7 })],
  ['VHS', () => new VHSEffect({ speed: 1.3 })],
] as const;

describe('time-based effects', () => {
  it.each(effects)('%s shows the same motion at a time however it got there', (_name, create) => {
    const time = (effect: ReturnType<typeof create>) => (data: RenderFrameData) => {
      effect.render(null, data);
      return Number(effect.time);
    };

    const live = playTo(time(create()), 0, 4, 60);
    const export30 = playTo(time(create()), 0, 4, 30);
    const exportFromMiddle = playTo(time(create()), 2.5, 4, 24);
    const preview = time(create())(frame(4, 30));

    expect(export30).toBeCloseTo(live, 6);
    expect(exportFromMiddle).toBeCloseTo(live, 6);
    expect(preview).toBeCloseTo(live, 6);
  });

  it('stays still while paused on a frame', () => {
    const effect = new VHSEffect({ speed: 1 });
    effect.render(null, frame(3, 60));
    const paused = effect.time;
    effect.render(null, frame(3, 60));

    expect(effect.time).toBe(paused);
  });
});

describe('static reactors', () => {
  it('ramp, reverse and cycle as functions of phase', () => {
    expect(staticOutput('Static Forward', 2.25)).toBeCloseTo(0.25);
    expect(staticOutput('Static Reverse', 2.25)).toBeCloseTo(0.75);
    expect(staticOutput('Static Cycle', 0.25)).toBeCloseTo(0.25);
    expect(staticOutput('Static Cycle', 1.25)).toBeCloseTo(0.75);
  });

  it.each(['Static Forward', 'Static Reverse', 'Static Cycle'])(
    '%s outputs the same value at a time at any frame rate',
    outputMode => {
      const output = (reactor: AudioReactor) => (data: RenderFrameData) =>
        reactor.parse(data).output;
      const create = () => new AudioReactor({ outputMode, speed: 0.35 });

      const live = playTo(output(create()), 0, 3, 60);

      expect(playTo(output(create()), 0, 3, 30)).toBeCloseTo(live, 6);
      expect(output(create())(frame(3, 30))).toBeCloseTo(live, 6);
    },
  );
});
