import Effect from "@/core/Effect";
import ShaderPass from "@/graphics/ShaderPass";
import KaleidoscopeShader from "@/shaders/KaleidoscopeShader";

export default class KaleidoscopeEffect extends Effect {
	static config = {
		name: "KaleidoscopeEffect",
		description: "Kaleidoscope effect.",
		type: "effect",
		label: "Kaleidoscope",
		defaultProperties: {
			sides: 6,
			angle: 0,
		},
		controls: {
			sides: {
				label: "Sides",
				type: "number",
				min: 1,
				max: 20,
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
		super(KaleidoscopeEffect, properties);
	}

	addToScene() {
		this.pass = new ShaderPass(KaleidoscopeShader);

		this.updatePass();
	}

	removeFromScene() {
		this.pass = null;
	}
}
