// @ts-nocheck
import { Color } from "three";
import BlendShader from "./BlendShader";
import CopyShader from "./CopyShader";
import ShaderPass from "./ShaderPass";
import blendModes from "./blendModes";
import { createRenderTarget } from "./common";

export default class StageComposer {
	constructor(renderer, width, height) {
		this.renderer = renderer;
		this.width = Math.max(1, Math.round(width || 1));
		this.height = Math.max(1, Math.round(height || 1));
		this.blendPass = new ShaderPass(BlendShader);
		this.blendPass.material.transparent = true;
		this.copyPass = new ShaderPass(CopyShader);
		this.copyPass.material.transparent = true;
		this.copyPass.renderToScreen = true;
		this.inputBuffer = null;
		this.outputBuffer = null;
		this.dataBuffer = new Uint8Array(this.width * this.height * 4);

		this.setRenderer(renderer);
	}

	setRenderer(renderer) {
		this.renderer = renderer;
		if (!renderer) {
			return;
		}

		this.renderer.autoClear = false;

		if (!this.inputBuffer || !this.outputBuffer) {
			this.inputBuffer = createRenderTarget(this.width, this.height);
			this.outputBuffer = createRenderTarget(this.width, this.height);
		}
	}

	setSize(width, height) {
		this.width = Math.max(1, Math.round(width || 1));
		this.height = Math.max(1, Math.round(height || 1));

		if (!this.inputBuffer || !this.outputBuffer) {
			return;
		}

		this.inputBuffer.setSize(this.width, this.height);
		this.outputBuffer.setSize(this.width, this.height);
		this.dataBuffer = new Uint8Array(this.width * this.height * 4);
	}

	dispose() {
		this.inputBuffer?.dispose();
		this.outputBuffer?.dispose();
		this.blendPass?.material?.dispose?.();
		this.copyPass?.material?.dispose?.();
	}

	swapBuffers() {
		const tmp = this.inputBuffer;
		this.inputBuffer = this.outputBuffer;
		this.outputBuffer = tmp;
	}

	clear(color, alpha = 1) {
		if (!this.renderer || !this.inputBuffer || !this.outputBuffer) {
			return;
		}

		const clearColor = new Color();
		this.renderer.getClearColor(clearColor);
		const clearAlpha = this.renderer.getClearAlpha();

		if (color !== undefined && color !== null) {
			this.renderer.setClearColor(color, alpha);
		}

		this.renderer.setRenderTarget(this.inputBuffer);
		this.renderer.clear(true, true, true);
		this.renderer.setRenderTarget(this.outputBuffer);
		this.renderer.clear(true, true, true);
		this.renderer.setRenderTarget(null);

		if (color !== undefined && color !== null) {
			this.renderer.setClearColor(clearColor, clearAlpha);
		}
	}

	blendTexture(texture, properties = {}) {
		if (!texture || !this.renderer || !this.inputBuffer || !this.outputBuffer) {
			return;
		}

		this.blendPass.setUniforms({
			baseBuffer: this.inputBuffer.texture,
			blendBuffer: texture,
			mode: blendModes[properties.blendMode] ?? blendModes.Normal,
			alpha: 1,
			opacity: Number(properties.opacity ?? 1),
			mask: properties.mask ? 1 : 0,
			inverse: properties.inverse ? 1 : 0,
		});

		this.blendPass.render(this.renderer, this.inputBuffer, this.outputBuffer);
		this.swapBuffers();
	}

	renderToScreen() {
		if (!this.renderer || !this.inputBuffer || !this.outputBuffer) {
			return;
		}

		this.copyPass.setUniforms({
			inputTexture: this.inputBuffer.texture,
			opacity: 1,
			alpha: 0,
		});
		this.copyPass.render(this.renderer, this.inputBuffer, this.outputBuffer);
	}

	composeSceneLayers(sceneLayers, backgroundColor) {
		this.clear(backgroundColor, 1);

		for (const layer of sceneLayers) {
			this.blendTexture(layer.texture, layer.properties);
		}

		this.renderToScreen();
	}

	getPixels() {
		if (!this.renderer || !this.inputBuffer) {
			return new Uint8Array(this.width * this.height * 4);
		}

		this.renderer.readRenderTargetPixels(
			this.inputBuffer,
			0,
			0,
			this.width,
			this.height,
			this.dataBuffer,
		);

		return this.dataBuffer;
	}
}
