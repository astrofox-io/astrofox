import CanvasDisplay from 'core/CanvasDisplay';
import CanvasImage from 'canvas/CanvasImage';
import { BLANK_IMAGE } from 'view/constants';
import { isDefined } from 'utils/array';
import { maxSize } from 'utils/controls';

const disabled = display => !display.hasImage;
const maxWidth = display => {
  const { naturalWidth } = display.image.image;
  const { width } = display.scene.getSize();

  return naturalWidth > width ? naturalWidth * 2 : width;
};
const maxHeight = display => {
  const { naturalHeight } = display.image.image;
  const { height } = display.scene.getSize();

  return naturalHeight > height ? naturalHeight * 2 : height;
};
const maxX = display => (disabled(display) ? 0 : maxWidth(display));
const maxY = display => (disabled(display) ? 0 : maxHeight(display));

export default class ImageDisplay extends CanvasDisplay {
  static config = {
    name: 'ImageDisplay',
    description: 'Displays an image.',
    type: 'display',
    label: 'Image',
    defaultProperties: {
      src: BLANK_IMAGE,
      x: 0,
      y: 0,
      width: 0,
      size : 100,
      height: 0,
      fixed: true,
      bounce: false,
      rotation: 0,
      opacity: 0,
    },
    controls: {
      src: {
        label: 'Image',
        type: 'image',
      },
      width: {
        label: 'Width',
        type: 'number',
        min: 0,
        max: maxWidth,
        withRange: true,
        withLink: 'fixed',
        disabled,
      },
      height: {
        label: 'Height',
        type: 'number',
        min: 0,
        max: maxHeight,
        withRange: true,
        withLink: 'fixed',
        disabled,
      },
      size: {
        label: 'Size',
        type: 'number',
        min: 1,
        max: 100,
        withRange: true,
        disabled,
      },
      bounce: {
        label: 'Bounce',
        type: 'checkbox',
        withReactor: true,
        disabled,
      },
      x: {
        label: 'X',
        type: 'number',
        min: display => -1 * maxX(display),
        max: display => maxX(display),
        withRange: true,
        disabled,
      },
      y: {
        label: 'Y',
        type: 'number',
        min: display => -1 * maxY(display),
        max: display => maxY(display),
        withRange: true,
        disabled,
      },
      rotation: {
        label: 'Rotation',
        type: 'number',
        min: 0,
        max: 360,
        withRange: true,
        withReactor: true,
        disabled,
      },
      opacity: {
        label: 'Opacity',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
        disabled,
      },
    },
  };

  constructor(properties) {
    super(ImageDisplay, properties);

    this.image = new CanvasImage(this.properties, this.canvas);
  }

  get hasImage() {
    return this.image.image.src !== BLANK_IMAGE;
  }

  update(properties) {
    const { src: newImage, width, height ,size } = properties;
    const { src, fixed ,bounce } = this.properties;

    if (typeof newImage === 'object') {
      if (newImage.src === BLANK_IMAGE) {
        // Image reset
        properties = { ...ImageDisplay.config.defaultProperties };
      } else if (newImage.src !== src) {
        // New image
        properties = {
          src: newImage.src,
          width: newImage.naturalWidth,
          height: newImage.naturalHeight,
          opacity: 1.0,
        };
      } else {
        properties.src = newImage.src;
      }
    }

    if (fixed && isDefined(width, height,size,bounce)) {
      const { naturalWidth, naturalHeight } = this.image.image;
      const ratio = naturalWidth / naturalHeight;

      if (width) {
        properties.height = Math.round(width * (1 / ratio)) || 0;
      }
      if (height) {
        properties.width = Math.round(height * ratio);
      }
      if (size) {
        properties.size = size
        properties.height = Math.round(naturalHeight/100)*size
        properties.width = Math.round(naturalWidth/100)*size
      }
      if (bounce) {
        var calculatedChange = this.properties.size + Math.round((bounce*100))
        properties.height = Math.round(naturalHeight/100)*calculatedChange
        properties.width = Math.round(naturalWidth/100)*calculatedChange
      }
    }

    const changed = super.update(properties);

    if (changed) {
      if (this.image.update(properties)) {
        this.image.render();
      }
    }

    return changed;
  }
}
