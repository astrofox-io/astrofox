import CanvasDisplay from 'core/CanvasDisplay';
import CanvasImage from 'canvas/CanvasImage';
import { BLANK_IMAGE } from 'view/constants';
import { isDefined } from 'utils/array';

const disabled = display => !display.hasImage;
const maxWidth = display => {
  const { naturalWidth } = display.canvasImage.image;
  const { width } = display.scene.getSize();

  return naturalWidth > width ? naturalWidth : width;
};
const maxHeight = display => {
  const { naturalHeight } = display.canvasImage.image;
  const { height } = display.scene.getSize();

  return naturalHeight > height ? naturalHeight : height;
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
      zoom: 1,
      height: 0,
      fixed: true,
      rotation: 0,
      opacity: 0,
    },
    controls: {
      image: {
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
      zoom: {
        label: 'Zoom',
        type: 'number',
        min: 1.0,
        max: 4.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
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

    this.canvasImage = new CanvasImage(this.properties, this.canvas);
  }

  get hasImage() {
    return this.canvasImage.image.src !== BLANK_IMAGE;
  }

  update(properties) {
    const { image, fixed, width, height, zoom } = properties;
    const { src, width: w, height: h, fixed: f } = this.properties;
    const { naturalWidth, naturalHeight } = this.canvasImage.image;
    const ratio = naturalWidth / naturalHeight;

    if (typeof image === 'object') {
      if (image.src === BLANK_IMAGE) {
        // Image reset
        properties = { ...ImageDisplay.config.defaultProperties };
      } else if (image.src !== src) {
        // New image
        properties = {
          src: image.src,
          width: image.naturalWidth,
          height: image.naturalHeight,
          opacity: 1.0,
        };
      }
    }

    // Sync width/height values
    if (!image && (fixed || f)) {
      if (!isDefined(width, height)) {
        if (w > h) {
          properties.height = Math.round(w * (1 / ratio)) || 0;
          properties.width = Math.round(properties.height * ratio);
        } else {
          properties.width = Math.round(h * ratio);
          properties.height = Math.round(properties.width * (1 / ratio)) || 0;
        }
      }

      if (width) {
        properties.height = Math.round(width * (1 / ratio)) || 0;
      }
      if (height) {
        properties.width = Math.round(height * ratio);
      }
    }

    const changed = super.update(properties);

    if (changed) {
      if (zoom) {
        properties.height = naturalHeight * zoom * (this.properties.height / naturalHeight);
        properties.width = naturalWidth * zoom * (this.properties.width / naturalWidth);
      }

      if (this.canvasImage.update(properties)) {
        this.canvasImage.render();
      }
    }

    return changed;
  }
}
