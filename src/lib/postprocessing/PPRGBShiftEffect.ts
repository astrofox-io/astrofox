// @ts-nocheck
import { Effect } from "postprocessing";
import { Uniform } from "three";

const fragmentShader = `
uniform float offset;
uniform float angle;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	vec2 dir = offset * vec2(cos(angle), sin(angle));
	vec4 cr = texture2D(inputBuffer, uv + dir);
	vec4 cg = texture2D(inputBuffer, uv);
	vec4 cb = texture2D(inputBuffer, uv - dir);

	outputColor = vec4(cr.r, cg.g, cb.b, (cr.a + cg.a + cb.a) / 3.0);
}
`;

export class PPRGBShiftEffect extends Effect {
	constructor({ offset = 0, angle = 0 } = {}) {
		super("PPRGBShiftEffect", fragmentShader, {
			uniforms: new Map([
				["offset", new Uniform(offset)],
				["angle", new Uniform(angle)],
			]),
		});
	}
}
