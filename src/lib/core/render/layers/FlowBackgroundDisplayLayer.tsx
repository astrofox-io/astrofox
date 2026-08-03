// @ts-nocheck
import { useFrame, useThree } from '@react-three/fiber';
import React from 'react';
import { Color, GLSL3, RawShaderMaterial, SRGBColorSpace, Vector2 } from 'three';
import { createRenderTarget } from '../composer/common';
import Pass from '../composer/Pass';
import { TexturePlane } from './TexturePlane';

const FLOW_VERTEX_SHADER = `precision mediump float;
in vec3 position;
in vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
out vec2 vTextureCoord;

void main() {
	vTextureCoord = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Ported directly from Onlook's public Unicorn Studio scene:
// https://www.onlook.com/scenes/flow-background.json
const FLOW_GRADIENT_FRAGMENT_SHADER = `precision highp float;
in vec2 vTextureCoord;
uniform float uTime;
uniform vec2 uMousePos;
out vec4 fragColor;

vec3 getColor(int index) {
	switch(index) {
		case 0: return vec3(0.08235294117647059, 0.08235294117647059, 0.08235294117647059);
		case 1: return vec3(0.0, 0.0, 0.0);
		case 2: return vec3(0.0, 0.0, 0.0);
		default: return vec3(0.0);
	}
}

float getStop(int index) {
	switch(index) {
		case 0: return 0.0;
		case 1: return 0.5;
		case 2: return 1.0;
		default: return 0.0;
	}
}

const float PI = 3.14159265;

vec2 rotate(vec2 coord, float angle) {
	float s = sin(angle);
	float c = cos(angle);
	return vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);
}

