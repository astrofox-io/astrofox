// @ts-nocheck
import { CopyMaterial, GaussianBlurMaterial, Pass } from "postprocessing";
import { SRGBColorSpace, UnsignedByteType, WebGLRenderTarget } from "three";

const BLUR_PASSES = 8;
const MIN_AMOUNT = 0.0001;

export class PPGaussianBlurPass extends Pass {
	constructor({ amount = 0, kernelSize = 9, passes = BLUR_PASSES } = {}) {
		super("PPGaussianBlurPass");

		this.renderTargetA = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.renderTargetA.texture.name = "PPGaussianBlur.Target.A";
		this.renderTargetB = this.renderTargetA.clone();
		this.renderTargetB.texture.name = "PPGaussianBlur.Target.B";

		this.blurMaterial = new GaussianBlurMaterial({ kernelSize });
		this.copyMaterial = new CopyMaterial();

		this.passes = Math.max(1, Number(passes || BLUR_PASSES));
		this.setAmount(amount);
	}

	setAmount(amount = 0) {
		this.amount = Math.max(0, Number(amount || 0));
		this.enabled = this.amount > MIN_AMOUNT;
	}

	render(renderer, inputBuffer, outputBuffer) {
		const scene = this.scene;
		const camera = this.camera;

		if (!inputBuffer?.texture) {
			return;
		}

		// Keep composer chain valid even when blur amount is effectively zero.
		if (!this.enabled) {
			this.copyMaterial.inputBuffer = inputBuffer.texture;
			this.fullscreenMaterial = this.copyMaterial;
			renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
			renderer.render(scene, camera);
			return;
		}

		const { renderTargetA, renderTargetB, blurMaterial, copyMaterial } = this;
		let previousBuffer = inputBuffer;

		// Legacy blur behavior: alternating ping-pong passes with decreasing radius.
		for (let i = 0; i < this.passes; i += 1) {
			const radius = (this.passes - i) * this.amount;
			const buffer = (i & 1) === 0 ? renderTargetA : renderTargetB;

			blurMaterial.scale = radius;
			blurMaterial.direction.set(i % 2 === 0 ? 0 : 1, i % 2 === 0 ? 1 : 0);
			blurMaterial.inputBuffer = previousBuffer.texture;

			this.fullscreenMaterial = blurMaterial;
			renderer.setRenderTarget(buffer);
			renderer.render(scene, camera);
			previousBuffer = buffer;
		}

		copyMaterial.inputBuffer = previousBuffer.texture;
		this.fullscreenMaterial = copyMaterial;
		renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
		renderer.render(scene, camera);
	}

	setSize(width, height) {
		const w = Math.max(1, Math.floor(Number(width || 1)));
		const h = Math.max(1, Math.floor(Number(height || 1)));

		this.renderTargetA.setSize(w, h);
		this.renderTargetB.setSize(w, h);
		this.blurMaterial.setSize(w, h);
	}

	initialize(renderer, alpha, frameBufferType) {
		if (frameBufferType === undefined) {
			return;
		}

		this.renderTargetA.texture.type = frameBufferType;
		this.renderTargetB.texture.type = frameBufferType;

		if (frameBufferType !== UnsignedByteType) {
			this.blurMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
			this.copyMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
			return;
		}

		if (renderer?.outputColorSpace === SRGBColorSpace) {
			this.renderTargetA.texture.colorSpace = SRGBColorSpace;
			this.renderTargetB.texture.colorSpace = SRGBColorSpace;
		}
	}

	dispose() {
		super.dispose();
		this.renderTargetA?.dispose();
		this.renderTargetB?.dispose();
		this.blurMaterial?.dispose();
		this.copyMaterial?.dispose();
	}
}
