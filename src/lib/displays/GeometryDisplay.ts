import FFTParser from '@/lib/audio/FFTParser';
import Display from '@/lib/core/Display';

const shapeOptions = [
  'Box',
  'Sphere',
  'Dodecahedron',
  'Icosahedron',
  'Octahedron',
  'Tetrahedron',
  'Torus',
  'Torus Knot',
];

const materialOptions = ['Basic', 'Lambert', 'Normal', 'Phong', 'Physical', 'Points', 'Standard'];

const shadingOptions = ['Smooth', 'Flat'];

export default class GeometryDisplay extends Display {
  declare parser: FFTParser;

  static config = {
    name: 'GeometryDisplay',
    description: 'Displays 3D geometry.',
    type: 'display',
    label: 'Geometry',
    defaultProperties: {
      shape: 'Box',
      material: 'Standard',
      shading: 'Smooth',
      color: '#FFFFFF',
      texture: '',
      wireframe: false,
      edges: false,
      edgeColor: '#FFFFFF',
      pointSize: 8,
      x: 0,
      y: 0,
      z: 0,
      opacity: 1.0,
      startX: 0,
      startY: 0,
      startZ: 0,
      seed: 0,
    },
    controls: {
      shape: {
        label: 'Shape',
        type: 'select',
        items: shapeOptions,
      },
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
      color: {
        label: 'Color',
        type: 'color',
      },
      texture: {
        label: 'Texture',
        type: 'image',
        hidden: (display: { properties: Record<string, unknown> }) =>
          display.properties.material === 'Points',
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
      pointSize: {
        label: 'Point Size',
        type: 'number',
        min: 0.5,
        max: 24,
        step: 0.1,
        withRange: true,
        withReactor: true,
        hidden: (display: { properties: Record<string, unknown> }) =>
          display.properties.material !== 'Points',
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
      opacity: {
        label: 'Opacity',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(GeometryDisplay, properties);

    this.parser = new FFTParser();
  }

  update(properties: Record<string, unknown>) {
    const changed = super.update(properties);

    if (changed) {
      this.parser.update(properties);
    }

    return changed;
  }
}
