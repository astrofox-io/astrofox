import { NoBlending } from 'three';
import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import SavePass from 'graphics/SavePass';
import BlendPass from 'graphics/BlendPass';
import GaussianBlurPass from 'graphics/GaussianBlurPass';
import LuminanceShader from 'shaders/LuminanceShader';

export default class BloomEffect extends Effect {
  static label = 'Bloom';

  static className = 'BloomEffect';

  static defaultProperties = {
    blendMode: 'Screen',
    amount: 0.1,
    threshold: 1.0,
  };

  constructor(properties) {
    super(BloomEffect, properties);
  }

  updatePass() {
    this.lumPass.setUniforms({ amount: 1 - this.properties.threshold });

    this.blurPass.setAmount(this.properties.amount);

    this.blendPass.update({ blendMode: this.properties.blendMode });
  }

  addToScene(scene) {
    const {
      properties: { blendMode },
    } = this;
    const { composer } = scene;
    const passes = [];

    // Save current frame
    this.savePass = new SavePass(composer.createRenderTarget(), { blending: NoBlending });
    passes.push(this.savePass);

    // Apply luminance threshold
    this.lumPass = new ShaderPass(LuminanceShader);
    passes.push(this.lumPass);

    // Apply blur
    this.blurPass = new GaussianBlurPass();
    passes.push(this.blurPass);

    // Blend with original frame
    this.blendPass = new BlendPass(this.savePass.buffer, { blendMode, alpha: 1 });
    passes.push(this.blendPass);

    // Set render pass
    this.setPass(composer.addMultiPass(passes));
    this.updatePass();
  }

  removeFromScene() {
    this.pass = null;
  }
}
