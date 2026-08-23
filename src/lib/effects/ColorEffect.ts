import Effect from '@/lib/core/Effect';
import {
  type EffectPassConfig,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import {
  createBrightnessContrastPass,
  createHueSaturationPass,
  createSepiaPass,
} from '@/lib/core/render/effects/passes/colorPasses';

export default class ColorEffect extends Effect {
  static config = {
    name: 'ColorEffect',
    description: 'Combined color adjustment effect.',
    type: 'effect',
    label: 'Color',
    category: 'color',
    defaultProperties: {
      brightness: 0,
      contrast: 0,
      hue: 0,
      saturation: 0,
      intensity: 0,
    },
    controls: {
      brightness: {
        label: 'Brightness',
        type: 'number',
        min: -1,
        max: 1,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      contrast: {
        label: 'Contrast',
        type: 'number',
        min: -1,
        max: 1,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      hue: {
        label: 'Hue',
        type: 'number',
        min: 0,
        max: 360,
        step: 1,
        withRange: true,
        withReactor: true,
      },
      saturation: {
        label: 'Saturation',
        type: 'number',
        min: -1,
        max: 1,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      intensity: {
        label: 'Sephia',
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
    super(ColorEffect, properties);
  }
}

// A chain of the individual color passes.
function createPass(effect: EffectPassConfig) {
  return [
    createBrightnessContrastPass(effect),
    createHueSaturationPass(effect),
    createSepiaPass(effect),
  ];
}
registerEffectPass(ColorEffect.config.name, createPass, {
  liveUpdatable: true,
});
