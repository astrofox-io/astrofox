import Entity from "@/lib/core/Entity";
import type { CanvasContext, CanvasElement } from "@/lib/types";
import { resetCanvas, setColor } from "@/lib/utils/canvas";

export default class CanvasMeter extends Entity {
	canvas: CanvasElement;
	context: CanvasContext;

	static defaultProperties = {
		width: 100,
		height: 50,
		color: "#FFFFFF",
		origin: "left",
	};

	constructor(properties: Record<string, unknown>, canvas: CanvasElement) {
		super("CanvasMeter", { ...CanvasMeter.defaultProperties, ...properties });

		this.canvas = canvas;
		this.context = this.canvas.getContext("2d") as CanvasContext;
	}

	render(value: number) {
		const { canvas, context } = this;

		const { height, width, color, origin } = this.properties as Record<
			string,
			unknown
		>;

		// Reset canvas
		resetCanvas(canvas, width as number, height as number);

		// Canvas setup
		setColor(context, color as string, 0, 0, 0, height as number);

		switch (origin) {
			case "left":
				context.fillRect(0, 0, ~~(value * (width as number)), height as number);
				break;
			case "bottom":
				context.fillRect(
					0,
					height as number,
					width as number,
					~~(-value * (height as number)),
				);
				break;
			case "right":
				context.fillRect(
					width as number,
					0,
					~~(-value * (width as number)),
					height as number,
				);
				break;
			case "top":
				context.fillRect(
					0,
					0,
					width as number,
					~~(-value * (height as number)),
				);
				break;
		}
	}
}
