uniform sampler2D inputBuffer;
uniform sampler2D extraBuffer;
uniform vec2 delta0;
uniform vec2 delta1;
uniform float power;
uniform int pass;
varying vec2 vUv;

#include "../func/random.glsl"

vec4 blur(vec2 delta) {
    float offset = random(delta);
    vec4 color = vec4(0.0);
    float total = 0.0;

    for (float t = 0.0; t <= 30.0; t++) {
        float percent = (t + offset) / 30.0;
        color += texture2D(inputBuffer, vUv + delta * percent);
        total += 1.0;
    }

    return color / total;
}

void main() {
    if (pass == 0) {
        vec4 color = texture2D(inputBuffer, vUv);
        gl_FragColor = pow(color, vec4(power));
    }

    if (pass == 1) {
        gl_FragColor = blur(delta0);
    }

    if (pass == 2) {
        gl_FragColor = (blur(delta0) + blur(delta1)) * 0.5;
    }

    if (pass == 3) {
        vec4 color = (blur(delta0) + 2.0 * texture2D(extraBuffer, vUv)) / 3.0;
        gl_FragColor = pow(color, vec4(power));
    }
}