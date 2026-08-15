varying vec2 vUv;

uniform vec2 resolution;
uniform float time;
uniform float volume;
uniform float fft[64];
uniform float speed;
uniform float scale;

void main() {
  vec2 p = (vUv - 0.5) * scale;
  float bass = (fft[0] + fft[1] + fft[2] + fft[3]) * 0.25;
  float t = time * speed;

  float v = sin(p.x * 3.0 + t);
  v += sin(p.y * 4.0 - t);
  v += sin((p.x + p.y) * 5.0 + t * 0.5);
  v += sin(length(p) * 6.0 - t);
  v += bass * 4.0;

  vec3 color = 0.5 + 0.5 * cos(v + vec3(0.0, 2.094, 4.188));

  gl_FragColor = vec4(color * (0.35 + bass * 0.9), 1.0);
}
