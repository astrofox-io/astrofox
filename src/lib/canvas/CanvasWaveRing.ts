import Entity from '@/lib/core/Entity';
import type { CanvasContext, CanvasElement } from '@/lib/types';
import { resetCanvas } from '@/lib/utils/canvas';
import { clamp } from '@/lib/utils/math';

function setRadialColor(
  context: CanvasRenderingContext2D,
  color: string | string[],
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
) {
  if (Array.isArray(color)) {
    const gradient = context.createRadialGradient(
      centerX,
      centerY,
      innerRadius,
      centerX,
      centerY,
      outerRadius,
    );

    for (let i = 0; i < color.length; i++) {
      gradient.addColorStop(i / Math.max(1, color.length - 1), color[i]);
    }

    return gradient;
  }

  return color;
}

export default class CanvasWaveRing extends Entity {
  canvas: CanvasElement;
  context: CanvasContext;

  static defaultProperties = {
    radius: 160,
    amplitude: 80,
    lineWidth: 2,
    stroke: true,
    strokeColor: '#FFFFFF',
    fill: false,
    fillColor: '#FFFFFF',
    smooth: true,
  };

  constructor(properties: Record<string, unknown>, canvas: CanvasElement) {
    super('CanvasWaveRing', {
      ...CanvasWaveRing.defaultProperties,
      ...properties,
    });

    this.canvas = canvas;
    this.context = this.canvas.getContext('2d') as CanvasContext;
  }

  render(values: Float32Array | number[]) {
    const { canvas, context } = this;
    const { radius, amplitude, lineWidth, stroke, strokeColor, fill, fillColor, smooth } = this
      .properties as Record<string, unknown>;
    const baseRadius = Math.max(1, Number(radius));
    const waveAmplitude = Math.max(0, Number(amplitude));
    const strokeWidth = Math.max(1, Number(lineWidth));
    const outerRadius = baseRadius + waveAmplitude + strokeWidth + 2;
    const totalSize = outerRadius * 2;
    const centerX = totalSize / 2;
    const centerY = totalSize / 2;
    const ctx = context as CanvasRenderingContext2D;

    resetCanvas(canvas, totalSize, totalSize);

    const count = values.length;
    if (count < 2) {
      return;
    }

    const points = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const value = clamp(Number(values[i]), 0, 1);
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const offset = (value - 0.5) * 2 * waveAmplitude;
      const pointRadius = Math.max(1, baseRadius + offset);

      points[i * 2] = centerX + Math.cos(angle) * pointRadius;
      points[i * 2 + 1] = centerY + Math.sin(angle) * pointRadius;
    }

    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = setRadialColor(
      ctx,
      strokeColor as string | string[],
      centerX,
      centerY,
      Math.max(0, baseRadius - waveAmplitude),
      outerRadius,
    );
    ctx.fillStyle = setRadialColor(
      ctx,
      fillColor as string | string[],
      centerX,
      centerY,
      Math.max(0, baseRadius - waveAmplitude),
      outerRadius,
    );

    ctx.beginPath();

    if (smooth) {
      const lastX = points[(count - 1) * 2];
      const lastY = points[(count - 1) * 2 + 1];
      const firstX = points[0];
      const firstY = points[1];
      ctx.moveTo((lastX + firstX) / 2, (lastY + firstY) / 2);

      for (let i = 0; i < count; i++) {
        const nextIndex = (i + 1) % count;
        const x = points[i * 2];
        const y = points[i * 2 + 1];
        const nextX = points[nextIndex * 2];
        const nextY = points[nextIndex * 2 + 1];

        ctx.quadraticCurveTo(x, y, (x + nextX) / 2, (y + nextY) / 2);
      }
    } else {
      ctx.moveTo(points[0], points[1]);

      for (let i = 1; i < count; i++) {
        ctx.lineTo(points[i * 2], points[i * 2 + 1]);
      }
    }

    ctx.closePath();

    if (fill) {
      ctx.fill();
    }

    if (stroke) {
      ctx.stroke();
    }
  }
}
