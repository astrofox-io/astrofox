import Effect from "@/lib/core/Effect";

export default class ColorHalftoneEffect extends Effect {
	static config = {
		name: "ColorHalftoneEffect",
		description: "Color halftone effect.",
		type: "effect",
		label: "Color Halftone",
		defaultProperties: {
			scale: 0.5,
			angle: 0,
		},
		controls: {
			scale: {
				label: "Scale",
				type: "number",
				min: 0,
				max: 1,
				step: 0.01,
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

	constructor(properties?: Record<string, unknown>) {
		super(ColorHalftoneEffect, properties);
	}
}
