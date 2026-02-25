import ShaderPass from "@/lib/graphics/ShaderPass";
import blendModes from "@/lib/graphics/blendModes";
import BlendShader from "@/lib/shaders/BlendShader";

export default class BlendPass extends ShaderPass {
	[key: string]: any;
	constructor(buffer) {
		super(BlendShader);

		this.buffer = buffer;
		this.blendMode = "Normal";
		this.opacity = 1.0;
	}

	render(renderer, inputBuffer, outputBuffer) {
		const { opacity, blendMode } = this;

		this.setUniforms({
			baseBuffer: this.buffer,
			blendBuffer: inputBuffer.texture,
			mode: blendModes[blendMode],
			opacity,
		});

		super.render(renderer, inputBuffer, outputBuffer);
	}
}
