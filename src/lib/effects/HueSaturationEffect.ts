import Effect from "@/lib/core/Effect";

export default class HueSaturationEffect extends Effect {
	static config = {
		name: "HueSaturationEffect",
		description: "Hue and saturation effect.",
		type: "effect",
		label: "Hue / Saturation",
		defaultProperties: {
			hue: 0,
			saturation: 0,
		},
		controls: {
			hue: {
				label: "Hue",
				type: "number",
				min: 0,
				max: 360,
				step: 1,
				withRange: true,
				withReactor: true,
			},
			saturation: {
				label: "Saturation",
				type: "number",
				min: -1,
				max: 1,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties?: Record<string, unknown>) {
		super(HueSaturationEffect, properties);
	}
}
