import Effect from "@/lib/core/Effect";

export default class ScanlineEffect extends Effect {
	static config = {
		name: "ScanlineEffect",
		description: "Scanline effect.",
		type: "effect",
		label: "Scanline",
		defaultProperties: {
			density: 1.25,
		},
		controls: {
			density: {
				label: "Density",
				type: "number",
				min: 0.1,
				max: 5,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties?: Record<string, unknown>) {
		super(ScanlineEffect, properties);
	}
}
