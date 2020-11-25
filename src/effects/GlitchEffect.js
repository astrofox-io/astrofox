import { Math as _Math, DataTexture, RGBFormat, FloatType } from 'three';
import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import GlitchShader from 'shaders/GlitchShader';

export default class GlitchEffect extends Effect {
  static config = {
    name: 'GlitchEffect',
    description: 'Glitch effect.',
    type: 'effect',
    label: 'Glitch',
    defaultProperties: {
      amount: 0.5,
    },
    controls: {
      amount: {
        label: 'Amount',
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
    super(GlitchEffect, properties);

    this.time = 0;
  }

  addToScene() {
    this.pass = new ShaderPass(GlitchShader);

    this.pass.setUniforms({
      displacementTexture: this.generateHeightmap(64),
    });

    this.updatePass();
  }

  removeFromScene() {
    this.pass = null;
  }

  generateHeightmap(size) {
    const data = new Float32Array(size * size * 3);
    const length = size * size;

    for (let i = 0; i < length; i++) {
      const val = _Math.randFloat(0, 1);
      data[i * 3] = val;
      data[i * 3 + 1] = val;
      data[i * 3 + 2] = val;
    }

    const texture = new DataTexture(data, size, size, RGBFormat, FloatType);
    texture.needsUpdate = true;

    return texture;
  }

  render(scene, data) {
    if (!data.hasUpdate) {
      return;
    }

    const { amount } = this.properties;
    this.time += data.delta;

    this.pass.setUniforms({
      shift: (Math.random() / 90) * amount,
      angle: _Math.randFloat(-Math.PI, Math.PI) * amount,
      seed: Math.random() * amount,
      seed_x: _Math.randFloat(-0.3, 0.3) * amount,
      seed_y: _Math.randFloat(-0.3, 0.3) * amount,
      distortion_x: _Math.randFloat(0, 1),
      distortion_y: _Math.randFloat(0, 1),
      col_s: amount > 0.25 ? 0.05 : _Math.randFloat(0, 1) * amount * 0.05,
    });
  }
}
