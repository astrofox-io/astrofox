import Entity from "@/lib/core/Entity";
import { resetCanvas } from "@/lib/utils/canvas";
import { deg2rad } from "@/lib/utils/math";

const TRIANGLE_ANGLE = (2 * Math.PI) / 3;
const HEXAGON_ANGLE = (2 * Math.PI) / 6;

export default class CanvasShape extends Entity {
	static defaultProperties = {
		shape: "Circle",
		width: 100,
		height: 100,
		fill: true,
		color: "#FFFFFF",
		stroke: false,
		strokeColor: "#FFFFFF",
		strokeWidth: 0,
	};

	constructor(properties, canvas) {
		super("CanvasShape", { ...CanvasShape.defaultProperties, ...properties });

		const { width, height, strokeWidth } = this.properties;

		this.canvas = canvas;
		this.canvas.width = width + strokeWidth;
		this.canvas.height = height + strokeWidth;

		this.context = this.canvas.getContext("2d");
	}

	render() {
		const { canvas, context } = this;
		const {
			shape,
			width,
			height,
			fill,
			color,
			stroke,
			strokeColor,
			strokeWidth,
		} = this.properties;
		const w = width + strokeWidth * 2;
		const h = height + strokeWidth * 2;
		const x = w / 2;
		const y = h / 2;
		const r = w > 0 ? w / 2 : 1;

		// Reset canvas
		resetCanvas(canvas, w, h);

		// Draw
		context.fillStyle = color;
		context.strokeStyle = strokeColor;
		context.lineWidth = strokeWidth;

		if (shape === "Circle") {
			context.beginPath();
			context.arc(x, y, r, 0, 2 * Math.PI);
		} else if (shape === "Triangle") {
			const points = [];

			for (let i = 0; i < 3; i++) {
				points.push({
					x: x + r * Math.cos(i * TRIANGLE_ANGLE - deg2rad(210)),
					y: y + r * Math.sin(i * TRIANGLE_ANGLE - deg2rad(210)),
				});
			}

			context.beginPath();
			context.moveTo(points[0].x, points[0].y);
			for (let i = 1; i < points.length; i++) {
				context.lineTo(points[i].x, points[i].y);
			}
			context.closePath();
		} else if (shape === "Hexagon") {
			const hexPoints = [];

			for (let i = 0; i < 6; i++) {
				hexPoints.push({
					x: x + r * Math.cos(i * HEXAGON_ANGLE),
					y: y + r * Math.sin(i * HEXAGON_ANGLE),
				});
			}

			context.beginPath();
			context.moveTo(hexPoints[0].x, hexPoints[0].y);
			for (let i = 1; i < hexPoints.length; i++) {
				context.lineTo(hexPoints[i].x, hexPoints[i].y);
			}
			context.closePath();
		} else {
			context.beginPath();
			context.moveTo(0, 0);
			context.lineTo(w, 0);
			context.lineTo(w, h);
			context.lineTo(0, h);
			context.closePath();
		}

		if (fill) {
			context.fill();
		}

		if (stroke && strokeWidth > 0) {
			context.save();
			context.clip();
			context.stroke();
			context.restore();
		}
	}
}
