import Effect from '@/lib/core/Effect';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import GlitchPass from '@/lib/core/render/effects/passes/GlitchPass';

const glitchModes = ['Sporadic', 'Constant'];

export default class GlitchEffect extends Effect {
  static config = {
    name: 'GlitchEffect',
    description: 'Glitch effect.',
    type: 'effect',
    label: 'Glitch',
    category: 'distortion',
    defaultProperties: {
      mode: 'Sporadic',
      strength: 0.3,
      columns: 0.05,
      ratio: 0.85,
    },
    controls: {
      mode: {
        label: 'Mode',
        type: 'select',
        items: glitchModes,
      },
      strength: {
        label: 'Strength',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      columns: {
        label: 'Columns',
        type: 'number',
        min: 0,
        max: 0.5,
        step: 0.01,
        withRange: true,
      },
      ratio: {
        label: 'Ratio',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(GlitchEffect, properties);
  }
}

function createPass(effect: EffectPassConfig) {
  const props = effect.properties;
  const pass = new GlitchPass();
  return attachPassUpdater(pass, frameData => {
    pass.updateOptions({ ...props, mode: props.mode || 'Sporadic' }, frameData);
    pass.enabled = isEffectEnabled(effect) && pass.enabled;
  });
}
registerEffectPass(GlitchEffect.config.name, createPass, { liveUpdatable: true });
