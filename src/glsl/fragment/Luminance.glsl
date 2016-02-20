uniform sampler2D tDiffuse;
uniform float amount;

varying vec2 vUv;

void main(void) {
    const vec3 luminanceVector = vec3(0.2125, 0.7154, 0.0721);
    vec4 src = texture2D(tDiffuse, vUv);

    float luminance = dot(luminanceVector, src.rgb);
    luminance = max(0.0, luminance - amount);

    gl_FragColor = src * sign(luminance);
}