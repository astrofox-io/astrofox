uniform sampler2D tDiffuse;
uniform float spacing;
uniform float size;
uniform float blur;
uniform vec2 resolution;

varying vec2 vUv;

void main() {
    vec2 count = vec2(resolution / spacing);
    vec2 p = floor(vUv * count) / count;

    vec4 color = texture2D(tDiffuse, p);

    vec2 pos = mod(gl_FragCoord.xy, vec2(spacing)) - vec2(spacing / 2.0);
    float dist_squared = dot(pos, pos);

    gl_FragColor = mix(color, vec4(0.0), smoothstep(size, size + blur, dist_squared));
    //gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
}