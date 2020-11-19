import ShaderPass from 'graphics/ShaderPass';
import MultiPass from 'graphics/MultiPass';
import GaussianBlurShader from 'shaders/GaussianBlurShader';

export default class GaussianBlurPass extends MultiPass {
  static defaultProperties = {
    amount: 1.0,
    rounds: 8,
    radius: 3,
  };

  constructor(properties) {
    const passes = [];
    const props = { ...GaussianBlurPass.defaultProperties, ...properties };

    for (let i = 0; i < props.rounds; i++) {
      passes.push(new ShaderPass(GaussianBlurShader));
    }

    super(passes, props);

    this.setUniforms({ amount: props.amount });
  }

  setUniforms({ amount }) {
    const { passes, rounds } = this;

    passes.forEach((pass, index) => {
      const r = (rounds - index) * amount;

      pass.setUniforms({ direction: index % 2 === 0 ? [0, r] : [r, 0] });
    });
  }
}
