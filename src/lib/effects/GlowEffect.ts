import Effect from "@/lib/core/Effect";

export default class GlowEffect extends Effect {
	[key: string]: any;
	static config = {
		name: "GlowEffect",
		description: "Glow effect.",
		type: "effect",
		label: "Glow",
		defaultProperties: {
			amount: 0.1,
			intensity: 1,
		},
		controls: {
			amount: {
				label: "Amount",
				type: "number",
				min: 0,
				max: 1.0,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
			intensity: {
				label: "Intensity",
				type: "number",
				min: 1,
				max: 3,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties) {
		super(GlowEffect, properties);
	}
}
