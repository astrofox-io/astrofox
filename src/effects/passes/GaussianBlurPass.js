import ShaderPass from 'graphics/ShaderPass';
import MultiPass from 'graphics/MultiPass';
import GaussianBlurShader from 'shaders/GaussianBlurShader';

const BLUR_PASSES = 8;

export default class GaussianBlurPass extends MultiPass {
  constructor() {
    const passes = [];

    for (let i = 0; i < BLUR_PASSES; i++) {
      passes.push(new ShaderPass(GaussianBlurShader));
    }

    super(passes);

    this.setUniforms({ amount: 1.0 });
  }

  setUniforms({ amount }) {
    this.passes.forEach((pass, index) => {
      const radius = (BLUR_PASSES - index) * amount;

      pass.setUniforms({ direction: index % 2 === 0 ? [0, radius] : [radius, 0] });
    });
  }
}
