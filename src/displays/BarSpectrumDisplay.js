import CanvasDisplay from 'core/CanvasDisplay';
import CanvasBars from 'canvas/CanvasBars';
import SpectrumParser from 'audio/SpectrumParser';
import { FFT_SIZE, SAMPLE_RATE } from 'view/constants';
import { renderToCanvas } from 'utils/canvas';

export default class BarSpectrumDisplay extends CanvasDisplay {
  static info = {
    name: 'astrofox-display-barspectrum',
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

  constructor(properties) {
    super(BarSpectrumDisplay, properties);

    this.bars = new CanvasBars(this.properties, this.canvas);
    this.parser = new SpectrumParser({
      ...this.properties,
      fftSize: FFT_SIZE,
      sampleRate: SAMPLE_RATE,
    });
  }

  update(properties) {
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
