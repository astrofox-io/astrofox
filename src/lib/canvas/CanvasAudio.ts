import CanvasBars from "@/lib/canvas/CanvasBars";
import Entity from "@/lib/core/Entity";
import type { CanvasElement } from "@/lib/types";

export default class CanvasAudio extends Entity {
	bars: CanvasBars;
	results: Float32Array;

	static defaultProperties = {
		bars: 100,
	};

	constructor(properties: Record<string, unknown>, canvas: CanvasElement) {
		super("CanvasAudio", { ...CanvasAudio.defaultProperties, ...properties });

		this.bars = new CanvasBars(properties, canvas);
		this.results = new Float32Array(
			(this.properties as Record<string, number>).bars,
		);
	}

	getCanvas() {
		return this.bars.canvas;
	}

	parseAudioBuffer(buffer: AudioBuffer): Float32Array {
		const { results } = this;
		const size = buffer.length / results.length;
		const step = ~~(size / 10) || 1;

		// Process each channel
		for (let c = 0; c < buffer.numberOfChannels; c += 1) {
			const data = buffer.getChannelData(c);

			// Process each bar
			for (let i = 0; i < results.length; i += 1) {
				const start = ~~(i * size);
				const end = ~~(start + size);
				let max = 0;

				// Find max value within range
				for (let j = start; j < end; j += step) {
					const val = data[j];
					if (val > max) {
						max = val;
					} else if (-val > max) {
						max = -val;
					}
				}

				if (c === 0 || max > results[i]) {
					results[i] = max;
				}
			}
		}

		return results;
	}

	render(data: AudioBuffer) {
		this.bars.render(this.parseAudioBuffer(data));
	}
}
