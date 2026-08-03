// @ts-nocheck

import { Vector2 } from 'three';
import vertexShader from '@/lib/shaders/glsl/vertex/basic.glsl';

export const BrightnessContrastShader = {
  uniforms: {
    inputTexture: { type: 't', value: null },
    brightness: { type: 'f', value: 0 },
    contrast: { type: 'f', value: 0 },
  },
  vertexShader,
  fragmentShader: `
varying vec2 vUv;
uniform sampler2D inputTexture;
uniform float brightness;
uniform float contrast;

void main() {
	vec4 tex = texture2D(inputTexture, vUv);
	vec3 color = tex.rgb + brightness;

	if (contrast > 0.0) {
		color = (color - 0.5) / max(1.0 - contrast, 0.0001) + 0.5;
	} else {
		color = (color - 0.5) * (1.0 + contrast) + 0.5;
	}

	gl_FragColor = vec4(clamp(color, 0.0, 1.0), tex.a);
}
`,
};

export const ColorAverageShader = {
  uniforms: {
    inputTexture: { type: 't', value: null },
  },
  vertexShader,
  fragmentShader: `
varying vec2 vUv;
uniform sampler2D inputTexture;

void main() {
	vec4 tex = texture2D(inputTexture, vUv);
	float luminance = dot(tex.rgb, vec3(0.2126, 0.7152, 0.0722));
	gl_FragColor = vec4(vec3(luminance), tex.a);
}
`,
};

export const ColorDepthShader = {
  uniforms: {
    inputTexture: { type: 't', value: null },
    bits: { type: 'f', value: 16 },
  },
  vertexShader,
  fragmentShader: `
varying vec2 vUv;
uniform sampler2D inputTexture;
uniform float bits;

void main() {
	vec4 tex = texture2D(inputTexture, vUv);
	float levels = max(pow(2.0, bits), 1.0);
	vec3 color = floor(tex.rgb * levels + 0.5) / levels;
	gl_FragColor = vec4(color, tex.a);
}
`,
};

export const HueSaturationShader = {
  uniforms: {
    inputTexture: { type: 't', value: null },
    hue: { type: 'f', value: 0 },
    saturation: { type: 'f', value: 0 },
  },
  vertexShader,
  fragmentShader: `
varying vec2 vUv;
uniform sampler2D inputTexture;
uniform float hue;
uniform float saturation;

vec3 rgb2hsv(vec3 c) {
	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
	vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
	vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
	float d = q.x - min(q.w, q.y);
	float e = 1.0e-10;
	return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
	vec4 tex = texture2D(inputTexture, vUv);
	vec3 hsv = rgb2hsv(tex.rgb);
	hsv.x = fract(hsv.x + hue / 6.28318530718);
	hsv.y = clamp(hsv.y + saturation, 0.0, 1.0);
	gl_FragColor = vec4(hsv2rgb(hsv), tex.a);
}
`,
};

export const SepiaShader = {
  uniforms: {
    inputTexture: { type: 't', value: null },
    intensity: { type: 'f', value: 1 },
  },
  vertexShader,
  fragmentShader: `
varying vec2 vUv;
uniform sampler2D inputTexture;
uniform float intensity;

void main() {
	vec4 tex = texture2D(inputTexture, vUv);
	vec3 sepia = vec3(
		dot(tex.rgb, vec3(0.393, 0.769, 0.189)),
		dot(tex.rgb, vec3(0.349, 0.686, 0.168)),
		dot(tex.rgb, vec3(0.272, 0.534, 0.131))
	);
	gl_FragColor = vec4(mix(tex.rgb, clamp(sepia, 0.0, 1.0), clamp(intensity, 0.0, 1.0)), tex.a);
}
`,
};

export const ScanlineShader = {
  uniforms: {
    inputTexture: { type: 't', value: null },
    density: { type: 'f', value: 1.25 },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
  },
  vertexShader,
  fragmentShader: `
varying vec2 vUv;
uniform sampler2D inputTexture;
uniform float density;
uniform vec2 resolution;

void main() {
	vec4 tex = texture2D(inputTexture, vUv);
	float lines = sin(vUv.y * resolution.y * density * 3.14159265359);
	float mask = 0.82 + 0.18 * lines;
	gl_FragColor = vec4(tex.rgb * mask, tex.a);
}
`,
};

