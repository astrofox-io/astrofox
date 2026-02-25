import Effect from "@/lib/core/Effect";
import ShaderPass from "@/lib/graphics/ShaderPass";
import EdgeDetectionShader from "@/lib/shaders/EdgeDetectionShader";

export default class EdgeDetectionEffect extends Effect {
	static config = {
		name: "EdgeDetectionEffect",
		description: "Sobel edge detection. Outline or neon glow mode.",
		type: "effect",
		label: "Edge Detection",
		defaultProperties: {
			thickness: 1.0,
			neon: false,
			color: "#ffffff",
		},
		controls: {
			thickness: {
				label: "Thickness",
				type: "number",
				min: 0.5,
				max: 5,
				step: 0.1,
				withRange: true,
				withReactor: true,
			},
			neon: {
				label: "Neon Mode",
				type: "toggle",
			},
			color: {
				label: "Edge Color",
				type: "color",
			},
		},
	};

	constructor(properties) {
		super(EdgeDetectionEffect, properties);
	}

	updatePass() {
		const { thickness, neon, color } = this.properties;
		const { width, height } = this.scene.getSize();

		// Parse hex color to RGB 0-1
		const r = parseInt(color.slice(1, 3), 16) / 255;
		const g = parseInt(color.slice(3, 5), 16) / 255;
		const b = parseInt(color.slice(5, 7), 16) / 255;

		this.pass.setUniforms({
			thickness,
			neon: neon ? 1 : 0,
			edgeColor: [r, g, b],
			resolution: [width, height],
		});
	}

	addToScene() {
		this.pass = new ShaderPass(EdgeDetectionShader);
		this.updatePass();
	}

	removeFromScene() {
		this.pass = null;
	}
}
