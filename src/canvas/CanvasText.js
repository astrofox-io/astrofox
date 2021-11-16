import Entity from 'core/Entity';
import { resetCanvas } from 'utils/canvas';

export default class CanvasText extends Entity {
  static defaultProperties = {
    text: '',
    size: 40,
    font: 'Roboto',
    italic: false,
    bold: false,
    color: '#FFFFFF',
  };

  constructor(properties, canvas) {
    super('CanvasText', { ...CanvasText.defaultProperties, ...properties });

    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
  }

  getFont() {
    const { italic, bold, size, font } = this.properties;

    return [italic ? 'italic' : 'normal', bold ? 'bold' : 'normal', `${size}px`, font].join(' ');
  }

  render() {
    const { canvas, context } = this;
    const { text, size, color } = this.properties;
    const font = this.getFont();

    context.font = font;

    const length = Math.ceil(context.measureText(text).width);
    const spacing = text.length ? Math.ceil(length / text.length) : 0;
    const width = length + spacing;
    const height = size * 2;

    // Reset canvas
    resetCanvas(canvas, width, height);

    // Draw text
    context.font = font;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, width / 2, height / 2);

    // Debugging
    /*
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 2;
    context.strokeStyle = 'red';
    context.stroke();
    */
  }
}
