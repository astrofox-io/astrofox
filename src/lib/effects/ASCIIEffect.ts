import Effect from "@/lib/core/Effect";

export default class ASCIIEffect extends Effect {
	static config = {
		name: "ASCIIEffect",
		description: "ASCII art effect.",
		type: "effect",
		label: "ASCII",
		defaultProperties: {
			fontSize: 54,
			cellSize: 16,
			color: "#ffffff",
			invert: false,
		},
		controls: {
			fontSize: {
				label: "Font Size",
				type: "number",
				min: 8,
				max: 128,
				step: 1,
				withRange: true,
			},
			cellSize: {
				label: "Cell Size",
				type: "number",
				min: 4,
				max: 64,
				step: 1,
				withRange: true,
				withReactor: true,
			},
			color: {
				label: "Color",
				type: "color",
			},
			invert: {
				label: "Invert",
				type: "toggle",
			},
		},
	};

	constructor(properties?: Record<string, unknown>) {
		super(ASCIIEffect, properties);
	}
}
