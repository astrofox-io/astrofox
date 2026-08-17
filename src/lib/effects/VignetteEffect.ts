import Effect from '@/lib/core/Effect';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import { VignetteShader } from '@/lib/core/render/effects/shaders/PostEffectShaders';

export default class VignetteEffect extends Effect {
  static config = {
    name: 'VignetteEffect',
    description: 'Vignette effect.',
    type: 'effect',
    label: 'Vignette',
    category: 'stylize',
    defaultProperties: {
      offset: 0.5,
      darkness: 0.5,
    },
    controls: {
      offset: {
        label: 'Offset',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      darkness: {
        label: 'Darkness',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(VignetteEffect, properties);
  }
}

function createPass(effect: EffectPassConfig) {
  const props = effect.properties;
  const pass = new ShaderPass(VignetteShader);
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setUniforms({
      offset: Number(props.offset ?? 0.5),
      darkness: Number(props.darkness ?? 0.5),
    });
  });
}
registerEffectPass(VignetteEffect.config.name, createPass, { liveUpdatable: true });
