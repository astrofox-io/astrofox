import Entity from '@/lib/core/Entity';
import type { CanvasContext, CanvasElement } from '@/lib/types';
import { resetCanvas } from '@/lib/utils/canvas';
import { clamp } from '@/lib/utils/math';

export default class CanvasRadial extends Entity {
  canvas: CanvasElement;
  context: CanvasContext;

  static defaultProperties = {
    radius: 150,
    innerRadius: 80,
    barCount: 64,
    barWidth: 4,
    mirror: true,
    color: '#FFFFFF',
    shadowColor: '#333333',
    shadowLength: 0.5,
  };

  constructor(properties: Record<string, unknown>, canvas: CanvasElement) {
    super('CanvasRadial', { ...CanvasRadial.defaultProperties, ...properties });

    this.canvas = canvas;
    this.context = this.canvas.getContext('2d') as CanvasContext;
  }

  render(data: Float32Array | number[]) {
    const { canvas, context } = this;
    const { radius, innerRadius, barCount, barWidth, mirror, color, shadowColor, shadowLength } =
      this.properties as Record<string, unknown>;

    const r = radius as number;
    const ir = innerRadius as number;
    const count = barCount as number;
    const bw = barWidth as number;
    const isMirror = mirror as boolean;
    const shadow = shadowLength as number;

    // Canvas size needs to accommodate the full circle plus max bar height
    const maxBarHeight = r;
    const totalSize = (ir + maxBarHeight) * 2 + 4;
    const centerX = totalSize / 2;
    const centerY = totalSize / 2;

    resetCanvas(canvas, totalSize, totalSize);

    const ctx = context as CanvasRenderingContext2D;

    // Total number of "slots" around the circle
    const totalSlots = isMirror ? count * 2 : count;
    const angleStep = (Math.PI * 2) / totalSlots;

    // Resample data to match the bar count
    const values = new Float32Array(count);
    const dataLen = data.length;
    for (let i = 0; i < count; i++) {
      const dataIndex = Math.floor((i / count) * dataLen);
      values[i] = clamp(data[dataIndex] || 0, 0, 1);
    }

    // Draw bars
    ctx.save();

    // Set bar color — use radial gradient if array
    if (Array.isArray(color)) {
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        ir,
        centerX,
        centerY,
        ir + maxBarHeight,
      );
      for (let i = 0; i < (color as string[]).length; i++) {
        gradient.addColorStop(i / ((color as string[]).length - 1), (color as string[])[i]);
      }
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = color as string;
    }

    for (let i = 0; i < totalSlots; i++) {
      // For mirrored mode, bars go 0..count-1 on the right half, then count-1..0 on the left half
      const dataIdx = isMirror ? (i < count ? i : totalSlots - 1 - i) : i;

      const val = values[dataIdx];
      const barHeight = val * maxBarHeight;

      if (barHeight < 1) continue;

      const angle = angleStep * i - Math.PI / 2; // start from top

      // Use fixed bar width or angular width, whichever is smaller
      const angularWidth = angleStep * 0.6;
      const arcLen = ir * angularWidth;
      const halfWidth = Math.min(bw, arcLen) / 2;

      // Calculate bar center angle and position on inner radius
      const midAngle = angle + angleStep * 0.3;
      const x1 = centerX + Math.cos(midAngle) * ir;
      const y1 = centerY + Math.sin(midAngle) * ir;

      // Draw as a thin rotated rectangle radiating outward
      ctx.save();
      ctx.translate(x1, y1);
      ctx.rotate(midAngle + Math.PI / 2);
      ctx.fillRect(-halfWidth, 0, halfWidth * 2, -barHeight);
      ctx.restore();
    }

    // Draw shadow (inward bars)
    if (shadow > 0) {
      if (Array.isArray(shadowColor)) {
        const gradient = ctx.createRadialGradient(centerX, centerY, ir, centerX, centerY, 0);
        for (let i = 0; i < (shadowColor as string[]).length; i++) {
          gradient.addColorStop(
            i / ((shadowColor as string[]).length - 1),
            (shadowColor as string[])[i],
          );
        }
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = shadowColor as string;
      }

      for (let i = 0; i < totalSlots; i++) {
        const dataIdx = isMirror ? (i < count ? i : totalSlots - 1 - i) : i;

        const val = values[dataIdx];
        const barHeight = val * maxBarHeight * shadow;

        if (barHeight < 1) continue;

        const angle = angleStep * i - Math.PI / 2;
        const angularWidth = angleStep * 0.6;
        const arcLen = ir * angularWidth;
        const halfWidth = Math.min(bw, arcLen) / 2;

        const midAngle = angle + angleStep * 0.3;
        const x1 = centerX + Math.cos(midAngle) * ir;
        const y1 = centerY + Math.sin(midAngle) * ir;

        ctx.save();
        ctx.translate(x1, y1);
        ctx.rotate(midAngle + Math.PI / 2);
        ctx.fillRect(-halfWidth, 0, halfWidth * 2, barHeight);
        ctx.restore();
      }
    }

    ctx.restore();
  }
}
