uniform sampler2D inputTexture;
uniform float time;
uniform float intensity;
uniform float scale;
uniform float speed;
varying vec2 vUv;

#include "../func/simplex-noise-2d.glsl"

void main() {
    vec2 uv = vUv;

    // Two layers of simplex noise for organic look
    float n1 = snoise(uv * scale + vec2(time * speed * 0.7, 0.0));
    float n2 = snoise(uv * scale * 2.3 + vec2(0.0, time * speed * 0.5));

    // Combine and apply as UV offset
    vec2 offset = vec2(n1, n2) * intensity * 0.04;
    uv += offset;
    uv = clamp(uv, 0.0, 1.0);

    gl_FragColor = texture2D(inputTexture, uv);
}
