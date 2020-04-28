import { Camera, Scene, WebGLRenderer } from 'three';
import FrameBuffer from './FrameBuffer';

export default class WebglBuffer extends FrameBuffer {
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
