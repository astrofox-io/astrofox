import Effect from '@/lib/core/Effect';
import type { RenderFrameData } from '@/lib/types';

export default class NoiseEffect extends Effect {
  declare time: number;

  static config = {
    name: 'NoiseEffect',
    description: 'Noise effect.',
    type: 'effect',
    label: 'Noise',
    defaultProperties: {
      premultiply: false,
    },
    controls: {
      premultiply: {
        label: 'Premultiply',
        type: 'toggle',
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(NoiseEffect, properties);

    this.time = 0;
  }

  render(_scene: unknown, data: RenderFrameData) {
    if (!data.hasUpdate) {
      return;
    }

    this.time += data.delta / 1000;
  }
}
