uniform sampler2D inputBuffer;
uniform float size;
uniform vec2 resolution;
varying vec2 vUv;

void main() {
	float d = size / resolution.x;
	float u = floor(vUv.x / d) * d;

	d = size / resolution.y;
	float v = floor(vUv.y / d) * d;

	gl_FragColor = texture2D(inputBuffer, vec2(u, v));
}