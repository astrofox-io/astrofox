// @ts-nocheck
import { Effect } from "postprocessing";
import { Uniform } from "three";

const fragmentShader = `
uniform float amount;
uniform float time;

void mainUv(inout vec2 uv) {
	float frequency = 6.0;
	float amplitude = 0.015 * amount;
	float x = uv.y * frequency + time * 0.7;
	float y = uv.x * frequency + time * 0.3;
	uv.x += cos(x + y) * amplitude * cos(y);
	uv.y += sin(x - y) * amplitude * cos(y);
}
`;

export class PPDistortionEffect extends Effect {
	constructor({ amount = 0, time = 0 } = {}) {
		super("PPDistortionEffect", fragmentShader, {
			uniforms: new Map([
				["amount", new Uniform(amount)],
				["time", new Uniform(time)],
			]),
		});
	}
}
