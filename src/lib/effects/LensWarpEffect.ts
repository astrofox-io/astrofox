import Effect from '@/lib/core/Effect';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import LensWarpShader from '@/lib/core/render/effects/shaders/LensWarpShader';

const WARP_MAX = 0.8;

export default class LensWarpEffect extends Effect {
  static config = {
    name: 'LensWarpEffect',
    description: 'Barrel or pincushion lens distortion.',
    type: 'effect',
    label: 'Lens Warp',
    category: 'distortion',
    defaultProperties: {
      warp: 0.3,
    },
    controls: {
      warp: {
        label: 'Warp',
        type: 'number',
        min: -1.0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(LensWarpEffect, properties);
  }
}

function createPass(effect: EffectPassConfig) {
  const props = effect.properties;
  const pass = new ShaderPass(LensWarpShader);
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setUniforms({
      warp: Number(props.warp || 0) * WARP_MAX,
    });
  });
}
registerEffectPass(LensWarpEffect.config.name, createPass, { liveUpdatable: true });
