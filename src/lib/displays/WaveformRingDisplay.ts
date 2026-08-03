import { DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_WIDTH } from '@/app/constants';
import WaveParser from '@/lib/audio/WaveParser';
import CanvasWaveRing from '@/lib/canvas/CanvasWaveRing';
import Display from '@/lib/core/Display';
import { stageHeight, stageWidth } from '@/lib/utils/controls';

export default class WaveformRingDisplay extends Display {
  declare ring: CanvasWaveRing;
  declare parser: WaveParser;

  static config = {
    name: 'WaveformRingDisplay',
    description: 'Displays a sound wave wrapped around a ring.',
    type: 'display',
    label: 'Waveform Ring',
    defaultProperties: {
      radius: 160,
      amplitude: 80,
      sampleCount: 256,
      lineWidth: 2,
      stroke: true,
      strokeColor: '#FFFFFF',
      fill: false,
      fillColor: ['#333333', '#FFFFFF'],
      smooth: true,
      smoothingTimeConstant: 0,
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 1.0,
    },
    controls: {
      radius: {
        label: 'Radius',
        type: 'number',
        min: 10,
        max: stageWidth((n: number) => n / 2),
        withRange: true,
        withReactor: true,
      },
      amplitude: {
        label: 'Amplitude',
        type: 'number',
        min: 0,
        max: stageHeight((n: number) => n / 2),
        withRange: true,
        withReactor: true,
      },
      sampleCount: {
        label: 'Samples',
        type: 'number',
        min: 16,
        max: 1024,
        step: 1,
        withRange: true,
      },
      lineWidth: {
        label: 'Line Width',
        type: 'number',
        min: 1,
        max: 20,
        withRange: true,
      },
      smoothingTimeConstant: {
        label: 'Smoothing',
        type: 'number',
        min: 0,
        max: 0.99,
        step: 0.01,
        withRange: true,
      },
      stroke: {
        label: 'Stroke',
        type: 'toggle',
      },
      strokeColor: {
        label: 'Stroke Color',
        type: 'color',
      },
      fill: {
        label: 'Fill',
        type: 'toggle',
      },
      fillColor: {
        label: 'Fill Color',
        type: 'colorrange',
      },
      smooth: {
        label: 'Smooth',
        type: 'toggle',
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
    super(WaveformRingDisplay, properties);

    const canvas = new OffscreenCanvas(DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT);
    const props = this.properties as Record<string, unknown>;
    this.ring = new CanvasWaveRing(props, canvas);
    this.parser = new WaveParser(props);
  }

  update(properties: Record<string, unknown>) {
    const changed = super.update(properties);

    if (changed) {
      this.ring.update(properties);
      this.parser.update(properties);
    }

    return changed;
  }
}
