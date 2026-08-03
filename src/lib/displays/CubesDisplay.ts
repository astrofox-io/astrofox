import Display from '@/lib/core/Display';
import { GRID_MOTION_OPTIONS } from '@/lib/core/render/geometry/gridMotion';

const materialOptions = ['Basic', 'Lambert', 'Normal', 'Phong', 'Physical', 'Standard'];

const shadingOptions = ['Smooth', 'Flat'];

export default class CubesDisplay extends Display {
  static config = {
    name: 'CubesDisplay',
    description: 'Displays an animated 3D wall of cubes.',
    type: 'display',
    label: 'Cubes',
    defaultProperties: {
      material: 'Standard',
      shading: 'Smooth',
      color: '#000000',
      texture: '',
      wireframe: false,
      edges: true,
      edgeColor: '#FFFFFF',
      x: 0,
      y: 0,
      z: 0,
      rows: 8,
      columns: 8,
      separation: 32,
      gap: 2,
      motion: 'Radial',
      height: 28,
      speed: 1,
      frequencyX: 0.3,
      frequencyY: 0.5,
      opacity: 1.0,
    },
    controls: {
      material: {
        label: 'Material',
        type: 'select',
        items: materialOptions,
      },
      shading: {
        label: 'Shading',
        type: 'select',
        items: shadingOptions,
      },
      motion: {
        label: 'Motion',
        type: 'select',
        items: [...GRID_MOTION_OPTIONS],
      },
      color: {
        label: 'Color',
        type: 'color',
      },
      texture: {
        label: 'Texture',
        type: 'image',
      },
      wireframe: {
        label: 'Wireframe',
        type: 'toggle',
      },
      edges: {
        label: 'Edges',
        type: 'toggle',
      },
      edgeColor: {
        label: 'Edge Color',
        type: 'color',
      },
      x: {
        label: 'X',
        type: 'number',
        min: -500,
        max: 500,
        withRange: true,
        hideFill: true,
      },
      y: {
        label: 'Y',
        type: 'number',
        min: -500,
        max: 500,
        withRange: true,
        hideFill: true,
      },
      z: {
        label: 'Z',
        type: 'number',
        min: -500,
        max: 500,
        withRange: true,
        hideFill: true,
      },
      rows: {
        label: 'Rows',
        type: 'number',
        min: 1,
        max: 18,
        step: 1,
        withRange: true,
      },
      columns: {
        label: 'Columns',
        type: 'number',
        min: 1,
        max: 28,
        step: 1,
        withRange: true,
      },
      separation: {
        label: 'Separation',
        type: 'number',
        min: 8,
        max: 120,
        step: 1,
        withRange: true,
      },
      gap: {
        label: 'Gap',
        type: 'number',
        min: 0,
        max: 24,
        step: 0.1,
        withRange: true,
      },
      height: {
        label: 'Height',
        type: 'number',
        min: 0,
        max: 120,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      speed: {
        label: 'Speed',
        type: 'number',
        min: 0,
        max: 6,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      frequencyX: {
        label: 'Freq X',
        type: 'number',
        min: 0.05,
        max: 2,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      frequencyY: {
        label: 'Freq Y',
        type: 'number',
        min: 0.05,
        max: 2,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      opacity: {
        label: 'Opacity',
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
    super(CubesDisplay, properties);
  }
}
