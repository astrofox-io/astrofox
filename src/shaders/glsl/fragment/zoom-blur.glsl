uniform sampler2D inputTexture;
uniform vec2 center;
uniform float amount;
uniform vec2 resolution;
varying vec2 vUv;

#include "../func/random.glsl"

void main() {
    vec4 color = vec4(0.0);
    float total = 0.0;
    vec2 c = center * resolution;
    vec2 toCenter = c - vUv * resolution;
    float offset = random(vUv);

    for (float t = 0.0; t <= 40.0; t++) {
        float percent = (t) / 40.0;
        float weight = 4.0 * (percent - percent * percent);
        vec4 s = texture2D(inputTexture, vUv + toCenter * percent * amount / resolution);
        color += s * weight;
        total += weight;
    }

    gl_FragColor = color / total;
}
