uniform sampler2D inputTexture;
uniform float time;
uniform float amount;
uniform float scale;
uniform int mode;
uniform vec2 resolution;
varying vec2 vUv;

#include "../func/classic-noise-3d.glsl"

// 2D simplex noise (Ashima Arts, MIT). Inlined rather than included so the
// shared mod289(vec3) helper isn't redefined alongside classic-noise-3d.
vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
    return mod289(((x * 34.0) + 1.0) * x);
}

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float fbm(vec3 point) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 4; i++) {
        value += amplitude * cnoise(point);
        point *= 2.0;
        amplitude *= 0.5;
    }

    return value;
}

void main() {
    vec2 uv = vUv;

    if (mode == 1) {
        // Simplex noise: two layers of scrolling simplex noise for organic turbulence
        float t = time * 0.1;
        float n1 = snoise(uv * scale + vec2(t * 0.7, 0.0));
        float n2 = snoise(uv * scale * 2.3 + vec2(0.0, t * 0.5));
        uv += vec2(n1, n2) * amount * 0.005;
    } else if (mode == 2) {
        // Perlin noise: aspect-corrected 3D classic noise FBM evolving over time
        float aspect = resolution.x / max(resolution.y, 1.0);
        vec2 noiseUv = (uv - 0.5) * vec2(aspect, 1.0);
        vec3 noisePoint = vec3(noiseUv * max(scale, 0.001), time);
        vec2 flow = vec2(fbm(noisePoint), fbm(noisePoint + vec3(23.7, 11.3, 5.1)));
        uv += flow * amount * vec2(0.0035 / aspect, 0.0035);
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
