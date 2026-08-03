import Effect from '@/lib/core/Effect';
import { stageHeight } from '@/lib/utils/controls';

export default class DepthOfFieldEffect extends Effect {
  static config = {
    name: 'DepthOfFieldEffect',
    description: 'Depth of field effect for 3D scene content.',
    type: 'effect',
    label: 'Depth of Field',
    defaultProperties: {
      focusDistance: 0,
      focalLength: 0.02,
      bokehScale: 2,
      height: 480,
    },
    controls: {
      focusDistance: {
        label: 'Focus Distance',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.001,
        withRange: true,
        withReactor: true,
      },
      focalLength: {
        label: 'Focal Length',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.001,
        withRange: true,
        withReactor: true,
      },
      bokehScale: {
        label: 'Bokeh Scale',
        type: 'number',
        min: 0,
        max: 10,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      height: {
        label: 'Render Height',
        type: 'number',
        min: 120,
        max: stageHeight(),
        step: 1,
        withRange: true,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(DepthOfFieldEffect, properties);
  }
}
