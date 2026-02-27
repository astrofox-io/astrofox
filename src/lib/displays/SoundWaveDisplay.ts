// @ts-nocheck
import WaveParser from "@/lib/audio/WaveParser";
import CanvasWave from "@/lib/canvas/CanvasWave";
import Display from "@/lib/core/Display";
import { stageHeight, stageWidth } from "@/lib/utils/controls";
import { DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_WIDTH } from "@/lib/view/constants";

export default class SoundWaveDisplay extends Display {
	[key: string]: any;
	static config = {
		name: "SoundWaveDisplay",
		description: "Displays a sound wave.",
		type: "display",
		label: "Sound Wave",
		defaultProperties: {
			stroke: true,
			strokeColor: "#FFFFFF",
			fill: false,
			fillColor: "#FFFFFF",
			taper: false,
			width: DEFAULT_CANVAS_WIDTH,
			height: DEFAULT_CANVAS_HEIGHT / 2,
			midpoint: DEFAULT_CANVAS_HEIGHT / 4,
			lineWidth: 1.0,
			wavelength: 0,
			smoothingTimeConstant: 0,
			x: 0,
			y: 0,
			rotation: 0,
			opacity: 1.0,
		},
		controls: {
			lineWidth: {
				label: "Line Width",
				type: "number",
				min: 1,
				max: 10,
				withRange: true,
			},
			wavelength: {
				label: "Wavelength",
				type: "number",
				min: 0,
				max: 1.0,
				step: 0.01,
				withRange: true,
			},
			smoothingTimeConstant: {
				label: "Smoothing",
				type: "number",
				min: 0,
				max: 0.99,
				step: 0.01,
				withRange: true,
			},
			stroke: {
				label: "Stroke",
				type: "toggle",
			},
			strokeColor: {
				label: "Stroke Color",
				type: "color",
			},
			fill: {
				label: "Fill",
				type: "toggle",
			},
			fillColor: {
				label: "Fill Color",
				type: "color",
			},
			taper: {
				label: "Taper Edges",
				type: "toggle",
			},
			width: {
				label: "Width",
				type: "number",
				min: 1,
				max: stageWidth((n) => n * 2),
				withRange: true,
			},
			height: {
				label: "Height",
				type: "number",
				min: 1,
				max: stageHeight((n) => n * 2),
				withRange: true,
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
		super(SoundWaveDisplay, properties);

		const canvas = new OffscreenCanvas(1, 1);
		this.wave = new CanvasWave(this.properties, canvas);
		this.parser = new WaveParser();
	}

	update(properties) {
		const changed = super.update(properties);

		if (changed) {
			const { height } = properties;

			if (height !== undefined) {
				properties.midpoint = height / 2;
			}

			this.wave.update(properties);
			this.parser.update(properties);
		}

		return changed;
	}
}
