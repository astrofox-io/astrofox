import Entity from "@/lib/core/Entity";
import { db2mag, floor, normalize } from "@/lib/utils/math";
import { FFT_SIZE, SAMPLE_RATE } from "@/lib/view/constants";

export default class FFTParser extends Entity {
	[key: string]: any;
	static defaultProperties = {
		fftSize: FFT_SIZE,
		sampleRate: SAMPLE_RATE,
		smoothingTimeConstant: 0.5,
		minDecibels: -100,
		maxDecibels: 0,
		minFrequency: 0,
		maxFrequency: SAMPLE_RATE / 2,
	};

	constructor(properties) {
		super("FFTParser", { ...FFTParser.defaultProperties, ...properties });

		this.init();
	}

	init() {
		const { fftSize, sampleRate, minFrequency, maxFrequency } = this.properties;

		const range = sampleRate / fftSize;

		this.startBin = floor(minFrequency / range);
		this.endBin = floor(maxFrequency / range);
		this.totalBins = this.endBin - this.startBin;
	}

	update(properties) {
		const changed = super.update(properties);

		if (changed) {
			this.init();
		}

		return changed;
	}

	getValue(fft) {
		const { minDecibels, maxDecibels } = this.properties;
		const db = minDecibels * (1 - fft / 256);

		return normalize(db2mag(db), db2mag(minDecibels), db2mag(maxDecibels));
	}

	parseFFT(fft, bins) {
		let { output, buffer } = this;
		const { startBin, endBin, totalBins } = this;
		const { smoothingTimeConstant } = this.properties;
		const size = bins || totalBins;

		// Resize data arrays
		if (output?.length !== size) {
			output = new Float32Array(size);
			buffer = new Float32Array(size);
			this.output = output;
			this.buffer = buffer;
		}

		// Straight conversion
		if (size === totalBins) {
			for (let i = startBin, k = 0; i < endBin; i += 1, k += 1) {
				output[k] = this.getValue(fft[i]);
			}
		}
		// Compress data
		else if (size < totalBins) {
			const step = totalBins / size;

			for (let i = startBin, k = 0; i < endBin; i += 1, k += 1) {
				const start = ~~(i * step);
				const end = ~~(start + step);
				let max = 0;

				// Find max value within range
				for (let j = start, n = ~~(step / 10) || 1; j < end; j += n) {
					const val = fft[j];

					if (val > max) {
						max = val;
					} else if (-val > max) {
						max = -val;
					}
				}

				output[k] = this.getValue(max);
			}
		}
		// Expand data
		else if (size > totalBins) {
			const step = size / totalBins;

			for (let i = startBin, j = 0; i < endBin; i += 1, j += 1) {
				const val = this.getValue(fft[i]);
				const start = ~~(j * step);
				const end = start + step;

				for (let k = start; k < end; k += 1) {
					output[k] = val;
				}
			}
		}

		// Apply smoothing
		if (smoothingTimeConstant > 0) {
			for (let i = 0; i < size; i += 1) {
				output[i] =
					buffer[i] * smoothingTimeConstant +
					output[i] * (1.0 - smoothingTimeConstant);
				buffer[i] = output[i];
			}
		}

		return output;
	}
}
