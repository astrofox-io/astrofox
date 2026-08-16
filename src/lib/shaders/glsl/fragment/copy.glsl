uniform sampler2D inputTexture;
uniform float opacity;
uniform int alpha;
varying vec2 vUv;

void main() {
    vec4 texture = texture2D(inputTexture, vUv);

    gl_FragColor = opacity * texture;

    if (alpha == 1) {
        gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
    }

    #include <tonemapping_fragment>
    #include <colorspace_fragment>

    #ifdef ENCODE_SRGB
    // When rendering into a texture (not the screen), three.js leaves the
    // output in the linear working color space. Apply the sRGB transfer
    // manually so pixel readbacks match what is shown on screen.
    gl_FragColor = sRGBTransferOETF(gl_FragColor);
    #endif
}
