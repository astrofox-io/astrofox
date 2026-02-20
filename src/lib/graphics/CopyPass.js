import ShaderPass from "@/lib/graphics/ShaderPass";
import CopyShader from "@/lib/shaders/CopyShader";

export default class CopyPass extends ShaderPass {
	constructor(buffer) {
		super(CopyShader);

		this.buffer = buffer;
		this.needsSwap = false;
		this.copyFromBuffer = false;
		this.clearBuffer = false;
	}

	dispose() {
		this.buffer.dispose();
	}

	render(renderer, inputBuffer) {
		const { buffer, copyFromBuffer, clearBuffer } = this;

		if (clearBuffer) {
			renderer.setRenderTarget(buffer);
			renderer.clear();
		}

		super.render(
			renderer,
			copyFromBuffer ? buffer : inputBuffer,
			copyFromBuffer ? inputBuffer : buffer,
		);
	}
}
