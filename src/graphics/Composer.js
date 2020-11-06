import { WebGLRenderTarget, LinearFilter, RGBAFormat } from 'three';
import ShaderPass from 'graphics/ShaderPass';
import CopyShader from 'shaders/CopyShader';
import BlendShader from 'shaders/BlendShader';
import blendModes from 'config/blendModes.json';

export default class Composer {
  constructor(renderer, renderTarget) {
    this.renderer = renderer;
    this.passes = [];
    this.maskActive = false;

    this.copyPass = new ShaderPass(CopyShader, { transparent: true });
    this.blendPass = new ShaderPass(BlendShader, { transparent: true });

    const target = renderTarget || this.createRenderTarget();

    this.readTarget = target;
    this.writeTarget = target.clone();

    this.readBuffer = this.readTarget;
    this.writeBuffer = this.writeTarget;
  }

  createRenderTarget() {
    const { renderer } = this;
    const context = renderer.getContext();
    const pixelRatio = renderer.getPixelRatio();
    const width = Math.floor(context.canvas.width / pixelRatio) || 1;
    const height = Math.floor(context.canvas.height / pixelRatio) || 1;

    return new WebGLRenderTarget(width, height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
      stencilBuffer: false,
    });
  }

  getImage(format = 'image/png') {
    const img = this.renderer.domElement.toDataURL(format);
    const data = img.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(data, 'base64');
  }

  getSize() {
    return {
      width: this.readTarget.width,
      height: this.readTarget.height,
    };
  }

  setSize(width, height) {
    this.renderer.setSize(width, height, true);
    this.readTarget.setSize(width, height);
    this.writeTarget.setSize(width, height);
  }

  clearScreen(color = true, depth = true, stencil = true) {
    this.renderer.clear(color, depth, stencil);
  }

  clearBuffer(color = true, depth = true, stencil = true) {
    this.renderer.setRenderTarget(this.readTarget);
    this.renderer.clear(color, depth, stencil);
    this.renderer.setRenderTarget(this.writeTarget);
    this.renderer.clear(color, depth, stencil);
  }

  clear(color, alpha) {
    const { renderer } = this;
    const clearColor = renderer.getClearColor();
    const clearAlpha = renderer.getClearAlpha();

    if (color) {
      renderer.setClearColor(color, alpha);
    }

    this.clearScreen();
    this.clearBuffer();

    if (color) {
      renderer.setClearColor(clearColor, clearAlpha);
    }
  }

  dispose() {
    this.readTarget.dispose();
    this.writeTarget.dispose();
  }

  swapBuffers() {
    const tmp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = tmp;
  }

  blendBuffer(buffer, properties) {
    const { renderer, blendPass, readBuffer, writeBuffer } = this;

    const { opacity, blendMode, mask, inverse } = properties;

    blendPass.setUniforms({
      baseBuffer: readBuffer.texture,
      blendBuffer: buffer.texture,
      mode: blendModes[blendMode],
      alpha: 1,
      opacity,
      mask,
      inverse,
    });

    blendPass.render(renderer, writeBuffer);

    this.swapBuffers();
  }

  renderToScreen() {
    const pass = this.copyPass;

    pass.renderToScreen = true;

    pass.render(this.renderer, this.writeBuffer, this.readBuffer);

    pass.renderToScreen = false;
  }

  render(passes = []) {
    const { renderer } = this;

    this.writeBuffer = this.writeTarget;
    this.readBuffer = this.readTarget;

    passes.forEach(pass => {
      pass.render(renderer, this.writeBuffer, this.readBuffer);

      if (pass.needsSwap) {
        this.swapBuffers();
      }
    });
  }
}
