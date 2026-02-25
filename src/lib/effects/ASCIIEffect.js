import Effect from "@/lib/core/Effect";
import ShaderPass from "@/lib/graphics/ShaderPass";
import ASCIIShader from "@/lib/shaders/ASCIIShader";

export default class ASCIIEffect extends Effect {
	static config = {
		name: "ASCIIEffect",
		description: "Converts image to ASCII art style using luminance patterns.",
		type: "effect",
		label: "ASCII",
		defaultProperties: {
			charSize: 8,
			colored: true,
		},
		controls: {
			charSize: {
				label: "Char Size",
				type: "number",
				min: 4,
				max: 32,
				step: 1,
				withRange: true,
				withReactor: true,
			},
			colored: {
				label: "Colored",
				type: "toggle",
			},
		},
	};

	constructor(properties) {
		super(ASCIIEffect, properties);
	}

	updatePass() {
		const { charSize, colored } = this.properties;
		const { width, height } = this.scene.getSize();

		this.pass.setUniforms({
			charSize,
			colored: colored ? 1 : 0,
			resolution: [width, height],
		});
	}

	addToScene() {
		this.pass = new ShaderPass(ASCIIShader);
		this.updatePass();
	}

	removeFromScene() {
		this.pass = null;
	}
}
