import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import GlowShader from 'shaders/GlowShader';

const GLOW_MAX = 5;

export default class GlowEffect extends Effect {
  static info = {
    name: 'GlowEffect',
    description: 'Glow effect.',
    type: 'effect',
    label: 'Glow',
  };

  static defaultProperties = {
    amount: 0.1,
    intensity: 1,
  };

  static controls = {
    amount: {
      label: 'Amount',
      type: 'number',
      min: 0,
      max: 1.0,
      step: 0.01,
      withRange: true,
      withReactor: true,
    },
    intensity: {
      label: 'Intensity',
      type: 'number',
      min: 1,
      max: 3,
      step: 0.01,
      withRange: true,
      withReactor: true,
    },
  };

  constructor(properties) {
    super(GlowEffect, properties);
  }

  updatePass() {
    this.pass.setUniforms({
      amount: this.properties.amount * GLOW_MAX,
      intensity: this.properties.intensity,
    });
  }

  addToScene() {
    this.pass = new ShaderPass(GlowShader);

    this.updatePass();
  }

  removeFromScene() {
    this.pass = null;
  }
}
