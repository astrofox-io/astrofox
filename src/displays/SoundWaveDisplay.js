import CanvasDisplay from 'core/CanvasDisplay';
import CanvasWave from 'canvas/CanvasWave';
import WaveParser from 'audio/WaveParser';
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from 'view/constants';
import { renderToCanvas } from 'utils/canvas';
import { stageWidth, stageHeight } from 'utils/controls';

const WAVELENGTH_MAX = 0.25;

export default class SoundWaveDisplay extends CanvasDisplay {
  static config = {
    name: 'SoundWaveDisplay',
    description: 'Displays a sound wave.',
    type: 'display',
    label: 'Sound Wave',
    defaultProperties: {
      color: '#FFFFFF',
      width: DEFAULT_CANVAS_WIDTH,
      height: DEFAULT_CANVAS_HEIGHT / 2,
      lineWidth: 1.0,
      wavelength: 0,
      smoothingTimeConstant: 0,
      fill: false,
      taper: false,
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 1.0,
    },
    controls: {
      color: {
        label: 'Color',
        type: 'color',
      },
      lineWidth: {
        label: 'Line Width',
        type: 'number',
        min: 1,
        max: 10,
        withRange: true,
      },
      wavelength: {
        label: 'Wavelength',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
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
      fill: {
        label: 'Fill',
        type: 'toggle',
      },
      taper: {
        label: 'Taper Edges',
        type: 'toggle',
      },
      width: {
        label: 'Width',
        type: 'number',
        min: 1,
        max: stageWidth(n => n * 2),
        withRange: true,
      },
      height: {
        label: 'Height',
        type: 'number',
        min: 1,
        max: stageHeight(n => n * 2),
        withRange: true,
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
        max: stageHeight(),
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
    super(SoundWaveDisplay, properties);

    this.wave = new CanvasWave(this.properties, this.canvas);
    this.parser = new WaveParser();
  }

  update(properties) {
    const changed = super.update(properties);

    if (changed) {
      this.wave.update(properties);
      this.parser.update(properties);
    }

    return changed;
  }

  render(scene, data) {
    const {
      wave,
      parser,
      canvas: { width, height },
      properties: { wavelength },
    } = this;

    const points = parser.parseTimeData(
      data.td,
      wavelength > 0 ? ~~(width / (wavelength * WAVELENGTH_MAX * width)) : width,
    );

    wave.render(points, wavelength > 0.02);

    const origin = {
      x: width / 2,
      y: height / 2,
    };

    renderToCanvas(scene.getCanvasConext(), this.canvas, this.properties, origin);
  }
}
