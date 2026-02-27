// @ts-nocheck
import { Effect } from "postprocessing";
import { Uniform, Vector2 } from "three";

const fragmentShader = `
uniform float size;
uniform vec2 sceneResolution;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	vec2 center = sceneResolution * 0.5;
	vec2 tex = (uv * sceneResolution - center) / size;
	tex.y /= 0.866025404;
	tex.x -= tex.y * 0.5;

	vec2 a;
	if (tex.x + tex.y - floor(tex.x) - floor(tex.y) < 1.0) {
		a = vec2(floor(tex.x), floor(tex.y));
	} else {
		a = vec2(ceil(tex.x), ceil(tex.y));
	}

	vec2 b = vec2(ceil(tex.x), floor(tex.y));
	vec2 c = vec2(floor(tex.x), ceil(tex.y));

	vec3 TEX = vec3(tex.x, tex.y, 1.0 - tex.x - tex.y);
	vec3 A = vec3(a.x, a.y, 1.0 - a.x - a.y);
	vec3 B = vec3(b.x, b.y, 1.0 - b.x - b.y);
	vec3 C = vec3(c.x, c.y, 1.0 - c.x - c.y);

	float alen = length(TEX - A);
	float blen = length(TEX - B);
	float clen = length(TEX - C);

	vec2 choice;
	if (alen < blen) {
		choice = alen < clen ? a : c;
	} else {
		choice = blen < clen ? b : c;
	}

	choice.x += choice.y * 0.5;
	choice.y *= 0.866025404;
	choice *= size / sceneResolution;

	outputColor = texture2D(inputBuffer, choice + center / sceneResolution);
}
`;

export class PPHexPixelateEffect extends Effect {
	constructor({ size = 10, width = 1, height = 1 } = {}) {
		super("PPHexPixelateEffect", fragmentShader, {
			uniforms: new Map([
				["size", new Uniform(size)],
				["sceneResolution", new Uniform(new Vector2(width, height))],
			]),
		});
	}
}
