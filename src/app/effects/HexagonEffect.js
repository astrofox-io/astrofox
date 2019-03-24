import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import HexagonShader from 'shaders/HexagonShader';

export default class HexagonEffect extends Effect {
  static label = 'Hexagon';

  static className = 'HexagonEffect';

  static defaultOptions = {
    scale: 10.0,
  };

  constructor(options) {
    super(HexagonEffect, options);
  }

  updatePass() {
    this.pass.setUniforms({ scale: this.options.scale });
  }

  addToScene() {
    this.setPass(new ShaderPass(HexagonShader));
    this.updatePass();
  }

  removeFromScene() {
    this.pass = null;
  }
}
