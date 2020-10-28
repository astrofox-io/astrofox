import Display from 'core/Display';
import { renderToCanvas } from 'utils/canvas';

export default class CanvasDisplay extends Display {
  constructor(Type, properties) {
    super(Type, properties);

    const { width, height } = this.properties;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext('2d');
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
