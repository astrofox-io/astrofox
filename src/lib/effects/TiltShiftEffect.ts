import Effect from "@/lib/core/Effect";

export default class TiltShiftEffect extends Effect {
	static config = {
		name: "TiltShiftEffect",
		description: "Tilt shift effect.",
		type: "effect",
		label: "Tilt Shift",
		defaultProperties: {
			blur: 0.15,
			taper: 0.5,
			samples: 10,
		},
		controls: {
			blur: {
				label: "Blur",
				type: "number",
				min: 0,
				max: 1,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
			taper: {
				label: "Taper",
				type: "number",
				min: 0,
				max: 1,
				step: 0.01,
				withRange: true,
			},
			samples: {
				label: "Samples",
				type: "number",
				min: 1,
				max: 32,
				step: 1,
				withRange: true,
			},
		},
	};

	constructor(properties?: Record<string, unknown>) {
		super(TiltShiftEffect, properties);
	}
}
