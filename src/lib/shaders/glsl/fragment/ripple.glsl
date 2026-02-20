uniform float time;
varying vec2 vUv;
varying float vNoise;

const vec3 black = vec3(0.0, 0.0, 0.0);

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec3 c = hsv2rgb(vec3((vUv.x + time, 0.8, 0.7)));

    gl_FragColor = vec4(mix(c, black, -vNoise), 1.0);
}