uniform sampler2D inputTexture;
uniform vec2 center;
uniform float angle;
uniform float scale;
uniform vec2 resolution;
varying vec2 vUv;

float pattern(float angle) {
    float s = sin(angle), c = cos(angle);
    vec2 tex = vUv * resolution - center;
    vec2 point = vec2(c * tex.x - s * tex.y, s * tex.x + c * tex.y) * scale;
    float r = (sin(point.x) * sin(point.y)) * 4.0;

    return r;
}

void main() {
    vec4 color = texture2D(inputTexture, vUv);
    vec3 cmy = 1.0 - color.rgb;
    float k = min(cmy.x, min(cmy.y, cmy.z));

    cmy = (cmy - k) / (1.0 - k);
    cmy = clamp(cmy * 10.0 - 3.0 + vec3(pattern(angle + 0.26179), pattern(angle + 1.30899), pattern(angle)), 0.0, 1.0);
    k = clamp(k * 10.0 - 5.0 + pattern(angle + 0.78539), 0.0, 1.0);

    gl_FragColor = vec4(1.0 - cmy - k, color.a);
}