import MultiPass from "@/lib/graphics/MultiPass";
import ShaderPass from "@/lib/graphics/ShaderPass";
import TriangleBlurShader from "@/lib/shaders/TriangleBlurShader";

const BLUR_PASSES = 4;

export default class TriangleBlurPass extends MultiPass {
	constructor() {
		const passes = [];

		for (let i = 0; i < BLUR_PASSES; i++) {
			passes.push(new ShaderPass(TriangleBlurShader));
		}

		super(passes);
	}

	setUniforms({ amount, width, height }) {
		this.passes.forEach((pass, index) => {
			const delta =
				index % 2 === 0 ? [amount / width, 0] : [0, amount / height];

			pass.setUniforms({ delta });
		});
	}
}
