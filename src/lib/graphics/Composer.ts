import ShaderPass from "@/lib/graphics/ShaderPass";
import blendModes from "@/lib/graphics/blendModes";
import BlendShader from "@/lib/shaders/BlendShader";
import CopyShader from "@/lib/shaders/CopyShader";
import { base64ToBytes } from "@/lib/utils/data";
import { Color } from "three";
import { createRenderTarget } from "./common";

export default class Composer {
	[key: string]: any;
	constructor(renderer) {
		this.renderer = renderer;

		this.blendPass = new ShaderPass(BlendShader);
		this.blendPass.material.transparent = true;

		this.copyPass = new ShaderPass(CopyShader);
		this.copyPass.material.transparent = true;
		this.copyPass.renderToScreen = true;

		this.inputBuffer = createRenderTarget({}, this.renderer);
		this.outputBuffer = this.inputBuffer.clone();

		this.dataBuffer = new Uint8Array(
			this.inputBuffer.width * this.inputBuffer.height * 4,
		);
	}

	getSize() {
		return {
			width: this.inputBuffer.width,
			height: this.inputBuffer.height,
		};
	}

	getImage(format = "image/png") {
		const img = this.renderer.domElement.toDataURL(format);
		const data = img.replace(/^data:image\/\w+;base64,/, "");

		return base64ToBytes(data);
	}

	getPixels() {
		this.renderer.readRenderTargetPixels(
			this.inputBuffer,
			0,
			0,
			this.inputBuffer.width,
			this.inputBuffer.height,
			this.dataBuffer,
		);

		return this.dataBuffer;
	}

	setSize(width, height) {
		this.renderer.setSize(width, height, true);
		this.inputBuffer.setSize(width, height);
		this.outputBuffer.setSize(width, height);
		this.dataBuffer = new Uint8Array(
			this.inputBuffer.width * this.inputBuffer.height * 4,
		);
	}

	clearScreen(color = true, depth = true, stencil = true) {
		this.renderer.clear(color, depth, stencil);
	}

	clearBuffer(color = true, depth = true, stencil = true) {
		this.renderer.setRenderTarget(this.inputBuffer);
		this.renderer.clear(color, depth, stencil);
		this.renderer.setRenderTarget(this.outputBuffer);
		this.renderer.clear(color, depth, stencil);
	}

	clear(color, alpha) {
		const { renderer } = this;
		const clearColor = new Color();
		renderer.getClearColor(clearColor);
		const clearAlpha = renderer.getClearAlpha();

		if (color) {
			renderer.setClearColor(color, alpha);
		}

		this.clearScreen();
		this.clearBuffer();

		if (color) {
			renderer.setClearColor(clearColor, clearAlpha);
		}
	}

	dispose() {
		this.inputBuffer.dispose();
		this.outputBuffer.dispose();
	}

	swapBuffers() {
		const tmp = this.inputBuffer;
		this.inputBuffer = this.outputBuffer;
		this.outputBuffer = tmp;
	}

	blendBuffer(buffer, properties) {
		const { renderer, blendPass, inputBuffer, outputBuffer } = this;

		const { opacity, blendMode, mask, inverse } = properties;

		blendPass.setUniforms({
			baseBuffer: inputBuffer.texture,
			blendBuffer: buffer.texture,
			mode: blendModes[blendMode],
			alpha: 1,
			opacity,
			mask,
			inverse,
		});

		blendPass.render(renderer, inputBuffer, outputBuffer);

		this.swapBuffers();
	}

	renderToScreen() {
		const { renderer, inputBuffer, outputBuffer, copyPass } = this;

		copyPass.render(renderer, inputBuffer, outputBuffer);
	}

	render(passes = []) {
		const { renderer } = this;

		passes.forEach((pass) => {
			pass.render(renderer, this.inputBuffer, this.outputBuffer);

			if (pass.needsSwap) {
				this.swapBuffers();
			}
		});
	}
}
