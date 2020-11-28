import Entity from 'core/Entity';
import { drawPath } from 'drawing/bezierSpline';
import { resetCanvas } from 'utils/canvas';

export default class CanvasWave extends Entity {
  static defaultProperties = {
    color: '#FFFFFF',
    width: 400,
    height: 200,
    lineWidth: 1.0,
    fill: false,
    taper: false,
  };

  constructor(properties, canvas) {
    super('CanvasWave', { ...CanvasWave.defaultProperties, ...properties });

    this.canvas = canvas || document.createElement('canvas');
    this.canvas.width = this.properties.width;
    this.canvas.height = this.properties.height;

    this.context = this.canvas.getContext('2d');
  }

  render(points, smooth) {
    const { canvas, context } = this;
    const { width, height, color, lineWidth, fill, taper } = this.properties;
    const step = width / (points.length - 1);

    // Reset canvas
    resetCanvas(canvas, width, height);

    // Canvas setup
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    context.fillStyle = color;

    // Normalize points
    for (let i = 0; i < points.length; i++) {
      points[i] = height - points[i] * height;
    }

    // Taper edges
    if (taper) {
      points[0] = height / 2;
      points[points.length - 1] = height / 2;
    }

    // Draw wave
    if (smooth) {
      context.beginPath();

      // Remap
      points = Array.from(points).flatMap((p, i) => [i * step, p]);

      // Draw bezier spline
      drawPath(context, points);

      if (fill) {
        context.moveTo(width, height / 2);
        context.lineTo(0, height / 2);
        context.closePath();
        context.fill();
      } else {
        context.stroke();
      }
    } else {
      context.beginPath();

      if (fill) {
        context.moveTo(0, height / 2);
      }

      for (let i = 0; i < points.length; i++) {
        context.lineTo(i * step, points[i]);
      }

      if (fill) {
        context.lineTo(width, height / 2);
        context.closePath();
        context.fill();
      } else {
        context.stroke();
      }
    }
  }
}
