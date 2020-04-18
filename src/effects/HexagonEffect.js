import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import HexagonShader from 'shaders/HexagonShader';

export default class HexagonEffect extends Effect {
  static label = 'Hexagon';

  static className = 'HexagonEffect';

  static defaultProperties = {
    scale: 10.0,
  };

  constructor(properties) {
    super(HexagonEffect, properties);
  }

  updatePass() {
    this.pass.setUniforms({ scale: this.properties.scale });
  }

  addToScene() {
    this.setPass(new ShaderPass(HexagonShader));
    this.updatePass();
  }

  removeFromScene() {
    this.pass = null;
  }
}
