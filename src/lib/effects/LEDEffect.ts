import Effect from '@/lib/core/Effect';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import LEDShader from '@/lib/core/render/effects/shaders/LEDShader';

export default class LEDEffect extends Effect {
  static config = {
    name: 'LEDEffect',
    description: 'LED effect.',
    type: 'effect',
    label: 'LED',
    category: 'pattern',
    defaultProperties: {
      spacing: 10,
      size: 4,
      blur: 4,
    },
    controls: {
      spacing: {
        label: 'Spacing',
        type: 'number',
        min: 1,
        max: 100,
        withRange: true,
        withReactor: true,
      },
      size: {
        label: 'Size',
        type: 'number',
        min: 0,
        max: 100,
        withRange: true,
        withReactor: true,
      },
      blur: {
        label: 'Blur',
        type: 'number',
        min: 0,
        max: 100,
        withRange: true,
        withReactor: true,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(LEDEffect, properties);
  }
}

function createPass(effect: EffectPassConfig, width: number, height: number) {
  const props = effect.properties;
  const pass = new ShaderPass(LEDShader);
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setSize(width, height);
    pass.setUniforms({
      spacing: Number(props.spacing || 10),
      size: Number(props.size || 4),
      blur: Number(props.blur || 4),
    });
  });
}
registerEffectPass(LEDEffect.config.name, createPass, { liveUpdatable: true });
