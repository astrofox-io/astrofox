import { NoBlending } from 'three';
import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import CopyPass from 'graphics/CopyPass';
import BlendPass from 'graphics/BlendPass';
import GaussianBlurPass from 'effects/passes/GaussianBlurPass';
import MultiPass from 'graphics/MultiPass';
import LuminanceShader from 'shaders/LuminanceShader';

const blendOptions = ['Add', 'Screen'];

export default class BloomEffect extends Effect {
  static config = {
    name: 'BloomEffect',
    description: 'Bloom effect.',
    type: 'effect',
    label: 'Bloom',
    defaultProperties: {
      blendMode: 'Screen',
      amount: 0.1,
      threshold: 1.0,
    },
    controls: {
      blendMode: {
        label: 'Blend Mode',
        type: 'select',
        items: blendOptions,
      },
      amount: {
        label: 'Amount',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
      threshold: {
        label: 'Threshold',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
    },
  };

  constructor(properties) {
    super(BloomEffect, properties);
  }

  updatePass() {
    const { amount, threshold, blendMode } = this.properties;

    this.lumPass.setUniforms({ amount: 1 - threshold });

    this.blurPass.setUniforms({ amount });

    this.blendPass.update({ blendMode });
  }

  addToScene(scene) {
    const { blendMode } = this.properties;
    const { composer } = scene;
    const passes = [];

    // Copy current frame
    this.copyPass = new CopyPass(composer.createRenderTarget(), { blending: NoBlending });
    passes.push(this.copyPass);

    // Apply luminance threshold
    this.lumPass = new ShaderPass(LuminanceShader);
    passes.push(this.lumPass);

    // Apply blur
    this.blurPass = new GaussianBlurPass();
    passes.push(this.blurPass);

    // Blend with original frame
    this.blendPass = new BlendPass(this.copyPass.buffer, { blendMode, alpha: 1 });
    passes.push(this.blendPass);

    // Set render pass
    this.pass = new MultiPass(passes);

    this.updatePass();
  }

  removeFromScene() {
    this.pass = null;
  }
}
