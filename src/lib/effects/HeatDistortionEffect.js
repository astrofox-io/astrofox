import Effect from "@/lib/core/Effect";
import ShaderPass from "@/lib/graphics/ShaderPass";
import HeatDistortionShader from "@/lib/shaders/HeatDistortionShader";

export default class HeatDistortionEffect extends Effect {
	static config = {
		name: "HeatDistortionEffect",
		description: "Heat shimmer distortion using simplex noise.",
		type: "effect",
		label: "Heat Distortion",
		defaultProperties: {
			intensity: 0.5,
			scale: 3.0,
			speed: 0.5,
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
			scale: {
				label: "Scale",
				type: "number",
				min: 1,
				max: 10,
				step: 0.1,
				withRange: true,
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
		super(HeatDistortionEffect, properties);
		this.time = 0;
	}

	updatePass() {
		const { intensity, scale, speed } = this.properties;
		this.pass.setUniforms({ intensity, scale, speed });
	}

	addToScene() {
		this.pass = new ShaderPass(HeatDistortionShader);
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
