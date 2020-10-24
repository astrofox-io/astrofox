import Display from 'core/Display';
import { DISPLAY_TYPE_CANVAS } from 'view/constants';
import { renderToCanvas } from 'utils/canvas';

export default class CanvasDisplay extends Display {
  constructor(type, properties) {
    super(type, properties);

    const { width, height } = this.properties;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext('2d');

    Object.defineProperty(this, 'type', { value: DISPLAY_TYPE_CANVAS });
  }

  render(scene) {
    const { width, height } = this.canvas;

    if (width === 0 || height === 0) {
      return;
    }

    const origin = {
      x: width / 2,
      y: height / 2,
    };

    renderToCanvas(scene.getCanvasConext(), this.canvas, this.properties, origin);
  }
}
