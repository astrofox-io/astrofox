uniform sampler2D inputTexture;
uniform float warp;
uniform float chromatic;
varying vec2 vUv;

vec2 barrelDistort(vec2 uv, float k) {
    vec2 cc = uv - 0.5;
    float dist = dot(cc, cc);
    return uv + cc * dist * k;
}

void main() {
    vec2 uv = vUv;

    float k = warp * 0.8;
    float ca = chromatic * 0.015;

    // Sample each channel with a slightly different warp strength
    vec2 uvR = barrelDistort(uv, k + ca);
    vec2 uvG = barrelDistort(uv, k);
    vec2 uvB = barrelDistort(uv, k - ca);

    // Clamp to avoid sampling outside bounds
    uvR = clamp(uvR, 0.0, 1.0);
    uvG = clamp(uvG, 0.0, 1.0);
    uvB = clamp(uvB, 0.0, 1.0);

    float r = texture2D(inputTexture, uvR).r;
    float g = texture2D(inputTexture, uvG).g;
    float b = texture2D(inputTexture, uvB).b;
    float a = texture2D(inputTexture, uvG).a;

    gl_FragColor = vec4(r, g, b, a);
}
