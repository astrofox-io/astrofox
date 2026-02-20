import {
	events,
	analyzer,
	player,
	reactors,
	renderBackend,
} from "@/lib/view/global";
import Clock from "./Clock";

const STOP_RENDERING = 0;
const VIDEO_RENDERING = -1;

export default class Renderer {
	constructor() {
		this.rendering = false;
		this.clock = new Clock();

		// Frame render data
		this.frameData = {
			id: 0,
			delta: 0,
			fft: null,
			td: null,
			volume: 0,
			audioPlaying: false,
			hasUpdate: false,
			reactors: {},
		};

		// Bind context
		this.render = this.render.bind(this);

		// Events
		player.on("playback-change", this.resetAnalyzer);
	}

	resetAnalyzer() {
		const audio = player.getAudio();

		if (audio && !audio.paused) {
			analyzer.reset();
		}
	}

	start() {
		if (!this.rendering) {
			this.time = Date.now();
			this.rendering = true;

			this.resetAnalyzer();
			this.render();
		}
	}

	stop() {
		const { id } = this.frameData;

		if (id) {
			window.cancelAnimationFrame(id);
		}

		this.frameData.id = STOP_RENDERING;
		this.rendering = false;
	}

	getFrameData(id) {
		const {
			frameData,
			clock: { delta },
		} = this;
		const playing = player.isPlaying();

		frameData.id = id;
		frameData.hasUpdate = playing || id === VIDEO_RENDERING;
		frameData.audioPlaying = playing;
		frameData.gain = analyzer.gain;
		frameData.fft = analyzer.fft;
		frameData.td = analyzer.td;
		frameData.reactors = reactors.getResults(frameData);
		frameData.delta = delta;

		return frameData;
	}

	getAudioSample(time) {
		const { fftSize } = analyzer.analyzer;
		const audio = player.getAudio();
		const pos = audio.getBufferPosition(time);
		const start = pos - fftSize / 2;
		const end = pos + fftSize / 2;

		return audio.getAudioSlice(start, end);
	}

	getFPS() {
		return this.clock.getFPS();
	}

	renderFrame(frame, fps) {
		return renderBackend.renderExportFrame({
			frame,
			fps,
			getAudioSample: this.getAudioSample.bind(this),
			analyzer,
			getFrameData: this.getFrameData.bind(this),
		});
	}

	render() {
		const id = window.requestAnimationFrame(this.render);

		this.clock.update();

		if (player.isPlaying()) {
			analyzer.process();
		}

		const data = this.getFrameData(id);

		renderBackend.render(data);

		events.emit("render", data);
	}
}
