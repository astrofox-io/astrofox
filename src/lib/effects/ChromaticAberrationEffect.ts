import Effect from "@/lib/core/Effect";

export default class ChromaticAberrationEffect extends Effect {
	static config = {
		name: "ChromaticAberrationEffect",
		description: "Chromatic aberration effect.",
		type: "effect",
		label: "Chromatic Aberration",
		defaultProperties: {
			offsetX: 0.01,
			offsetY: 0.01,
		},
		controls: {
			offsetX: {
				label: "Offset X",
				type: "number",
				min: 0,
				max: 0.1,
				step: 0.001,
				withRange: true,
				withReactor: true,
			},
			offsetY: {
				label: "Offset Y",
				type: "number",
				min: 0,
				max: 0.1,
				step: 0.001,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties?: Record<string, unknown>) {
		super(ChromaticAberrationEffect, properties);
	}
}
