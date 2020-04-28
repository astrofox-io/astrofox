import CanvasDisplay from 'core/CanvasDisplay';
import CanvasWave from 'canvas/CanvasWave';
import WaveParser from 'audio/WaveParser';
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from 'view/constants';

export default class SoundwaveDisplay extends CanvasDisplay {
  static label = 'Soundwave';

  static className = 'SoundwaveDisplay';

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

  constructor(properties) {
    super(SoundwaveDisplay, properties);

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

  renderToScene(scene, data) {
    const {
      wave,
      parser,
      canvas: { width, height },
      properties: { smooth, wavelength },
    } = this;

    const points = parser.parseTimeData(data.td, wavelength > 0 ? width / wavelength : width);

    wave.render(points, wavelength > 3 ? smooth : false);

    this.renderToCanvas(scene.getCanvasConext(), width / 2, height / 2);
  }
}
