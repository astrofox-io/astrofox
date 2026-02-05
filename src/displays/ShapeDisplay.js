import CanvasShape from "canvas/CanvasShape";
import CanvasDisplay from "core/CanvasDisplay";
import { maxSize, property, stageHeight, stageWidth } from "utils/controls";

const shapeOptions = ["Circle", "Triangle", "Square", "Rectangle", "Hexagon"];

const isRectangle = (display) => display.properties.shape === "Rectangle";

export default class ShapeDisplay extends CanvasDisplay {
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
				label: (display) => (isRectangle(display) ? "Width" : "Size"),
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
				hidden: (display) => !isRectangle(display),
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

	constructor(properties) {
		super(ShapeDisplay, properties);
	}

	addToScene() {
		this.shape = new CanvasShape(this.properties, this.canvas);
		this.shape.render();
	}

	update(properties) {
		const { shape, width } = properties;

		if (width !== undefined && this.properties.shape !== "Rectangle") {
			properties.height = width;
		}

		if (shape !== undefined && shape !== "Rectangle") {
			properties.width = this.properties.width;
			properties.height = properties.width;
		}

		if (this.shape.update(properties)) {
			this.shape.render();
		}

		return super.update(properties);
	}
}
