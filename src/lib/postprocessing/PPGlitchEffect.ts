// @ts-nocheck
import { Effect } from "postprocessing";
import { Uniform } from "three";

const fragmentShader = `
uniform float amount;
uniform float time;

float rand(vec2 n) {
	return fract(sin(dot(n, vec2(12.9898, 78.233))) * 43758.5453);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	float line = step(0.95, rand(vec2(floor(uv.y * 80.0 + time * 0.05), time)));
	float jitter = (rand(vec2(time * 0.01, floor(uv.y * 40.0))) - 0.5) * 0.06 * amount;
	vec2 guv = uv + vec2(jitter * line, 0.0);

	vec4 base = texture2D(inputBuffer, guv);

	float angle = rand(vec2(time * 0.02, 1.0)) * 6.28318530718;
	vec2 offset = amount * 0.03 * vec2(cos(angle), sin(angle));
	vec4 cr = texture2D(inputBuffer, guv + offset);
	vec4 cg = texture2D(inputBuffer, guv);
	vec4 cb = texture2D(inputBuffer, guv - offset);
	vec4 rgb = vec4(cr.r, cg.g, cb.b, (cr.a + cg.a + cb.a) / 3.0);

	float noise = (rand(uv * vec2(640.0, 360.0) + time * 0.1) - 0.5) * 0.2 * amount;
	vec3 color = mix(base.rgb, rgb.rgb, 0.6) + noise;
	outputColor = vec4(clamp(color, 0.0, 1.0), base.a);
}
`;

export class PPGlitchEffect extends Effect {
	constructor({ amount = 0.5, time = 0 } = {}) {
		super("PPGlitchEffect", fragmentShader, {
			uniforms: new Map([
				["amount", new Uniform(amount)],
				["time", new Uniform(time)],
			]),
		});
	}
}
