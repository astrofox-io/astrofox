import Effect from "@/lib/core/Effect";
import ShaderPass from "@/lib/graphics/ShaderPass";
import HueShiftShader from "@/lib/shaders/HueShiftShader";

export default class HueShiftEffect extends Effect {
	static config = {
		name: "HueShiftEffect",
		description: "Continuously rotates the hue of the image over time.",
		type: "effect",
		label: "Hue Shift",
		defaultProperties: {
			speed: 0.3,
			saturation: 1.0,
		},
		controls: {
			speed: {
				label: "Speed",
				type: "number",
				min: 0,
				max: 1.0,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
			saturation: {
				label: "Saturation",
				type: "number",
				min: 0,
				max: 2.0,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties) {
		super(HueShiftEffect, properties);
		this.hue = 0;
	}

	updatePass() {
		this.pass.setUniforms({ saturation: this.properties.saturation });
	}

	addToScene() {
		this.pass = new ShaderPass(HueShiftShader);
		this.updatePass();
	}

	removeFromScene() {
		this.pass = null;
	}

	render(scene, data) {
		if (!data.hasUpdate) return;

		const { speed } = this.properties;
		this.hue = (this.hue + (data.delta / 5000) * speed) % 1.0;

		this.pass.setUniforms({ hue: this.hue });
	}
}
