import { Color, Mesh, PlaneGeometry, Vector2 } from 'three';
import type { GpuDisplay } from './GpuDisplayLayer';
import { planeVertex, shaderMaterial } from './materials';

const fragment = /* glsl */ `
uniform vec2 size;
uniform int shape;
uniform vec3 fillColor;
uniform vec3 strokeColor;
uniform float fillEnabled;
uniform float strokeWidth;
uniform float opacity;
varying vec2 vUv;

float polygonDistance(vec2 p, int count, float radius, float offset) {
  float distanceSquared = 1e20;
  float inside = 1.0;
  for (int i = 0; i < 6; i++) {
    if (i >= count) break;
    float a = float(i) * 6.28318530718 / float(count) + offset;
    float b = float(i + 1) * 6.28318530718 / float(count) + offset;
    vec2 v = radius * vec2(cos(a), sin(a));
    vec2 e = radius * vec2(cos(b), sin(b)) - v;
    vec2 q = p - v;
    vec2 d = q - e * clamp(dot(q, e) / dot(e, e), 0.0, 1.0);
    distanceSquared = min(distanceSquared, dot(d, d));
    inside *= step(0.0, e.x * q.y - e.y * q.x);
  }
  return sqrt(distanceSquared) * (1.0 - 2.0 * inside);
}

void main() {
  vec2 p = (vec2(vUv.x, 1.0 - vUv.y) - 0.5) * size;
  float d;
  if (shape == 0) d = length(p) - size.x * 0.5;
  else if (shape == 1) d = polygonDistance(p, 3, size.x * 0.5, -3.66519142919);
  else if (shape == 2) d = polygonDistance(p, 6, size.x * 0.5, 0.0);
  else d = max(abs(p.x) - size.x * 0.5, abs(p.y) - size.y * 0.5);
  float aa = max(fwidth(d), 0.0001);
  float outer = clamp(0.5 - d / aa, 0.0, 1.0);
  // Canvas clips a centered stroke to the shape, leaving its inner half.
  float stroke = strokeWidth > 0.0
    ? outer - clamp(0.5 - (d + strokeWidth * 0.5) / aa, 0.0, 1.0) : 0.0;
  float fill = outer * fillEnabled;
  float alpha = max(fill, stroke);
  if (alpha <= 0.0) discard;
  gl_FragColor = vec4(mix(fillColor, strokeColor, stroke / alpha), alpha * opacity);
  #include <colorspace_fragment>
}
`;

export class ShapeRenderer implements GpuDisplay {
  private material = shaderMaterial(planeVertex, fragment);
  object = new Mesh(new PlaneGeometry(1, 1), this.material);

  constructor() {
    this.material.uniforms = {
      size: { value: new Vector2() },
      shape: { value: 0 },
      fillColor: { value: new Color() },
      strokeColor: { value: new Color() },
      fillEnabled: { value: 1 },
      strokeWidth: { value: 0 },
      opacity: { value: 1 },
    };
  }

  update(p: Record<string, unknown>) {
    const width = Math.max(1, Math.round(Number(p.width || p.size || 100)));
    const height =
      p.shape === 'Rectangle' ? Math.max(1, Math.round(Number(p.height || p.width || 100))) : width;
    const strokeWidth = Math.max(0, Math.round(Number(p.strokeWidth || 0)));
    const w = width + 2 * strokeWidth;
    const h = height + 2 * strokeWidth;
    const u = this.material.uniforms;
    u.size.value.set(w, h);
    u.shape.value = ['Circle', 'Triangle', 'Hexagon'].indexOf(String(p.shape || 'Circle'));
    u.fillColor.value.set(String(p.color || '#FFFFFF'));
    u.strokeColor.value.set(String(p.strokeColor || '#FFFFFF'));
    u.fillEnabled.value = p.fill === false ? 0 : 1;
    u.strokeWidth.value = p.stroke ? strokeWidth : 0;
    u.opacity.value = Math.max(0, Math.min(1, Number(p.opacity ?? 1)));
    this.object.scale.set(w * Number(p.zoom ?? 1), h * Number(p.zoom ?? 1), 1);
  }

  dispose() {
    this.object.geometry.dispose();
    this.material.dispose();
  }
}
