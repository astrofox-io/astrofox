import Effect from "@/lib/core/Effect";
import { stageWidth } from "@/lib/utils/controls";

export default class RGBShiftEffect extends Effect {
	[key: string]: any;
	static config = {
		name: "RGBShiftEffect",
		description: "RGB shift effect.",
		type: "effect",
		label: "RGB Shift",
		defaultProperties: {
			offset: 5,
			angle: 45,
		},
		controls: {
			offset: {
				label: "Offset",
				type: "number",
				min: 0,
				max: stageWidth(),
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
		super(RGBShiftEffect, properties);
	}
}
