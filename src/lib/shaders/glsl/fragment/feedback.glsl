uniform sampler2D inputTexture;
uniform sampler2D feedbackTexture;
uniform float decay;
uniform float zoom;
varying vec2 vUv;

void main() {
    vec4 current = texture2D(inputTexture, vUv);

    // Sample previous frame with slight zoom for psychedelic tunnel effect
    vec2 feedbackUV = (vUv - 0.5) / zoom + 0.5;
    feedbackUV = clamp(feedbackUV, 0.0, 1.0);
    vec4 feedback = texture2D(feedbackTexture, feedbackUV) * decay;

    // Additive blend: current frame always visible, echoes accumulate
    gl_FragColor = clamp(current + feedback * (1.0 - current.a * 0.5), 0.0, 1.0);
}
