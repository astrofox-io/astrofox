import Entity from "@/lib/core/Entity";
import { resetCanvas, setColor } from "@/lib/utils/canvas";

export default class CanvasMeter extends Entity {
	static defaultProperties = {
		width: 100,
		height: 50,
		color: "#FFFFFF",
		origin: "left",
	};

	constructor(properties, canvas) {
		super("CanvasMeter", { ...CanvasMeter.defaultProperties, ...properties });

		this.canvas = canvas;
		this.context = this.canvas.getContext("2d");
	}

	render(value) {
		const { canvas, context } = this;

		const { height, width, color, origin } = this.properties;

		// Reset canvas
		resetCanvas(canvas, width, height);

		// Canvas setup
		setColor(context, color, 0, 0, 0, height);

		switch (origin) {
			case "left":
				context.fillRect(0, 0, ~~(value * width), height);
				break;
			case "bottom":
				context.fillRect(0, height, width, ~~(-value * height));
				break;
			case "right":
				context.fillRect(width, 0, ~~(-value * width), height);
				break;
			case "top":
				context.fillRect(0, 0, width, ~~(-value * height));
				break;
		}
	}
}