export const VignetteShader = {
  uniforms: {
    inputTexture: { type: 't', value: null },
    offset: { type: 'f', value: 0.5 },
    darkness: { type: 'f', value: 0.5 },
  },
  vertexShader,
  fragmentShader: `
varying vec2 vUv;
uniform sampler2D inputTexture;
uniform float offset;
uniform float darkness;

void main() {
	vec4 tex = texture2D(inputTexture, vUv);
	float dist = distance(vUv, vec2(0.5));
	float vignette = smoothstep(max(offset * 0.5, 0.0001), 0.85, dist);
	float strength = clamp(vignette * darkness, 0.0, 1.0);
	gl_FragColor = vec4(tex.rgb * (1.0 - strength), tex.a);
}
`,
};

export const ToneMappingShader = {
  uniforms: {
    inputTexture: { type: 't', value: null },
    adaptive: { type: 'f', value: 0 },
    middleGrey: { type: 'f', value: 0.6 },
    maxLuminance: { type: 'f', value: 16 },
    averageLuminance: { type: 'f', value: 1 },
    adaptationRate: { type: 'f', value: 1 },
  },
  vertexShader,
  fragmentShader: `
varying vec2 vUv;
uniform sampler2D inputTexture;
uniform float adaptive;
uniform float middleGrey;
uniform float maxLuminance;
uniform float averageLuminance;
uniform float adaptationRate;

void main() {
	vec4 tex = texture2D(inputTexture, vUv);
	float luminance = max(dot(tex.rgb, vec3(0.2126, 0.7152, 0.0722)), 0.0001);
	float adaptiveMix = adaptive > 0.5 ? clamp(adaptationRate * 0.1, 0.0, 1.0) : 0.0;
	float targetAverage = mix(max(averageLuminance, 0.0001), luminance, adaptiveMix);
	float exposure = middleGrey / max(targetAverage, 0.0001);
	vec3 mapped = tex.rgb * exposure;
	float whitePoint = max(maxLuminance, 1.0);
	mapped = (mapped * (1.0 + mapped / (whitePoint * whitePoint))) / (1.0 + mapped);
	gl_FragColor = vec4(clamp(mapped, 0.0, 1.0), tex.a);
}
`,
};

export const TiltShiftShader = {
  uniforms: {
    inputTexture: { type: 't', value: null },
    blur: { type: 'f', value: 0.15 },
    taper: { type: 'f', value: 0.5 },
    start: { type: 'v2', value: new Vector2(0.5, 0.0) },
    end: { type: 'v2', value: new Vector2(0.5, 1.0) },
    direction: { type: 'v2', value: new Vector2(1, 1) },
    samples: { type: 'i', value: 10 },
    resolution: { type: 'v2', value: new Vector2(1, 1) },
  },
  vertexShader,
  fragmentShader: `
#define MAX_ITERATIONS 100
varying vec2 vUv;
uniform sampler2D inputTexture;
uniform float blur;
uniform float taper;
uniform vec2 start;
uniform vec2 end;
uniform vec2 direction;
uniform int samples;
uniform vec2 resolution;

float random(vec3 scale, float seed) {
	return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main() {
	vec4 color = vec4(0.0);
	float total = 0.0;
	vec2 startPixel = vec2(start.x * resolution.x, start.y * resolution.y);
	vec2 endPixel = vec2(end.x * resolution.x, end.y * resolution.y);
	float fSamples = float(samples);
	float halfSamples = fSamples / 2.0;

	float maxScreenDistance = distance(vec2(0.0), resolution);
	float gradientRadius = max(taper * maxScreenDistance, 0.0001);
	float blurRadius = blur * (maxScreenDistance / 16.0);

	float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
	vec2 normal = normalize(vec2(startPixel.y - endPixel.y, endPixel.x - startPixel.x));
	vec2 blurDirection = normalize(direction);
	float radius = smoothstep(
		0.0,
		1.0,
		abs(dot(vUv * resolution - startPixel, normal)) / gradientRadius
	) * blurRadius;

	for (int i = 0; i <= MAX_ITERATIONS; i++) {
		if (i >= samples) {
			break;
		}

		float fI = float(i);
		float sampleIndex = -halfSamples + fI;
		float percent = (sampleIndex + offset - 0.5) / max(halfSamples, 0.0001);
		float weight = 1.0 - abs(percent);
		vec4 sampleColor = texture2D(
			inputTexture,
			vUv + blurDirection / resolution * percent * radius
		);
		sampleColor.rgb *= sampleColor.a;
		color += sampleColor * weight;
		total += weight;
	}

	vec4 outputColor = color / max(total, 0.00001);
	outputColor.rgb /= outputColor.a + 0.00001;
	gl_FragColor = outputColor;
}
`,
};
