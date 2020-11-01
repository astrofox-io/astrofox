import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import LEDShader from 'shaders/LEDShader';

export default class LEDEffect extends Effect {
  static info = {
    name: 'LEDEffect',
    description: 'LED effect.',
    type: 'effect',
    label: 'LED',
  };

  static defaultProperties = {
    spacing: 10,
    size: 4,
    blur: 4,
  };

  static controls = {
    spacing: {
      label: 'Spacing',
      type: 'number',
      min: 1,
      max: 100,
      withRange: true,
      withReactor: true,
    },
    size: {
      label: 'Size',
      type: 'number',
      min: 0,
      max: 100,
      withRange: true,
      withReactor: true,
    },
    blur: {
      label: 'Blur',
      type: 'number',
      min: 0,
      max: 100,
      withRange: true,
      withReactor: true,
    },
  };

  constructor(properties) {
    super(LEDEffect, properties);
  }

  addToScene() {
    this.setPass(new ShaderPass(LEDShader));
    this.updatePass();
  }

  removeFromScene() {
    this.pass = null;
  }
}
