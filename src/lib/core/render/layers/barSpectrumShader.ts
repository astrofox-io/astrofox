export const barVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const barFragmentShader = /* glsl */ `
uniform sampler2D spectrum;
uniform float spectrumWidth;
uniform float binCount;
uniform float displayWidth;
uniform float barHeight;
uniform float shadowHeight;
uniform float minHeight;
uniform float barWidth;
uniform float barPitch;
uniform float binStep;
uniform float opacity;
uniform vec3 colors[BAR_COLOR_COUNT];
uniform vec3 shadowColors[SHADOW_COLOR_COUNT];
varying vec2 vUv;

// Coverage in display pixels, with derivatives keeping edges smooth at any zoom.
float rectangle(vec2 point, vec2 lower, vec2 upper, vec2 pixelWidth) {
  vec2 coverage = clamp((point - lower) / pixelWidth + 0.5, 0.0, 1.0)
    - clamp((point - upper) / pixelWidth + 0.5, 0.0, 1.0);
  return coverage.x * coverage.y;
}

void main() {
  vec2 point = vec2(vUv.x * displayWidth, (1.0 - vUv.y) * (barHeight + shadowHeight));
  vec2 pixelWidth = max(fwidth(point), vec2(0.0001));
  float column = floor(point.x / barPitch);
  float index = floor(column * binStep);
  if (index >= binCount || barWidth <= 0.0) discard;

  float amplitude = texture2D(spectrum, vec2((index + 0.5) / spectrumWidth, 0.5)).r;
  float left = column * barPitch;
  float top = barHeight - clamp(amplitude * barHeight, min(minHeight, barHeight), barHeight);
  float barAlpha = rectangle(point, vec2(left, top), vec2(left + barWidth, barHeight), pixelWidth);
  float shadowAlpha = rectangle(point, vec2(left, barHeight),
    vec2(left + barWidth, barHeight + amplitude * shadowHeight), pixelWidth);

  float barStop = clamp(point.y / max(barHeight, 0.0001), 0.0, 1.0) * float(BAR_COLOR_COUNT - 1);
  int barIndex = int(floor(barStop));
  vec3 barColor = mix(colors[barIndex], colors[min(barIndex + 1, BAR_COLOR_COUNT - 1)], fract(barStop));
  float shadowStop = clamp((point.y - barHeight) / max(shadowHeight, 0.0001), 0.0, 1.0)
    * float(SHADOW_COLOR_COUNT - 1);
  int shadowIndex = int(floor(shadowStop));
  vec3 shadowColor = mix(shadowColors[shadowIndex],
    shadowColors[min(shadowIndex + 1, SHADOW_COLOR_COUNT - 1)], fract(shadowStop));

  float alpha = barAlpha + shadowAlpha;
  if (alpha <= 0.0) discard;
  vec3 color = (barColor * barAlpha + shadowColor * shadowAlpha) / alpha;
  gl_FragColor = sRGBTransferEOTF(vec4(color, min(alpha, 1.0) * opacity));
  #include <colorspace_fragment>
}
`;
