import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import CopyPass from 'graphics/CopyPass';
import BlendPass from 'graphics/BlendPass';
import GaussianBlurPass from 'effects/passes/GaussianBlurPass';
import MultiPass from 'graphics/MultiPass';
import LuminanceShader from 'shaders/LuminanceShader';
import { createRenderTarget } from 'graphics/common';

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
    const [, lumPass, blurPass, blendPass] = this.pass.passes;

    lumPass.setUniforms({ amount: 1 - threshold });

    blurPass.setUniforms({ amount });

    blendPass.update({ blendMode });
  }

  addToScene() {
    const passes = [];

    // Copy current frame
    const copyPass = new CopyPass(createRenderTarget());
    copyPass.clearBuffer = true;

    passes.push(copyPass);

    // Apply luminance threshold
    passes.push(new ShaderPass(LuminanceShader));

    // Apply blur
    passes.push(new GaussianBlurPass());

    // Blend with original frame
    passes.push(new BlendPass(copyPass.buffer));

    // Set render pass
    this.pass = new MultiPass(passes);

    this.updatePass();
  }

  removeFromScene() {
    this.pass = null;
  }
}
