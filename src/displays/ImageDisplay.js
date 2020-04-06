import CanvasDisplay from 'core/CanvasDisplay';
import CanvasImage from 'canvas/CanvasImage';
import blankImage from 'view/assets/images/blank.gif';

export default class ImageDisplay extends CanvasDisplay {
  static label = 'Image';

  static className = 'ImageDisplay';

  static defaultOptions = {
    src: blankImage,
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    fixed: true,
    rotation: 0,
    opacity: 1.0,
  };

  constructor(options) {
    super(ImageDisplay, options);

    this.image = new CanvasImage(this.options, this.canvas);
  }

  update(options) {
    const changed = super.update(options);

    if (changed) {
      if (this.image.update(options)) {
        let render = false;

        Object.keys(CanvasImage.defaultOptions).forEach(prop => {
          if (options[prop] !== undefined) {
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
