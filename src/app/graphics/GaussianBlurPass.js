import ShaderPass from 'graphics/ShaderPass';
import MultiPass from 'graphics/MultiPass';
import GaussianBlurShader from 'shaders/GaussianBlurShader';

const defaults = {
    amount: 1.0,
    passes: 8,
    radius: 3
};

export default class GaussianBlurPass extends MultiPass {
    constructor(options) {
        let passes = [];

        options = Object.assign({}, defaults, options);

        for (let i = 0; i < options.passes; i++) {
            passes.push(new ShaderPass(GaussianBlurShader));
        }

        super(passes, options);

        this.setAmount(options.amount);
    }

    setAmount(amount) {
        this.getPasses().forEach((pass, index) => {
            let radius = (this.options.passes - index) * this.options.radius * amount;

            pass.setUniforms({ direction: (index % 2 === 0) ? [0, radius] : [radius, 0] });
        });
    }
}