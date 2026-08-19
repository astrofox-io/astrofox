uniform sampler2D inputTexture;
uniform float time;
uniform float amount;
uniform float scale;
uniform int mode;
varying vec2 vUv;

#include "../func/simplex-noise-2d.glsl"

void main() {
    vec2 uv = vUv;

    if (mode == 1) {
        // Noise: two layers of scrolling simplex noise for organic turbulence
        float t = time * 0.1;
        float n1 = snoise(uv * scale + vec2(t * 0.7, 0.0));
        float n2 = snoise(uv * scale * 2.3 + vec2(0.0, t * 0.5));
        uv += vec2(n1, n2) * amount * 0.005;
    } else {
        // Wave: regular periodic sine/cosine ripple
        float frequency = scale * 2.0;
        float amplitude = 0.015 * amount;
        float x = uv.y * frequency + time * 0.7;
        float y = uv.x * frequency + time * 0.3;
        uv.x += cos(x + y) * amplitude * cos(y);
        uv.y += sin(x - y) * amplitude * cos(y);
    }

    gl_FragColor = texture2D(inputTexture, clamp(uv, 0.0, 1.0));
}
