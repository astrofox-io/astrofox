import Effect from "@/lib/core/Effect";
import ShaderPass from "@/lib/graphics/ShaderPass";
import VignetteShader from "@/lib/shaders/VignetteShader";

export default class VignetteEffect extends Effect {
	static config = {
		name: "VignetteEffect",
		description: "Darkens the edges of the frame.",
		type: "effect",
		label: "Vignette",
		defaultProperties: {
			intensity: 1.0,
			radius: 0.75,
			softness: 0.45,
		},
		controls: {
			intensity: {
				label: "Intensity",
				type: "number",
				min: 0,
				max: 1.0,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
			radius: {
				label: "Radius",
				type: "number",
				min: 0,
				max: 1.0,
				step: 0.01,
				withRange: true,
			},
			softness: {
				label: "Softness",
				type: "number",
				min: 0,
				max: 1.0,
				step: 0.01,
				withRange: true,
			},
		},
	};

	constructor(properties) {
		super(VignetteEffect, properties);
	}

	addToScene() {
		this.pass = new ShaderPass(VignetteShader);
		this.updatePass();
	}

	removeFromScene() {
		this.pass = null;
	}
}
