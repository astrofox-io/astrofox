import Effect from '@/lib/core/Effect';
import { registerEffectPass } from '@/lib/core/render/effects/effectPassRegistry';
import { createColorDepthPass } from '@/lib/core/render/effects/passes/colorPasses';

export default class ColorDepthEffect extends Effect {
  static config = {
    name: 'ColorDepthEffect',
    description: 'Color depth effect.',
    type: 'effect',
    label: 'Color Depth',
    category: 'color',
    defaultProperties: {
      bits: 16,
    },
    controls: {
      bits: {
        label: 'Bits',
        type: 'number',
        min: 1,
        max: 32,
        step: 1,
        withRange: true,
        withReactor: true,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(ColorDepthEffect, properties);
  }
}

registerEffectPass(ColorDepthEffect.config.name, createColorDepthPass, { liveUpdatable: true });
