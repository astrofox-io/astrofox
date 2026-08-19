import Effect from '@/lib/core/Effect';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import ShockwaveShader from '@/lib/core/render/effects/shaders/ShockwaveShader';
import type { RenderFrameData } from '@/lib/types';

export default class ShockwaveEffect extends Effect {
  declare time: number;

  static config = {
    name: 'ShockwaveEffect',
    description: 'Radial shockwave distortion emanating from the center.',
    type: 'effect',
    label: 'Shockwave',
    category: 'distortion',
    defaultProperties: {
      amplitude: 0.5,
      frequency: 5.0,
      speed: 0.5,
    },
    controls: {
      amplitude: {
        label: 'Amplitude',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      frequency: {
        label: 'Frequency',
        type: 'number',
        min: 1,
        max: 20,
        step: 0.5,
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
    super(ShockwaveEffect, properties);

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

function createPass(effect: EffectPassConfig) {
  const props = effect.properties;
  const pass = new ShaderPass(ShockwaveShader);
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setUniforms({
      amplitude: Number(props.amplitude || 0),
      frequency: Number(props.frequency || 1),
      time: Number(effect.time || 0),
    });
  });
}
registerEffectPass(ShockwaveEffect.config.name, createPass, { liveUpdatable: true });
