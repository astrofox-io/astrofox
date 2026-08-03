import { DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_WIDTH } from '@/app/constants';
import Display from '@/lib/core/Display';
import { stageHeight, stageWidth } from '@/lib/utils/controls';

export default class FlowBackgroundDisplay extends Display {
  static config = {
    name: 'FlowBackgroundDisplay',
    description: 'Displays an animated dark flow background with soft glowing trails.',
    type: 'display',
    label: 'Flow Background',
    defaultProperties: {
      width: DEFAULT_CANVAS_WIDTH,
      height: DEFAULT_CANVAS_HEIGHT,
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 1.0,
      motion: 'Orbit',
      speed: 1.0,
    },
    controls: {
      motion: {
        label: 'Motion',
        type: 'select',
        items: ['Orbit', 'Figure 8', 'Sweep', 'Drift', 'Pulse'],
      },
      speed: {
        label: 'Speed',
        type: 'number',
        min: 0,
        max: 5,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      width: {
        label: 'Width',
        type: 'number',
        min: 1,
        max: stageWidth((n: number) => n * 2),
        withRange: true,
      },
      height: {
        label: 'Height',
        type: 'number',
        min: 1,
        max: stageHeight((n: number) => n * 2),
        withRange: true,
      },
      x: {
        label: 'X',
        type: 'number',
        min: stageWidth((n: number) => -n),
        max: stageWidth(),
        withRange: true,
        hideFill: true,
      },
      y: {
        label: 'Y',
        type: 'number',
        min: stageHeight((n: number) => -n),
        max: stageHeight(),
        withRange: true,
        hideFill: true,
      },
      rotation: {
        label: 'Rotation',
        type: 'number',
        min: 0,
        max: 360,
        withRange: true,
        withReactor: true,
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
    super(FlowBackgroundDisplay, properties);
  }
}