float rand(vec2 co) {
	return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 linear_from_srgb(vec3 rgb) {
	return pow(rgb, vec3(2.2));
}

vec3 srgb_from_linear(vec3 lin) {
	return pow(lin, vec3(1.0 / 2.2));
}

vec3 oklab_mix(vec3 lin1, vec3 lin2, float amount) {
	const mat3 kCONEtoLMS = mat3(
		0.4121656120, 0.2118591070, 0.0883097947,
		0.5362752080, 0.6807189584, 0.2818474174,
		0.0514575653, 0.1074065790, 0.6302613616
	);
	const mat3 kLMStoCONE = mat3(
		4.0767245293, -1.2681437731, -0.0041119885,
		-3.3072168827, 2.6093323231, -0.7034763098,
		0.2307590544, -0.3411344290, 1.7068625689
	);

	vec3 lms1 = pow(kCONEtoLMS * lin1, vec3(1.0 / 3.0));
	vec3 lms2 = pow(kCONEtoLMS * lin2, vec3(1.0 / 3.0));
	vec3 lms = mix(lms1, lms2, amount);
	lms *= 1.0 + 0.025 * amount * (1.0 - amount);

	return kLMStoCONE * (lms * lms * lms);
}

vec3 getGradientColor(float position) {
	position = clamp(position, 0.0, 1.0);

	for (int index = 0; index < 2; index++) {
		float colorPosition = getStop(index);
		float nextColorPosition = getStop(index + 1);

		if (position <= nextColorPosition) {
			float mixFactor = (position - colorPosition) / (nextColorPosition - colorPosition);
			vec3 linStart = linear_from_srgb(getColor(index));
			vec3 linEnd = linear_from_srgb(getColor(index + 1));
			vec3 mixedLin = oklab_mix(linStart, linEnd, mixFactor);
			return srgb_from_linear(mixedLin);
		}
	}

	return getColor(2);
}

vec3 applyColorToPosition(float position) {
	position -= uTime * 0.01;
	float cycle = floor(position);
	bool reverse = int(cycle) % 2 == 0;
	float animatedPos = reverse ? 1.0 - fract(position) : fract(position);
	vec3 color = getGradientColor(animatedPos);
	float dither = rand(gl_FragCoord.xy) * 0.005;

	return color + dither;
}

void main() {
	vec2 uv = vTextureCoord;
	vec2 pos = vec2(0.5, 0.5) + mix(vec2(0.0), (uMousePos - 0.5), 0.0);
	uv -= pos;
	uv /= 1.0;
	uv = rotate(uv, (0.0783 - 0.5) * 2.0 * PI);
	vec3 color = applyColorToPosition(uv.x + 0.5);
	fragColor = vec4(color, 1.0);
}
`;

const FLOW_TRAIL_UPDATE_FRAGMENT_SHADER = `precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uPingPongTexture;
uniform vec2 uPreviousMousePos;
uniform float uTime;
uniform vec2 uMousePos;
uniform vec2 uResolution;
out vec4 fragColor;

const float PI = 3.1415926;
const float TWOPI = 6.2831852;

vec3 hsv2rgb(vec3 c) {
	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 rgb2hsv(vec3 c) {
	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
	vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
	vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
	float d = q.x - min(q.w, q.y);
	float e = 1.0e-10;
	return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

mat2 rot(float angle) {
	return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

vec2 angleToDir(float angle) {
	float rad = angle * 2.0 * PI;
	return vec2(cos(rad), sin(rad));
}

vec2 liquify(vec2 st, vec2 dir) {
	float aspectRatio = uResolution.x / uResolution.y;
	st.x *= aspectRatio;
	float amplitude = 0.0025;
	float freq = 6.0;

	for (float index = 1.0; index <= 5.0; index++) {
		st = st * rot(index / 5.0 * PI * 2.0);
		st += vec2(
			amplitude * cos(index * freq * st.y + uTime * 0.02 * dir.x),
			amplitude * sin(index * freq * st.x + uTime * 0.02 * dir.y)
		);
	}

	st.x /= aspectRatio;
	return st;
}

vec3 calculateTrailContribution(
	vec2 mousePos,
	vec2 prevMousePos,
	vec2 correctedUv,
	float aspectRatio,
	float radius
) {
	vec2 dir = (mousePos - prevMousePos) * vec2(aspectRatio, 1.0);
	float angle = atan(dir.y, dir.x);
	if (angle < 0.0) {
		angle += TWOPI;
	}

	vec2 mouseVec = mousePos - prevMousePos;
	float mouseLen = length(mouseVec);
	vec2 mouseDir = mouseLen > 0.0 ? mouseVec / mouseLen : vec2(0.0);
	vec2 posToUv = (correctedUv - prevMousePos) * vec2(aspectRatio, 1.0);
	float projection = clamp(
		dot(posToUv, mouseDir * vec2(aspectRatio, 1.0)),
		0.0,
		mouseLen * aspectRatio
	);
	vec2 closestPoint =
		prevMousePos * vec2(aspectRatio, 1.0) +
		mouseDir * vec2(aspectRatio, 1.0) * projection;
	float distanceToLine = distance(correctedUv, closestPoint);
	float strength = (1.0 + radius) / (distanceToLine + radius) * radius;
	vec3 color = vec3(angle / TWOPI, 1.0, 1.0);
	vec3 pointColor = hsv2rgb(color);
	pointColor = pow(pointColor, vec3(2.2));
	float intensity = pow(strength, 10.0 * (1.0 - 0.5 + 0.1));

	return pointColor * intensity;
}

void main() {
	float aspectRatio = uResolution.x / uResolution.y;
	vec2 uv = vTextureCoord;
	vec2 correctedUv = uv * vec2(aspectRatio, 1.0);
	vec3 lastFrameColor = texture(uPingPongTexture, uv).rgb;
	vec3 lastFrameColorGamma = pow(lastFrameColor, vec3(2.2));
	vec3 hsv = rgb2hsv(lastFrameColor);
	vec3 hsvGamma = rgb2hsv(lastFrameColorGamma);
	vec2 prevDir = angleToDir(hsv.x);
	float prevStrength = hsvGamma.z;
	vec2 dir = (uMousePos - uPreviousMousePos) * vec2(aspectRatio, 1.0);
	float dist = length(dir);
	float blurAmount = 0.03 * prevStrength;
	uv = uv - prevDir * blurAmount;
	uv = mix(uv, liquify(uv - prevDir * 0.005, prevDir), (1.0 - prevStrength) * 0.25);
	lastFrameColor = texture(uPingPongTexture, uv).rgb;
	lastFrameColor = pow(lastFrameColor, vec3(2.2));

	int numPoints = int(max(12.0, dist * 24.0));
	float speedFactor = clamp(dist, 0.7, 1.3);
	float radius = mix(0.1, 0.7, 0.5280 * speedFactor);
	vec3 trailColor = vec3(0.0);
	int iterations = min(numPoints, 24);

	for (int index = 0; index <= 24; index++) {
		if (index > iterations) {
			break;
		}

		float t = float(index) / float(max(numPoints, 1));
		vec2 interpPos = mix(uPreviousMousePos, uMousePos, t);
		vec2 prevInterpPos =
			index > 0
				? mix(
					uPreviousMousePos,
					uMousePos,
					float(index - 1) / float(max(numPoints, 1))
				)
				: uPreviousMousePos;

		trailColor += calculateTrailContribution(
			interpPos,
			prevInterpPos,
			correctedUv,
			aspectRatio,
			radius
		);
	}

	trailColor = trailColor / float(min(numPoints, 50) + 1);
	vec3 blurredLastFrame = vec3(0.0);
	float clampedDist = clamp(length(trailColor) * dist, 0.0, 1.0);
	float blurRadius = 0.005;
	blurredLastFrame += pow(texture(uPingPongTexture, uv + vec2(blurRadius, 0.0)).rgb, vec3(2.2)) * 0.2;
	blurredLastFrame += pow(texture(uPingPongTexture, uv + vec2(-blurRadius, 0.0)).rgb, vec3(2.2)) * 0.2;
	blurredLastFrame += pow(texture(uPingPongTexture, uv + vec2(0.0, blurRadius)).rgb, vec3(2.2)) * 0.2;
	blurredLastFrame += pow(texture(uPingPongTexture, uv + vec2(0.0, -blurRadius)).rgb, vec3(2.2)) * 0.2;
	blurredLastFrame += lastFrameColor * 0.2;
	vec3 draw = mix(blurredLastFrame, trailColor, clampedDist);
	draw *= pow(0.5, 0.2);
	draw = pow(draw, vec3(1.0 / 2.2));
	fragColor = vec4(draw, 1.0);
}
`;

const FLOW_TRAIL_COMPOSITE_FRAGMENT_SHADER = `precision highp float;
precision highp int;
in vec2 vTextureCoord;
uniform sampler2D uTexture;
uniform sampler2D uPingPongTexture;
out vec4 fragColor;

uvec2 pcg2d(uvec2 value) {
	value = value * 1664525u + 1013904223u;
	value.x += value.y * value.y * 1664525u + 1013904223u;
	value.y += value.x * value.x * 1664525u + 1013904223u;
	value ^= value >> 16;
	value.x += value.y * value.y * 1664525u + 1013904223u;
	value.y += value.x * value.x * 1664525u + 1013904223u;
	return value;
}

float randFibo(vec2 value) {
	uvec2 bits = floatBitsToUint(value);
	bits = pcg2d(bits);
	uint result = bits.x ^ bits.y;
	return float(result) / float(0xffffffffu);
}

vec3 rgb2hsv(vec3 c) {
	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
	vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
	vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
	float d = q.x - min(q.w, q.y);
	float e = 1.0e-10;
	return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec2 angleToDir(float angle) {
	float rad = angle * 6.2831852;
	return vec2(cos(rad), sin(rad));
}

void main() {
	vec2 uv = vTextureCoord;
	vec3 mouseRgb = texture(uPingPongTexture, uv).rgb;
	vec3 mouseTrail = rgb2hsv(mouseRgb);
	float angle = mouseTrail.x;
	float strength = mouseTrail.z * (0.5 * 5.0);
	vec2 direction = angleToDir(angle);
	vec4 bg = texture(uTexture, uv - (direction * 0.1 * strength * 0.0));
	vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
	color.rgb = vec3(strength * mix(mouseRgb, vec3(0.9607843137254902, 0.0, 0.19607843137254902), 0.5));
	float dither = (randFibo(gl_FragCoord.xy) - 0.5) / 255.0;
	vec3 blendedRgb = color.rgb + dither + bg.rgb;
	fragColor = vec4(mix(bg.rgb, blendedRgb, mouseTrail.z), 1.0);
}
`;

const FLOW_FBM_FRAGMENT_SHADER = `precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMousePos;
uniform vec2 uResolution;
out vec4 fragColor;

float ease(float t) {
	return t;
}

vec3 hash33(vec3 p3) {
	p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
	p3 += dot(p3, p3.yxz + 19.19);
	return -1.0 + 2.0 * fract(vec3(
		(p3.x + p3.y) * p3.z,
		(p3.x + p3.z) * p3.y,
		(p3.y + p3.z) * p3.x
	));
}

float perlin_noise(vec3 p) {
	vec3 pi = floor(p);
	vec3 pf = p - pi;
	vec3 w = pf * pf * (3.0 - 2.0 * pf);

	float n000 = dot(pf - vec3(0.0, 0.0, 0.0), hash33(pi + vec3(0.0, 0.0, 0.0)));
	float n100 = dot(pf - vec3(1.0, 0.0, 0.0), hash33(pi + vec3(1.0, 0.0, 0.0)));
	float n010 = dot(pf - vec3(0.0, 1.0, 0.0), hash33(pi + vec3(0.0, 1.0, 0.0)));
	float n110 = dot(pf - vec3(1.0, 1.0, 0.0), hash33(pi + vec3(1.0, 1.0, 0.0)));
	float n001 = dot(pf - vec3(0.0, 0.0, 1.0), hash33(pi + vec3(0.0, 0.0, 1.0)));
	float n101 = dot(pf - vec3(1.0, 0.0, 1.0), hash33(pi + vec3(1.0, 0.0, 1.0)));
	float n011 = dot(pf - vec3(0.0, 1.0, 1.0), hash33(pi + vec3(0.0, 1.0, 1.0)));
	float n111 = dot(pf - vec3(1.0, 1.0, 1.0), hash33(pi + vec3(1.0, 1.0, 1.0)));

	float nx00 = mix(n000, n100, w.x);
	float nx01 = mix(n001, n101, w.x);
	float nx10 = mix(n010, n110, w.x);
	float nx11 = mix(n011, n111, w.x);
	float nxy0 = mix(nx00, nx10, w.y);
	float nxy1 = mix(nx01, nx11, w.y);

	return mix(nxy0, nxy1, w.z);
}

const float PI = 3.14159265359;

mat2 rot(float angle) {
	return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

const mat2 rotHalf = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));

float fbm(vec3 st) {
	float value = 0.0;
	float amplitude = 0.25;
	float amplitudeMultiplier = 0.1 + 0.7600 * 0.65;
	vec2 shift = vec2(100.0);

	for (int index = 0; index < 6; index++) {
		value += amplitude * perlin_noise(st);
		st.xy *= rotHalf * 2.5;
		st.xy += shift;
		amplitude *= amplitudeMultiplier;
	}

	return value;
}

void main() {
	vec2 uv = vTextureCoord;
	float aspectRatio = uResolution.x / uResolution.y;
	float multiplier = 6.0 * (0.1500 / ((aspectRatio + 1.0) / 2.0));
	vec2 mPos = vec2(0.5685640362225097, 0.6510996119016818) + mix(vec2(0.0), (uMousePos - 0.5), 0.0);
	vec2 pos = mix(vec2(0.5685640362225097, 0.6510996119016818), mPos, floor(1.0));
	float mDist = ease(max(0.0, 1.0 - distance(uv * vec2(aspectRatio, 1.0), mPos * vec2(aspectRatio, 1.0)) * 4.0 * (1.0 - 1.0)));
	vec2 st = ((uv - pos) * vec2(aspectRatio, 1.0)) * multiplier * aspectRatio;
	st = rot(0.1350 * -1.0 * 2.0 * PI) * st;
	vec2 drift = vec2(uTime * 0.005) * (0.7200 * 2.0);
	float time = uTime * 0.025;
	vec2 r = vec2(
		fbm(vec3(st - drift + vec2(1.7, 9.2), time)),
		fbm(vec3(st - drift + vec2(8.2, 1.3), time))
	);
	float f = fbm(vec3(st + r - drift, time)) * 0.3100;
	vec2 offset = f * 2.0 + (r * 0.3100);
	vec4 color = texture(uTexture, uv + offset * mDist);
	fragColor = color;
}
`;

function createFlowPass(fragmentShader, uniforms) {
  const material = new RawShaderMaterial({
    glslVersion: GLSL3,
    vertexShader: FLOW_VERTEX_SHADER,
    fragmentShader,
    uniforms,
    depthTest: false,
    depthWrite: false,
  });
  const pass = new Pass();
  pass.setFullscreen(material);

  return pass;
}

function setPassUniforms(pass, values = {}) {
  const uniforms = pass.material.uniforms || {};

  for (const [key, value] of Object.entries(values)) {
    const uniform = uniforms[key];

    if (!uniform) {
      continue;
    }

    const currentValue = uniform.value;
    if (currentValue?.set && Array.isArray(value)) {
      currentValue.set(...value);
    } else {
      uniform.value = value;
    }
  }
}

function clearRenderTarget(renderer, target) {
  const previousColor = new Color();
  const previousAlpha = renderer.getClearAlpha();
  renderer.getClearColor(previousColor);
  renderer.setRenderTarget(target);
  renderer.setClearColor(0x000000, 1);
  renderer.clear(true, true, false);
  renderer.setRenderTarget(null);
  renderer.setClearColor(previousColor, previousAlpha);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getFlowMousePosition(time, speed, motion) {
  const rate = 0.45 + speed * 0.45;
  const originX = 0.5685640362225097;
  const originY = 0.6510996119016818;
  const spread = 1 + speed * 0.18;

  switch (motion) {
    case 'Figure 8':
      return [
        originX + Math.sin(time * 0.72 * rate) * 0.11 * spread,
        originY + Math.sin(time * 1.44 * rate + 0.45) * 0.075 * spread,
      ];
    case 'Sweep':
      return [
        originX + Math.sin(time * 0.52 * rate) * 0.24 * spread,
        originY + Math.cos(time * 0.3 * rate + 0.8) * 0.08 * spread,
      ];
    case 'Drift':
      return [
        originX +
          Math.sin(time * 0.36 * rate) * 0.095 * spread +
          Math.sin(time * 0.81 * rate + 1.3) * 0.055 * spread,
        originY +
          Math.cos(time * 0.31 * rate + 0.7) * 0.085 * spread +
          Math.sin(time * 0.62 * rate) * 0.05 * spread,
      ];
    case 'Pulse':
      return [
        originX + Math.sin(time * 0.68 * rate) * 0.055 * spread,
        originY + Math.cos(time * 0.68 * rate + 0.5) * 0.055 * spread,
      ];
    default:
      return [
        originX + Math.sin(time * 0.6 * rate) * 0.12 * spread,
        originY + Math.cos(time * 0.48 * rate + 0.7) * 0.09 * spread,
      ];
  }
}

export function FlowBackgroundDisplayLayer({
  display,
  order,
  frameData,
  sceneOpacity,
  sceneBlendMode,
  sceneMask,
  sceneInverse,
  sceneMaskCombine,
}) {
  const gl = useThree(state => state.gl);
  const { properties = {} } = display;
  const { x = 0, y = 0, rotation = 0, zoom = 1, opacity = 1, motion = 'Orbit' } = properties;
  const width = Math.max(2, Math.round(Number(properties.width || 2)));
  const height = Math.max(2, Math.round(Number(properties.height || 2)));
  const speed = clamp(Number(properties.speed ?? 1), 0, 5);
  const halfWidth = Math.max(2, Math.round(width * 0.5));
  const halfHeight = Math.max(2, Math.round(height * 0.5));
  const fbmWidth = Math.max(2, Math.round(width * 0.75));
  const fbmHeight = Math.max(2, Math.round(height * 0.75));

  const gradientTarget = React.useMemo(() => createRenderTarget(halfWidth, halfHeight), []);
  const trailReadTarget = React.useMemo(() => createRenderTarget(halfWidth, halfHeight), []);
  const trailWriteTarget = React.useMemo(() => createRenderTarget(halfWidth, halfHeight), []);
  const compositeTarget = React.useMemo(() => createRenderTarget(halfWidth, halfHeight), []);
  const fbmTarget = React.useMemo(() => createRenderTarget(fbmWidth, fbmHeight), []);
  fbmTarget.texture.colorSpace = SRGBColorSpace;

  const gradientPassRef = React.useRef(null);
  const trailUpdatePassRef = React.useRef(null);
  const trailCompositePassRef = React.useRef(null);
  const fbmPassRef = React.useRef(null);
  const timeRef = React.useRef(0);
  const previousMousePosRef = React.useRef(new Vector2(0.5685640362225097, 0.6510996119016818));
  const pingRef = React.useRef({
    read: trailReadTarget,
    write: trailWriteTarget,
  });
  const needsClearRef = React.useRef(true);
  const needsRenderRef = React.useRef(true);

  if (!gradientPassRef.current) {
    gradientPassRef.current = createFlowPass(FLOW_GRADIENT_FRAGMENT_SHADER, {
      uTime: { value: 0 },
      uMousePos: { value: new Vector2(0.5, 0.5) },
    });
  }

  if (!trailUpdatePassRef.current) {
    trailUpdatePassRef.current = createFlowPass(FLOW_TRAIL_UPDATE_FRAGMENT_SHADER, {
      uPingPongTexture: { value: trailReadTarget.texture },
      uPreviousMousePos: { value: previousMousePosRef.current.clone() },
      uTime: { value: 0 },
      uMousePos: { value: new Vector2(0.5, 0.5) },
      uResolution: { value: new Vector2(halfWidth, halfHeight) },
    });
  }

  if (!trailCompositePassRef.current) {
    trailCompositePassRef.current = createFlowPass(FLOW_TRAIL_COMPOSITE_FRAGMENT_SHADER, {
      uTexture: { value: gradientTarget.texture },
      uPingPongTexture: { value: trailWriteTarget.texture },
    });
  }

  if (!fbmPassRef.current) {
    fbmPassRef.current = createFlowPass(FLOW_FBM_FRAGMENT_SHADER, {
      uTexture: { value: compositeTarget.texture },
      uTime: { value: 0 },
      uMousePos: { value: new Vector2(0.5, 0.5) },
      uResolution: { value: new Vector2(fbmWidth, fbmHeight) },
    });
  }

  React.useEffect(() => {
    gradientTarget.setSize(halfWidth, halfHeight);
    trailReadTarget.setSize(halfWidth, halfHeight);
    trailWriteTarget.setSize(halfWidth, halfHeight);
    compositeTarget.setSize(halfWidth, halfHeight);
    fbmTarget.setSize(fbmWidth, fbmHeight);
    setPassUniforms(trailUpdatePassRef.current, {
      uResolution: [halfWidth, halfHeight],
    });
    setPassUniforms(fbmPassRef.current, {
      uResolution: [fbmWidth, fbmHeight],
    });
    needsClearRef.current = true;
    needsRenderRef.current = true;
  }, [
    compositeTarget,
    fbmHeight,
    fbmTarget,
    fbmWidth,
    gradientTarget,
    halfHeight,
    halfWidth,
    trailReadTarget,
    trailWriteTarget,
  ]);

  React.useEffect(() => {
    needsRenderRef.current = true;
  }, [motion, speed, width, height]);

  React.useEffect(() => {
    return () => {
      gradientTarget.dispose();
      trailReadTarget.dispose();
      trailWriteTarget.dispose();
      compositeTarget.dispose();
      fbmTarget.dispose();
      gradientPassRef.current?.dispose?.();
      trailUpdatePassRef.current?.dispose?.();
      trailCompositePassRef.current?.dispose?.();
      fbmPassRef.current?.dispose?.();
    };
  }, [compositeTarget, fbmTarget, gradientTarget, trailReadTarget, trailWriteTarget]);

  useFrame((_, delta) => {
    if (!gl.capabilities.isWebGL2) {
      return;
    }

    const shouldAnimate = Boolean(frameData?.hasUpdate);

    if (needsClearRef.current) {
      clearRenderTarget(gl, trailReadTarget);
      clearRenderTarget(gl, trailWriteTarget);
      needsClearRef.current = false;
    }

    if (!shouldAnimate && !needsRenderRef.current) {
      return;
    }

    const animationRate = 0.75 + speed * 1.75;
    if (shouldAnimate) {
      timeRef.current += delta * animationRate;
    }
    const currentMousePos = getFlowMousePosition(timeRef.current, speed, motion);
    const currentRead = pingRef.current.read;
    const currentWrite = pingRef.current.write;

    setPassUniforms(gradientPassRef.current, {
      uTime: 0,
      uMousePos: currentMousePos,
    });
    gradientPassRef.current.render(
      gl,
      gradientPassRef.current.scene,
      gradientPassRef.current.camera,
      gradientTarget,
    );

    setPassUniforms(trailUpdatePassRef.current, {
      uPingPongTexture: currentRead.texture,
      uPreviousMousePos: previousMousePosRef.current,
      uMousePos: currentMousePos,
      uTime: 0,
      uResolution: [halfWidth, halfHeight],
    });
    trailUpdatePassRef.current.render(
      gl,
      trailUpdatePassRef.current.scene,
      trailUpdatePassRef.current.camera,
      currentWrite,
    );

    setPassUniforms(trailCompositePassRef.current, {
      uTexture: gradientTarget.texture,
      uPingPongTexture: currentWrite.texture,
    });
    trailCompositePassRef.current.render(
      gl,
      trailCompositePassRef.current.scene,
      trailCompositePassRef.current.camera,
      compositeTarget,
    );

    setPassUniforms(fbmPassRef.current, {
      uTexture: compositeTarget.texture,
      uTime: timeRef.current,
      uMousePos: currentMousePos,
      uResolution: [fbmWidth, fbmHeight],
    });
    fbmPassRef.current.render(gl, fbmPassRef.current.scene, fbmPassRef.current.camera, fbmTarget);

    if (shouldAnimate) {
      pingRef.current.read = currentWrite;
      pingRef.current.write = currentRead;
      previousMousePosRef.current.set(...currentMousePos);
    }
    needsRenderRef.current = false;
  }, -3);

  if (!gl.capabilities.isWebGL2) {
    return null;
  }

  return (
    <TexturePlane
      texture={fbmTarget.texture}
      width={width}
      height={height}
      x={x}
      y={y}
      originX={width / 2}
      originY={height / 2}
      rotation={rotation}
      zoom={zoom}
      opacity={opacity}
      sceneOpacity={sceneOpacity}
      sceneBlendMode={sceneBlendMode}
      sceneMask={sceneMask}
      sceneInverse={sceneInverse}
      sceneMaskCombine={sceneMaskCombine}
      renderOrder={order}
    />
  );
}
