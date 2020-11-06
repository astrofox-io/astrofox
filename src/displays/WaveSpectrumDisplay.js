import CanvasDisplay from 'core/CanvasDisplay';
import CanvasWave from 'canvas/CanvasWave';
import SpectrumParser from 'audio/SpectrumParser';
import { FFT_SIZE, SAMPLE_RATE } from 'view/constants';
import { renderToCanvas } from 'utils/canvas';
import { property, stageHeight, stageWidth } from 'utils/controls';

export default class WaveSpectrumDisplay extends CanvasDisplay {
  static config = {
    name: 'WaveSpectrumDisplay',
    description: 'Displays an audio wave spectrum.',
    type: 'display',
    label: 'Wave Spectrum',
    defaultProperties: {
      width: 770,
      height: 240,
      x: 0,
      y: 0,
      stroke: true,
      strokeColor: '#FFFFFF',
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
        type: 'color',
      },
      taper: {
        label: 'Taper Edges',
        type: 'toggle',
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
        min: stageHeight(n => -n),
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
    },
  };

  constructor(properties) {
    super(WaveSpectrumDisplay, properties);

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
