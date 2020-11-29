uniform sampler2D inputTexture;
uniform float sides;
uniform float angle;
varying vec2 vUv;

void main() {
    vec2 p = vUv - 0.5;
    float r = length(p);
    float a = atan(p.y, p.x) + angle;
    float tau = 2. * 3.1416;
    a = mod(a, tau/sides);
    a = abs(a - tau/sides/2.);
    p = r * vec2(cos(a), sin(a));

    gl_FragColor = texture2D(inputTexture, p + 0.5);
}