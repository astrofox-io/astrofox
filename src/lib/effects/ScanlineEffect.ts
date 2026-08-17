import Effect from '@/lib/core/Effect';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import { ScanlineShader } from '@/lib/core/render/effects/shaders/PostEffectShaders';

export default class ScanlineEffect extends Effect {
  static config = {
    name: 'ScanlineEffect',
    description: 'Scanline effect.',
    type: 'effect',
    label: 'Scanline',
    category: 'pattern',
    defaultProperties: {
      density: 1.25,
    },
    controls: {
      density: {
        label: 'Density',
        type: 'number',
        min: 0.1,
        max: 5,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(ScanlineEffect, properties);
  }
}

function createPass(effect: EffectPassConfig) {
  const props = effect.properties;
  const pass = new ShaderPass(ScanlineShader);
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setUniforms({
      density: Number(props.density ?? 1.25),
    });
  });
}
registerEffectPass(ScanlineEffect.config.name, createPass, { liveUpdatable: true });
