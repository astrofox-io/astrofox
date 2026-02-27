import Effect from "@/lib/core/Effect";
import { property, stageHeight, stageWidth } from "@/lib/utils/controls";

const blurOptions = ["Box", "Circular", "Gaussian", "Triangle", "Zoom"];

const showZoomOption = property("type", (value) => value !== "Zoom");
const showLensOption = property("type", (value) => value !== "Lens");

export default class BlurEffect extends Effect {
	[key: string]: any;
	static config = {
		name: "BlurEffect",
		description: "Blur effect.",
		type: "effect",
		label: "Blur",
		defaultProperties: {
			type: "Gaussian",
			amount: 0.3,
			x: 0,
			y: 0,
			radius: 10,
			brightness: 0.75,
			angle: 0,
		},
		controls: {
			type: {
				label: "Type",
				type: "select",
				items: blurOptions,
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
			x: {
				label: "X",
				type: "number",
				min: stageWidth((n) => -n / 2),
				max: stageWidth((n) => n / 2),
				hidden: showZoomOption,
				withRange: true,
			},
			y: {
				label: "Y",
				type: "number",
				min: stageHeight((n) => -n / 2),
				max: stageHeight((n) => n / 2),
				hidden: showZoomOption,
				withRange: true,
			},
			radius: {
				label: "Radius",
				type: "number",
				min: 0,
				max: 50,
				hidden: showLensOption,
				withRange: true,
			},
			brightness: {
				label: "Brightness",
				type: "number",
				min: -1,
				max: 1,
				step: 0.01,
				hidden: showLensOption,
				withRange: true,
			},
			angle: {
				label: "Angle",
				type: "number",
				min: -180,
				max: 180,
				hidden: showLensOption,
				withRange: true,
			},
		},
	};

	constructor(properties) {
		super(BlurEffect, properties);
	}
}
