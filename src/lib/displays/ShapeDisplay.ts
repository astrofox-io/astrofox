import CanvasShape from "@/lib/canvas/CanvasShape";
import Display from "@/lib/core/Display";
import {
	maxSize,
	property,
	stageHeight,
	stageWidth,
} from "@/lib/utils/controls";

const shapeOptions = ["Circle", "Triangle", "Square", "Rectangle", "Hexagon"];

const isRectangle = (display: { properties: Record<string, unknown> }) =>
	display.properties.shape === "Rectangle";

export default class ShapeDisplay extends Display {
	declare shape: CanvasShape;

	static config = {
		name: "ShapeDisplay",
		description: "Displays a shape.",
		type: "display",
		label: "Shape",
		defaultProperties: {
			shape: "Circle",
			size: 100,
			width: 100,
			height: 100,
			x: 0,
			y: 0,
			fill: true,
			color: "#ffffff",
			stroke: false,
			strokeColor: "#ff0000",
			strokeWidth: 5,
			rotation: 0,
			opacity: 1.0,
		},
		controls: {
			shape: {
				label: "Shape",
				type: "select",
				items: shapeOptions,
			},
			width: {
				label: (display: { properties: Record<string, unknown> }) =>
					isRectangle(display) ? "Width" : "Size",
				type: "number",
				min: 1,
				max: maxSize(),
				withRange: true,
				withReactor: true,
			},
			height: {
				label: "Height",
				type: "number",
				min: 1,
				max: maxSize(),
				withRange: true,
				withReactor: true,
				hidden: (display: { properties: Record<string, unknown> }) =>
					!isRectangle(display),
			},
			x: {
				label: "X",
				type: "number",
				min: stageWidth((n: number) => -n),
				max: stageWidth(),
				withRange: true,
			},
			y: {
				label: "Y",
				type: "number",
				min: stageHeight((n: number) => -n),
				max: stageHeight(),
				withRange: true,
			},
			fill: {
				label: "Fill",
				type: "toggle",
			},
			color: {
				label: "Fill Color",
				type: "color",
			},
			stroke: {
				label: "Stroke",
				type: "toggle",
			},
			strokeColor: {
				label: "Stroke Color",
				type: "color",
			},
			strokeWidth: {
				label: "Stroke Width",
				type: "number",
				min: 1,
				max: 100,
				withRange: true,
				withReactor: true,
				hidden: property("stroke", false),
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

	constructor(properties?: Record<string, unknown>) {
		super(ShapeDisplay, properties);

		const canvas = new OffscreenCanvas(1, 1);
		const props = this.properties as Record<string, unknown>;
		this.shape = new CanvasShape(props, canvas);
	}

	update(properties: Record<string, unknown>) {
		const { shape, width } = properties;
		const props = this.properties as Record<string, unknown>;

		if (width !== undefined && props.shape !== "Rectangle") {
			properties.height = width;
		}

		if (shape !== undefined && shape !== "Rectangle") {
			properties.width = props.width;
			properties.height = properties.width;
		}

		if (this.shape.update(properties)) {
			this.shape.render();
		}

		return super.update(properties);
	}
}
