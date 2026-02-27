// @ts-nocheck
import { Effect } from "postprocessing";
import { Uniform, Vector2 } from "three";

const fragmentShader = `
uniform float spacing;
uniform float size;
uniform float blur;
uniform vec2 sceneResolution;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	vec2 count = vec2(sceneResolution / spacing);
	vec2 p = floor(uv * count) / count;
	vec4 color = texture2D(inputBuffer, p);
	vec2 pos = mod(gl_FragCoord.xy, vec2(spacing)) - vec2(spacing / 2.0);
	float distSquared = dot(pos, pos);
	float t = smoothstep(size, size + blur, distSquared);
	outputColor = mix(color, vec4(0.0), t);
}
`;

export class PPLEDEffect extends Effect {
	constructor({ spacing = 10, size = 4, blur = 4, width = 1, height = 1 } = {}) {
		super("PPLEDEffect", fragmentShader, {
			uniforms: new Map([
				["spacing", new Uniform(spacing)],
				["size", new Uniform(size)],
				["blur", new Uniform(blur)],
				["sceneResolution", new Uniform(new Vector2(width, height))],
			]),
		});
	}
}
