import { BLANK_IMAGE } from '@/app/constants';
import Display from '@/lib/core/Display';
import { GRID_MOTION_OPTIONS } from '@/lib/core/render/geometry/gridMotion';
import { DISPLAY_3D_DEFAULTS, display3DControls } from '@/lib/displays/shared/display3DConfig';

const materialOptions = ['Basic', 'Lambert', 'Normal', 'Phong', 'Physical', 'Points', 'Standard'];

const shadingOptions = ['Smooth', 'Flat'];

export default class MeshGridDisplay extends Display {
  static config = {
    name: 'MeshGridDisplay',
    description: 'Displays an animated 3D mesh grid surface.',
    type: 'display',
    label: 'Mesh Grid',
    order: 4,
    defaultProperties: {
      material: 'Standard',
      shading: 'Smooth',
      motion: 'Radial',
      color: '#FFFFFF',
      texture: '',
      wireframe: true,
      edges: false,
      edgeColor: '#FFFFFF',
      x: 0,
      y: 0,
      z: 0,
      columns: 42,
      rows: 32,
      separation: 32,
      height: 28,
      pointSize: 4,
      speed: 1,
      frequencyX: 0.3,
      frequencyY: 0.5,
      opacity: 1,
      ...DISPLAY_3D_DEFAULTS,
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
      columns: {
        label: 'Columns',
        type: 'number',
        min: 4,
        max: 96,
        step: 1,
        withRange: true,
      },
      rows: {
        label: 'Rows',
        type: 'number',
        min: 4,
        max: 96,
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
      height: {
        label: 'Height',
        type: 'number',
        min: 0,
        max: 120,
        step: 1,
        withRange: true,
        withReactor: true,
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
      ...display3DControls,
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(MeshGridDisplay, properties);
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

    return super.update(nextProperties);
  }
}
