import WebGLDisplay from 'core/WebGLDisplay';
import { BLANK_IMAGE } from 'view/constants';
import {
  Texture,
} from 'three';
import SpritePass from 'graphics/SpritePass';
import { deg2rad } from 'utils/math';

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

export default class SpriteDisplay extends WebGLDisplay {
  static config = {
    name: 'SpriteDisplay',
    description: 'Displays a sprite.',
    type: 'display',
    label: 'Sprite',
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
      zoom: {
        label: 'Zoom',
        type: 'number',
        min: 0.5,
        max: 4.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
        disabled,
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
    },
  };

  constructor(properties) {
    super(SpriteDisplay, properties);

    this.image = new Image(64, 64);
  }

  get hasImage() {
    return this.image.src !== BLANK_IMAGE;
  }

  update(properties) {
    const { src: newImage } = properties;

    const { src } = this.properties;

    if (typeof newImage === 'object') {
      if (newImage.src === BLANK_IMAGE) {
        // Image reset
        properties = { ...SpriteDisplay.config.defaultProperties };
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

    const changed = super.update(properties);

    if (changed) {
      const { opacity, zoom, width, height, x, y, rotation } = properties;

      if (newImage) {
        this.image = newImage;

        const texture = new Texture(this.image);
        texture.needsUpdate = true;

        this.pass = new SpritePass(texture, this.scene.getSize());

        this.pass.camera.updateProjectionMatrix();
      }
      if (zoom !== undefined) {
        const camera = this.pass.camera;

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
    this.size = { width, height};

    const texture = new Texture(this.image);

    this.pass = new SpritePass(texture, { width, height });

    this.setSize(width, height);
  }

  setSize(width, height) {
    this.pass.camera.aspect = width / height;
    this.pass.camera.updateProjectionMatrix();
  }
}
