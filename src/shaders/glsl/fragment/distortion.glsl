uniform sampler2D inputTexture;
uniform float time;
uniform float amount;
uniform vec2 resolution;
varying vec2 vUv;

void main() {
    vec2 uv1 = vUv;
    vec2 uv = gl_FragCoord.xy/resolution.xy;
    float frequency = 6.0;
    float amplitude = 0.015 * amount;
    float x = uv1.y * frequency + time * .7;
    float y = uv1.x * frequency + time * .3;
    uv1.x += cos(x+y) * amplitude * cos(y);
    uv1.y += sin(x-y) * amplitude * cos(y);

    gl_FragColor = texture2D(inputTexture, uv1);
}