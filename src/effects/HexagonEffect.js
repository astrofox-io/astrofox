import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import HexagonShader from 'shaders/HexagonShader';

export default class HexagonEffect extends Effect {
  static info = {
    name: 'HexagonEffect',
    description: 'Hexagon effect.',
    type: 'effect',
    label: 'Hexagon',
  };

  static defaultProperties = {
    scale: 10.0,
  };

  constructor(properties) {
    super(HexagonEffect.info, { ...HexagonEffect.defaultProperties, ...properties });
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
