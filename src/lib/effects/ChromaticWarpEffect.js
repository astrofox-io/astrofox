import Effect from "@/lib/core/Effect";
import ShaderPass from "@/lib/graphics/ShaderPass";
import ChromaticWarpShader from "@/lib/shaders/ChromaticWarpShader";

export default class ChromaticWarpEffect extends Effect {
	static config = {
		name: "ChromaticWarpEffect",
		description: "Barrel lens distortion with chromatic aberration.",
		type: "effect",
		label: "Chromatic Warp",
		defaultProperties: {
			warp: 0.3,
			chromatic: 0.5,
		},
		controls: {
			warp: {
				label: "Warp",
				type: "number",
				min: 0,
				max: 1.0,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
			chromatic: {
				label: "Chromatic",
				type: "number",
				min: 0,
				max: 1.0,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties) {
		super(ChromaticWarpEffect, properties);
	}

	addToScene() {
		this.pass = new ShaderPass(ChromaticWarpShader);
		this.updatePass();
	}

	removeFromScene() {
		this.pass = null;
	}
}
