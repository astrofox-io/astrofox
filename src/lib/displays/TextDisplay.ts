// @ts-nocheck
import CanvasText from "@/lib/canvas/CanvasText";
import fonts from "@/lib/config/fonts.json";
import Display from "@/lib/core/Display";
import { stageHeight, stageWidth } from "@/lib/utils/controls";
import { resolveFontFamily } from "@/lib/view/fontFamilies";

const fontOptions = fonts.map((item) => ({
	label: item,
	value: item,
	style: { fontFamily: resolveFontFamily(item) },
}));

export default class TextDisplay extends Display {
	[key: string]: any;
	static config = {
		name: "TextDisplay",
		description: "Displays text.",
		type: "display",
		label: "Text",
		defaultProperties: {
			text: "",
			size: 40,
			font: "Roboto",
			italic: false,
			bold: false,
			x: 0,
			y: 0,
			color: "#FFFFFF",
			rotation: 0,
			opacity: 1.0,
		},
		controls: {
			text: {
				label: "Text",
				type: "text",
			},
			size: {
				label: "Size",
				type: "number",
			},
			font: {
				label: "Font",
				type: "select",
				items: fontOptions,
			},
			italic: {
				label: "Italic",
				type: "toggle",
			},
			bold: {
				label: "Bold",
				type: "toggle",
			},
			x: {
				label: "X",
				type: "number",
				min: stageWidth((n) => -n),
				max: stageWidth(),
				withRange: true,
			},
			y: {
				label: "Y",
				type: "number",
				min: stageHeight((n) => -n),
				max: stageHeight(),
				withRange: true,
			},
			color: {
				label: "Color",
				type: "color",
			},
			rotation: {
				label: "Rotation",
				type: "number",
				min: 0,
				max: 360,
				withRange: true,
				withReactor: true,
			},
			opacity: {
				label: "Opacity",
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
		super(TextDisplay, properties);

		const canvas = new OffscreenCanvas(1, 1);
		this.text = new CanvasText(this.properties, canvas);
	}

	update(properties) {
		if (this.text.update(properties)) {
			this.text.render();
		}

		return super.update(properties);
	}
}
