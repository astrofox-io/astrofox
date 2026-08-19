uniform sampler2D inputTexture;
uniform float warp;
varying vec2 vUv;

// Radial lens distortion: warp > 0 barrel (bulge), warp < 0 pincushion.
void main() {
    vec2 cc = vUv - 0.5;
    float dist = dot(cc, cc);
    vec2 uv = clamp(vUv + cc * dist * warp, 0.0, 1.0);

    gl_FragColor = texture2D(inputTexture, uv);
}
