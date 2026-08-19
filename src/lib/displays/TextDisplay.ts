import { resolveFontFamily } from '@/app/fontFamilies';
import CanvasText from '@/lib/canvas/CanvasText';
import fonts from '@/lib/config/fonts.json';
import Display from '@/lib/core/Display';
import { stageHeight, stageWidth } from '@/lib/utils/controls';

const fontOptions = fonts.map(item => ({
  label: item,
  value: item,
  style: { fontFamily: resolveFontFamily(item) },
}));

export default class TextDisplay extends Display {
  declare text: CanvasText;

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
      font: 'Roboto',
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
        type: 'select',
        items: fontOptions,
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

    const canvas = new OffscreenCanvas(1, 1);
    const props = this.properties as Record<string, unknown>;
    this.text = new CanvasText(props, canvas);
  }

  update(properties: Record<string, unknown>) {
    if (this.text.update(properties)) {
      this.text.render();
    }

    return super.update(properties);
  }
}
