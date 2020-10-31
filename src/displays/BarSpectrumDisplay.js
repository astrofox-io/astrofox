import CanvasDisplay from 'core/CanvasDisplay';
import CanvasBars from 'canvas/CanvasBars';
import SpectrumParser from 'audio/SpectrumParser';
import { FFT_SIZE, SAMPLE_RATE } from 'view/constants';
import { renderToCanvas } from 'utils/canvas';
import { property, stageWidth, stageHeight } from 'utils/controls';

export default class BarSpectrumDisplay extends CanvasDisplay {
  static info = {
    name: 'BarSpectrumDisplay',
    description: 'Displays an audio bar spectrum.',
    type: 'display',
    label: 'Bar Spectrum',
  };

  static defaultProperties = {
    width: 770,
    height: 240,
    x: 0,
    y: 0,
    barWidth: -1,
    barSpacing: -1,
    barWidthAutoSize: 1,
    barSpacingAutoSize: 1,
    shadowHeight: 100,
    color: ['#FFFFFF', '#FFFFFF'],
    shadowColor: ['#333333', '#000000'],
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
  };

  static controls = {
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
    width: {
      label: 'Width',
      type: 'number',
      min: 0,
      max: stageWidth(),
      withRange: true,
    },
    height: {
      label: 'Height',
      type: 'number',
      min: 0,
      max: stageHeight(),
      withRange: true,
    },
    shadowHeight: {
      label: 'Shadow Height',
      type: 'number',
      min: 0,
      max: stageWidth(),
      withRange: true,
    },
    barWidthAutoSize: {
      label: 'Bar Width',
      type: 'toggle',
      inputProps: {
        label: 'Auto-size',
      },
    },
    barWidth: {
      type: 'number',
      min: property('barWidthAutoSize', n => (n ? -1 : 1)),
      max: stageWidth(),
      hidden: property('barWidthAutoSize'),
      withRange: true,
    },
    barSpacingAutoSize: {
      label: 'Bar Spacing',
      type: 'toggle',
      inputProps: {
        label: 'Auto-size',
      },
    },
    barSpacing: {
      type: 'number',
      min: property('barSpacingAutoSize', n => (n ? -1 : 1)),
      max: stageWidth(),
      hidden: property('barSpacingAutoSize'),
      withRange: true,
    },
    barColor: {
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
      min: stageWidth(n => -n),
      max: stageWidth(),
      withRange: true,
    },
    y: {
      label: 'Y',
      type: 'number',
      min: stageWidth(n => -n),
      max: stageWidth(),
      withRange: true,
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
  };

  constructor(properties) {
    super(BarSpectrumDisplay.info, { ...BarSpectrumDisplay.defaultProperties, ...properties });

    this.bars = new CanvasBars(this.properties, this.canvas);
    this.parser = new SpectrumParser({
      ...this.properties,
      fftSize: FFT_SIZE,
      sampleRate: SAMPLE_RATE,
    });
  }

  update(properties) {
    const { barWidthAutoSize, barSpacingAutoSize } = properties;

    if (barWidthAutoSize !== undefined) {
      properties.barWidth = barWidthAutoSize ? -1 : 1;
    }
    if (barSpacingAutoSize !== undefined) {
      properties.barSpacing = barSpacingAutoSize ? -1 : 1;
    }

    const changed = super.update(properties);

    if (changed) {
      this.bars.update(properties);
      this.parser.update(properties);
    }

    return changed;
  }

  render(scene, data) {
    const fft = this.parser.parseFFT(data.fft);

    this.bars.render(fft);

    const origin = {
      x: this.canvas.width / 2,
      y: this.properties.height,
    };

    renderToCanvas(scene.getCanvasConext(), this.canvas, this.properties, origin);
  }
}
