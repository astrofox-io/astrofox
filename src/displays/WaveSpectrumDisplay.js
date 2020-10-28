import CanvasDisplay from 'core/CanvasDisplay';
import CanvasWave from 'canvas/CanvasWave';
import SpectrumParser from 'audio/SpectrumParser';
import { FFT_SIZE, SAMPLE_RATE } from 'view/constants';
import { renderToCanvas } from 'utils/canvas';

export default class WaveSpectrumDisplay extends CanvasDisplay {
  static info = {
    name: 'WaveSpectrumDisplay',
    description: 'Displays an audio wave spectrum.',
    type: 'display',
    label: 'Wave Spectrum',
  };

  static defaultProperties = {
    width: 770,
    height: 240,
    x: 0,
    y: 0,
    stroke: true,
    color: '#FFFFFF',
    fill: true,
    fillColor: ['#C0C0C0', '#000000'],
    taper: true,
    rotation: 0,
    opacity: 1.0,
    fftSize: FFT_SIZE,
    sampleRate: SAMPLE_RATE,
    smoothingTimeConstant: 0.5,
    minDecibels: -100,
    maxDecibels: -20,
    minFrequency: 0,
    maxFrequency: 2000,
    normalize: true,
  };

  constructor(properties) {
    super(WaveSpectrumDisplay.info, { ...WaveSpectrumDisplay.defaultProperties, ...properties });

    this.wave = new CanvasWave(this.properties, this.canvas);
    this.parser = new SpectrumParser(this.properties);
  }

  update(properties) {
    const changed = super.update(properties);

    if (changed) {
      this.wave.update(properties);
      this.parser.update(properties);
    }

    return changed;
  }

  getPoints(fft) {
    const { width } = this.properties;
    const points = [];

    for (let i = 0, j = 0, k = 0; i < fft.length; i += 1) {
      j = fft[i];

      if (i === 0 || i === fft.length - 1 || k !== j > fft[i - 1] ? 1 : -1) {
        points.push(i * (width / fft.length));
        points.push(j);
      }

      k = j > fft[i - 1] ? 1 : -1;
    }

    points[points.length - 2] = width;

    return points;
  }

  render(scene, data) {
    const {
      wave,
      parser,
      canvas: { width, height },
    } = this;
    const fft = parser.parseFFT(data.fft);

    wave.render(this.getPoints(fft), true);

    const origin = {
      x: width / 2,
      y: height,
    };

    renderToCanvas(scene.getCanvasConext(), this.canvas, this.properties, origin);
  }
}
