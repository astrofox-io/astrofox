import Effect from '@/lib/core/Effect';
import type { RenderFrameData } from '@/lib/types';

export default class PerlinNoiseEffect extends Effect {
  declare time: number;

  static config = {
    name: 'PerlinNoiseEffect',
    description: 'Perlin noise effect.',
    type: 'effect',
    label: 'Perlin Noise',
    defaultProperties: {
      time: 0,
      amount: 0.35,
      scale: 3,
      speed: 0.25,
    },
    controls: {
      amount: {
        label: 'Amount',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      scale: {
        label: 'Scale',
        type: 'number',
        min: 0.25,
        max: 12,
        step: 0.05,
        withRange: true,
        withReactor: true,
      },
      speed: {
        label: 'Speed',
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
    super(PerlinNoiseEffect, properties);

    this.time = 0;
  }

  render(_scene: unknown, data: RenderFrameData) {
    if (!data.hasUpdate) {
      return;
    }

    const speed = Number(
      (this.properties as Record<string, unknown>).speed ??
        PerlinNoiseEffect.config.defaultProperties.speed,
    );

    if (speed > 0) {
      this.time += data.delta / (100 / speed);
    }
  }
}
