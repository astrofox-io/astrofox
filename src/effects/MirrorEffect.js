import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import MirrorShader from 'shaders/MirrorShader';

export default class MirrorEffect extends Effect {
  static info = {
    name: 'MirrorEffect',
    description: 'Mirror effect.',
    type: 'effect',
    label: 'Mirror',
  };

  static defaultProperties = {
    side: 0,
  };

  constructor(properties) {
    super(MirrorEffect.info, { ...MirrorEffect.defaultProperties, ...properties });
  }

  addToScene() {
    this.setPass(new ShaderPass(MirrorShader));
    this.updatePass();
  }

  removeFromScene() {
    this.pass = null;
  }
}
