import Effect from '@/lib/core/Effect';
import { registerEffectPass } from '@/lib/core/render/effects/effectPassRegistry';
import { createColorAveragePass } from '@/lib/core/render/effects/passes/colorPasses';

export default class ColorAverageEffect extends Effect {
  static config = {
    name: 'ColorAverageEffect',
    description: 'Color average effect.',
    type: 'effect',
    label: 'Color Average',
    defaultProperties: {},
    controls: {},
  };

  constructor(properties?: Record<string, unknown>) {
    super(ColorAverageEffect, properties);
  }
}

registerEffectPass(ColorAverageEffect.config.name, createColorAveragePass, { liveUpdatable: true });
