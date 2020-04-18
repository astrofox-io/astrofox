import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import MirrorShader from 'shaders/MirrorShader';

export default class MirrorEffect extends Effect {
  static label = 'Mirror';

  static className = 'MirrorEffect';

  static defaultOptions = {
    side: 0,
  };

  constructor(properties) {
    super(MirrorEffect, properties);
  }

  addToScene() {
    this.setPass(new ShaderPass(MirrorShader));
    this.updatePass();
  }

  removeFromScene() {
    this.pass = null;
  }
}
