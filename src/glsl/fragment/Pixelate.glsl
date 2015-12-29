uniform sampler2D tDiffuse;
uniform float amount;
uniform vec2 resolution;

varying vec2 vUv;

void main() {
	float d = 1.0 / amount;
	float ar = resolution.x / resolution.y;
	float u = floor(vUv.x / d) * d;
	d = ar / amount;
	float v = floor(vUv.y / d) * d;

	gl_FragColor = texture2D(tDiffuse, vec2(u, v));
}