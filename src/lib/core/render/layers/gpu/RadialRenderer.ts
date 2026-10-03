import {
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  PlaneGeometry,
} from 'three';
import FFTParser from '@/lib/audio/FFTParser';
import type { RenderFrameData } from '@/lib/types';
import type { GpuDisplay } from './GpuDisplayLayer';
import { gradientShader, setGradient, shaderMaterial } from './materials';
import { VectorSurface } from './VectorSurface';

const vertex = /* glsl */ `
attribute vec3 bar;
uniform float slots;
uniform float radius;
uniform float innerRadius;
uniform float barWidth;
uniform float shadowLength;
uniform float center;
varying vec2 vPoint;
varying vec2 vLocal;
varying vec2 vSize;
varying float vShadow;
void main() {
  float angleStep = 6.28318530718 / slots;
  float angle = (bar.x + 0.3) * angleStep - 1.57079632679;
  vec2 direction = vec2(cos(angle), sin(angle));
  vec2 tangent = vec2(-direction.y, direction.x);
  float width = min(barWidth, innerRadius * angleStep * 0.6);
  float height = bar.y * radius * mix(1.0, shadowLength, bar.z);
  // One pixel of padding lets the fragment shader cover the rectangle edges.
  vLocal = vec2(position.x * (width + 2.0), (position.y + 0.5) * (height + 2.0) - 1.0);
  vSize = vec2(width, height);
  vShadow = bar.z;
  vPoint = vec2(center) + direction * (innerRadius + vLocal.y * (1.0 - 2.0 * bar.z))
    + tangent * vLocal.x;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPoint, 0.0, 1.0);
}
`;
const fragment = /* glsl */ `
uniform float radius;
uniform float innerRadius;
uniform float center;
varying vec2 vPoint;
varying vec2 vLocal;
varying vec2 vSize;
varying float vShadow;
${gradientShader('colors')}
${gradientShader('shadowColors')}
void main() {
  if (vSize.y < 1.0 || vSize.x <= 0.0) discard;
  vec2 pixel = max(fwidth(vLocal), vec2(0.0001));
  vec2 lower = vec2(-vSize.x * 0.5, 0.0);
  vec2 upper = vec2(vSize.x * 0.5, vSize.y);
  vec2 coverage = clamp((vLocal - lower) / pixel + 0.5, 0.0, 1.0)
    - clamp((vLocal - upper) / pixel + 0.5, 0.0, 1.0);
  // Canvas applies each rectangle's transform to the gradient as well. Keep
  // that local coordinate space so existing gradient presets do not change.
  float r = length(vec2(vLocal.x, vLocal.y * (2.0 * vShadow - 1.0)) - vec2(center));
  vec3 color = vShadow > 0.5 ? shadowColorsAt((innerRadius - r) / max(innerRadius, 0.0001))
    : colorsAt((r - innerRadius) / max(radius, 0.0001));
  gl_FragColor = sRGBTransferEOTF(vec4(color, coverage.x * coverage.y));
}
`;

export class RadialRenderer implements GpuDisplay {
  private surface = new VectorSurface();
  object = this.surface.object;
  private parser = new FFTParser();
  private geometry = new InstancedBufferGeometry();
  private bars = new InstancedBufferAttribute(new Float32Array(1024 * 3), 3).setUsage(
    DynamicDrawUsage,
  );
  private material = shaderMaterial(vertex, fragment);

  constructor() {
    const plane = new PlaneGeometry(1, 1);
    this.geometry.index = plane.index;
    this.geometry.attributes.position = plane.attributes.position;
    this.geometry.setAttribute('bar', this.bars);
    this.material.uniforms = {
      slots: { value: 1 },
      radius: { value: 150 },
      innerRadius: { value: 80 },
      barWidth: { value: 4 },
      shadowLength: { value: 0.5 },
      center: { value: 232 },
    };
    setGradient(this.material, 'colors', '#FFFFFF');
    setGradient(this.material, 'shadowColors', '#333333');
    const mesh = new Mesh(this.geometry, this.material);
    mesh.frustumCulled = false;
    this.surface.scene.add(mesh);
  }

  update(p: Record<string, unknown>, frame?: RenderFrameData) {
    this.parser.update(p);
    const values = frame?.fft && this.parser.totalBins > 0 ? this.parser.parseFFT(frame.fft) : null;
    const count = Math.max(1, Math.min(256, Math.floor(Number(p.barCount ?? 64))));
    const mirror = p.mirror !== false;
    const slots = mirror ? count * 2 : count;
    const radius = Math.max(0, Number(p.radius ?? 150));
    const innerRadius = Math.max(0, Number(p.innerRadius ?? 80));
    const shadow = Math.max(0, Number(p.shadowLength ?? 0.5));
    const size = (radius + innerRadius) * 2 + 4;
    this.surface.setSize(size, size, p);
    const instances = slots * (shadow > 0 ? 2 : 1);
    for (let i = 0; i < instances; i++) {
      const slot = i % slots;
      const index = mirror && slot >= count ? slots - 1 - slot : slot;
      const value = values?.[Math.floor((index / count) * values.length)] || 0;
      this.bars.setXYZ(i, slot, Math.max(0, Math.min(1, value)), i >= slots ? 1 : 0);
    }
    this.bars.clearUpdateRanges();
    this.bars.addUpdateRange(0, instances * 3);
    this.bars.needsUpdate = true;
    this.geometry.instanceCount = instances;
    const u = this.material.uniforms;
    u.slots.value = slots;
    u.radius.value = radius;
    u.innerRadius.value = innerRadius;
    u.barWidth.value = Math.max(0, Number(p.barWidth ?? 4));
    u.shadowLength.value = shadow;
    u.center.value = size / 2;
    setGradient(this.material, 'colors', p.color ?? '#FFFFFF');
    setGradient(this.material, 'shadowColors', p.shadowColor ?? '#333333');
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.surface.dispose();
  }
}
