uniform sampler2D inputTexture;
uniform float time;
uniform float intensity;
uniform float size;
uniform int colored;
varying vec2 vUv;

#include "../func/random.glsl"

void main() {
    vec4 color = texture2D(inputTexture, vUv);

    // Quantize UVs to grain cell size
    vec2 grainUV = floor(vUv * size) / size;

    if (colored > 0) {
        float r = random(grainUV + vec2(time * 1.3, 0.0));
        float g = random(grainUV + vec2(0.0, time * 1.7));
        float b = random(grainUV + vec2(time * 0.9, time * 1.1));
        color.rgb += (vec3(r, g, b) - 0.5) * intensity;
    } else {
        float grain = random(grainUV + vec2(time));
        color.rgb += (grain - 0.5) * intensity;
    }

    gl_FragColor = clamp(color, 0.0, 1.0);
}
