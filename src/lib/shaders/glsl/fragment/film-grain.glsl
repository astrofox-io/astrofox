uniform sampler2D inputTexture;
uniform float time;
uniform float intensity;
uniform float size;
uniform int colored;
uniform int premultiply;
varying vec2 vUv;

#include "../func/random.glsl"

void main() {
    vec4 color = texture2D(inputTexture, vUv);

    // Quantize UVs to grain cell size
    vec2 grainUV = floor(vUv * size) / size;

    vec3 grain;
    if (colored > 0) {
        float r = random(grainUV + vec2(time * 1.3, 0.0));
        float g = random(grainUV + vec2(0.0, time * 1.7));
        float b = random(grainUV + vec2(time * 0.9, time * 1.1));
        grain = vec3(r, g, b) - 0.5;
    } else {
        grain = vec3(random(grainUV + vec2(time)) - 0.5);
    }

    // Premultiply: scale grain by the image so it only shows in lit areas
    if (premultiply > 0) {
        grain *= color.rgb;
    }

    color.rgb += grain * intensity;

    gl_FragColor = clamp(color, 0.0, 1.0);
}
