import CanvasText from "canvas/CanvasText";
import fonts from "config/fonts.json";
import CanvasDisplay from "core/CanvasDisplay";
import { stageHeight, stageWidth } from "utils/controls";

const fontOptions = fonts.map((item) => ({
	label: item,
	value: item,
	style: { fontFamily: item },
}));

export default class TextDisplay extends CanvasDisplay {
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
	}

	addToScene() {
		this.text = new CanvasText(this.properties, this.canvas);
		this.text.render();
	}

	update(properties) {
		if (this.text.update(properties)) {
			this.text.render();
		}

		return super.update(properties);
	}
}
