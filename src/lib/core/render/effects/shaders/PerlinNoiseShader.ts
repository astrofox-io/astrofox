// @ts-nocheck

import { Vector2 } from 'three';
import classicNoise3D from '@/lib/shaders/glsl/func/classic-noise-3d.glsl';
import vertexShader from '@/lib/shaders/glsl/vertex/basic.glsl';

const fragmentShader = `
uniform sampler2D inputTexture;
uniform float time;
uniform float amount;
uniform float scale;
uniform vec2 resolution;
varying vec2 vUv;

${classicNoise3D}

float fbm(vec3 point) {
	float value = 0.0;
	float amplitude = 0.5;

	for (int i = 0; i < 4; i++) {
		value += amplitude * cnoise(point);
		point *= 2.0;
		amplitude *= 0.5;
	}

	return value;
}

void main() {
	float aspect = resolution.x / max(resolution.y, 1.0);
	vec2 noiseUv = (vUv - 0.5) * vec2(aspect, 1.0);
	vec3 noisePoint = vec3(noiseUv * max(scale, 0.001), time);
	vec2 flow = vec2(
		fbm(noisePoint + vec3(0.0, 0.0, 0.0)),
		fbm(noisePoint + vec3(23.7, 11.3, 5.1))
	);
	vec2 displacedUv = clamp(
		vUv + flow * amount * vec2(0.035 / aspect, 0.035),
		vec2(0.0),
		vec2(1.0)
	);

	gl_FragColor = texture2D(inputTexture, displacedUv);
}
`;

export default {
  uniforms: {
    inputTexture: { type: 't', value: null },
    time: { type: 'f', value: 0 },
    amount: { type: 'f', value: 0.35 },
    scale: { type: 'f', value: 3 },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
  },
  vertexShader,
  fragmentShader,
};
