import { LinearFilter, RGBAFormat, WebGLMultisampleRenderTarget, Scene, Camera } from 'three';
import CopyPass from './CopyPass';

export default class WebglBuffer {
  constructor(renderer) {
    this.renderer = renderer;

    this.buffer = this.createRenderTarget();

    this.pass = new CopyPass(this.buffer, { copyToBuffer: false });

    this.scene = new Scene();
    this.camera = new Camera();
  }

  createRenderTarget() {
    const { renderer } = this;
    const context = renderer.getContext();
    const pixelRatio = renderer.getPixelRatio();
    const width = Math.floor(context.canvas.width / pixelRatio) || 1;
    const height = Math.floor(context.canvas.height / pixelRatio) || 1;

    return new WebGLMultisampleRenderTarget(width, height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
      stencilBuffer: false,
    });
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
