uniform vec2 center;
uniform float angle;
uniform float scale;
uniform vec2 tSize;

uniform sampler2D tDiffuse;

varying vec2 vUv;

float pattern() {
    float s = sin(angle), c = cos(angle);

    vec2 tex = vUv * tSize - center;
    vec2 point = vec2(c * tex.x - s * tex.y, s * tex.x + c * tex.y) * scale;

    float p = (sin( point.x ) * sin( point.y )) * 4.0;

    return p;
}

void main() {
    vec4 color = texture2D(tDiffuse, vUv);

    float average = (color.r + color.g + color.b) / 3.0;

    gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);
}