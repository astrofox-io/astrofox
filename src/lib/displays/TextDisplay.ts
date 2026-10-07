import type CanvasText from '@/lib/canvas/CanvasText';
import Display from '@/lib/core/Display';
import { layer2D, registerDisplayLayer } from '@/lib/core/render/displayLayerRegistry';
import { TextDisplayLayer } from '@/lib/core/render/layers/TextDisplayLayer';
import { stageHeight, stageWidth } from '@/lib/utils/controls';

export default class TextDisplay extends Display {
  // The renderer owns this canvas; the transform overlay reads its dimensions.
  declare text: CanvasText | undefined;

  static config = {
    name: 'TextDisplay',
    description: 'Displays text.',
    type: 'display',
    label: 'Text',
    order: 1,
    transform: {
      kind: 'text',
      // Empty text renders a degenerate (~1px) canvas; draw no handles.
      hasContent: (properties: Record<string, unknown>) =>
        String(properties.text ?? '').trim().length > 0,
    },
    defaultProperties: {
      text: '',
      size: 40,
      font: 'Inter',
      italic: false,
      bold: false,
      x: 0,
      y: 0,
      color: '#FFFFFF',
      rotation: 0,
      zoom: 1,
      opacity: 1.0,
    },
    controls: {
      text: {
        label: 'Text',
        type: 'text',
      },
      font: {
        label: 'Font',
        type: 'font',
      },
      size: {
        label: 'Size',
        type: 'number',
      },
      italic: {
        label: 'Italic',
        type: 'toggle',
      },
      bold: {
        label: 'Bold',
        type: 'toggle',
      },
      color: {
        label: 'Color',
        type: 'color',
      },
      rotation: {
        group: 'Appearance',
        label: 'Rotation',
        type: 'number',
        min: 0,
        max: 360,
        // Keyframes may hold any number of turns.
        unbounded: true,
        withRange: true,
        withReactor: true,
      },
      zoom: {
        group: 'Appearance',
        label: 'Scale',
        type: 'number',
        min: 1,
        max: 10,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      opacity: {
        group: 'Appearance',
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
        min: stageWidth((n: number) => -n),
        max: stageWidth(),
        withRange: true,
        hideFill: true,
      },
      y: {
        group: 'Position',
        label: 'Y',
        type: 'number',
        min: stageHeight((n: number) => -n),
        max: stageHeight(),
        withRange: true,
        hideFill: true,
      },
    },
  };

  constructor(properties?: Record<string, unknown>) {
    super(TextDisplay, properties);
  }
}

registerDisplayLayer(TextDisplay.config.name, layer2D(TextDisplayLayer));
