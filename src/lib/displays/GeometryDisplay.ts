// @ts-nocheck
import FFTParser from "@/lib/audio/FFTParser";
import Display from "@/lib/core/Display";

const shapeOptions = [
	"Box",
	"Sphere",
	"Dodecahedron",
	"Icosahedron",
	"Octahedron",
	"Tetrahedron",
	"Torus",
	"Torus Knot",
];

const materialOptions = [
	"Basic",
	"Lambert",
	"Normal",
	"Phong",
	"Physical",
	"Points",
	"Standard",
];

const shadingOptions = ["Smooth", "Flat"];

export default class GeometryDisplay extends Display {
	[key: string]: any;
	static config = {
		name: "GeometryDisplay",
		description: "Displays 3D geometry.",
		type: "display",
		label: "Geometry (3D)",
		defaultProperties: {
			shape: "Box",
			material: "Standard",
			shading: "Smooth",
			color: "#FFFFFF",
			wireframe: false,
			edges: false,
			edgeColor: "#FFFFFF",
			x: 0,
			y: 0,
			z: 0,
			opacity: 1.0,
			startX: 0,
			startY: 0,
			startZ: 0,
			seed: 0,
			lightIntensity: 1.0,
			lightDistance: 500,
			cameraZoom: 250,
		},
		controls: {
			shape: {
				label: "Shape",
				type: "select",
				items: shapeOptions,
			},
			material: {
				label: "Material",
				type: "select",
				items: materialOptions,
			},
			shading: {
				label: "Shading",
				type: "select",
				items: shadingOptions,
			},
			color: {
				label: "Color",
				type: "color",
			},
			wireframe: {
				label: "Wireframe",
				type: "toggle",
			},
			edges: {
				label: "Edges",
				type: "toggle",
			},
			edgeColor: {
				label: "Edge Color",
				type: "color",
			},
			x: {
				label: "X",
				type: "number",
				min: -500,
				max: 500,
				withRange: true,
			},
			y: {
				label: "Y",
				type: "number",
				min: -500,
				max: 500,
				withRange: true,
			},
			z: {
				label: "Z",
				type: "number",
				min: -1000,
				max: 1000,
				withRange: true,
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
		super(GeometryDisplay, properties);

		this.parser = new FFTParser();
	}

	update(properties) {
		const changed = super.update(properties);

		if (changed) {
			this.parser.update(properties);
		}

		return changed;
	}
}
