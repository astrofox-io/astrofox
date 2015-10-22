uniform sampler2D tDiffuse;
uniform float opacity;

varying vec2 vUv;

void main() {
    vec4 texture = texture2D(tDiffuse, vUv);

    gl_FragColor = opacity * texture;
}