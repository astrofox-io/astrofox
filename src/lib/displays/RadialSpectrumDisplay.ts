import { FFT_SIZE, SAMPLE_RATE } from '@/app/constants';
import FFTParser from '@/lib/audio/FFTParser';
import CanvasRadial from '@/lib/canvas/CanvasRadial';
import Display from '@/lib/core/Display';
import { property, stageHeight, stageWidth } from '@/lib/utils/controls';

export default class RadialSpectrumDisplay extends Display {
  declare radial: CanvasRadial;
  declare parser: FFTParser;

  static config = {
    name: 'RadialSpectrumDisplay',
    description: 'Displays an audio spectrum in a radial/circular layout.',
    type: 'display',
    label: 'Radial Spectrum',
    defaultProperties: {
      radius: 150,
      innerRadius: 80,
      barCount: 64,
      barWidth: 4,
      mirror: true,
      shadowLength: 0.5,
      color: ['#FFFFFF', '#FFFFFF'],
      shadowColor: ['#333333', '#000000'],
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 1.0,
      fftSize: FFT_SIZE,
      sampleRate: SAMPLE_RATE,
      smoothingTimeConstant: 0.5,
      minDecibels: -100,
      maxDecibels: -12,
      minFrequency: 0,
      maxFrequency: 6000,
      normalize: true,
    },
    controls: {
      maxDecibels: {
        label: 'Max dB',
        type: 'number',
        min: -40,
        max: 0,
        step: 1,
        withRange: true,
      },
      minFrequency: {
        label: 'Min Frequency',
        type: 'number',
        min: 0,
        max: property('maxFrequency'),
        step: 10,
        withRange: true,
      },
      maxFrequency: {
        label: 'Max Frequency',
        type: 'number',
        min: property('minFrequency'),
        max: 22000,
        step: 10,
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
      radius: {
        label: 'Radius',
        type: 'number',
        min: 10,
        max: stageWidth((n: number) => n / 2),
        withRange: true,
        withReactor: true,
      },
      innerRadius: {
        label: 'Inner Radius',
        type: 'number',
        min: 0,
        max: property('radius'),
        withRange: true,
      },
      barCount: {
        label: 'Bar Count',
        type: 'number',
        min: 8,
        max: 256,
        step: 1,
        withRange: true,
      },
      barWidth: {
        label: 'Bar Width',
        type: 'number',
        min: 1,
        max: 50,
        step: 1,
        withRange: true,
      },
      mirror: {
        label: 'Mirror',
        type: 'toggle',
        inputProps: {
          label: 'Symmetric',
        },
      },
      shadowLength: {
        label: 'Shadow Length',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
      },
      color: {
        label: 'Bar Color',
        type: 'colorrange',
      },
      shadowColor: {
        label: 'Shadow Color',
        type: 'colorrange',
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
    super(RadialSpectrumDisplay, properties);

    const canvas = new OffscreenCanvas(1, 1);
    const props = this.properties as Record<string, unknown>;
    this.radial = new CanvasRadial(props, canvas);
    this.parser = new FFTParser({
      ...props,
      fftSize: FFT_SIZE,
      sampleRate: SAMPLE_RATE,
    });
  }

  update(properties: Record<string, unknown>) {
    const changed = super.update(properties);

    if (changed) {
      this.radial.update(properties);
      this.parser.update(properties);
    }

    return changed;
  }
}
