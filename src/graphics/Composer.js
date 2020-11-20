import ShaderPass from 'graphics/ShaderPass';
import CopyShader from 'shaders/CopyShader';
import BlendShader from 'shaders/BlendShader';
import blendModes from 'graphics/blendModes';
import { createRenderTarget } from './common';

export default class Composer {
  constructor(renderer) {
    this.renderer = renderer;

    this.copyPass = new ShaderPass(CopyShader, { transparent: true });
    this.blendPass = new ShaderPass(BlendShader, { transparent: true });

    this.inputBuffer = createRenderTarget();
    this.outputBuffer = this.inputBuffer.clone();
  }

  getSize() {
    return {
      width: this.inputBuffer.width,
      height: this.inputBuffer.height,
    };
  }

  getImage(format = 'image/png') {
    const img = this.renderer.domElement.toDataURL(format);
    const data = img.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(data, 'base64');
  }

  setSize(width, height) {
    this.renderer.setSize(width, height, true);
    this.inputBuffer.setSize(width, height);
    this.outputBuffer.setSize(width, height);
  }

  clearScreen(color = true, depth = true, stencil = true) {
    this.renderer.clear(color, depth, stencil);
  }

  clearBuffer(color = true, depth = true, stencil = true) {
    this.renderer.setRenderTarget(this.inputBuffer);
    this.renderer.clear(color, depth, stencil);
    this.renderer.setRenderTarget(this.outputBuffer);
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
    this.inputBuffer.dispose();
    this.outputBuffer.dispose();
  }

  swapBuffers() {
    const tmp = this.inputBuffer;
    this.inputBuffer = this.outputBuffer;
    this.outputBuffer = tmp;
  }

  blendBuffer(buffer, properties) {
    const { renderer, blendPass, inputBuffer, outputBuffer } = this;

    const { opacity, blendMode, mask, inverse } = properties;

    blendPass.setUniforms({
      baseBuffer: inputBuffer.texture,
      blendBuffer: buffer.texture,
      mode: blendModes[blendMode],
      alpha: 1,
      opacity,
      mask,
      inverse,
    });

    blendPass.render(renderer, inputBuffer, outputBuffer);

    this.swapBuffers();
  }

  renderToScreen() {
    const { renderer, inputBuffer, outputBuffer, copyPass } = this;

    copyPass.renderToScreen = true;

    copyPass.render(renderer, inputBuffer, outputBuffer);

    copyPass.renderToScreen = false;
  }

  render(passes = []) {
    const { renderer } = this;

    passes.forEach(pass => {
      pass.render(renderer, this.inputBuffer, this.outputBuffer);

      if (pass.needsSwap) {
        this.swapBuffers();
      }
    });
  }
}
