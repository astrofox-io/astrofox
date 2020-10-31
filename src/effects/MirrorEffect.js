import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import MirrorShader from 'shaders/MirrorShader';

const mirrorOptions = [
  { label: 'Left 🠖 Right', value: 0 },
  { label: 'Right 🠖 Left', value: 1 },
  { label: 'Top 🠖 Bottom', value: 2 },
  { label: 'Bottom 🠖 Top', value: 3 },
];

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

  static controls = {
    side: {
      label: 'Side',
      type: 'select',
      items: mirrorOptions,
    },
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
