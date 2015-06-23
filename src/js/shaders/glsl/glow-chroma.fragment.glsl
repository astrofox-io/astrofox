uniform sampler2D uTexture;
uniform sampler2D uBlurTexture;
uniform float uBeat;

const vec2 center = vec2(0.5, 0.5);

varying vec2 vTextureCoord;

void main(void) {
	vec3 c = texture2D(uTexture, vTextureCoord).rgb;
    vec3 b = texture2D(uBlurTexture, vTextureCoord).rgb;
    gl_FragColor = vec4(mix(c, b, 0.6), 1.0);
}