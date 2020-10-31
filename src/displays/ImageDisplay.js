import CanvasDisplay from 'core/CanvasDisplay';
import CanvasImage from 'canvas/CanvasImage';
import { BLANK_IMAGE } from 'view/constants';
import { isDefined } from 'utils/array';

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
    width: 0,
    height: 0,
    fixed: true,
    rotation: 0,
    opacity: 0,
  };

  static controls = {
    src: {
      label: 'image',
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
  };

  constructor(properties) {
    super(ImageDisplay.info, { ...ImageDisplay.defaultProperties, ...properties });

    this.image = new CanvasImage(this.properties, this.canvas);
  }

  get hasImage() {
    return this.image.image.src !== BLANK_IMAGE;
  }

  update(properties) {
    const { src: image, width, height } = properties;
    const { fixed } = this.properties;

    if (image) {
      if (image?.src === BLANK_IMAGE) {
        properties = { ...ImageDisplay.defaultProperties };
      } else {
        properties = {
          src: image.src,
          width: image.naturalWidth,
          height: image.naturalHeight,
          opacity: 1.0,
        };
      }
    }

    if (fixed && isDefined(width, height)) {
      const { naturalWidth, naturalHeight } = this.image.image;
      const ratio = naturalWidth / naturalHeight;

      if (width) {
        properties.height = Math.round(width * (1 / ratio)) || 0;
      }
      if (height) {
        properties.width = Math.round(height * ratio);
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
