// @ts-nocheck
import { Color, LinearFilter, RGBAFormat, UnsignedByteType, WebGLRenderTarget } from 'three';
import BlendShader from './BlendShader';
import blendModes from './blendModes';
import CopyShader from './CopyShader';
import { createRenderTarget } from './common';
import ShaderPass from './ShaderPass';

export default class StageComposer {
  constructor(renderer, width, height) {
    this.renderer = renderer;
    this.width = Math.max(1, Math.round(width || 1));
    this.height = Math.max(1, Math.round(height || 1));
    this.blendPass = new ShaderPass(BlendShader);
    this.blendPass.material.transparent = true;
    this.copyPass = new ShaderPass(CopyShader);
    this.copyPass.material.transparent = true;
    // Never tone map the final on-screen copy; the readback path renders into
    // a render target where three.js skips tone mapping, so both must agree.
    this.copyPass.material.toneMapped = false;
    this.copyPass.renderToScreen = true;
    // Readback copy pass encodes to sRGB so exported pixels match the screen.
    this.readbackPass = new ShaderPass({ ...CopyShader, defines: { ENCODE_SRGB: 1 } });
    this.readbackPass.material.transparent = false;
    this.readbackPass.material.toneMapped = false;
    this.readbackPass.renderToScreen = false;
    this.inputBuffer = null;
    this.outputBuffer = null;
    this.readbackBuffer = null;
    this.dataBuffer = new Uint8Array(this.width * this.height * 4);
    this.warmedUpRenderer = null;

    this.setRenderer(renderer);
  }

  setRenderer(renderer) {
    this.renderer = renderer;
    if (!renderer) {
      this.warmedUpRenderer = null;
      return;
    }

    this.renderer.autoClear = false;

    if (!this.inputBuffer || !this.outputBuffer) {
      this.inputBuffer = createRenderTarget(this.width, this.height);
      this.outputBuffer = createRenderTarget(this.width, this.height);
    }

    if (this.warmedUpRenderer !== renderer) {
      this.warmUpPasses();
      this.warmedUpRenderer = renderer;
    }
  }

  setSize(width, height) {
    this.width = Math.max(1, Math.round(width || 1));
    this.height = Math.max(1, Math.round(height || 1));

    if (!this.inputBuffer || !this.outputBuffer) {
      return;
    }

    this.inputBuffer.setSize(this.width, this.height);
    this.outputBuffer.setSize(this.width, this.height);
    this.readbackBuffer?.setSize(this.width, this.height);
    this.dataBuffer = new Uint8Array(this.width * this.height * 4);
  }

  dispose() {
    this.inputBuffer?.dispose();
    this.outputBuffer?.dispose();
    this.readbackBuffer?.dispose();
    this.readbackBuffer = null;
    this.blendPass?.material?.dispose?.();
    this.copyPass?.material?.dispose?.();
    this.readbackPass?.material?.dispose?.();
  }

  swapBuffers() {
    const tmp = this.inputBuffer;
    this.inputBuffer = this.outputBuffer;
    this.outputBuffer = tmp;
  }

  clear(color, alpha = 1) {
    if (!this.renderer || !this.inputBuffer || !this.outputBuffer) {
      return;
    }

    const clearColor = new Color();
    this.renderer.getClearColor(clearColor);
    const clearAlpha = this.renderer.getClearAlpha();

    if (color !== undefined && color !== null) {
      this.renderer.setClearColor(color, alpha);
    }

    this.renderer.setRenderTarget(this.inputBuffer);
    this.renderer.clear(true, true, true);
    this.renderer.setRenderTarget(this.outputBuffer);
    this.renderer.clear(true, true, true);
    this.renderer.setRenderTarget(null);

    if (color !== undefined && color !== null) {
      this.renderer.setClearColor(clearColor, clearAlpha);
    }
  }

  blendTexture(texture, properties = {}) {
    if (!texture || !this.renderer || !this.inputBuffer || !this.outputBuffer) {
      return;
    }

    this.blendPass.setUniforms({
      baseBuffer: this.inputBuffer.texture,
      blendBuffer: texture,
      mode: blendModes[properties.blendMode] ?? blendModes.Normal,
      alpha: 1,
      opacity: Number(properties.opacity ?? 1),
      mask: properties.mask ? 1 : 0,
      inverse: properties.inverse ? 1 : 0,
    });

    this.blendPass.render(this.renderer, this.inputBuffer, this.outputBuffer);
    this.swapBuffers();
  }

  renderToScreen() {
    if (!this.renderer || !this.inputBuffer || !this.outputBuffer) {
      return;
    }

    this.copyPass.setUniforms({
      inputTexture: this.inputBuffer.texture,
      opacity: 1,
      alpha: 0,
    });
    this.copyPass.render(this.renderer, this.inputBuffer, this.outputBuffer);
  }

  warmUpPasses() {
    if (!this.renderer || !this.inputBuffer || !this.outputBuffer) {
      return;
    }

    this.blendPass.setUniforms({
      baseBuffer: this.inputBuffer.texture,
      blendBuffer: this.outputBuffer.texture,
      mode: blendModes.Normal,
      alpha: 1,
      opacity: 1,
      mask: 0,
      inverse: 0,
    });
    this.copyPass.setUniforms({
      inputTexture: this.inputBuffer.texture,
      opacity: 1,
      alpha: 0,
    });

    this.renderer.compile(this.blendPass.scene, this.blendPass.camera);
    this.renderer.compile(this.copyPass.scene, this.copyPass.camera);
  }

  composeSceneLayers(sceneLayers, backgroundColor) {
    this.clear(backgroundColor, 1);

    for (const layer of sceneLayers) {
      this.blendTexture(layer.texture, layer.properties);
    }

    this.renderToScreen();
  }

  getPixels() {
    if (!this.renderer || !this.inputBuffer) {
      return new Uint8Array(this.width * this.height * 4);
    }

    // The composer buffers are HalfFloatType, which cannot be read into a
    // Uint8Array. Copy the composite into an 8-bit target first.
    if (!this.readbackBuffer) {
      this.readbackBuffer = new WebGLRenderTarget(this.width, this.height, {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat,
        type: UnsignedByteType,
        depthBuffer: false,
        stencilBuffer: false,
      });
    }

    const clearColor = new Color();
    this.renderer.getClearColor(clearColor);
    const clearAlpha = this.renderer.getClearAlpha();
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setRenderTarget(this.readbackBuffer);
    this.renderer.clear(true, false, false);
    this.renderer.setClearColor(clearColor, clearAlpha);

    this.readbackPass.setUniforms({
      inputTexture: this.inputBuffer.texture,
      opacity: 1,
      alpha: 0,
    });
    this.readbackPass.render(this.renderer, this.inputBuffer, this.readbackBuffer);
    this.renderer.setRenderTarget(null);

    this.renderer.readRenderTargetPixels(
      this.readbackBuffer,
      0,
      0,
      this.width,
      this.height,
      this.dataBuffer,
    );

    return this.dataBuffer;
  }
}
