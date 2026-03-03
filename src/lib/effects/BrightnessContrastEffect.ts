import Effect from "@/lib/core/Effect";

export default class BrightnessContrastEffect extends Effect {
	static config = {
		name: "BrightnessContrastEffect",
		description: "Brightness and contrast effect.",
		type: "effect",
		label: "Brightness / Contrast",
		defaultProperties: {
			brightness: 0,
			contrast: 0,
		},
		controls: {
			brightness: {
				label: "Brightness",
				type: "number",
				min: -1,
				max: 1,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
			contrast: {
				label: "Contrast",
				type: "number",
				min: -1,
				max: 1,
				step: 0.01,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties?: Record<string, unknown>) {
		super(BrightnessContrastEffect, properties);
	}
}
