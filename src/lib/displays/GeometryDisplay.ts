import { BLANK_IMAGE } from '@/app/constants';
import FFTParser from '@/lib/audio/FFTParser';
import Display from '@/lib/core/Display';
import { DISPLAY_3D_DEFAULTS, display3DControls } from '@/lib/displays/shared/display3DConfig';

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
    order: 1,
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
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      opacity: 1.0,
      startX: 0,
      startY: 0,
      startZ: 0,
      seed: 0,
      ...DISPLAY_3D_DEFAULTS,
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
      opacity: {
        label: 'Opacity',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      x: {
        group: 'Position',
        label: 'X',
        type: 'number',
        min: -500,
        max: 500,
        withRange: true,
        hideFill: true,
      },
      y: {
        group: 'Position',
        label: 'Y',
        type: 'number',
        min: -500,
        max: 500,
        withRange: true,
        hideFill: true,
      },
      z: {
        group: 'Position',
        label: 'Z',
        type: 'number',
        min: -500,
        max: 500,
        withRange: true,
        hideFill: true,
      },
      rotationX: {
        group: 'Rotation',
        label: 'X',
        type: 'number',
        min: 0,
        max: 360,
        withRange: true,
        withReactor: true,
      },
      rotationY: {
        group: 'Rotation',
        label: 'Y',
        type: 'number',
        min: 0,
        max: 360,
        withRange: true,
        withReactor: true,
      },
      rotationZ: {
        group: 'Rotation',
        label: 'Z',
        type: 'number',
        min: 0,
        max: 360,
        withRange: true,
        withReactor: true,
      },
      ...display3DControls,
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(GeometryDisplay, properties);

    this.parser = new FFTParser();
  }

  update(properties: Record<string, unknown>) {
    let nextProperties = properties;

    // Normalize texture input from ImageInput (HTMLImageElement or BLANK_IMAGE) to a src string
    if (properties && 'texture' in properties) {
      const { texture } = properties;
      let src = '';

      if (typeof texture === 'string') {
        src = texture === BLANK_IMAGE ? '' : texture;
      } else if (texture && typeof texture === 'object' && (texture as HTMLImageElement).src) {
        const { src: imageSrc } = texture as HTMLImageElement;
        src = imageSrc === BLANK_IMAGE ? '' : imageSrc;
      }

      nextProperties = { ...properties, texture: src };
    }

    const changed = super.update(nextProperties);

    if (changed) {
      this.parser.update(properties);
    }

    return changed;
  }
}
