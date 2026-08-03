import Effect from '@/lib/core/Effect';

const isAdaptive = (display: { properties: Record<string, unknown> }) =>
  Boolean(display.properties.adaptive);

export default class ToneMappingEffect extends Effect {
  static config = {
    name: 'ToneMappingEffect',
    description: 'Tone mapping effect.',
    type: 'effect',
    label: 'Tone Mapping',
    defaultProperties: {
      adaptive: false,
      middleGrey: 0.6,
      maxLuminance: 16,
      averageLuminance: 1.0,
      adaptationRate: 1.0,
    },
    controls: {
      adaptive: {
        label: 'Adaptive',
        type: 'toggle',
      },
      middleGrey: {
        label: 'Middle Grey',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.01,
        withRange: true,
      },
      maxLuminance: {
        label: 'Max Luminance',
        type: 'number',
        min: 1,
        max: 100,
        step: 0.1,
        withRange: true,
      },
      averageLuminance: {
        label: 'Avg Luminance',
        type: 'number',
        min: 0.01,
        max: 10,
        step: 0.01,
        withRange: true,
        hidden: isAdaptive,
      },
      adaptationRate: {
        label: 'Adaptation Rate',
        type: 'number',
        min: 0.01,
        max: 10,
        step: 0.01,
        withRange: true,
        hidden: (display: { properties: Record<string, unknown> }) => !isAdaptive(display),
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(ToneMappingEffect, properties);
  }
}
