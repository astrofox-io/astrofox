import { clamp, round } from "@/lib/utils/math";

export default class Clock {
	time = 0;
	elapsedTime = 0;
	frames = 0;
	delta = 0;
	startTime: number;

	constructor() {
		this.startTime = Date.now();
	}

	update() {
		const time = Date.now();

		if (this.time) {
			const delta = time - this.time;

			this.elapsedTime += delta;
			this.delta = delta;
		}

		this.time = time;
		this.frames += 1;
	}

	getFPS() {
		const { time, frames, elapsedTime } = this;

		if (!time) {
			return 0;
		}

		const seconds = elapsedTime / 1000;
		const fps = clamp(round(frames / seconds), 0, 60);

		this.frames = 0;
		this.elapsedTime = 0;

		return fps;
	}
}
