import RenderBackend from "./RenderBackend";

const VIDEO_RENDERING = -1;

/**
 * Adapter around the existing Stage + Composer imperative pipeline.
 */
export default class LegacyBackend extends RenderBackend {
	constructor(stage) {
		super();
		this.stage = stage;
		this.initialized = false;
		this.pendingProperties = {};
	}

	init({ canvas, width, height, backgroundColor }) {
		this.stage.init(canvas);
		this.initialized = true;

		const properties = {
			...this.pendingProperties,
		};

		if (width !== undefined) {
			properties.width = width;
		}

		if (height !== undefined) {
			properties.height = height;
		}

		if (backgroundColor !== undefined) {
			properties.backgroundColor = backgroundColor;
		}

		this.pendingProperties = {};

		this.stage.update(properties);

		return true;
	}

	update(properties) {
		if (!this.initialized) {
			Object.assign(this.pendingProperties, properties);
			Object.assign(this.stage.properties, properties);

			return true;
		}

		return this.stage.update(properties);
	}

	render(frameData) {
		this.stage.render(frameData);
	}

	async renderExportFrame({
		frame,
		fps,
		getAudioSample,
		analyzer,
		getFrameData,
	}) {
		analyzer.process(getAudioSample(frame / fps));

		const frameData = getFrameData(VIDEO_RENDERING);
		frameData.delta = 1000 / fps;

		this.render(frameData);

		return this.getPixels();
	}

	getSize() {
		return this.stage.getSize();
	}

	getPixels() {
		return this.stage.getPixels();
	}

	getImage(format) {
		return this.stage.getImage(format);
	}

	dispose() {
		this.initialized = false;
		this.pendingProperties = {};
	}
}
