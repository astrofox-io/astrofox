import { Color, DoubleSide, LinearSRGBColorSpace, ShaderMaterial } from 'three';

export function shaderMaterial(vertexShader: string, fragmentShader: string) {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    side: DoubleSide,
  });
}

export const planeVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Preserve canvas interpolation in sRGB, decoding after interpolation. Rebuild
// the program only when the number of stops changes, not when colors animate.
export function setGradient(material: ShaderMaterial, name: string, value: unknown) {
  const stops = Array.isArray(value) && value.length ? value : [value || '#FFFFFF'];
  const uniform = material.uniforms[name];
  const colors: Color[] = uniform?.value || [];
  if (colors.length !== stops.length) {
    colors.length = stops.length;
    material.defines[`${name.toUpperCase()}_COUNT`] = stops.length;
    material.needsUpdate = true;
  }
  for (let i = 0; i < stops.length; i++) {
    colors[i] ||= new Color();
    colors[i].setStyle(String(stops[i]), LinearSRGBColorSpace);
  }
  material.uniforms[name] ||= { value: colors };
}

export function gradientShader(name: string) {
  const count = `${name.toUpperCase()}_COUNT`;
  return /* glsl */ `
uniform vec3 ${name}[${count}];
vec3 ${name}At(float t) {
  float stop = clamp(t, 0.0, 1.0) * float(${count} - 1);
  int i = int(floor(stop));
  return mix(${name}[i], ${name}[min(i + 1, ${count} - 1)], fract(stop));
}
`;
}
