import Effect from "@/lib/core/Effect";
import ShaderPass from "@/lib/graphics/ShaderPass";
import FilmGrainShader from "@/lib/shaders/FilmGrainShader";

export default class FilmGrainEffect extends Effect {
	static config = {
		name: "FilmGrainEffect",
		description: "Film grain noise overlay.",
		type: "effect",
		label: "Film Grain",
		defaultProperties: {
			intensity: 0.3,
			size: 512,
			colored: false,
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
			size: {
				label: "Grain Size",
				type: "number",
				min: 50,
				max: 2000,
				step: 10,
				withRange: true,
			},
			colored: {
				label: "Colored",
				type: "toggle",
			},
		},
	};

	constructor(properties) {
		super(FilmGrainEffect, properties);
		this.time = 0;
	}

	updatePass() {
		const { intensity, size, colored } = this.properties;
		this.pass.setUniforms({ intensity, size, colored: colored ? 1 : 0 });
	}

	addToScene() {
		this.pass = new ShaderPass(FilmGrainShader);
		this.updatePass();
	}

	removeFromScene() {
		this.pass = null;
	}

	render(scene, data) {
		this.time += data.delta * 0.001;
		this.pass.setUniforms({ time: this.time });
	}
}
