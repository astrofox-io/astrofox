import CanvasDisplay from 'core/CanvasDisplay';
import CanvasImage from 'canvas/CanvasImage';
import blankImage from 'view/assets/images/blank.gif';

export default class ImageDisplay extends CanvasDisplay {
  static label = 'Image';

  static className = 'ImageDisplay';

  static defaultProperties = {
    src: blankImage,
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    fixed: true,
    rotation: 0,
    opacity: 1.0,
  };

  constructor(properties) {
    super(ImageDisplay, properties);

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
}
