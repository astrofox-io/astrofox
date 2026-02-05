import Effect from "core/Effect";
import ShaderPass from "graphics/ShaderPass";
import DotScreenShader from "shaders/DotScreenShader";
import { deg2rad } from "utils/math";

export default class DotScreenEffect extends Effect {
	static config = {
		name: "DotScreenEffect",
		description: "Dot screen effect.",
		type: "effect",
		label: "Dot Screen",
		defaultProperties: {
			angle: 90,
			scale: 0.5,
		},
		controls: {
			scale: {
				label: "Scale",
				type: "number",
				min: 0,
				max: 1,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
			angle: {
				label: "Angle",
				type: "number",
				min: 0,
				max: 360,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties) {
		super(DotScreenEffect, properties);
	}

	updatePass() {
		const { scale, angle } = this.properties;

		this.pass.setUniforms({
			scale: 2 - scale * 2,
			angle: deg2rad(angle),
		});
	}

	addToScene() {
		this.pass = new ShaderPass(DotScreenShader);

		this.updatePass();
	}

	removeFromScene() {
		this.pass = null;
	}
}
