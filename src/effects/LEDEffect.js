import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import LEDShader from 'shaders/LEDShader';

export default class LEDEffect extends Effect {
  static info = {
    name: 'astrofox-effect-led',
    description: 'LED effect.',
    type: 'effect',
    label: 'LED',
  };

  static defaultProperties = {
    spacing: 10,
    size: 4,
    blur: 4,
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
