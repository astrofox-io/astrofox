// @ts-nocheck
import FFTParser from "@/lib/audio/FFTParser";
import CanvasWave from "@/lib/canvas/CanvasWave";
import Display from "@/lib/core/Display";
import { property, stageHeight, stageWidth } from "@/lib/utils/controls";
import { FFT_SIZE, SAMPLE_RATE } from "@/lib/view/constants";

export default class WaveSpectrumDisplay extends Display {
	[key: string]: any;
	static config = {
		name: "WaveSpectrumDisplay",
		description: "Displays an audio wave spectrum.",
		type: "display",
		label: "Wave Spectrum",
		defaultProperties: {
			width: 770,
			height: 240,
			midpoint: 240,
			x: 0,
			y: 0,
			stroke: true,
			strokeColor: "#FFFFFF",
			fill: true,
			fillColor: ["#C0C0C0", "#FFFFFF"],
			taper: true,
			rotation: 0,
			opacity: 1.0,
			fftSize: FFT_SIZE,
			sampleRate: SAMPLE_RATE,
			smoothingTimeConstant: 0.5,
			minDecibels: -100,
			maxDecibels: -14,
			minFrequency: 0,
			maxFrequency: 2000,
			normalize: true,
		},

		controls: {
			maxDecibels: {
				label: "Max dB",
				type: "number",
				min: -40,
				max: 0,
				step: 1,
				withRange: true,
			},
			minFrequency: {
				label: "Min Frequency",
				type: "number",
				min: 0,
				max: property("maxFrequency"),
				step: 10,
				withRange: true,
			},
			maxFrequency: {
				label: "Max Frequency",
				type: "number",
				min: property("minFrequency"),
				max: 22000,
				step: 10,
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
			width: {
				label: "Width",
				type: "number",
				min: 1,
				max: stageWidth(),
				withRange: true,
			},
			height: {
				label: "Height",
				type: "number",
				min: 1,
				max: stageHeight(),
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
				type: "colorrange",
			},
			taper: {
				label: "Taper Edges",
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
				max: stageWidth(),
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
		super(WaveSpectrumDisplay, properties);

		const canvas = new OffscreenCanvas(1, 1);
		this.wave = new CanvasWave(this.properties, canvas);
		this.parser = new FFTParser(this.properties);
	}

	update(properties) {
		const changed = super.update(properties);

		if (changed) {
			const { height } = properties;

			if (height !== undefined) {
				properties.midpoint = height;
			}

			this.wave.update(properties);
			this.parser.update(properties);
		}

		return changed;
	}
}
