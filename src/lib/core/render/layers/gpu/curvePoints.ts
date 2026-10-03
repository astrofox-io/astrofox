import { getSplinePoints } from '@/lib/drawing/bezierSpline';

// Flatten the same cubic curves CanvasWave uses. Adaptive subdivision bounds
// the deviation in layer pixels instead of changing the smoothing algorithm.
function cubic(
  out: number[],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  tolerance: number,
  depth = 0,
) {
  const dx = x3 - x0;
  const dy = y3 - y0;
  const d1 = Math.abs((x1 - x3) * dy - (y1 - y3) * dx);
  const d2 = Math.abs((x2 - x3) * dy - (y2 - y3) * dx);
  // A closed chord can still curve away from its endpoints (e.g. a two-sample
  // ring). Distance to the chord alone would incorrectly flatten that loop.
  const flat =
    dx === 0 && dy === 0
      ? Math.max(Math.hypot(x1 - x0, y1 - y0), Math.hypot(x2 - x0, y2 - y0)) <= tolerance
      : (d1 + d2) ** 2 <= tolerance ** 2 * (dx * dx + dy * dy);
  if (depth >= 10 || flat) {
    out.push(x3, y3);
    return;
  }
  const ax = (x0 + x1) / 2,
    ay = (y0 + y1) / 2;
  const bx = (x1 + x2) / 2,
    by = (y1 + y2) / 2;
  const cx = (x2 + x3) / 2,
    cy = (y2 + y3) / 2;
  const dx2 = (ax + bx) / 2,
    dy2 = (ay + by) / 2;
  const ex = (bx + cx) / 2,
    ey = (by + cy) / 2;
  const mx = (dx2 + ex) / 2,
    my = (dy2 + ey) / 2;
  cubic(out, x0, y0, ax, ay, dx2, dy2, mx, my, tolerance, depth + 1);
  cubic(out, mx, my, ex, ey, cx, cy, x3, y3, tolerance, depth + 1);
}

export function smoothWave(points: number[]) {
  if (points.length < 6) return points;
  const { x, y, px, py } = getSplinePoints(points);
  const output = [points[0], points[1]];
  for (let i = 0; i < x.length - 1; i++) {
    cubic(output, x[i], y[i], px.p1[i], py.p1[i], px.p2[i], py.p2[i], x[i + 1], y[i + 1], 0.15);
  }
  return output;
}

export function smoothRing(points: number[]) {
  const count = points.length / 2;
  const output = [
    (points[points.length - 2] + points[0]) / 2,
    (points[points.length - 1] + points[1]) / 2,
  ];
  for (let i = 0; i < count; i++) {
    const next = ((i + 1) % count) * 2;
    const x0 = output[output.length - 2],
      y0 = output[output.length - 1];
    const x1 = points[i * 2],
      y1 = points[i * 2 + 1];
    const x2 = (x1 + points[next]) / 2,
      y2 = (y1 + points[next + 1]) / 2;
    // Exact quadratic-to-cubic conversion of CanvasWaveRing's midpoint spline.
    cubic(
      output,
      x0,
      y0,
      x0 + ((x1 - x0) * 2) / 3,
      y0 + ((y1 - y0) * 2) / 3,
      x2 + ((x1 - x2) * 2) / 3,
      y2 + ((y1 - y2) * 2) / 3,
      x2,
      y2,
      0.15,
    );
  }
  return output;
}
