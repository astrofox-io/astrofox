// @ts-nocheck
import CopyShader from "./CopyShader";
import ShaderPass from "./ShaderPass";

export default class CopyPass extends ShaderPass {
	constructor(buffer) {
		super(CopyShader);

		this.buffer = buffer;
		this.needsSwap = false;
		this.copyFromBuffer = false;
		this.clearBuffer = false;
	}

	dispose() {
		this.buffer?.dispose?.();
		super.dispose();
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
