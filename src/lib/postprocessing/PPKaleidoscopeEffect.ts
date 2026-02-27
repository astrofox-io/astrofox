// @ts-nocheck
import { Effect } from "postprocessing";
import { Uniform } from "three";

const fragmentShader = `
uniform float sides;
uniform float angle;

void mainUv(inout vec2 uv) {
	vec2 p = uv - 0.5;
	float r = length(p);
	float a = atan(p.y, p.x) + angle;
	float tau = 6.28318530718;
	float s = max(sides, 1.0);
	a = mod(a, tau / s);
	a = abs(a - tau / s / 2.0);
	uv = r * vec2(cos(a), sin(a)) + 0.5;
}
`;

export class PPKaleidoscopeEffect extends Effect {
	constructor({ sides = 6, angle = 0 } = {}) {
		super("PPKaleidoscopeEffect", fragmentShader, {
			uniforms: new Map([
				["sides", new Uniform(sides)],
				["angle", new Uniform(angle)],
			]),
		});
	}
}
