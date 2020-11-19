import { WebGLRenderTarget } from 'three';
import ShaderPass from 'graphics/ShaderPass';
import CopyShader from 'shaders/CopyShader';
import BlendShader from 'shaders/BlendShader';
import blendModes from 'config/blendModes.json';

export default class Composer {
  constructor(renderer) {
    this.renderer = renderer;

    this.copyPass = new ShaderPass(CopyShader, { transparent: true });
    this.blendPass = new ShaderPass(BlendShader, { transparent: true });

    const target = this.createRenderTarget();

    this.bufferA = target;
    this.bufferB = target.clone();

    this.readBuffer = this.bufferA;
    this.writeBuffer = this.bufferB;
  }

  createRenderTarget() {
    const { renderer } = this;
    const context = renderer.getContext();
    const pixelRatio = renderer.getPixelRatio();
    const width = Math.floor(context.canvas.width / pixelRatio) || 1;
    const height = Math.floor(context.canvas.height / pixelRatio) || 1;

    return new WebGLRenderTarget(width, height);
  }

  getImage(format = 'image/png') {
    const img = this.renderer.domElement.toDataURL(format);
    const data = img.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(data, 'base64');
  }

  getSize() {
    return {
      width: this.bufferA.width,
      height: this.bufferA.height,
    };
  }

  setSize(width, height) {
    this.renderer.setSize(width, height, true);
    this.bufferA.setSize(width, height);
    this.bufferB.setSize(width, height);
  }

  clearScreen(color = true, depth = true, stencil = true) {
    this.renderer.clear(color, depth, stencil);
  }

  clearBuffer(color = true, depth = true, stencil = true) {
    this.renderer.setRenderTarget(this.bufferA);
    this.renderer.clear(color, depth, stencil);
    this.renderer.setRenderTarget(this.bufferB);
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
    this.bufferA.dispose();
    this.bufferB.dispose();
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

    this.readBuffer = this.bufferA;
    this.writeBuffer = this.bufferB;

    passes.forEach(pass => {
      pass.render(renderer, this.writeBuffer, this.readBuffer);

      if (pass.needsSwap) {
        this.swapBuffers();
      }
    });
  }
}
