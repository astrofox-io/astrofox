import Effect from '@/lib/core/Effect';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import VHSShader from '@/lib/core/render/effects/shaders/VHSShader';
import type { RenderFrameData } from '@/lib/types';

// CPU-side mirror of the shader's noise, used for the per-frame crease noise value
const fract = (x: number) => x - Math.floor(x);
const hash2 = (x: number, y: number) => fract(Math.sin(x * 89.44 + y * 19.36) * 22189.22);
const smooth01 = (x: number) => x * x * (3 - 2 * x);

function iHashCpu(vx: number, vy: number, r: number) {
  const fx = Math.floor(vx * r);
  const fy = Math.floor(vy * r);
  const h00 = hash2(fx / r, fy / r);
  const h10 = hash2((fx + 1) / r, fy / r);
  const h01 = hash2(fx / r, (fy + 1) / r);
  const h11 = hash2((fx + 1) / r, (fy + 1) / r);
  const ix = smooth01(fract(vx * r));
  const iy = smooth01(fract(vy * r));
  return (h00 * (1 - ix) + h10 * ix) * (1 - iy) + (h01 * (1 - ix) + h11 * ix) * iy;
}

function noiseCpu(vx: number, vy: number) {
  let sum = 0;
  let s = 2;
  for (let i = 1; i < 7; i++) {
    sum += iHashCpu(vx + i, vy + i, 2 * s) / s;
    s *= 2;
  }
  return sum;
}

export default class VHSEffect extends Effect {
  declare time: number;

  static config = {
    name: 'VHSEffect',
    description:
      'Worn VHS tape playback with tape wave, head-switching noise, chroma bleed, grain and scanlines.',
    type: 'effect',
    label: 'VHS',
    category: 'distortion',
    defaultProperties: {
      speed: 0.5,
      wave: 1,
      jitter: 0.25,
      crease: 0.1,
      switching: 0.05,
      switchingHeight: 0.02,
      bloom: 0.4,
      aberration: 2,
      acBeat: 1,
      grain: 0.1,
      scanlines: 0.1,
      vignette: 0,
      barrel: 0,
      saturation: 1,
      exposure: 1,
    },
    controls: {
      speed: {
        label: 'Speed',
        type: 'number',
        min: 0,
        max: 2.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      wave: {
        label: 'Wave',
        type: 'number',
        min: 0,
        max: 3.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      jitter: {
        label: 'Jitter',
        type: 'number',
        min: 0,
        max: 3.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      crease: {
        label: 'Crease',
        type: 'number',
        min: 0,
        max: 3.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      switching: {
        label: 'Switching',
        type: 'number',
        min: 0,
        max: 3.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      switchingHeight: {
        label: 'Switching Height',
        type: 'number',
        min: 0,
        max: 0.2,
        step: 0.005,
        withRange: true,
        withReactor: true,
      },
      bloom: {
        label: 'Bloom',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      aberration: {
        label: 'Aberration',
        type: 'number',
        min: 0,
        max: 10.0,
        step: 0.1,
        withRange: true,
        withReactor: true,
      },
      acBeat: {
        label: 'AC Beat',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      grain: {
        label: 'Grain',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      scanlines: {
        label: 'Scanlines',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      vignette: {
        label: 'Vignette',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      barrel: {
        label: 'Barrel',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      saturation: {
        label: 'Saturation',
        type: 'number',
        min: 0,
        max: 2.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      exposure: {
        label: 'Exposure',
        type: 'number',
        min: 0,
        max: 2.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(VHSEffect, properties);

    this.time = 0;
  }

  render(_scene: unknown, data: RenderFrameData) {
    if (!data.hasUpdate) return;

    const speed = Number(this.properties.speed || 0);

    if (speed > 0) {
      this.time += (data.delta / 1000) * speed;
    }
  }
}

function createPass(effect: EffectPassConfig, width: number, height: number) {
  const props = effect.properties;
  const pass = new ShaderPass(VHSShader);
  return attachPassUpdater(pass, () => {
    const time = Number(effect.time || 0);
    pass.enabled = isEffectEnabled(effect);
    pass.setSize(width, height);
    pass.setUniforms({
      time,
      wave: Math.max(Number(props.wave || 0), 0),
      jitter: Math.max(Number(props.jitter || 0), 0),
      crease: Math.max(Number(props.crease || 0), 0),
      switching: Math.max(Number(props.switching || 0), 0),
      switchingHeight: Math.max(Number(props.switchingHeight || 0), 0),
      bloom: Math.max(Number(props.bloom || 0), 0),
      aberration: Math.max(Number(props.aberration || 0), 0),
      acBeat: Math.max(Number(props.acBeat || 0), 0),
      grain: Math.max(Number(props.grain || 0), 0),
      scanlines: Math.max(Number(props.scanlines || 0), 0),
      vignette: Math.max(Number(props.vignette || 0), 0),
      barrel: Math.max(Number(props.barrel || 0), 0),
      saturation: Math.max(Number(props.saturation || 0), 0),
      exposure: Math.max(Number(props.exposure || 0), 0),
      creaseNoise: noiseCpu(time, time),
    });
  });
}
registerEffectPass(VHSEffect.config.name, createPass, { liveUpdatable: true });
