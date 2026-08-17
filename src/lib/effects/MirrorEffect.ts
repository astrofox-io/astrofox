import Effect from '@/lib/core/Effect';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import MirrorShader from '@/lib/core/render/effects/shaders/MirrorShader';

const mirrorOptions = [
  { label: 'Left \u{1F816} Right', value: 0 },
  { label: 'Right \u{1F816} Left', value: 1 },
  { label: 'Top \u{1F816} Bottom', value: 2 },
  { label: 'Bottom \u{1F816} Top', value: 3 },
];

export default class MirrorEffect extends Effect {
  static config = {
    name: 'MirrorEffect',
    description: 'Mirror effect.',
    type: 'effect',
    label: 'Mirror',
    category: 'distortion',
    defaultProperties: {
      side: 0,
    },
    controls: {
      side: {
        label: 'Side',
        type: 'select',
        items: mirrorOptions,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(MirrorEffect, properties);
  }
}

function createPass(effect: EffectPassConfig) {
  const props = effect.properties;
  const pass = new ShaderPass(MirrorShader);
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setUniforms({
      side: Number(props.side || 0),
    });
  });
}
registerEffectPass(MirrorEffect.config.name, createPass, { liveUpdatable: true });
