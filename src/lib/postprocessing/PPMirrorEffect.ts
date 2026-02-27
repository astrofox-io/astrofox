// @ts-nocheck
import { Effect } from "postprocessing";
import { Uniform } from "three";

const fragmentShader = `
uniform float side;

void mainUv(inout vec2 uv) {
	int s = int(side + 0.5);

	if (s == 0) {
		if (uv.x > 0.5) uv.x = 1.0 - uv.x;
	}
	else if (s == 1) {
		if (uv.x < 0.5) uv.x = 1.0 - uv.x;
	}
	else if (s == 2) {
		if (uv.y < 0.5) uv.y = 1.0 - uv.y;
	}
	else if (s == 3) {
		if (uv.y > 0.5) uv.y = 1.0 - uv.y;
	}
}
`;

export class PPMirrorEffect extends Effect {
	constructor({ side = 0 } = {}) {
		super("PPMirrorEffect", fragmentShader, {
			uniforms: new Map([["side", new Uniform(side)]]),
		});
	}
}
