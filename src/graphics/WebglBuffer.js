import { Scene, Camera } from 'three';
import CopyPass from './CopyPass';
import { createRenderTarget } from './common';

export default class WebglBuffer {
  constructor(renderer) {
    this.renderer = renderer;

    this.buffer = createRenderTarget({ multisample: true });

    this.pass = new CopyPass(this.buffer);
    this.pass.copyFromBuffer = true;

    this.scene = new Scene();
    this.camera = new Camera();
  }

  setSize(width, height) {
    this.buffer.setSize(width, height);
  }

  dispose() {
    this.buffer.dispose();
  }

  clear() {
    const { renderer, buffer, scene, camera } = this;

    renderer.setRenderTarget(buffer);
    renderer.clear();

    // HACK: Renderer clear does not work with multi-sample render target
    renderer.render(scene, camera);
  }

  render(scene, camera) {
    const { renderer, buffer } = this;

    renderer.setRenderTarget(buffer);
    renderer.render(scene, camera);
  }
}
