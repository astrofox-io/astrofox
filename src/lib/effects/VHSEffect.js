import Effect from "@/lib/core/Effect";
import ShaderPass from "@/lib/graphics/ShaderPass";
import VHSShader from "@/lib/shaders/VHSShader";

export default class VHSEffect extends Effect {
	static config = {
		name: "VHSEffect",
		description: "VHS tape distortion with scanlines, noise and color bleeding.",
		type: "effect",
		label: "VHS",
		defaultProperties: {
			intensity: 0.5,
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
		super(VHSEffect, properties);
		this.time = 0;
	}

	updatePass() {
		const { intensity, speed } = this.properties;
		const { width, height } = this.scene.getSize();

		this.pass.setUniforms({ intensity, speed, resolution: [width, height] });
	}

	addToScene() {
		this.pass = new ShaderPass(VHSShader);
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
