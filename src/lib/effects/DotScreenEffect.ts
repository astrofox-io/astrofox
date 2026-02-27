import Effect from "@/lib/core/Effect";

export default class DotScreenEffect extends Effect {
	[key: string]: any;
	static config = {
		name: "DotScreenEffect",
		description: "Dot screen effect.",
		type: "effect",
		label: "Dot Screen",
		defaultProperties: {
			angle: 90,
			scale: 0.5,
		},
		controls: {
			scale: {
				label: "Scale",
				type: "number",
				min: 0,
				max: 1,
				step: 0.01,
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
		super(DotScreenEffect, properties);
	}
}
