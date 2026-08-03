// @ts-nocheck

import { Vector2 } from 'three';
import vertexShader from '@/lib/shaders/glsl/vertex/basic.glsl';

export default {
  uniforms: {
    inputTexture: { type: 't', value: null },
    depthTexture: { type: 't', value: null },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
    nearClip: { type: 'f', value: 0.1 },
    farClip: { type: 'f', value: 5000 },
    focusDistance: { type: 'f', value: 0 },
    focalLength: { type: 'f', value: 0.02 },
    bokehScale: { type: 'f', value: 2 },
    resolutionScale: { type: 'f', value: 1 },
  },
  vertexShader,
  fragmentShader: `
#include <packing>

varying vec2 vUv;

uniform sampler2D inputTexture;
uniform sampler2D depthTexture;
uniform vec2 resolution;
uniform float nearClip;
uniform float farClip;
uniform float focusDistance;
uniform float focalLength;
uniform float bokehScale;
uniform float resolutionScale;

const int SAMPLE_COUNT = 16;
const float GOLDEN_ANGLE = 2.39996323;

float readDepth(vec2 uv) {
	float fragCoordZ = texture2D(depthTexture, uv).x;
	float viewZ = perspectiveDepthToViewZ(fragCoordZ, nearClip, farClip);
	return viewZToOrthographicDepth(viewZ, nearClip, farClip);
}

float getBlurFactor(float depth) {
	float focusDelta = abs(depth - clamp(focusDistance, 0.0, 1.0));
	float lensStrength = mix(6.0, 42.0, clamp(focalLength, 0.0, 1.0));
	float coc = focusDelta * lensStrength * max(bokehScale, 0.0);
	return clamp(coc, 0.0, 1.0);
}

void main() {
	vec4 centerSample = texture2D(inputTexture, vUv);
	float centerDepth = readDepth(vUv);
	float blurFactor = getBlurFactor(centerDepth);

	if (blurFactor <= 0.0001) {
		gl_FragColor = centerSample;
		return;
	}

	vec2 texelSize = 1.0 / max(resolution * max(resolutionScale, 0.125), vec2(1.0));
	float blurRadius = mix(0.0, 12.0, blurFactor);
	vec4 accum = vec4(centerSample.rgb * centerSample.a, centerSample.a);
	float total = 1.0;

	for (int i = 0; i < SAMPLE_COUNT; i++) {
		float fi = float(i);
		float radius = sqrt((fi + 0.5) / float(SAMPLE_COUNT));
		float angle = fi * GOLDEN_ANGLE;
		vec2 direction = vec2(cos(angle), sin(angle));
		vec2 sampleUv = clamp(vUv + direction * texelSize * blurRadius * radius, 0.0, 1.0);
		vec4 sampleColor = texture2D(inputTexture, sampleUv);
		float sampleBlur = getBlurFactor(readDepth(sampleUv));
		float weight = mix(0.15, 1.0, sampleBlur);

		accum.rgb += sampleColor.rgb * sampleColor.a * weight;
		accum.a += sampleColor.a * weight;
		total += weight;
	}

	vec4 blurred = accum / max(total, 0.0001);
	blurred.rgb /= max(blurred.a, 0.0001);
	gl_FragColor = mix(centerSample, blurred, blurFactor);
}
`,
};
