// @ts-nocheck
import { Pass } from "postprocessing";
import { Vector2 } from "three";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

export class PPUnrealBloomPass extends Pass {
	constructor({
		width = 1,
		height = 1,
		exposure = 1,
		strength = 1.5,
		radius = 0,
		threshold = 0,
	} = {}) {
		super("PPUnrealBloomPass");
		const exposureScale = Math.pow(Math.max(0, Number(exposure ?? 1)), 4);
		const mappedStrength = Number(strength ?? 1.5) * exposureScale;

		this.unrealBloomPass = new UnrealBloomPass(
			new Vector2(
				Math.max(1, Math.floor(Number(width || 1))),
				Math.max(1, Math.floor(Number(height || 1))),
			),
			mappedStrength,
			Number(radius ?? 0),
			Number(threshold ?? 0),
		);

		// UnrealBloomPass composites into the read buffer and doesn't require swap.
		this.needsSwap = false;
	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		this.unrealBloomPass.render(
			renderer,
			outputBuffer,
			inputBuffer,
			deltaTime,
			stencilTest,
		);
	}

	setSize(width, height) {
		this.unrealBloomPass.setSize(width, height);
	}

	dispose() {
		super.dispose();
		this.unrealBloomPass?.dispose();
	}
}
