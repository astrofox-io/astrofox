uniform sampler2D inputBuffer;
uniform float spacing;
uniform float size;
uniform float blur;
uniform vec2 resolution;

varying vec2 vUv;

void main() {
    vec2 count = vec2(resolution / spacing);
    vec2 p = floor(vUv * count) / count;

    vec4 color = texture2D(inputBuffer, p);

    vec2 pos = mod(gl_FragCoord.xy, vec2(spacing)) - vec2(spacing / 2.0);
    float dist_squared = dot(pos, pos);

    gl_FragColor = mix(color, vec4(0.0), smoothstep(size, size + blur, dist_squared));
}