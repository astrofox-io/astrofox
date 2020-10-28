import CanvasDisplay from 'core/CanvasDisplay';
import CanvasImage from 'canvas/CanvasImage';
import { BLANK_IMAGE } from 'view/constants';

export default class ImageDisplay extends CanvasDisplay {
  static info = {
    name: 'ImageDisplay',
    description: 'Displays an image.',
    type: 'display',
    label: 'Image',
  };

  static defaultProperties = {
    src: BLANK_IMAGE,
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    fixed: true,
    rotation: 0,
    opacity: 1.0,
  };

  constructor(properties) {
    super(ImageDisplay.info, { ...ImageDisplay.defaultProperties, ...properties });

    this.image = new CanvasImage(this.properties, this.canvas);
  }

  update(properties) {
    const changed = super.update(properties);

    if (changed) {
      if (this.image.update(properties)) {
        let render = false;

        Object.keys(CanvasImage.defaultProperties).forEach(prop => {
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
