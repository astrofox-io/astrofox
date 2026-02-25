uniform sampler2D inputTexture;
uniform float time;
uniform float intensity;
uniform float speed;
uniform vec2 resolution;
varying vec2 vUv;

#include "../func/random.glsl"

void main() {
    vec2 uv = vUv;

    // Horizontal line jitter: each scanline row randomly shifts on X
    float lineY = floor(uv.y * resolution.y);
    float jitter = random(vec2(lineY, floor(time * 10.0))) * 2.0 - 1.0;
    uv.x += jitter * intensity * 0.04;

    // Occasional full-frame horizontal roll
    float roll = random(vec2(floor(time * 3.0), 0.5));
    if (roll > 0.92) {
        float rollAmt = random(vec2(floor(time * 5.0), 1.0)) * intensity * 0.15;
        uv.y = fract(uv.y + rollAmt);
    }

    // Clamp UVs
    uv = clamp(uv, 0.0, 1.0);

    // Sample image with distorted UVs
    vec4 color = texture2D(inputTexture, uv);

    // Color bleeding: red channel slightly offset to the left
    float bleedAmt = intensity * 0.008;
    vec4 colorLeft = texture2D(inputTexture, clamp(uv - vec2(bleedAmt, 0.0), 0.0, 1.0));
    color.r = mix(color.r, colorLeft.r, intensity * 0.6);

    // Scanlines
    float scanline = sin(uv.y * resolution.y * 3.14159) * 0.5 + 0.5;
    scanline = pow(scanline, 0.3);
    color.rgb *= mix(1.0, scanline, intensity * 0.35);

    // Random noise
    float noise = random(uv + vec2(time * 7.3, time * 3.1)) - 0.5;
    color.rgb += noise * intensity * 0.12;

    // Slight desaturation (tape degradation)
    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = mix(color.rgb, vec3(lum), intensity * 0.2);

    gl_FragColor = clamp(color, 0.0, 1.0);
}
