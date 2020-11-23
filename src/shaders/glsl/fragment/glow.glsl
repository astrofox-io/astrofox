uniform sampler2D inputBuffer;
uniform float amount;
uniform float intensity;
uniform vec2 resolution;
varying vec2 vUv;

void main() {
    vec4 src = texture2D(inputBuffer, vUv);
    vec4 sum = vec4(0.0);
    float h = amount / resolution.x;
    float v = amount / resolution.y;

    // horizontal blur
    sum += texture2D(inputBuffer, vec2(vUv.x - 4.0 * h, vUv.y)) * 0.051;
    sum += texture2D(inputBuffer, vec2(vUv.x - 3.0 * h, vUv.y)) * 0.0918;
    sum += texture2D(inputBuffer, vec2(vUv.x - 2.0 * h, vUv.y)) * 0.12245;
    sum += texture2D(inputBuffer, vec2(vUv.x - 1.0 * h, vUv.y)) * 0.1531;
    sum += texture2D(inputBuffer, vec2(vUv.x, vUv.y)) * 0.1633;
    sum += texture2D(inputBuffer, vec2(vUv.x + 1.0 * h, vUv.y)) * 0.1531;
    sum += texture2D(inputBuffer, vec2(vUv.x + 2.0 * h, vUv.y)) * 0.12245;
    sum += texture2D(inputBuffer, vec2(vUv.x + 3.0 * h, vUv.y)) * 0.0918;
    sum += texture2D(inputBuffer, vec2(vUv.x + 4.0 * h, vUv.y)) * 0.051;

    // vertical blur
    sum += texture2D(inputBuffer, vec2(vUv.x, vUv.y - 4.0 * v)) * 0.051;
    sum += texture2D(inputBuffer, vec2(vUv.x, vUv.y - 3.0 * v)) * 0.0918;
    sum += texture2D(inputBuffer, vec2(vUv.x, vUv.y - 2.0 * v)) * 0.12245;
    sum += texture2D(inputBuffer, vec2(vUv.x, vUv.y - 1.0 * v)) * 0.1531;
    sum += texture2D(inputBuffer, vec2(vUv.x, vUv.y)) * 0.1633;
    sum += texture2D(inputBuffer, vec2(vUv.x, vUv.y + 1.0 * v)) * 0.1531;
    sum += texture2D(inputBuffer, vec2(vUv.x, vUv.y + 2.0 * v)) * 0.12245;
    sum += texture2D(inputBuffer, vec2(vUv.x, vUv.y + 3.0 * v)) * 0.0918;
    sum += texture2D(inputBuffer, vec2(vUv.x, vUv.y + 4.0 * v)) * 0.051;

    gl_FragColor = vec4(mix(src.rgb, sum.rgb, 0.6) * intensity, sum.a);
}