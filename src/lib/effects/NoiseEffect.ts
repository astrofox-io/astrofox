import Effect from "@/lib/core/Effect";

export default class NoiseEffect extends Effect {
	static config = {
		name: "NoiseEffect",
		description: "Noise effect.",
		type: "effect",
		label: "Noise",
		defaultProperties: {
			premultiply: false,
		},
		controls: {
			premultiply: {
				label: "Premultiply",
				type: "toggle",
			},
		},
	};

	constructor(properties?: Record<string, unknown>) {
		super(NoiseEffect, properties);
	}
}
