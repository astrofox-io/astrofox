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

export default class VHSEffect extends Effect {
  declare time: number;

  static config = {
    name: 'VHSEffect',
    description: 'VHS tape distortion with scanlines, noise and color bleeding.',
    type: 'effect',
    label: 'VHS',
    category: 'distortion',
    defaultProperties: {
      intensity: 0.5,
      speed: 0.5,
    },
    controls: {
      intensity: {
        label: 'Intensity',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
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
    pass.enabled = isEffectEnabled(effect);
    pass.setSize(width, height);
    pass.setUniforms({
      intensity: Number(props.intensity || 0),
      time: Number(effect.time || 0),
    });
  });
}
registerEffectPass(VHSEffect.config.name, createPass, { liveUpdatable: true });
