import Effect from '@/lib/core/Effect';
import { registerEffectPass } from '@/lib/core/render/effects/effectPassRegistry';
import { createSepiaPass } from '@/lib/core/render/effects/passes/colorPasses';

export default class SepiaEffect extends Effect {
  static config = {
    name: 'SepiaEffect',
    description: 'Sepia effect.',
    type: 'effect',
    label: 'Sepia',
    defaultProperties: {
      intensity: 1.0,
    },
    controls: {
      intensity: {
        label: 'Intensity',
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
    super(SepiaEffect, properties);
  }
}

registerEffectPass(SepiaEffect.config.name, createSepiaPass, { liveUpdatable: true });
