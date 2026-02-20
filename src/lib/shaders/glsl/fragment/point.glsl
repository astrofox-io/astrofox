uniform vec3 color;
uniform sampler2D inputTexture;
uniform float opacity;
varying vec3 vColor;

void main() {
    gl_FragColor = vec4(color * vColor, 1.0) * texture2D(inputTexture, gl_PointCoord);

    if (gl_FragColor.a < ALPHATEST) {
        discard;
    }

    gl_FragColor.a = gl_FragColor.a * opacity;
}