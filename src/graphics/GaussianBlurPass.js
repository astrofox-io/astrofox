import ShaderPass from 'graphics/ShaderPass';
import MultiPass from 'graphics/MultiPass';
import GaussianBlurShader from 'shaders/GaussianBlurShader';

export default class GaussianBlurPass extends MultiPass {
  static defaultProperties = {
    amount: 1.0,
    passes: 8,
    radius: 3,
  };

  constructor(properties) {
    const passes = [];
    const props = { ...GaussianBlurPass.defaultProperties, ...properties };

    for (let i = 0; i < props.passes; i++) {
      passes.push(new ShaderPass(GaussianBlurShader));
    }

    super(passes, props);

    this.setAmount(props.amount);
  }

  setAmount(amount) {
    const { passes, radius } = this.properties;

    this.passes.forEach((pass, index) => {
      const r = (passes - index) * radius * amount;

      pass.setUniforms({ direction: index % 2 === 0 ? [0, r] : [r, 0] });
    });
  }
}
