import Effect from '@/lib/core/Effect';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import NoiseShader from '@/lib/core/render/effects/shaders/NoiseShader';
import type { RenderFrameData } from '@/lib/types';

export default class NoiseEffect extends Effect {
  declare time: number;

  static config = {
    name: 'NoiseEffect',
    description: 'Noise effect.',
    type: 'effect',
    label: 'Noise',
    category: 'stylize',
    defaultProperties: {
      premultiply: false,
    },
    controls: {
      premultiply: {
        label: 'Premultiply',
        type: 'toggle',
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(NoiseEffect, properties);

    this.time = 0;
  }

  render(_scene: unknown, data: RenderFrameData) {
    if (!data.hasUpdate) {
      return;
    }

    this.time += data.delta / 1000;
  }
}

function createPass(effect: EffectPassConfig, width: number, height: number) {
  const props = effect.properties;
  const pass = new ShaderPass(NoiseShader);
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setSize(width, height);
    pass.setUniforms({
      time: Number(effect.time || props.time || 0),
      premultiply: props.premultiply ? 1 : 0,
    });
  });
}
registerEffectPass(NoiseEffect.config.name, createPass, { liveUpdatable: true });
