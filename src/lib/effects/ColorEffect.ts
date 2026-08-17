import Effect from '@/lib/core/Effect';
import {
  type EffectPassConfig,
  registerEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import {
  createBrightnessContrastPass,
  createColorAveragePass,
  createColorDepthPass,
  createHueSaturationPass,
  createSepiaPass,
  createToneMappingPass,
} from '@/lib/core/render/effects/passes/colorPasses';

const isDisabled = (propertyName: string) => (display: { properties: Record<string, unknown> }) =>
  !display.properties[propertyName];

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
      colorAverageEnabled: false,
      colorDepthEnabled: false,
      bits: 16,
      hue: 0,
      saturation: 0,
      intensity: 0,
      toneMappingEnabled: false,
      toneMappingAdaptive: false,
      middleGrey: 0.6,
      maxLuminance: 16,
      averageLuminance: 1.0,
      adaptationRate: 1.0,
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
      colorAverageEnabled: {
        label: 'Color Average',
        type: 'toggle',
      },
      colorDepthEnabled: {
        label: 'Color Depth',
        type: 'checkbox',
      },
      bits: {
        label: 'Bits',
        type: 'number',
        min: 1,
        max: 32,
        step: 1,
        withRange: true,
        withReactor: true,
        hidden: isDisabled('colorDepthEnabled'),
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
      toneMappingEnabled: {
        label: 'Tone Mapping',
        type: 'checkbox',
      },
      toneMappingAdaptive: {
        label: 'Adaptive',
        type: 'toggle',
        hidden: isDisabled('toneMappingEnabled'),
      },
      middleGrey: {
        label: 'Middle Grey',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.01,
        withRange: true,
        hidden: isDisabled('toneMappingEnabled'),
      },
      maxLuminance: {
        label: 'Max Luminance',
        type: 'number',
        min: 1,
        max: 100,
        step: 0.1,
        withRange: true,
        hidden: isDisabled('toneMappingEnabled'),
      },
      averageLuminance: {
        label: 'Avg Luminance',
        type: 'number',
        min: 0.01,
        max: 10,
        step: 0.01,
        withRange: true,
        hidden: (display: { properties: Record<string, unknown> }) =>
          !display.properties.toneMappingEnabled || Boolean(display.properties.toneMappingAdaptive),
      },
      adaptationRate: {
        label: 'Adaptation Rate',
        type: 'number',
        min: 0.01,
        max: 10,
        step: 0.01,
        withRange: true,
        hidden: (display: { properties: Record<string, unknown> }) =>
          !display.properties.toneMappingEnabled || !display.properties.toneMappingAdaptive,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(ColorEffect, properties);
  }
}

// A chain of the individual color passes; optional stages are structural
// (toggling them rebuilds the chain).
function createPass(effect: EffectPassConfig) {
  const props = effect.properties;
  const passes = [createBrightnessContrastPass(effect)];

  if (props.colorAverageEnabled) {
    passes.push(createColorAveragePass(effect));
  }
  if (props.colorDepthEnabled) {
    passes.push(createColorDepthPass(effect));
  }
  passes.push(createHueSaturationPass(effect));
  passes.push(createSepiaPass(effect));
  if (props.toneMappingEnabled) {
    passes.push(createToneMappingPass(effect));
  }

  return passes;
}
registerEffectPass(ColorEffect.config.name, createPass, {
  liveUpdatable: true,
  structuralProps: ['colorAverageEnabled', 'colorDepthEnabled', 'toneMappingEnabled'],
});
