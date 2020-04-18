import CanvasDisplay from 'core/CanvasDisplay';
import CanvasImage from 'canvas/CanvasImage';
import WATERMARK from 'assets/images/watermark.png';

const WATERMARK_HEIGHT = 96;
const WATERMARK_WIDTH = 96;

export default class WatermarkDisplay extends CanvasDisplay {
  static label = 'Watermark';

  static className = 'WatermarkDisplay';

  static defaultProperties = {
    src: WATERMARK,
    x: 0,
    y: 0,
    width: WATERMARK_WIDTH,
    height: WATERMARK_HEIGHT,
    fixed: true,
    rotation: 0,
    opacity: 0.5,
    enabled: false,
  };

  constructor(properties) {
    super(WatermarkDisplay, properties);

    this.image = new CanvasImage(this.properties, this.canvas);
  }

  update(properties) {
    const changed = super.update(properties);

    if (changed) {
      if (this.image.update(properties)) {
        let render = false;

        Object.keys(CanvasImage.defaultproperties).forEach(prop => {
          if (properties[prop] !== undefined) {
            render = true;
          }
        });

        if (render) {
          this.image.render();
        }
      }
    }

    return changed;
  }

  setSize(width, height) {
    this.update({
      x: 0,
      y: -height / 2 + 10 + WATERMARK_HEIGHT * 0.5,
    });
  }
}
