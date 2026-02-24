uniform sampler2D inputTexture;
uniform float intensity;
uniform float radius;
uniform float softness;
varying vec2 vUv;

void main() {
    vec4 color = texture2D(inputTexture, vUv);

    // Distance from center
    vec2 uv = vUv - 0.5;
    float dist = length(uv);

    // Smooth vignette
    float vignette = smoothstep(radius, radius - softness, dist);

    // Lerp between darkened and original based on intensity
    color.rgb *= mix(1.0, vignette, intensity);

    gl_FragColor = color;
}
