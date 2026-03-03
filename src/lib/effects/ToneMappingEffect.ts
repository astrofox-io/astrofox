import Effect from "@/lib/core/Effect";

export default class ToneMappingEffect extends Effect {
	static config = {
		name: "ToneMappingEffect",
		description: "Tone mapping effect.",
		type: "effect",
		label: "Tone Mapping",
		defaultProperties: {
			middleGrey: 0.6,
			maxLuminance: 16,
			averageLuminance: 1.0,
			adaptationRate: 1.0,
		},
		controls: {
			middleGrey: {
				label: "Middle Grey",
				type: "number",
				min: 0,
				max: 1,
				step: 0.01,
				withRange: true,
			},
			maxLuminance: {
				label: "Max Luminance",
				type: "number",
				min: 1,
				max: 100,
				step: 0.1,
				withRange: true,
			},
			averageLuminance: {
				label: "Avg Luminance",
				type: "number",
				min: 0.01,
				max: 10,
				step: 0.01,
				withRange: true,
			},
			adaptationRate: {
				label: "Adaptation Rate",
				type: "number",
				min: 0.01,
				max: 10,
				step: 0.01,
				withRange: true,
			},
		},
	};

	constructor(properties?: Record<string, unknown>) {
		super(ToneMappingEffect, properties);
	}
}
