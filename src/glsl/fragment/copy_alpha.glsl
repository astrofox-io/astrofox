uniform sampler2D tBase;
uniform sampler2D tAdd;
uniform float amount;

varying vec2 vUv;

void main() {
    vec4 t1 = texture2D( tBase, vUv );
    vec4 t2 = texture2D( tAdd, vUv );
    gl_FragColor = (t1 * (1.0 - t2.a))+(t2 * t2.a);
}