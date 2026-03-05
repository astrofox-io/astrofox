import Effect from "@/lib/core/Effect";

export default class UnrealBloomEffect extends Effect {
	static config = {
		name: "UnrealBloomEffect",
		description: "Unreal Bloom effect.",
		type: "effect",
		label: "Unreal Bloom",
		defaultProperties: {
			exposure: 1,
			strength: 1.5,
			radius: 0,
			threshold: 0,
		},
		controls: {
			exposure: {
				label: "Exposure",
				type: "number",
				min: 0,
				max: 2,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
			strength: {
				label: "Strength",
				type: "number",
				min: 0,
				max: 3,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
			radius: {
				label: "Radius",
				type: "number",
				min: 0,
				max: 1,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
			threshold: {
				label: "Threshold",
				type: "number",
				min: 0,
				max: 1,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties?: Record<string, unknown>) {
		super(UnrealBloomEffect, properties);
	}
}
