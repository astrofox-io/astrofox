uniform sampler2D inputTexture;
uniform float amount;
uniform float angle;
varying vec2 vUv;

void main() {
    vec2 offset = amount * vec2(cos(angle), sin(angle));
    vec4 cr = texture2D(inputTexture, vUv + offset);
    vec4 cg = texture2D(inputTexture, vUv);
    vec4 cb = texture2D(inputTexture, vUv - offset);
    float opacity = cr.a + cg.a + cb.a;

    gl_FragColor = vec4(cr.r, cg.g, cb.b, opacity);
}