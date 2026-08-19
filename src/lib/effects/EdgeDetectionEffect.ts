import { Color } from 'three';
import Effect from '@/lib/core/Effect';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import {
  attachPassUpdater,
  type EffectPassConfig,
  isEffectEnabled,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import EdgeDetectionShader from '@/lib/core/render/effects/shaders/EdgeDetectionShader';

export default class EdgeDetectionEffect extends Effect {
  static config = {
    name: 'EdgeDetectionEffect',
    description: 'Sobel edge detection with outline or neon glow mode.',
    type: 'effect',
    label: 'Edge Detection',
    category: 'stylize',
    defaultProperties: {
      thickness: 1.0,
      neon: false,
      color: '#ffffff',
    },
    controls: {
      thickness: {
        label: 'Thickness',
        type: 'number',
        min: 0.5,
        max: 5,
        step: 0.1,
        withRange: true,
        withReactor: true,
      },
      neon: {
        label: 'Neon Mode',
        type: 'toggle',
      },
      color: {
        label: 'Edge Color',
        type: 'color',
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(EdgeDetectionEffect, properties);
  }
}

function createPass(effect: EffectPassConfig, width: number, height: number) {
  const props = effect.properties;
  const pass = new ShaderPass(EdgeDetectionShader);
  const color = new Color();
  return attachPassUpdater(pass, () => {
    pass.enabled = isEffectEnabled(effect);
    pass.setSize(width, height);
    color.set(String(props.color || '#ffffff'));
    pass.setUniforms({
      thickness: Number(props.thickness || 1),
      neon: props.neon ? 1 : 0,
      edgeColor: [color.r, color.g, color.b],
    });
  });
}
registerEffectPass(EdgeDetectionEffect.config.name, createPass, { liveUpdatable: true });
