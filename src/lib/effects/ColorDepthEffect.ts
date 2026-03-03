import Effect from "@/lib/core/Effect";

export default class ColorDepthEffect extends Effect {
	static config = {
		name: "ColorDepthEffect",
		description: "Color depth effect.",
		type: "effect",
		label: "Color Depth",
		defaultProperties: {
			bits: 16,
		},
		controls: {
			bits: {
				label: "Bits",
				type: "number",
				min: 1,
				max: 32,
				step: 1,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties?: Record<string, unknown>) {
		super(ColorDepthEffect, properties);
	}
}
