uniform sampler2D inputTexture;
uniform float time;
uniform float amplitude;
uniform float frequency;
uniform float speed;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    vec2 center = vec2(0.5, 0.5);
    vec2 delta = uv - center;
    float dist = length(delta);

    // Radial sine wave emanating from center
    float wave = sin(dist * frequency * 20.0 - time * speed * 8.0);
    float attenuation = max(0.0, 1.0 - dist * 2.0);

    vec2 offset = normalize(delta + vec2(0.0001)) * wave * amplitude * 0.05 * attenuation;
    uv += offset;
    uv = clamp(uv, 0.0, 1.0);

    gl_FragColor = texture2D(inputTexture, uv);
}
