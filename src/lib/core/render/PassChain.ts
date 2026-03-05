// @ts-nocheck
import { Pass } from "postprocessing";
import {
	HalfFloatType,
	LinearFilter,
	RGBAFormat,
	WebGLRenderTarget,
	WebGLRenderer,
} from "three";

/**
 * V1-style ping-pong buffer chain.
 * Runs an array of postprocessing Pass objects, swapping instance-level
 * inputBuffer / outputBuffer after each pass that sets needsSwap = true.
 * The final result is ALWAYS in this.inputBuffer.
 */
export class PassChain {
	inputBuffer: WebGLRenderTarget;
	outputBuffer: WebGLRenderTarget;

	constructor(width: number, height: number) {
		const opts = {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBAFormat,
			type: HalfFloatType,
		};
		this.inputBuffer = new WebGLRenderTarget(width, height, opts);
		this.inputBuffer.texture.name = "PassChain.Input";
		this.outputBuffer = new WebGLRenderTarget(width, height, opts);
		this.outputBuffer.texture.name = "PassChain.Output";
	}

	setSize(width: number, height: number) {
		this.inputBuffer.setSize(width, height);
		this.outputBuffer.setSize(width, height);
	}

	render(renderer: WebGLRenderer, passes: Pass[], deltaTime: number) {
		for (const pass of passes) {
			if (!pass.enabled) {
				continue;
			}
			try {
				pass.render(
					renderer,
					this.inputBuffer,
					this.outputBuffer,
					deltaTime,
					false,
				);
				if (pass.needsSwap) {
					const tmp = this.inputBuffer;
					this.inputBuffer = this.outputBuffer;
					this.outputBuffer = tmp;
				}
			} catch {
				// Skip failed pass and continue with the rest.
			}
		}
		// Result is now in this.inputBuffer.
	}

	dispose() {
		this.inputBuffer?.dispose();
		this.outputBuffer?.dispose();
	}
}
