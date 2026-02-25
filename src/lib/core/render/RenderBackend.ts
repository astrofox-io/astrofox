/**
 * @typedef {object} RenderFrameData
 * @property {number} id
 * @property {number} delta
 * @property {Float32Array | null} fft
 * @property {Float32Array | null} td
 * @property {number} volume
 * @property {number} gain
 * @property {boolean} audioPlaying
 * @property {boolean} hasUpdate
 * @property {Record<string, number>} reactors
 */

/**
 * Render backend contract used by the app-level renderer loop.
 * Implementations may be legacy imperative Three.js or @react-three/fiber.
 */
export default class RenderBackend {
	[key: string]: any;
	/**
	 * Called once after the stage viewport is mounted.
	 * @param {{ canvas: HTMLCanvasElement, width: number, height: number, backgroundColor: string }} params
	 */
	init(params) {
		throw new Error(
			`RenderBackend.init is not implemented for ${this.constructor.name}`,
		);
	}

	/**
	 * Apply stage property updates (size, background color, zoom metadata, etc).
	 * @param {Record<string, unknown>} properties
	 * @returns {boolean}
	 */
	update(properties) {
		throw new Error(
			`RenderBackend.update is not implemented for ${this.constructor.name}`,
		);
	}

	/**
	 * Render one interactive frame.
	 * @param {RenderFrameData} frameData
	 */
	render(frameData) {
		throw new Error(
			`RenderBackend.render is not implemented for ${this.constructor.name}`,
		);
	}

	/**
	 * Render one deterministic export frame and return RGBA pixels.
	 * @param {{ frame: number, fps: number, getAudioSample: (time: number) => Float32Array, analyzer: { process: (sample: Float32Array) => void } }} params
	 * @returns {Promise<Uint8Array>}
	 */
	async renderExportFrame(params) {
		throw new Error(
			`RenderBackend.renderExportFrame is not implemented for ${this.constructor.name}`,
		);
	}

	/**
	 * Get current stage size in pixels.
	 * @returns {{ width: number, height: number }}
	 */
	getSize() {
		throw new Error(
			`RenderBackend.getSize is not implemented for ${this.constructor.name}`,
		);
	}

	/**
	 * Read current output RGBA pixels.
	 * @returns {Uint8Array}
	 */
	getPixels() {
		throw new Error(
			`RenderBackend.getPixels is not implemented for ${this.constructor.name}`,
		);
	}

	/**
	 * Encode current output as an image buffer.
	 * @param {string} format
	 * @returns {Uint8Array}
	 */
	getImage(format = "image/png") {
		throw new Error(
			`RenderBackend.getImage is not implemented for ${this.constructor.name}`,
		);
	}

	/**
	 * Cleanup resources.
	 */
	dispose() {}
}
