uniform sampler2D inputTexture;
uniform sampler2D displacementTexture;
uniform float shift;
uniform float angle;
uniform float seed;
uniform float seed_x;
uniform float seed_y;
uniform float distortion_x;
uniform float distortion_y;
uniform float col_s;
uniform int horizontal;
uniform int vertical;
varying vec2 vUv;

#include "../func/random.glsl"

void main() {
    vec2 p = vUv;
    float xs = floor(gl_FragCoord.x / 0.5);
    float ys = floor(gl_FragCoord.y / 0.5);

    // based on staffantans glitch shader for unity https://github.com/staffantan/unityglitch
    vec4 normal = texture2D (displacementTexture, p * seed * seed);
    if (horizontal > 0 && p.y < distortion_x + col_s && p.y > distortion_x - col_s * seed) {
        if (seed_x > 0.){
            p.y = 1. - (p.y + distortion_y);
        }
        else {
            p.y = distortion_y;
        }
    }
    if (vertical > 0 && p.x < distortion_y + col_s && p.x > distortion_y - col_s * seed) {
        if (seed_y > 0.) {
            p.x = distortion_x;
        }
        else {
            p.x = 1. - (p.x + distortion_x);
        }
    }
    p.x += normal.x * seed_x * (seed/5.);
    p.y += normal.y * seed_y * (seed/5.);

    vec2 offset = shift * vec2(cos(angle), sin(angle));
    vec4 cr = texture2D(inputTexture, p + offset);
    vec4 cga = texture2D(inputTexture, p);
    vec4 cb = texture2D(inputTexture, p - offset);

    gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
}