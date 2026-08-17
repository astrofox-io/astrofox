import Effect from '@/lib/core/Effect';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import { toRadians } from '@/lib/core/render/constants';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import KaleidoscopeShader from '@/lib/core/render/effects/shaders/KaleidoscopeShader';

export default class KaleidoscopeEffect extends Effect {
  static config = {
    name: 'KaleidoscopeEffect',
    description: 'Kaleidoscope effect.',
    type: 'effect',
    label: 'Kaleidoscope',
    category: 'distortion',
    defaultProperties: {
      sides: 6,
      angle: 0,
    },
    controls: {
      sides: {
        label: 'Sides',
        type: 'number',
        min: 1,
        max: 20,
        withRange: true,
        withReactor: true,
      },
      angle: {
        label: 'Angle',
        type: 'number',
        min: 0,
        max: 360,
        withRange: true,
        withReactor: true,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(KaleidoscopeEffect, properties);
  }
}

function createPass(effect: EffectPassConfig) {
  const props = effect.properties;
  const pass = new ShaderPass(KaleidoscopeShader);
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setUniforms({
      sides: Math.max(1, Number(props.sides || 6)),
      angle: toRadians(Number(props.angle || 0)),
    });
  });
}
registerEffectPass(KaleidoscopeEffect.config.name, createPass, { liveUpdatable: true });
