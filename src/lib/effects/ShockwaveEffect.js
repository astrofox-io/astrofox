import Effect from "@/lib/core/Effect";
import ShaderPass from "@/lib/graphics/ShaderPass";
import ShockwaveShader from "@/lib/shaders/ShockwaveShader";

export default class ShockwaveEffect extends Effect {
	static config = {
		name: "ShockwaveEffect",
		description: "Radial shockwave distortion emanating from center.",
		type: "effect",
		label: "Shockwave",
		defaultProperties: {
			amplitude: 0.5,
			frequency: 5.0,
			speed: 0.5,
		},
		controls: {
			amplitude: {
				label: "Amplitude",
				type: "number",
				min: 0,
				max: 1.0,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
			frequency: {
				label: "Frequency",
				type: "number",
				min: 1,
				max: 20,
				step: 0.5,
				withRange: true,
				withReactor: true,
			},
			speed: {
				label: "Speed",
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
		super(ShockwaveEffect, properties);
		this.time = 0;
	}

	updatePass() {
		const { amplitude, frequency, speed } = this.properties;
		this.pass.setUniforms({ amplitude, frequency, speed });
	}

	addToScene() {
		this.pass = new ShaderPass(ShockwaveShader);
		this.updatePass();
	}

	removeFromScene() {
		this.pass = null;
	}

	render(scene, data) {
		if (!data.hasUpdate) return;

		const { speed } = this.properties;
		this.time += data.delta / (1000 / Math.max(speed, 0.01));

		this.pass.setUniforms({ time: this.time });
	}
}
