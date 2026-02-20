uniform float time;
uniform float size;
uniform float depth;
varying vec2 vUv;
varying float vNoise;

#include "../func/simplex-noise-2d.glsl"

void main() {
    vUv = uv;
    vNoise = snoise(vUv* size + time);

    vec3 newPosition = position + normal * vNoise * depth;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}