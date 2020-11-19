import ShaderPass from 'graphics/ShaderPass';
import MultiPass from 'graphics/MultiPass';
import TriangleBlurShader from 'shaders/TriangleBlurShader';

export default class TriangleBlurPass extends MultiPass {
  static defaultProperties = {
    amount: 0.3,
    rounds: 4,
  };

  constructor(properties) {
    const passes = [];
    const props = { ...TriangleBlurPass.defaultProperties, ...properties };

    for (let i = 0; i < props.rounds; i++) {
      passes.push(new ShaderPass(TriangleBlurShader));
    }

    super(passes, props);
  }

  setUniforms({ amount, width, height }) {
    this.passes.forEach((pass, index) => {
      const delta = index % 2 === 0 ? [amount / width, 0] : [0, amount / height];

      pass.setUniforms({ delta });
    });
  }
}
