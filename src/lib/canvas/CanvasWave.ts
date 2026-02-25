import Entity from "@/lib/core/Entity";
import { drawPath } from "@/lib/drawing/bezierSpline";
import { resetCanvas, setColor } from "@/lib/utils/canvas";

export default class CanvasWave extends Entity {
	[key: string]: any;
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

	constructor(properties, canvas) {
		super("CanvasWave", { ...CanvasWave.defaultProperties, ...properties });

		this.canvas = canvas;
		this.context = this.canvas.getContext("2d");
	}

	render(points, smooth) {
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
		} = this.properties;

		// Reset canvas
		resetCanvas(canvas, width, height);

		// Canvas setup
		context.lineWidth = lineWidth;
		context.strokeStyle = strokeColor;
		setColor(context, fillColor, 0, 0, 0, height);

		// Normalize points
		for (let i = 0; i < points.length; i += 2) {
			points[i + 1] = height - points[i + 1] * height;
		}

		// Taper edges
		if (taper) {
			points[1] = midpoint;
			points[points.length - 1] = midpoint;
		}

		// Draw wave
		if (smooth) {
			context.beginPath();

			// Draw bezier spline
			drawPath(context, points);

			if (stroke) {
				context.stroke();
			}

			if (fill) {
				context.lineTo(width, midpoint);
				context.lineTo(0, midpoint);
				context.closePath();
				context.fill();
			}
		} else {
			context.beginPath();

			if (fill) {
				context.moveTo(0, midpoint);
			}

			for (let i = 0; i < points.length; i += 2) {
				context.lineTo(points[i], points[i + 1]);
			}

			if (stroke) {
				context.stroke();
			}

			if (fill) {
				context.lineTo(width, midpoint);
				context.closePath();
				context.fill();
			}
		}
	}
}
