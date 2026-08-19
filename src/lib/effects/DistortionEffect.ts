import Effect from '@/lib/core/Effect';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import DistortionShader from '@/lib/core/render/effects/shaders/DistortionShader';
import type { RenderFrameData } from '@/lib/types';

const distortionModes = ['Wave', 'Simplex Noise', 'Perlin Noise'];

export default class DistortionEffect extends Effect {
  declare time: number;

  static config = {
    name: 'DistortionEffect',
    description: 'Animated distortion using a wave, simplex noise or Perlin noise field.',
    type: 'effect',
    label: 'Distortion',
    category: 'distortion',
    defaultProperties: {
      time: 0,
      mode: 'Wave',
      amount: 0.15,
      scale: 3.0,
      speed: 0.5,
    },
    controls: {
      mode: {
        label: 'Mode',
        type: 'select',
        items: distortionModes,
      },
      amount: {
        label: 'Amount',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      scale: {
        label: 'Scale',
        type: 'number',
        min: 0.5,
        max: 10,
        step: 0.1,
        withRange: true,
        withReactor: true,
      },
      speed: {
        label: 'Speed',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(DistortionEffect, properties);

    this.time = 0;
  }

  render(_scene: unknown, data: RenderFrameData) {
    if (!data.hasUpdate) return;

    const speed = Number(this.properties.speed || 0);

    if (speed > 0) {
      this.time += data.delta / (100 / speed);
    }
  }
}

const DISTORTION_MAX = 30;

function createPass(effect: EffectPassConfig, width: number, height: number) {
  const props = effect.properties;
  const pass = new ShaderPass(DistortionShader);
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setSize(width, height);
    pass.setUniforms({
      mode: Math.max(0, distortionModes.indexOf(String(props.mode))),
      amount: Number(props.amount || 0) * DISTORTION_MAX,
      scale: Number(props.scale || 3),
      time: Number(effect.time || props.time || 0),
    });
  });
}
registerEffectPass(DistortionEffect.config.name, createPass, { liveUpdatable: true });
