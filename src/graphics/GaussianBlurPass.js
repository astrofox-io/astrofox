import ShaderPass from 'graphics/ShaderPass';
import MultiPass from 'graphics/MultiPass';
import GaussianBlurShader from 'shaders/GaussianBlurShader';

export default class GaussianBlurPass extends MultiPass {
  static defaultOptions = {
    amount: 1.0,
    passes: 8,
    radius: 3,
  };

  constructor(properties) {
    const passes = [];
    const opts = { ...GaussianBlurPass.defaultOptions, ...properties };

    for (let i = 0; i < opts.passes; i++) {
      passes.push(new ShaderPass(GaussianBlurShader));
    }

    super(passes, opts);

    this.setAmount(opts.amount);
  }

  setAmount(amount) {
    this.passes.forEach((pass, index) => {
      const radius = (this.properties.passes - index) * this.properties.radius * amount;

      pass.setUniforms({ direction: index % 2 === 0 ? [0, radius] : [radius, 0] });
    });
  }
}
