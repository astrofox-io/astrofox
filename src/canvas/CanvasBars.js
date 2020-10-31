import Entity from 'core/Entity';
import { setColor } from 'utils/canvas';
import { clamp } from 'utils/math';

export default class CanvasBars extends Entity {
  static info = {
    name: 'CanvasBars',
    description: 'Canvas bars.',
    type: 'entity',
  };

  static defaultProperties = {
    width: 300,
    height: 100,
    minHeight: 0,
    barWidth: -1,
    barSpacing: -1,
    shadowHeight: 100,
    color: '#FFFFFF',
    shadowColor: '#CCCCCC',
  };

  constructor(properties, canvas) {
    super(CanvasBars, { ...CanvasBars.defaultProperties, ...properties });

    this.canvas = canvas || document.createElement('canvas');
    this.canvas.width = this.properties.width;
    this.canvas.height = this.properties.height + this.properties.shadowHeight;

    this.context = this.canvas.getContext('2d');
  }

  render(data) {
    const bars = data.length;
    const { canvas, context } = this;
    const { height, width, color, shadowHeight, shadowColor, minHeight } = this.properties;
    let { barWidth, barSpacing } = this.properties;

    // Reset canvas
    if (canvas.width !== width || canvas.height !== height + shadowHeight) {
      canvas.width = width;
      canvas.height = height + shadowHeight;
    } else {
      context.clearRect(0, 0, width, height + shadowHeight);
    }

    // Calculate bar widths
    if (barWidth < 0 && barSpacing < 0) {
      barSpacing = width / bars / 2;
      barWidth = barSpacing;
    } else if (barSpacing >= 0 && barWidth < 0) {
      barWidth = (width - bars * barSpacing) / bars;
      if (barWidth <= 0) barWidth = 1;
    } else if (barWidth > 0 && barSpacing < 0) {
      barSpacing = (width - bars * barWidth) / bars;
      if (barSpacing <= 0) barSpacing = 1;
    }

    // Calculate bars to display
    const barSize = barWidth + barSpacing;
    const fullWidth = barSize * bars;

    // Stepping
    const step = fullWidth > width ? fullWidth / width : 1;

    // Canvas setup
    setColor(context, color, 0, 0, 0, height);

    // Draw bars
    for (let i = 0, x = 0, last = null; i < bars && x < fullWidth; i += step, x += barSize) {
      const index = ~~i;

      if (index !== last) {
        const val = clamp(data[index] * height, minHeight, height);
        last = index;

        context.fillRect(x, height, barWidth, -val);
      }
    }

    // Draw shadow bars
    if (shadowHeight > 0) {
      setColor(context, shadowColor, 0, height, 0, height + shadowHeight);

      for (let i = 0, x = 0, last = null; i < bars && x < fullWidth; i += step, x += barSize) {
        const index = ~~i;

        if (index !== last) {
          const val = data[index] * shadowHeight;
          last = index;

          context.fillRect(x, height, barWidth, val);
        }
      }
    }
  }
}
