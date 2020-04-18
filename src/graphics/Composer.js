import { WebGLRenderTarget, LinearFilter, RGBAFormat, Texture } from 'three';
import MultiPass from 'graphics/MultiPass';
import RenderPass from 'graphics/RenderPass';
import ShaderPass from 'graphics/ShaderPass';
import SpritePass from 'graphics/SpritePass';
import TexturePass from 'graphics/TexturePass';
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

    this.setRenderTarget(renderTarget || this.getRenderTarget());
  }

  getRenderTarget() {
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

  setRenderTarget(renderTarget) {
    this.readTarget = renderTarget;
    this.writeTarget = renderTarget.clone();

    this.readBuffer = this.readTarget;
    this.writeBuffer = this.writeTarget;
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
    this.clearPasses();
    this.readTarget.dispose();
    this.writeTarget.dispose();
  }

  swapBuffers() {
    const tmp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = tmp;
  }

  addPass(pass) {
    this.passes.push(pass);

    return pass;
  }

  removePass(pass) {
    this.passes = this.passes.filter(p => p !== pass);
  }

  addRenderPass(scene, camera, properties) {
    return this.addPass(new RenderPass(scene, camera, properties));
  }

  addShaderPass(shader, properties) {
    return this.addPass(new ShaderPass(shader, properties));
  }

  addTexturePass(texture, properties) {
    return this.addPass(new TexturePass(texture, properties));
  }

  addSpritePass(image, properties) {
    const texture = new Texture(image);
    texture.minFilter = LinearFilter;

    return this.addPass(new SpritePass(texture, properties));
  }

  addCopyPass(properties) {
    return this.addShaderPass(CopyShader, properties);
  }

  addMultiPass(passes, properties) {
    return this.addPass(new MultiPass(passes, properties));
  }

  clearPasses() {
    this.passes = [];
  }

  blendBuffer(buffer, properties) {
    const { renderer, blendPass, readBuffer, writeBuffer } = this;

    const { opacity, blendMode, mask, inverse } = properties;

    blendPass.setUniforms({
      tBase: readBuffer.texture,
      tBlend: buffer.texture,
      opacity,
      mode: blendModes[blendMode],
      alpha: 1,
      mask,
      inverse,
    });

    blendPass.render(renderer, writeBuffer);

    this.swapBuffers();
  }

  renderToScreen() {
    const pass = this.copyPass;

    pass.update({ renderToScreen: true });

    pass.render(this.renderer, this.writeBuffer, this.readBuffer);

    pass.update({ renderToScreen: false });
  }

  render() {
    const { renderer } = this;

    this.writeBuffer = this.writeTarget;
    this.readBuffer = this.readTarget;

    this.passes.forEach(pass => {
      if (pass.properties.enabled) {
        pass.render(renderer, this.writeBuffer, this.readBuffer);

        if (pass.properties.needsSwap) {
          this.swapBuffers();
        }
      }
    });
  }
}
