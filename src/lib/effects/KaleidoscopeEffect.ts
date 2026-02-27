import Effect from "@/lib/core/Effect";

export default class KaleidoscopeEffect extends Effect {
	[key: string]: any;
	static config = {
		name: "KaleidoscopeEffect",
		description: "Kaleidoscope effect.",
		type: "effect",
		label: "Kaleidoscope",
		defaultProperties: {
			sides: 6,
			angle: 0,
		},
		controls: {
			sides: {
				label: "Sides",
				type: "number",
				min: 1,
				max: 20,
				withRange: true,
				withReactor: true,
			},
			angle: {
				label: "Angle",
				type: "number",
				min: 0,
				max: 360,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties) {
		super(KaleidoscopeEffect, properties);
	}
}
