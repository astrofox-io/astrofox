import FFTParser from "audio/FFTParser";
import CanvasWave from "canvas/CanvasWave";
import CanvasDisplay from "core/CanvasDisplay";
import { property, stageHeight, stageWidth } from "utils/controls";
import { FFT_SIZE, SAMPLE_RATE } from "view/constants";

export default class WaveSpectrumDisplay extends CanvasDisplay {
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

		this.wave = new CanvasWave(this.properties, this.canvas);
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

	getPoints(fft, width) {
		const points = [];

		for (let i = 0, j = 0, k = 0; i < fft.length; i += 1) {
			j = fft[i];

			if (i === 0 || i === fft.length - 1 || k !== j > fft[i - 1] ? 1 : -1) {
				points.push(i * (width / fft.length));
				points.push(j);
			}

			k = j > fft[i - 1] ? 1 : -1;
		}

		points[points.length - 2] = width;

		return points;
	}

	render(scene, data) {
		const {
			wave,
			parser,
			canvas: { width, height },
		} = this;
		const fft = parser.parseFFT(data.fft);

		wave.render(this.getPoints(fft, width), true);

		const origin = {
			x: width / 2,
			y: height,
		};

		scene.renderToCanvas(this.canvas, this.properties, origin);
	}
}
