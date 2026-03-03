import Effect from "@/lib/core/Effect";

export default class VignetteEffect extends Effect {
	static config = {
		name: "VignetteEffect",
		description: "Vignette effect.",
		type: "effect",
		label: "Vignette",
		defaultProperties: {
			offset: 0.5,
			darkness: 0.5,
		},
		controls: {
			offset: {
				label: "Offset",
				type: "number",
				min: 0,
				max: 1,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
			darkness: {
				label: "Darkness",
				type: "number",
				min: 0,
				max: 1,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties?: Record<string, unknown>) {
		super(VignetteEffect, properties);
	}
}
