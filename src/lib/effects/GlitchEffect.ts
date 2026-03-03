import Effect from "@/lib/core/Effect";

const glitchModes = ["Sporadic", "Constant"];

export default class GlitchEffect extends Effect {
	static config = {
		name: "GlitchEffect",
		description: "Glitch effect.",
		type: "effect",
		label: "Glitch",
		defaultProperties: {
			mode: "Sporadic",
			strength: 0.3,
			columns: 0.05,
			ratio: 0.85,
		},
		controls: {
			mode: {
				label: "Mode",
				type: "select",
				items: glitchModes,
			},
			strength: {
				label: "Strength",
				type: "number",
				min: 0,
				max: 1.0,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
			columns: {
				label: "Columns",
				type: "number",
				min: 0,
				max: 0.5,
				step: 0.01,
				withRange: true,
			},
			ratio: {
				label: "Ratio",
				type: "number",
				min: 0,
				max: 1.0,
				step: 0.01,
				withRange: true,
			},
		},
	};

	constructor(properties?: Record<string, unknown>) {
		super(GlitchEffect, properties);
	}
}
