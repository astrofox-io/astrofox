import Effect from '@/lib/core/Effect';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import { toRadians } from '@/lib/core/render/constants';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import RGBShiftShader from '@/lib/core/render/effects/shaders/RGBShiftShader';
import { stageWidth } from '@/lib/utils/controls';

export default class RGBShiftEffect extends Effect {
  static config = {
    name: 'RGBShiftEffect',
    description: 'RGB shift effect.',
    type: 'effect',
    label: 'RGB Shift',
    category: 'distortion',
    defaultProperties: {
      offset: 5,
      angle: 45,
    },
    controls: {
      offset: {
        label: 'Offset',
        type: 'number',
        min: 0,
        max: stageWidth(),
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
    super(RGBShiftEffect, properties);
  }
}

function createPass(effect: EffectPassConfig, width: number) {
  const props = effect.properties;
  const pass = new ShaderPass(RGBShiftShader);
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setUniforms({
      amount: Number(props.offset || 0) / Math.max(1, Number(width || 1)),
      angle: toRadians(Number(props.angle || 0)),
    });
  });
}
registerEffectPass(RGBShiftEffect.config.name, createPass, { liveUpdatable: true });
