import { WebGLRenderer, Texture, LinearFilter, Scene, Camera } from 'three';
import TexturePass from 'graphics/TexturePass';

class FrameBuffer {
  constructor() {
    this.canvas = document.createElement('canvas');

    this.texture = new Texture(this.canvas);
    this.texture.minFilter = LinearFilter;
    this.texture.needsUpdate = true;

    this.pass = new TexturePass(this.texture);
  }
}

export class CanvasBuffer extends FrameBuffer {
  constructor(width, height) {
    super();

    this.context = this.canvas.getContext('2d');

    this.setSize(width, height);
  }

  setSize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

export class GLBuffer extends FrameBuffer {
  constructor(width, height) {
    super();

    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: this.canvas,
    });

    this.renderer.autoClear = false;

    // Initialize renderer, required since r87
    this.renderer.render(new Scene(), new Camera());

    this.setSize(width, height);
  }

  setSize(width, height) {
    this.renderer.setSize(width, height);
  }

  clear() {
    this.renderer.clear();
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);
  }
}
