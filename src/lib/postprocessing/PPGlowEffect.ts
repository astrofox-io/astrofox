// @ts-nocheck
import { Effect, EffectAttribute } from "postprocessing";
import { Uniform, Vector2 } from "three";

const fragmentShader = `
uniform float amount;
uniform float intensity;
uniform vec2 sceneResolution;

vec4 boxBlur(vec2 uv, float amt) {
	float h = amt / sceneResolution.x;
	float v = amt / sceneResolution.y;
	vec4 sum = vec4(0.0);

	sum += texture2D(inputBuffer, vec2(uv.x - 4.0 * h, uv.y)) * 0.051;
	sum += texture2D(inputBuffer, vec2(uv.x - 3.0 * h, uv.y)) * 0.0918;
	sum += texture2D(inputBuffer, vec2(uv.x - 2.0 * h, uv.y)) * 0.12245;
	sum += texture2D(inputBuffer, vec2(uv.x - 1.0 * h, uv.y)) * 0.1531;
	sum += texture2D(inputBuffer, vec2(uv.x, uv.y)) * 0.1633;
	sum += texture2D(inputBuffer, vec2(uv.x + 1.0 * h, uv.y)) * 0.1531;
	sum += texture2D(inputBuffer, vec2(uv.x + 2.0 * h, uv.y)) * 0.12245;
	sum += texture2D(inputBuffer, vec2(uv.x + 3.0 * h, uv.y)) * 0.0918;
	sum += texture2D(inputBuffer, vec2(uv.x + 4.0 * h, uv.y)) * 0.051;

	sum += texture2D(inputBuffer, vec2(uv.x, uv.y - 4.0 * v)) * 0.051;
	sum += texture2D(inputBuffer, vec2(uv.x, uv.y - 3.0 * v)) * 0.0918;
	sum += texture2D(inputBuffer, vec2(uv.x, uv.y - 2.0 * v)) * 0.12245;
	sum += texture2D(inputBuffer, vec2(uv.x, uv.y - 1.0 * v)) * 0.1531;
	sum += texture2D(inputBuffer, vec2(uv.x, uv.y)) * 0.1633;
	sum += texture2D(inputBuffer, vec2(uv.x, uv.y + 1.0 * v)) * 0.1531;
	sum += texture2D(inputBuffer, vec2(uv.x, uv.y + 2.0 * v)) * 0.12245;
	sum += texture2D(inputBuffer, vec2(uv.x, uv.y + 3.0 * v)) * 0.0918;
	sum += texture2D(inputBuffer, vec2(uv.x, uv.y + 4.0 * v)) * 0.051;

	return sum * 0.5;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	vec4 src = texture2D(inputBuffer, uv);
	vec4 sum = boxBlur(uv, amount);
	outputColor = vec4(mix(src.rgb, sum.rgb, 0.6) * intensity, sum.a);
}
`;

export class PPGlowEffect extends Effect {
	constructor({ amount = 0, intensity = 1, width = 1, height = 1 } = {}) {
		super("PPGlowEffect", fragmentShader, {
			attributes: EffectAttribute.CONVOLUTION,
			uniforms: new Map([
				["amount", new Uniform(amount)],
				["intensity", new Uniform(intensity)],
				["sceneResolution", new Uniform(new Vector2(width, height))],
			]),
		});
	}
}
