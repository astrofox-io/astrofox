import Effect from "@/lib/core/Effect";
import ShaderPass from "@/lib/graphics/ShaderPass";
import LEDShader from "@/lib/shaders/LEDShader";

export default class LEDEffect extends Effect {
	[key: string]: any;
	static config = {
		name: "LEDEffect",
		description: "LED effect.",
		type: "effect",
		label: "LED",
		defaultProperties: {
			spacing: 10,
			size: 4,
			blur: 4,
		},
		controls: {
			spacing: {
				label: "Spacing",
				type: "number",
				min: 1,
				max: 100,
				withRange: true,
				withReactor: true,
			},
			size: {
				label: "Size",
				type: "number",
				min: 0,
				max: 100,
				withRange: true,
				withReactor: true,
			},
			blur: {
				label: "Blur",
				type: "number",
				min: 0,
				max: 100,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties) {
		super(LEDEffect, properties);
	}

	addToScene() {
		this.pass = new ShaderPass(LEDShader);
	}

	removeFromScene() {
		this.pass = null;
	}
}
