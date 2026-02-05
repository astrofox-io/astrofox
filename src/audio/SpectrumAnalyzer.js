import Entity from "core/Entity";
import fft from "fourier-transform";
import { downmix } from "utils/audio";
import { mag2db, normalize } from "utils/math";
import { FFT_SIZE } from "view/constants";
import blackman from "window-function/blackman";
import { updateExistingProps } from "../utils/object";

export default class SpectrumAnalyzer extends Entity {
	static defaultProperties = {
		fftSize: FFT_SIZE,
		minDecibels: -100,
		maxDecibels: 0,
		smoothingTimeConstant: 0,
	};

	constructor(context, properties) {
		super("SpectrumAnalyzer", {
			...SpectrumAnalyzer.defaultProperties,
			...properties,
		});

		this.audioContext = context;

		this.analyzer = Object.assign(context.createAnalyser(), this.properties);

		this.init();
	}

	update(properties) {
		const changed = super.update(properties);

		const { fftSize } = properties;

		if (changed) {
			updateExistingProps(this.analyzer, properties);

			if (fftSize !== undefined) {
				this.init();
			}
		}

		return changed;
	}

	init() {
		const {
			audioContext,
			analyzer: { fftSize },
		} = this;

		this.fft = new Uint8Array(fftSize / 2);
		this.td = new Float32Array(fftSize);

		this.blackmanTable = new Float32Array(fftSize);

		for (let i = 0; i < fftSize; i++) {
			this.blackmanTable[i] = blackman(i, fftSize);
		}

		this.buffer = audioContext.createBuffer(
			1,
			fftSize,
			audioContext.sampleRate,
		);

		this.smoothing = new Float32Array(fftSize / 2);
	}

	get gain() {
		const { fft } = this;
		return fft.reduce((a, b) => a + b) / fft.length;
	}

	getFloatTimeDomainData(array) {
		array.set(this.buffer.getChannelData(0));
	}

	getFloatFrequencyData(array) {
		const { fftSize, smoothingTimeConstant } = this.analyzer;
		const waveform = new Float32Array(fftSize);

		// Get waveform from buffer
		this.getFloatTimeDomainData(waveform);

		// Apply blackman function
		for (let i = 0; i < fftSize; i++) {
			waveform[i] = waveform[i] * this.blackmanTable[i] || 0;
		}

		// Get FFT
		const spectrum = fft(waveform);

		for (let i = 0, n = fftSize / 2; i < n; i++) {
			let db = mag2db(spectrum[i]);

			if (smoothingTimeConstant) {
				this.smoothing[i] =
					spectrum[i] * smoothingTimeConstant * this.smoothing[i] +
					(1 - smoothingTimeConstant);

				db = mag2db(this.smoothing[i]);
			}

			array[i] = Number.isFinite(db) ? db : Number.NEGATIVE_INFINITY;
		}
	}

	getByteTimeDomainData(array) {
		const { fftSize } = this.analyzer;
		const waveform = new Float32Array(fftSize);

		this.getFloatTimeDomainData(waveform);

		for (let i = 0, n = waveform.length; i < n; i++) {
			array[i] = Math.round(normalize(waveform[i], -1, 1) * 255);
		}
	}

	getByteFrequencyData(array) {
		const { minDecibels, maxDecibels, frequencyBinCount } = this.analyzer;
		const spectrum = new Float32Array(frequencyBinCount);

		this.getFloatFrequencyData(spectrum);

		for (let i = 0, n = spectrum.length; i < n; i++) {
			array[i] = Math.round(
				normalize(spectrum[i], minDecibels, maxDecibels) * 255,
			);
		}
	}

	process(input) {
		if (input) {
			const data = downmix(input);
			this.buffer.copyToChannel(data, 0);
		}

		this.updateTimeData(input);
		this.updateFrequencyData(input);
	}

	updateFrequencyData(input) {
		if (input) {
			this.getByteFrequencyData(this.fft);
		} else {
			this.analyzer.getByteFrequencyData(this.fft);
		}
	}

	updateTimeData(input) {
		if (input) {
			this.getFloatTimeDomainData(this.td);
		} else {
			this.analyzer.getFloatTimeDomainData(this.td);
		}
	}

	reset() {
		this.fft.fill(0);
		this.td.fill(0);
		this.smoothing.fill(0);
	}
}
