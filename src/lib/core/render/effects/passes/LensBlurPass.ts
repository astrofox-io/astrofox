// @ts-nocheck
import { clamp } from "@/lib/utils/math";
import {
	CopyPass,
	MultiPass,
	ShaderPass,
	createRenderTarget,
} from "../../composer";
import LensBlurShader from "../shaders/LensBlurShader";

export default class LensBlurPass extends MultiPass {
	constructor() {
		const passes = [];

		const preBlur = new ShaderPass(LensBlurShader);
		preBlur.setUniforms({ pass: 0 });
		passes.push(preBlur);

		const blur1 = new ShaderPass(LensBlurShader);
		blur1.setUniforms({ pass: 1 });
		passes.push(blur1);

		const blur2 = new ShaderPass(LensBlurShader);
		blur2.setUniforms({ pass: 2 });
		passes.push(blur2);

		const blur3 = new ShaderPass(LensBlurShader);
		blur3.setUniforms({ pass: 1 });
		passes.push(blur3);

		const blur4 = new ShaderPass(LensBlurShader);
		blur4.setUniforms({ pass: 3 });
		passes.push(blur4);

		const copy = new CopyPass(createRenderTarget(1, 1));
		passes.push(copy);

		super(passes);
	}

	setSize(width, height) {
		super.setSize(width, height);
		this.passes.at(-1)?.buffer?.setSize?.(width, height);
	}

	setUniforms({ radius, brightness, angle, width, height }) {
		const [preBlur, blur1, blur2, blur3, blur4] = this.passes;
		const dir = [];

		for (let i = 0; i < 3; i += 1) {
			const a = angle + (i * Math.PI * 2) / 3;
			dir.push([
				(radius * Math.sin(a)) / width,
				(radius * Math.cos(a)) / height,
			]);
		}

		const power = 10 ** clamp(brightness, -1, 1);

		preBlur.setUniforms({ power });
		blur1.setUniforms({ delta0: dir[0] });
		blur2.setUniforms({ delta0: dir[1], delta1: dir[2] });
		blur3.setUniforms({ delta0: dir[1] });
		blur4.setUniforms({ delta0: dir[2], power: 1 / power });
	}

	render(renderer, inputBuffer, outputBuffer) {
		const [preBlur, blur1, blur2, blur3, blur4, copy] = this.passes;
		const bufferA = inputBuffer;
		const bufferB = outputBuffer;

		preBlur.render(renderer, bufferA, bufferB);
		blur1.render(renderer, bufferB, bufferA);
		blur2.render(renderer, bufferA, bufferB);
		copy.render(renderer, bufferA);
		blur3.render(renderer, bufferB, bufferA);
		blur4.setUniforms({ extraBuffer: copy.buffer.texture });
		blur4.render(renderer, bufferB, bufferA);
	}
}
