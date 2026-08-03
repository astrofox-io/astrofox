import Effect from '@/lib/core/Effect';

const halftoneShapeOptions = ['Dot', 'Ellipse', 'Line', 'Square', 'Diamond'];

export default class ColorHalftoneEffect extends Effect {
  static config = {
    name: 'ColorHalftoneEffect',
    description: 'Color halftone effect.',
    type: 'effect',
    label: 'Color Halftone',
    defaultProperties: {
      shape: 'Dot',
      radius: 4,
      rotateR: 15,
      rotateG: 30,
      rotateB: 45,
      scatter: 0,
    },
    controls: {
      shape: {
        label: 'Shape',
        type: 'select',
        items: halftoneShapeOptions,
      },
      radius: {
        label: 'Radius',
        type: 'number',
        min: 1,
        max: 25,
        step: 1,
        withRange: true,
        withReactor: true,
      },
      rotateR: {
        label: 'Red Angle',
        type: 'number',
        min: 0,
        max: 90,
        step: 1,
        withRange: true,
        withReactor: true,
      },
      rotateG: {
        label: 'Green Angle',
        type: 'number',
        min: 0,
        max: 90,
        step: 1,
        withRange: true,
        withReactor: true,
      },
      rotateB: {
        label: 'Blue Angle',
        type: 'number',
        min: 0,
        max: 90,
        step: 1,
        withRange: true,
        withReactor: true,
      },
      scatter: {
        label: 'Scatter',
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
    super(ColorHalftoneEffect, properties);
  }
}
