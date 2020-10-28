import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import RGBShiftShader from 'shaders/RGBShiftShader';
import { deg2rad } from 'utils/math';

export default class RGBShiftEffect extends Effect {
  static info = {
    name: 'RGBShiftEffect',
    description: 'RGB shift effect.',
    type: 'effect',
    label: 'RGB Shift',
  };

  static defaultProperties = {
    offset: 5,
    angle: 45,
  };

  constructor(properties) {
    super(RGBShiftEffect.info, { ...RGBShiftEffect.defaultProperties, ...properties });
  }

  updatePass() {
    const { width } = this.scene.getSize();

    this.pass.setUniforms({
      amount: this.properties.offset / width,
      angle: deg2rad(this.properties.angle),
    });
  }

  addToScene() {
    this.setPass(new ShaderPass(RGBShiftShader));
    this.updatePass();
  }

  removeFromScene() {
    this.pass = null;
  }
}
