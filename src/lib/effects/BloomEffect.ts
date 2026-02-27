import Effect from "@/lib/core/Effect";

const blendOptions = ["Add", "Screen"];

export default class BloomEffect extends Effect {
	[key: string]: any;
	static config = {
		name: "BloomEffect",
		description: "Bloom effect.",
		type: "effect",
		label: "Bloom",
		defaultProperties: {
			blendMode: "Screen",
			amount: 0.1,
			threshold: 1.0,
		},
		controls: {
			blendMode: {
				label: "Blend Mode",
				type: "select",
				items: blendOptions,
			},
			amount: {
				label: "Amount",
				type: "number",
				min: 0,
				max: 1.0,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
			threshold: {
				label: "Threshold",
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
		super(BloomEffect, properties);
	}
}
