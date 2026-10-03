import {
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  PlaneGeometry,
  Vector2,
} from 'three';
import FFTParser from '@/lib/audio/FFTParser';
import WaveParser from '@/lib/audio/WaveParser';
import type { RenderFrameData } from '@/lib/types';
import { WAVELENGTH_MAX } from '../../constants';
import { smoothRing, smoothWave } from './curvePoints';
import type { GpuDisplay } from './GpuDisplayLayer';
import { gradientShader, setGradient, shaderMaterial } from './materials';
import { VectorSurface } from './VectorSurface';

const vertex = /* glsl */ `
attribute float edge;
varying vec2 vPoint;
varying float vEdge;
void main() {
  vPoint = position.xy;
  vEdge = edge;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const colorFragment = /* glsl */ `
uniform vec2 size;
uniform vec2 radialRange;
uniform float radial;
uniform float halfWidth;
uniform float outline;
varying vec2 vPoint;
varying float vEdge;
${gradientShader('colors')}
void main() {
  float t = radial > 0.5
    ? (length(vPoint - size * 0.5) - radialRange.x) / max(radialRange.y - radialRange.x, 0.0001)
    : vPoint.y / max(size.y, 0.0001);
  float alpha = outline > 0.5 ? clamp((halfWidth - abs(vEdge)) / max(fwidth(vEdge), 0.0001) + 0.5, 0.0, 1.0) : 1.0;
  gl_FragColor = sRGBTransferEOTF(vec4(colorsAt(t), alpha));
}
`;
const roundVertex = /* glsl */ `
attribute vec4 segment;
uniform float halfWidth;
varying vec2 vPoint;
varying vec2 vLocal;
varying float vLength;
void main() {
  vec2 delta = segment.zw - segment.xy;
  float len = length(delta);
  vec2 along = len > 0.0001 ? delta / len : vec2(1.0, 0.0);
  vec2 normal = vec2(-along.y, along.x);
  float padding = halfWidth + 1.0;
  vLocal = vec2((position.x + 0.5) * (len + 2.0 * padding) - padding, position.y * 2.0 * padding);
  vLength = len;
  vPoint = segment.xy + along * vLocal.x + normal * vLocal.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPoint, 0.0, 1.0);
}
`;
const roundFragment = colorFragment
  .replace('varying float vEdge;', 'varying vec2 vLocal;\nvarying float vLength;')
  .replace(
    '  float alpha = outline',
    '  float vEdge = length(vec2(vLocal.x - clamp(vLocal.x, 0.0, vLength), vLocal.y));\n  float alpha = outline',
  );

/** Reusable triangle storage; updates upload only the populated prefix. */
class Triangles {
  geometry = new BufferGeometry();
  private capacity = 0;
  private positions = new Float32Array();
  private edges = new Float32Array();
  count = 0;

  begin(vertices: number) {
    this.count = 0;
    if (vertices <= this.capacity) return;
    this.capacity = 2 ** Math.ceil(Math.log2(Math.max(16, vertices)));
    // Dispose old GL attributes before replacing them; keep the geometry object.
    this.geometry.dispose();
    this.positions = new Float32Array(this.capacity * 3);
    this.edges = new Float32Array(this.capacity);
    this.geometry.setAttribute(
      'position',
      new BufferAttribute(this.positions, 3).setUsage(DynamicDrawUsage),
    );
    this.geometry.setAttribute(
      'edge',
      new BufferAttribute(this.edges, 1).setUsage(DynamicDrawUsage),
    );
  }

  vertex(x: number, y: number, edge = 0) {
    this.positions[this.count * 3] = x;
    this.positions[this.count * 3 + 1] = y;
    this.edges[this.count++] = edge;
  }

  end() {
    this.geometry.setDrawRange(0, this.count);
    for (const name of ['position', 'edge']) {
      const attribute = this.geometry.getAttribute(name) as BufferAttribute;
      if (!attribute) continue;
      attribute.clearUpdateRanges();
      if (this.count) attribute.addUpdateRange(0, this.count * attribute.itemSize);
      attribute.needsUpdate = true;
    }
  }
}

export class PathRenderer implements GpuDisplay {
  private surface = new VectorSurface();
  object = this.surface.object;
  private fft = new FFTParser();
  private wave = new WaveParser();
  private fill = new Triangles();
  private stroke = new Triangles();
  private fillMaterial = shaderMaterial(vertex, colorFragment);
  private strokeMaterial;
  private roundGeometry = new InstancedBufferGeometry();
  private segments = new InstancedBufferAttribute(new Float32Array(4), 4).setUsage(
    DynamicDrawUsage,
  );
  private fillMesh = new Mesh(this.fill.geometry, this.fillMaterial);
  private strokeMesh;

  constructor(private kind: 'spectrum' | 'sound' | 'ring') {
    this.strokeMaterial = shaderMaterial(
      kind === 'ring' ? roundVertex : vertex,
      kind === 'ring' ? roundFragment : colorFragment,
    );
    const plane = new PlaneGeometry(1, 1);
    this.roundGeometry.index = plane.index;
    this.roundGeometry.attributes.position = plane.attributes.position;
    this.roundGeometry.setAttribute('segment', this.segments);
    this.strokeMesh = new Mesh(
      kind === 'ring' ? this.roundGeometry : this.stroke.geometry,
      this.strokeMaterial,
    );
    for (const material of [this.fillMaterial, this.strokeMaterial]) {
      material.uniforms = {
        size: { value: new Vector2() },
        radialRange: { value: new Vector2() },
        radial: { value: kind === 'ring' ? 1 : 0 },
        halfWidth: { value: 0.5 },
        outline: { value: material === this.strokeMaterial ? 1 : 0 },
      };
      setGradient(material, 'colors', '#FFFFFF');
    }
    this.fillMesh.frustumCulled = this.strokeMesh.frustumCulled = false;
    this.fillMesh.renderOrder = kind === 'ring' ? 0 : 1;
    this.strokeMesh.renderOrder = kind === 'ring' ? 1 : 0;
    this.surface.scene.add(this.fillMesh, this.strokeMesh);
  }

  update(p: Record<string, unknown>, frame?: RenderFrameData) {
    const ring = this.kind === 'ring';
    const radius = Math.max(1, Number(p.radius ?? 160));
    const amplitude = Math.max(0, Number(p.amplitude ?? 80));
    const lineWidth = Math.max(ring ? 1 : 0.01, Number(p.lineWidth ?? (ring ? 2 : 1)));
    const size = (radius + amplitude + lineWidth + 2) * 2;
    const width = ring ? size : Math.max(2, Number(p.width || 400));
    const height = ring ? size : Math.max(1, Number(p.height || 200));
    const midpoint = Number(p.midpoint ?? 100);
    const points: number[] = [];
    if (this.kind === 'spectrum') {
      this.fft.update(p);
      const bins = Math.max(1, this.fft.totalBins || 64);
      const values = frame?.fft
        ? this.fft.totalBins > 0
          ? this.fft.parseFFT(frame.fft)
          : new Float32Array(0)
        : new Float32Array(bins);
      for (let i = 0; i < values.length; i++)
        points.push((i * width) / values.length, height - values[i] * height);
      if (points.length) points[points.length - 2] = width;
    } else {
      this.wave.update(p);
      const wavelength = Number(p.wavelength || 0);
      const count = ring
        ? Math.max(2, Math.floor(Number(p.sampleCount || 256)))
        : wavelength > 0
          ? Math.max(2, Math.floor(1 / (wavelength * WAVELENGTH_MAX)))
          : Math.floor(width);
      const values = frame?.td
        ? this.wave.parseTimeData(frame.td, count)
        : new Float32Array(count).fill(ring ? 0.5 : 0);
      for (let i = 0; i < count; i++) {
        if (ring) {
          const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
          const r = Math.max(1, radius + (values[i] - 0.5) * 2 * amplitude);
          points.push(size / 2 + Math.cos(angle) * r, size / 2 + Math.sin(angle) * r);
        } else points.push((i * width) / (count - 1), height - values[i] * height);
      }
    }
    if (!ring && p.taper && points.length) {
      points[1] = midpoint;
      points[points.length - 1] = midpoint;
    }
    let path = points;
    const smooth = ring
      ? p.smooth !== false
      : this.kind === 'spectrum' || Number(p.wavelength || 0) > 0.02;
    if (smooth && points.length >= 4) path = ring ? smoothRing(points) : smoothWave(points);
    else if (ring) path = [...points, points[0], points[1]];
    this.surface.setSize(width, height, p);
    this.fillMesh.visible = Boolean(p.fill) && path.length > 0;
    this.strokeMesh.visible = p.stroke !== false && path.length >= 4;
    for (const material of [this.fillMaterial, this.strokeMaterial]) {
      material.uniforms.size.value.set(width, height);
      material.uniforms.radialRange.value.set(Math.max(0, radius - amplitude), size / 2);
      material.uniforms.halfWidth.value = lineWidth / 2;
    }
    setGradient(this.fillMaterial, 'colors', p.fillColor ?? '#FFFFFF');
    setGradient(this.strokeMaterial, 'colors', p.strokeColor ?? '#FFFFFF');
    if (this.fillMesh.visible) this.fillPath(path, ring, width, height, midpoint);
    if (this.strokeMesh.visible) {
      if (ring) this.roundStroke(path);
      else {
        // CanvasWave's unsmoothed filled path starts at the baseline.
        const strokePath = !smooth && p.fill ? [0, midpoint, ...path] : path;
        this.strokePath(strokePath, lineWidth / 2);
      }
    }
  }

  private fillPath(path: number[], ring: boolean, width: number, height: number, midpoint: number) {
    if (!ring) path = [0, midpoint, ...path, width, midpoint];
    this.fill.begin(path.length * 6);
    const triangle = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => {
      this.fill.vertex(ax, ay);
      this.fill.vertex(bx, by);
      this.fill.vertex(cx, cy);
    };
    for (let i = 0; i < path.length - 2; i += 2) {
      const ax = path[i],
        ay = path[i + 1],
        bx = path[i + 2],
        by = path[i + 3];
      if (ring) triangle(width / 2, height / 2, ax, ay, bx, by);
      else if ((ay - midpoint) * (by - midpoint) < 0) {
        const cross = ax + ((bx - ax) * (midpoint - ay)) / (by - ay);
        triangle(ax, midpoint, ax, ay, cross, midpoint);
        triangle(cross, midpoint, bx, by, bx, midpoint);
      } else {
        triangle(ax, midpoint, ax, ay, bx, by);
        triangle(ax, midpoint, bx, by, bx, midpoint);
      }
    }
    this.fill.end();
  }

  private roundStroke(path: number[]) {
    const count = Math.max(0, path.length / 2 - 1);
    if (count > this.segments.count) {
      this.roundGeometry.dispose();
      this.segments = new InstancedBufferAttribute(
        new Float32Array(2 ** Math.ceil(Math.log2(count)) * 4),
        4,
      ).setUsage(DynamicDrawUsage);
      this.roundGeometry.setAttribute('segment', this.segments);
    }
    for (let i = 0; i < count; i++)
      this.segments.setXYZW(i, path[i * 2], path[i * 2 + 1], path[i * 2 + 2], path[i * 2 + 3]);
    this.segments.clearUpdateRanges();
    if (count) this.segments.addUpdateRange(0, count * 4);
    this.segments.needsUpdate = true;
    this.roundGeometry.instanceCount = count;
  }

  private strokePath(path: number[], halfWidth: number) {
    this.stroke.begin(path.length * 3);
    const normals: number[] = [];
    for (let i = 0; i < path.length - 2; i += 2) {
      const dx = path[i + 2] - path[i],
        dy = path[i + 3] - path[i + 1];
      const length = Math.hypot(dx, dy) || 1;
      normals.push(-dy / length, dx / length);
    }
    const offsets: number[] = [];
    for (let i = 0; i < path.length; i += 2) {
      const previous = Math.max(0, i - 2),
        next = Math.min(normals.length - 2, i);
      const nx = normals[previous] + normals[next],
        ny = normals[previous + 1] + normals[next + 1];
      const length = Math.hypot(nx, ny) || 1;
      const dot = (nx * normals[next] + ny * normals[next + 1]) / length;
      const scale = (halfWidth + 1) / Math.max(0.1, dot);
      offsets.push((nx / length) * scale, (ny / length) * scale);
    }
    const vertexAt = (i: number, side: number) =>
      this.stroke.vertex(
        path[i] + offsets[i] * side,
        path[i + 1] + offsets[i + 1] * side,
        (halfWidth + 1) * side,
      );
    for (let i = 0; i < path.length - 2; i += 2) {
      vertexAt(i, -1);
      vertexAt(i, 1);
      vertexAt(i + 2, 1);
      vertexAt(i, -1);
      vertexAt(i + 2, 1);
      vertexAt(i + 2, -1);
    }
    this.stroke.end();
  }

  dispose() {
    this.fill.geometry.dispose();
    this.stroke.geometry.dispose();
    this.roundGeometry.dispose();
    this.fillMaterial.dispose();
    this.strokeMaterial.dispose();
    this.surface.dispose();
  }
}
