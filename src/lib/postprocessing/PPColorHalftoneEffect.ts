// @ts-nocheck
import { Effect } from "postprocessing";
import { Uniform, Vector2 } from "three";

const fragmentShader = `
uniform float scale;
uniform float angle;
uniform vec2 sceneResolution;

float dotPattern(vec2 uv, float a, float s, vec2 size) {
	float si = sin(a);
	float co = cos(a);
	vec2 tex = uv * size - vec2(size.x * 0.5, size.y * 0.5);
	vec2 point = vec2(co * tex.x - si * tex.y, si * tex.x + co * tex.y) * s;
	return (sin(point.x) * sin(point.y)) * 4.0;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	vec4 color = texture2D(inputBuffer, uv);
	vec3 cmy = 1.0 - color.rgb;
	float k = min(cmy.x, min(cmy.y, cmy.z));
	cmy = (cmy - k) / max(1.0 - k, 0.0001);

	vec3 pattern = vec3(
		dotPattern(uv, angle + 0.26179, scale, sceneResolution),
		dotPattern(uv, angle + 1.30899, scale, sceneResolution),
		dotPattern(uv, angle, scale, sceneResolution)
	);

	cmy = clamp(cmy * 10.0 - 3.0 + pattern, 0.0, 1.0);
	k = clamp(k * 10.0 - 5.0 + dotPattern(uv, angle + 0.78539, scale, sceneResolution), 0.0, 1.0);

	outputColor = vec4(1.0 - cmy - k, color.a);
}
`;

export class PPColorHalftoneEffect extends Effect {
	constructor({ scale = 1, angle = 0, width = 1, height = 1 } = {}) {
		super("PPColorHalftoneEffect", fragmentShader, {
			uniforms: new Map([
				["scale", new Uniform(scale)],
				["angle", new Uniform(angle)],
				["sceneResolution", new Uniform(new Vector2(width, height))],
			]),
		});
	}
}
