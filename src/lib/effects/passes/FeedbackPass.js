import Pass from "@/lib/graphics/Pass";
import ShaderPass from "@/lib/graphics/ShaderPass";
import CopyShader from "@/lib/shaders/CopyShader";
import FeedbackShader from "@/lib/shaders/FeedbackShader";
import { createRenderTarget } from "@/lib/graphics/common";

export default class FeedbackPass extends Pass {
	constructor() {
		super();

		this.needsSwap = true;
		this.feedbackBuffer = null;

		this.blendPass = new ShaderPass(FeedbackShader);
		this.copyPass = new ShaderPass(CopyShader);
		this.copyPass.needsSwap = false;
	}

	init() {
		this.feedbackBuffer = createRenderTarget();
	}

	setUniforms({ decay, zoom }) {
		this.blendPass.setUniforms({ decay, zoom });
	}

	setSize(width, height) {
		if (this.feedbackBuffer) {
			this.feedbackBuffer.setSize(width, height);
		}
	}

	render(renderer, inputBuffer, outputBuffer) {
		if (!this.feedbackBuffer) {
			this.init();
		}

		// Blend current frame with accumulated feedback → outputBuffer
		this.blendPass.setUniforms({ feedbackTexture: this.feedbackBuffer.texture });
		this.blendPass.render(renderer, inputBuffer, outputBuffer);

		// Copy outputBuffer into feedbackBuffer for next frame
		this.copyPass.render(renderer, outputBuffer, this.feedbackBuffer);
	}
}
