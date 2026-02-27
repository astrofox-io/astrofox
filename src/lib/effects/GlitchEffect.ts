import Effect from "@/lib/core/Effect";

export default class GlitchEffect extends Effect {
	[key: string]: any;
	static config = {
		name: "GlitchEffect",
		description: "Glitch effect.",
		type: "effect",
		label: "Glitch",
		defaultProperties: {
			amount: 0.5,
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
		},
	};

	constructor(properties) {
		super(GlitchEffect, properties);

		this.time = 0;
	}

	render(scene, data) {
		if (!data.hasUpdate) return;

		this.time += data.delta;
	}
}
