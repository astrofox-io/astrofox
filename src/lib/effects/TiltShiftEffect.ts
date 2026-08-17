import Effect from '@/lib/core/Effect';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import { TiltShiftShader } from '@/lib/core/render/effects/shaders/PostEffectShaders';

export default class TiltShiftEffect extends Effect {
  static config = {
    name: 'TiltShiftEffect',
    description: 'Tilt shift effect.',
    type: 'effect',
    label: 'Tilt Shift',
    category: 'blur-focus',
    order: 4,
    defaultProperties: {
      blur: 0.15,
      taper: 0.5,
      samples: 10,
    },
    controls: {
      blur: {
        label: 'Blur',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      taper: {
        label: 'Taper',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.01,
        withRange: true,
      },
      samples: {
        label: 'Samples',
        type: 'number',
        min: 1,
        max: 32,
        step: 1,
        withRange: true,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(TiltShiftEffect, properties);
  }
}

function createPass(effect: EffectPassConfig) {
  const props = effect.properties;
  const pass = new ShaderPass(TiltShiftShader);
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setUniforms({
      blur: Number(props.blur ?? 0.15),
      taper: Number(props.taper ?? 0.5),
      start: [0.5, 0.0],
      end: [0.5, 1.0],
      samples: Number(props.samples ?? 10),
      direction: [1, 1],
    });
  });
}
registerEffectPass(TiltShiftEffect.config.name, createPass, { liveUpdatable: true });
