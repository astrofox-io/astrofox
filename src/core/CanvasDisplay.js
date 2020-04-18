import Display from 'core/Display';
import { deg2rad } from 'utils/math';

export default class CanvasDisplay extends Display {
  constructor(type, properties) {
    super(type, properties);

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.properties.width;
    this.canvas.height = this.properties.height;
    this.context = this.canvas.getContext('2d');
  }

  renderToScene(scene) {
    const { width, height } = this.canvas;

    this.renderToCanvas(scene.getContext('2d'), width / 2, height / 2);
  }

  renderToCanvas(context, dx, dy) {
    const { canvas } = this;
    const { width, height } = context.canvas;

    if (canvas.width === 0 || canvas.height === 0) {
      return;
    }

    const { x, y, opacity, rotation } = this.properties;

    const halfSceneWidth = width / 2;
    const halfSceneHeight = height / 2;

    context.globalAlpha = opacity;

    if (rotation % 360 !== 0) {
      const cx = halfSceneWidth + x;
      const cy = halfSceneHeight - y;

      context.save();
      context.translate(cx, cy);
      context.rotate(deg2rad(rotation));
      context.drawImage(canvas, -dx, -dy);
      context.restore();
    } else {
      context.drawImage(canvas, halfSceneWidth + x - dx, halfSceneHeight - y - dy);
    }

    context.globalAlpha = 1.0;
  }
}
