import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import RGBShiftShader from 'shaders/RGBShiftShader';
import { deg2rad } from 'utils/math';

export default class RGBShiftEffect extends Effect {
  static label = 'RGB Shift';

  static className = 'RGBShiftEffect';

  static defaultOptions = {
    offset: 5,
    angle: 45,
  };

  constructor(properties) {
    super(RGBShiftEffect, properties);
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
