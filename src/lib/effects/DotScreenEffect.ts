import Effect from '@/lib/core/Effect';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import { toRadians } from '@/lib/core/render/constants';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import DotScreenShader from '@/lib/core/render/effects/shaders/DotScreenShader';

export default class DotScreenEffect extends Effect {
  static config = {
    name: 'DotScreenEffect',
    description: 'Dot screen effect.',
    type: 'effect',
    label: 'Dot Screen',
    category: 'pattern',
    defaultProperties: {
      angle: 90,
      scale: 0.5,
    },
    controls: {
      scale: {
        label: 'Scale',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.01,
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
    super(DotScreenEffect, properties);
  }
}

function createPass(effect: EffectPassConfig, width: number, height: number) {
  const props = effect.properties;
  const pass = new ShaderPass(DotScreenShader);
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setUniforms({
      tSize: [width, height],
      center: [width / 2, height / 2],
      scale: 2 - Number(props.scale || 0) * 2,
      angle: toRadians(Number(props.angle || 0)),
    });
  });
}
registerEffectPass(DotScreenEffect.config.name, createPass, { liveUpdatable: true });
