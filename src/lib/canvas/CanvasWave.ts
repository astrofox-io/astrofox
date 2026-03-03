import Entity from "@/lib/core/Entity";
import { drawPath } from "@/lib/drawing/bezierSpline";
import type { CanvasContext, CanvasElement } from "@/lib/types";
import { resetCanvas, setColor } from "@/lib/utils/canvas";

export default class CanvasWave extends Entity {
	canvas: CanvasElement;
	context: CanvasContext;

	static defaultProperties = {
		stroke: true,
		strokeColor: "#FFFFFF",
		fill: false,
		fillColor: "#FFFFFF",
		taper: false,
		width: 400,
		height: 200,
		midpoint: 100,
		lineWidth: 1.0,
	};

	constructor(properties: Record<string, unknown>, canvas: CanvasElement) {
		super("CanvasWave", { ...CanvasWave.defaultProperties, ...properties });

		this.canvas = canvas;
		this.context = this.canvas.getContext("2d") as CanvasContext;
	}

	render(points: Float32Array, smooth: boolean) {
		const { canvas, context } = this;
		const {
			width,
			height,
			midpoint,
			stroke,
			strokeColor,
			fill,
			fillColor,
			lineWidth,
			taper,
		} = this.properties as Record<string, unknown>;

		// Reset canvas
		resetCanvas(canvas, width as number, height as number);

		// Canvas setup
		context.lineWidth = lineWidth as number;
		context.strokeStyle = strokeColor as string;
		setColor(context, fillColor as string, 0, 0, 0, height as number);

		// Normalize points
		for (let i = 0; i < points.length; i += 2) {
			points[i + 1] = (height as number) - points[i + 1] * (height as number);
		}

		// Taper edges
		if (taper) {
			points[1] = midpoint as number;
			points[points.length - 1] = midpoint as number;
		}

		// Draw wave
		if (smooth) {
			context.beginPath();

			// Draw bezier spline
			drawPath(
				context as CanvasRenderingContext2D,
				Array.from(points),
			);

			if (stroke) {
				context.stroke();
			}

			if (fill) {
				context.lineTo(width as number, midpoint as number);
				context.lineTo(0, midpoint as number);
				context.closePath();
				context.fill();
			}
		} else {
			context.beginPath();

			if (fill) {
				context.moveTo(0, midpoint as number);
			}

			for (let i = 0; i < points.length; i += 2) {
				context.lineTo(points[i], points[i + 1]);
			}

			if (stroke) {
				context.stroke();
			}

			if (fill) {
				context.lineTo(width as number, midpoint as number);
				context.closePath();
				context.fill();
			}
		}
	}
}
