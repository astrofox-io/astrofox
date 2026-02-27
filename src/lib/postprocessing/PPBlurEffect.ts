// @ts-nocheck
import { Effect, EffectAttribute } from "postprocessing";
import { Uniform, Vector2 } from "three";

const fragmentShader = `
uniform float amount;
uniform int blurType;
uniform float centerX;
uniform float centerY;
uniform float radius;
uniform float brightness;
uniform float blurAngle;
uniform vec2 sceneResolution;

vec4 boxBlur(vec2 uv, float amt) {
	float d = amt / max(sceneResolution.x, sceneResolution.y);
	vec4 sum = vec4(0.0);
	float count = 0.0;
	for (float x = -4.0; x <= 4.0; x += 1.0) {
		for (float y = -4.0; y <= 4.0; y += 1.0) {
			sum += texture2D(inputBuffer, uv + vec2(x, y) * d);
			count += 1.0;
		}
	}
	return sum / count;
}

vec4 gaussianBlur(vec2 uv, float amt) {
	float h = amt / sceneResolution.x;
	float v = amt / sceneResolution.y;
	vec4 sum = vec4(0.0);

	// Horizontal pass - Gaussian weights for 9-tap kernel (sigma ~2.0)
	sum += texture2D(inputBuffer, vec2(uv.x - 4.0 * h, uv.y)) * 0.0162;
	sum += texture2D(inputBuffer, vec2(uv.x - 3.0 * h, uv.y)) * 0.0540;
	sum += texture2D(inputBuffer, vec2(uv.x - 2.0 * h, uv.y)) * 0.1216;
	sum += texture2D(inputBuffer, vec2(uv.x - 1.0 * h, uv.y)) * 0.1945;
	sum += texture2D(inputBuffer, vec2(uv.x, uv.y)) * 0.2270;
	sum += texture2D(inputBuffer, vec2(uv.x + 1.0 * h, uv.y)) * 0.1945;
	sum += texture2D(inputBuffer, vec2(uv.x + 2.0 * h, uv.y)) * 0.1216;
	sum += texture2D(inputBuffer, vec2(uv.x + 3.0 * h, uv.y)) * 0.0540;
	sum += texture2D(inputBuffer, vec2(uv.x + 4.0 * h, uv.y)) * 0.0162;

	// Vertical pass
	vec4 sum2 = vec4(0.0);
	sum2 += texture2D(inputBuffer, vec2(uv.x, uv.y - 4.0 * v)) * 0.0162;
	sum2 += texture2D(inputBuffer, vec2(uv.x, uv.y - 3.0 * v)) * 0.0540;
	sum2 += texture2D(inputBuffer, vec2(uv.x, uv.y - 2.0 * v)) * 0.1216;
	sum2 += texture2D(inputBuffer, vec2(uv.x, uv.y - 1.0 * v)) * 0.1945;
	sum2 += texture2D(inputBuffer, vec2(uv.x, uv.y)) * 0.2270;
	sum2 += texture2D(inputBuffer, vec2(uv.x, uv.y + 1.0 * v)) * 0.1945;
	sum2 += texture2D(inputBuffer, vec2(uv.x, uv.y + 2.0 * v)) * 0.1216;
	sum2 += texture2D(inputBuffer, vec2(uv.x, uv.y + 3.0 * v)) * 0.0540;
	sum2 += texture2D(inputBuffer, vec2(uv.x, uv.y + 4.0 * v)) * 0.0162;

	return (sum + sum2) * 0.5;
}

vec4 circularBlur(vec2 uv, float amt) {
	float d = amt / max(sceneResolution.x, sceneResolution.y);
	vec4 sum = vec4(0.0);
	float count = 0.0;

	// 16-sample Poisson disc pattern
	sum += texture2D(inputBuffer, uv + vec2( 0.0,  0.0) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2( 1.0,  0.0) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2(-1.0,  0.0) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2( 0.0,  1.0) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2( 0.0, -1.0) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2( 0.707,  0.707) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2(-0.707,  0.707) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2( 0.707, -0.707) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2(-0.707, -0.707) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2( 2.0,  0.0) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2(-2.0,  0.0) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2( 0.0,  2.0) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2( 0.0, -2.0) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2( 1.414,  1.414) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2(-1.414,  1.414) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2( 1.414, -1.414) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2(-1.414, -1.414) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2( 3.0,  0.0) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2(-3.0,  0.0) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2( 0.0,  3.0) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2( 0.0, -3.0) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2( 2.121,  2.121) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2(-2.121,  2.121) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2( 2.121, -2.121) * d); count += 1.0;
	sum += texture2D(inputBuffer, uv + vec2(-2.121, -2.121) * d); count += 1.0;

	return sum / count;
}

vec4 triangleBlur(vec2 uv, float amt) {
	float d = amt / max(sceneResolution.x, sceneResolution.y);
	vec4 sum = vec4(0.0);
	float total = 0.0;
	for (float x = -4.0; x <= 4.0; x += 1.0) {
		for (float y = -4.0; y <= 4.0; y += 1.0) {
			float w = max(0.0, 5.0 - abs(x) - abs(y));
			sum += texture2D(inputBuffer, uv + vec2(x, y) * d) * w;
			total += w;
		}
	}
	return sum / max(total, 0.0001);
}

vec4 zoomBlur(vec2 uv, float amt, vec2 center) {
	vec4 color = vec4(0.0);
	float total = 0.0;
	vec2 c = center * sceneResolution;
	vec2 toCenter = c - uv * sceneResolution;

	for (float t = 0.0; t <= 40.0; t++) {
		float percent = t / 40.0;
		float weight = 4.0 * (percent - percent * percent);
		vec4 s = texture2D(inputBuffer, uv + toCenter * percent * amt / sceneResolution);
		color += s * weight;
		total += weight;
	}

	return color / max(total, 0.0001);
}

vec4 lensBlur(vec2 uv, float r, float bright, float a) {
	vec2 dir = vec2(cos(a), sin(a));
	float d = r / max(sceneResolution.x, sceneResolution.y);
	vec4 sum = vec4(0.0);
	sum += texture2D(inputBuffer, uv + dir * d * -4.0);
	sum += texture2D(inputBuffer, uv + dir * d * -3.0);
	sum += texture2D(inputBuffer, uv + dir * d * -2.0);
	sum += texture2D(inputBuffer, uv + dir * d * -1.0);
	sum += texture2D(inputBuffer, uv);
	sum += texture2D(inputBuffer, uv + dir * d * 1.0);
	sum += texture2D(inputBuffer, uv + dir * d * 2.0);
	sum += texture2D(inputBuffer, uv + dir * d * 3.0);
	sum += texture2D(inputBuffer, uv + dir * d * 4.0);
	vec4 color = sum / 9.0;
	color.rgb += bright;
	return vec4(clamp(color.rgb, 0.0, 1.0), color.a);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	// blurType: 0=Box, 1=Circular, 2=Gaussian, 3=Triangle, 4=Zoom, 5=Lens
	float scaledAmount = amount * 10.0;
	if (blurType == 0) {
		outputColor = boxBlur(uv, scaledAmount);
	} else if (blurType == 1) {
		outputColor = circularBlur(uv, scaledAmount);
	} else if (blurType == 2) {
		outputColor = gaussianBlur(uv, scaledAmount);
	} else if (blurType == 3) {
		outputColor = triangleBlur(uv, amount * 200.0);
	} else if (blurType == 4) {
		outputColor = zoomBlur(uv, amount, vec2(centerX, centerY));
	} else if (blurType == 5) {
		outputColor = lensBlur(uv, radius, brightness, blurAngle);
	}
}
`;

export class PPBlurEffect extends Effect {
	constructor({
		amount = 0,
		blurType = 2,
		centerX = 0.5,
		centerY = 0.5,
		radius = 10,
		brightness = 0,
		blurAngle = 0,
		width = 1,
		height = 1,
	} = {}) {
		super("PPBlurEffect", fragmentShader, {
			attributes: EffectAttribute.CONVOLUTION,
			uniforms: new Map([
				["amount", new Uniform(amount)],
				["blurType", new Uniform(blurType)],
				["centerX", new Uniform(centerX)],
				["centerY", new Uniform(centerY)],
				["radius", new Uniform(radius)],
				["brightness", new Uniform(brightness)],
				["blurAngle", new Uniform(blurAngle)],
				["sceneResolution", new Uniform(new Vector2(width, height))],
			]),
		});
	}
}
