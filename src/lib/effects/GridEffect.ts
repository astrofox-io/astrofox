import Effect from "@/lib/core/Effect";

export default class GridEffect extends Effect {
	static config = {
		name: "GridEffect",
		description: "Grid effect.",
		type: "effect",
		label: "Grid",
		defaultProperties: {
			scale: 1.0,
			lineWidth: 0.5,
		},
		controls: {
			scale: {
				label: "Scale",
				type: "number",
				min: 0.1,
				max: 10,
				step: 0.1,
				withRange: true,
				withReactor: true,
			},
			lineWidth: {
				label: "Line Width",
				type: "number",
				min: 0,
				max: 2,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties?: Record<string, unknown>) {
		super(GridEffect, properties);
	}
}
