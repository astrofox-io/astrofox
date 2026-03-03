import Effect from "@/lib/core/Effect";

export default class ColorAverageEffect extends Effect {
	static config = {
		name: "ColorAverageEffect",
		description: "Color average effect.",
		type: "effect",
		label: "Color Average",
		defaultProperties: {},
		controls: {},
	};

	constructor(properties?: Record<string, unknown>) {
		super(ColorAverageEffect, properties);
	}
}
