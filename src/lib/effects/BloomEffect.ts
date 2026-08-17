import Effect from '@/lib/core/Effect';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import UnrealBloomEffectPass from '@/lib/core/render/effects/passes/UnrealBloomEffectPass';

export default class BloomEffect extends Effect {
  static config = {
    name: 'BloomEffect',
    description: 'Bloom effect.',
    type: 'effect',
    label: 'Bloom',
    category: 'blur-focus',
    order: 2,
    defaultProperties: {
      exposure: 1,
      strength: 0.5,
      radius: 0,
      threshold: 0,
    },
    controls: {
      exposure: {
        label: 'Exposure',
        type: 'number',
        min: 0,
        max: 2,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      strength: {
        label: 'Strength',
        type: 'number',
        min: 0,
        max: 3,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      radius: {
        label: 'Radius',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      threshold: {
        label: 'Threshold',
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
    super(BloomEffect, properties);
  }
}

function getBloomOptions(props: Record<string, unknown>) {
  return {
    exposure: Number(props.exposure ?? 1),
    strength: Number(props.strength ?? 1.5),
    radius: Number(props.radius ?? 0),
    threshold: Number(props.threshold ?? 0),
  };
}

function createPass(effect: EffectPassConfig, width: number, height: number) {
  const props = effect.properties;
  const pass = new UnrealBloomEffectPass({ width, height, ...getBloomOptions(props) });
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.updateOptions(getBloomOptions(props));
  });
}
registerEffectPass(BloomEffect.config.name, createPass, { liveUpdatable: true });
