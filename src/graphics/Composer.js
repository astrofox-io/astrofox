import ShaderPass from 'graphics/ShaderPass';
import BlendShader from 'shaders/BlendShader';
import blendModes from 'graphics/blendModes';
import { createRenderTarget } from './common';
import RenderPass from './RenderPass';

export default class Composer {
  constructor(renderer) {
    this.renderer = renderer;

    this.blendPass = new ShaderPass(BlendShader);
    this.renderPass = new RenderPass(this.blendPass.scene, this.blendPass.camera);
    this.renderPass.renderToScreen = true;

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
    const { renderer, inputBuffer, outputBuffer, renderPass } = this;

    renderPass.render(renderer, inputBuffer, outputBuffer);
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
