varying vec2 vUv;

uniform sampler2D inputTexture;
uniform vec2 resolution;
uniform float time;
uniform float volume;
uniform float amount;
uniform vec3 tint;

void main() {
  vec4 tex = texture2D(inputTexture, vUv);
  float dist = distance(vUv, vec2(0.5));
  float glow = volume * amount * smoothstep(0.8, 0.0, dist);

  gl_FragColor = vec4(tex.rgb + tint * glow, tex.a);
}
