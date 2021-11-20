import { Texture, TextureLoader } from 'three';
import WebGLDisplay from 'core/WebGLDisplay';
import { BLANK_IMAGE } from 'view/constants';
import ImagePass from 'graphics/ImagePass';
import { deg2rad } from 'utils/math';
import { isDefined } from 'utils/array';

const disabled = display => !display.hasImage;
const maxWidth = display => {
  const { naturalWidth } = display.image;
  const { width } = display.scene.getSize();

  return naturalWidth > width ? naturalWidth : width;
};
const maxHeight = display => {
  const { naturalHeight } = display.image;
  const { height } = display.scene.getSize();

  return naturalHeight > height ? naturalHeight : height;
};
const maxX = display => (disabled(display) ? 0 : maxWidth(display));
const maxY = display => (disabled(display) ? 0 : maxHeight(display));

export default class ImageDisplay extends WebGLDisplay {
  static config = {
    name: 'ImageDisplay',
    description: 'Displays an image.',
    type: 'display',
    label: 'Image',
    defaultProperties: {
      src: BLANK_IMAGE,
      x: 0,
      y: 0,
      zoom: 1,
      width: 0,
      height: 0,
      fixed: true,
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

    this.image = new Image();
    this.image.src = this.properties.src;
  }

  get hasImage() {
    return this.properties.src !== BLANK_IMAGE;
  }

  update(properties) {
    const { src: image, fixed, width, height } = properties;
    const { src, width: w, height: h, fixed: f } = this.properties;

    // If we get an HTMLImageElement
    if (typeof image === 'object') {
      this.image = image;

      if (image.src === BLANK_IMAGE) {
        // Image reset
        properties = { ...ImageDisplay.config.defaultProperties };
      } else if (image.src !== src) {
        // New image
        properties = {
          src: image.src,
          width: image.naturalWidth,
          height: image.naturalHeight,
          opacity: 1,
        };
      } else {
        properties.src = image.src;
      }
    }

    // Sync width/height values
    if (!image && (fixed || f)) {
      const { naturalWidth, naturalHeight } = this.image;
      const ratio = naturalWidth / naturalHeight;

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
      const { opacity, zoom, width, height, x, y, rotation } = properties;

      if (image) {
        const texture = new Texture(image);
        texture.needsUpdate = true;

        const { width, height } = this.scene.getSize();

        this.pass = new ImagePass(texture, { width, height });

        this.pass.camera.aspect = width / height;
        this.pass.camera.updateProjectionMatrix();
      }
      if (zoom !== undefined) {
        const { camera } = this.pass;

        camera.zoom = zoom;
        camera.updateProjectionMatrix();
      }
      if (width) {
        this.pass.mesh.scale.x = width / this.image.naturalWidth;
      }
      if (height) {
        this.pass.mesh.scale.y = height / this.image.naturalHeight;
      }
      if (opacity) {
        this.pass.material.opacity = opacity;
      }
      if (x !== undefined) {
        this.pass.mesh.position.x = x;
      }
      if (y !== undefined) {
        this.pass.mesh.position.y = y;
      }
      if (rotation !== undefined) {
        this.pass.mesh.rotation.z = deg2rad(-rotation);
      }
    }

    return changed;
  }

  addToScene({ getSize }) {
    const { width, height } = getSize();

    new TextureLoader().load(this.properties.src, texture => {
      this.pass = new ImagePass(texture, { width, height });

      this.setSize(width, height);
    });
  }

  setSize(width, height) {
    if (this.pass) {
      this.pass.camera.aspect = width / height;
      this.pass.camera.updateProjectionMatrix();
    }
  }
}
