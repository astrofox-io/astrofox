import Effect from "@/lib/core/Effect";

const renderOptions = ["Square", "Hexagon"];

export default class PixelateEffect extends Effect {
	[key: string]: any;
	static config = {
		name: "PixelateEffect",
		description: "Pixelate effect.",
		type: "effect",
		label: "Pixelate",
		defaultProperties: {
			type: "Square",
			size: 10,
		},
		controls: {
			type: {
				label: "Type",
				type: "select",
				items: renderOptions,
			},
			size: {
				label: "Size",
				type: "number",
				min: 2,
				max: 240,
				withRange: true,
				withReactor: true,
			},
		},
	};

	constructor(properties) {
		super(PixelateEffect, properties);
	}
}
