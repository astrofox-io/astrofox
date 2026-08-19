import Effect from '@/lib/core/Effect';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import FilmGrainShader from '@/lib/core/render/effects/shaders/FilmGrainShader';
import type { RenderFrameData } from '@/lib/types';

export default class FilmGrainEffect extends Effect {
  declare time: number;

  static config = {
    name: 'FilmGrainEffect',
    description: 'Animated film grain noise overlay.',
    type: 'effect',
    label: 'Film Grain',
    category: 'stylize',
    defaultProperties: {
      intensity: 0.3,
      size: 512,
      colored: false,
      premultiply: false,
    },
    controls: {
      intensity: {
        label: 'Intensity',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      size: {
        label: 'Grain Size',
        type: 'number',
        min: 50,
        max: 2000,
        step: 10,
        withRange: true,
      },
      colored: {
        label: 'Colored',
        type: 'toggle',
      },
      premultiply: {
        label: 'Premultiply',
        type: 'toggle',
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(FilmGrainEffect, properties);

    this.time = 0;
  }

  render(_scene: unknown, data: RenderFrameData) {
    if (!data.hasUpdate) return;

    this.time += data.delta / 1000;
  }
}

function createPass(effect: EffectPassConfig) {
  const props = effect.properties;
  const pass = new ShaderPass(FilmGrainShader);
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setUniforms({
      intensity: Number(props.intensity || 0),
      size: Math.max(1, Number(props.size || 1)),
      colored: props.colored ? 1 : 0,
      premultiply: props.premultiply ? 1 : 0,
      time: Number(effect.time || 0),
    });
  });
}
registerEffectPass(FilmGrainEffect.config.name, createPass, { liveUpdatable: true });
