uniform sampler2D inputBuffer;
uniform vec2 resolution;
uniform float amount;
varying vec2 vUv;

float nrand(vec2 n) {
	return fract(sin(dot(n.xy, vec2(12.9898, 78.233)))* 43758.5453);
}

vec2 rot2d(vec2 p, float a) {
	vec2 sc = vec2(sin(a),cos(a));
	return vec2(dot(p, vec2(sc.y, -sc.x)), dot(p, sc.xy));
}

void main() {
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	vec4 src = texture2D(inputBuffer, vUv);

	float maxofs = 12.0 * amount;
	const int NUM_SAMPLES = 16;
	const int NUM_SAMPLES2 = NUM_SAMPLES / 2;
	const float NUM_SAMPLES_F = float(NUM_SAMPLES);
	const float anglestep = 6.28 / NUM_SAMPLES_F;
	const float MIPBIAS = -8.0;

	float rnd = nrand(0.01 * gl_FragCoord.xy);

	vec2 ofs[NUM_SAMPLES];
	{
		float angle = 3.1416 * rnd;
		for (int i = 0; i < NUM_SAMPLES2; ++i) {
			ofs[i] = rot2d(vec2(maxofs, 0.0), angle) / resolution.xy;
			angle += anglestep;
		}
	}
	
	vec4 sum = vec4(0.0);

	for (int i = 0; i < NUM_SAMPLES2; ++i) {
		sum += texture2D(inputBuffer, vec2(uv.x, uv.y) + ofs[i], MIPBIAS);
    }

	for (int i = 0; i < NUM_SAMPLES2; ++i) {
		sum += texture2D(inputBuffer, vec2(uv.x, uv.y) - ofs[i], MIPBIAS);
    }

	//gl_FragColor.rgb = sum.rgb / NUM_SAMPLES_F;
	//gl_FragColor.a = sum.a + src.a;
	gl_FragColor = sum / NUM_SAMPLES_F;
}