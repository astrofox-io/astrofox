// @ts-nocheck
export const TRIANGLE_ANGLE = (2 * Math.PI) / 3;
export const HEXAGON_ANGLE = (2 * Math.PI) / 6;
export const WAVELENGTH_MAX = 0.25;
export const LUMA = [0.2126, 0.7152, 0.0722];

export const MASK_VERTEX_SHADER = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const MASK_FRAGMENT_SHADER = `
uniform sampler2D map;
uniform float opacity;
uniform float inverse;
uniform vec3 luma;
varying vec2 vUv;

void main() {
	vec4 tex = texture2D(map, vUv) * opacity;
	float lightness = dot(tex.rgb, luma);
	float alpha = inverse > 0.5 ? 1.0 - lightness : lightness;
	gl_FragColor = vec4(0.0, 0.0, 0.0, clamp(alpha, 0.0, 1.0));
}
`;

export function toRadians(value = 0) {
	return (Number(value) * Math.PI) / 180;
}
