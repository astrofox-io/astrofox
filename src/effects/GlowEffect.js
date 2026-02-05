import Effect from "core/Effect";
import ShaderPass from "graphics/ShaderPass";
import GlowShader from "shaders/GlowShader";

const GLOW_MAX = 5;

export default class GlowEffect extends Effect {
	static config = {
		name: "GlowEffect",
		description: "Glow effect.",
		type: "effect",
		label: "Glow",
		defaultProperties: {
			amount: 0.1,
			intensity: 1,
		},
		controls: {
			amount: {
				label: "Amount",
				type: "number",
				min: 0,
				max: 1.0,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
			intensity: {
				label: "Intensity",
				type: "number",
				min: 1,
				max: 3,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties) {
		super(GlowEffect, properties);
	}

	update(properties) {
		const changed = super.update(properties);

		if (changed) {
			const { amount, intensity } = this.properties;

			this.pass.setUniforms({
				amount: amount * GLOW_MAX,
				intensity,
			});
		}

		return changed;
	}

	addToScene() {
		this.pass = new ShaderPass(GlowShader);

		this.updatePass();
	}

	removeFromScene() {
		this.pass = null;
	}
}
