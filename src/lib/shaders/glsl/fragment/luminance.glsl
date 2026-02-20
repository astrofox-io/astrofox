uniform sampler2D inputTexture;
uniform float amount;
varying vec2 vUv;

const vec3 vLuma = vec3(0.2126, 0.7152, 0.0722);

void main(void) {
    vec4 src = texture2D(inputTexture, vUv);
    float luma = dot(vLuma, src.rgb);

    luma = max(0.0, luma - amount);

    gl_FragColor = src * sign(luma);
}