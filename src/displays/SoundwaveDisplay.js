import CanvasDisplay from 'core/CanvasDisplay';
import CanvasWave from 'canvas/CanvasWave';
import WaveParser from 'audio/WaveParser';
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from 'view/constants';
import { renderToCanvas } from 'utils/canvas';
import { stageWidth, stageHeight } from 'utils/controls';

export default class SoundwaveDisplay extends CanvasDisplay {
  static info = {
    name: 'SoundwaveDisplay',
    description: 'Displays an audio soundwave.',
    type: 'display',
    label: 'Soundwave',
  };

  static defaultProperties = {
    color: '#FFFFFF',
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT / 2,
    lineWidth: 1.0,
    wavelength: 0,
    smooth: false,
    x: 0,
    y: 0,
    rotation: 0,
    opacity: 1.0,
  };

  static controls = {
    color: {
      label: 'Color',
      type: 'color',
    },
    lineWidth: {
      label: 'Line Width',
      type: 'number',
      min: 0,
      max: 10,
      withRange: true,
    },
    width: {
      label: 'Width',
      type: 'number',
      min: 0,
      max: display => stageWidth(display) * 2,
      withRange: true,
    },
    height: {
      label: 'Height',
      type: 'number',
      min: 0,
      max: display => stageHeight(display) * 2,
      withRange: true,
    },
    x: {
      label: 'X',
      type: 'number',
      min: display => -1 * stageWidth(display),
      max: stageWidth,
      withRange: true,
    },
    y: {
      label: 'Y',
      type: 'number',
      min: display => -1 * stageHeight(display),
      max: stageHeight,
      withRange: true,
    },
    wavelength: {
      label: 'Wavelength',
      type: 'number',
      min: 0,
      max: 100,
      withRange: true,
    },
    smooth: {
      label: 'Smooth',
      type: 'toggle',
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
    super(SoundwaveDisplay.info, { ...SoundwaveDisplay.defaultProperties, ...properties });

    this.wave = new CanvasWave(this.properties, this.canvas);
    this.parser = new WaveParser();
  }

  update(properties) {
    const changed = super.update(properties);

    if (changed) {
      this.wave.update(properties);
    }

    return changed;
  }

  render(scene, data) {
    const {
      wave,
      parser,
      canvas: { width, height },
      properties: { smooth, wavelength },
    } = this;

    const points = parser.parseTimeData(data.td, wavelength > 0 ? width / wavelength : width);

    wave.render(points, wavelength > 3 ? smooth : false);

    const origin = {
      x: width / 2,
      y: height / 2,
    };

    renderToCanvas(scene.getCanvasConext(), this.canvas, this.properties, origin);
  }
}
