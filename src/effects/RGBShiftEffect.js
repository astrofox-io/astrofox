import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import RGBShiftShader from 'shaders/RGBShiftShader';
import { deg2rad } from 'utils/math';
import { stageWidth } from 'utils/controls';

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

  static controls = {
    offset: {
      label: 'Offset',
      type: 'number',
      min: 0,
      max: stageWidth(),
      withRange: true,
      withReactor: true,
    },
    angle: {
      label: 'Angle',
      type: 'number',
      min: 0,
      max: 360,
      withRange: true,
      withReactor: true,
    },
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
