import CanvasDisplay from 'core/CanvasDisplay';
import CanvasImage from 'canvas/CanvasImage';
import WebGLDisplay from 'core/WebGLDisplay';
import { BLANK_IMAGE } from 'view/constants';
import { Object3D, OrthographicCamera, PerspectiveCamera, Scene, Texture } from 'three';
import TexturePass from '../graphics/TexturePass';

const disabled = display => !display.hasImage;
const maxWidth = display => {
  const { naturalWidth } = display.image;
  const { width } = display.scene.getSize();

  return naturalWidth > width ? naturalWidth * 2 : width;
};
const maxHeight = display => {
  const { naturalHeight } = display.image;
  const { height } = display.scene.getSize();

  return naturalHeight > height ? naturalHeight * 2 : height;
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
      width: 0,
      size: 100,
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
        max: 400,
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
    super(SpriteDisplay, properties);

    this.image = new Image();
  }

  get hasImage() {
    return this.image.src !== BLANK_IMAGE;
  }

  update(properties) {
    const { src: newImage, width, height } = properties;

    const {
      texture,
      properties: { src },
    } = this;

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
      if (newImage && texture) {
        this.image = newImage;
        this.texture = new Texture(this.image);
        this.pass.material.map = this.texture;
        this.texture.needsUpdate = true;
      }
    }

    return changed;
  }

  addToScene({ getSize }) {
    const { width, height } = getSize();

    this.texture = new Texture(this.image);
    this.pass = new TexturePass(this.texture);

    this.setSize(width, height);
  }

  setSize(width, height) {
    this.pass.camera.aspect = width / height;
    this.pass.camera.updateProjectionMatrix();
  }
}
