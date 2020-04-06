export default class BezierSpline {
  static draw(context, points) {
    context.beginPath();

    this.drawPath(context, points);

    context.stroke();
  }

  static drawPath(context, points) {
    const { x, y, px, py } = this.getSplinePoints(points);

    context.moveTo(points[0], points[1]);

    for (let i = 0; i < points.length; i += 1) {
      context.bezierCurveTo(px.p1[i], py.p1[i], px.p2[i], py.p2[i], x[i + 1], y[i + 1]);
    }
  }

  static getSplinePoints(points) {
    const x = [];
    const y = [];

    // Grab (x,y) coordinates of the control points
    for (let i = 0; i < points.length; i += 2) {
      x.push(points[i]);
      y.push(points[i + 1]);
    }

    // Computes control points p1 and p2 for x and y direction
    const px = this.computeControlPoints(x);
    const py = this.computeControlPoints(y);

    return {
      x,
      y,
      px,
      py,
    };
  }

  static computeControlPoints(K) {
    const p1 = [];
    const p2 = [];
    const n = K.length - 1;

    // RHS vector
    const a = [];
    const b = [];
    const c = [];
    const r = [];

    // Left most segment
    a[0] = 0;
    b[0] = 2;
    c[0] = 1;
    r[0] = K[0] + 2 * K[1];

    // Internal segments
    for (let i = 1; i < n - 1; i += 1) {
      a[i] = 1;
      b[i] = 4;
      c[i] = 1;
      r[i] = 4 * K[i] + 2 * K[i + 1];
    }

    // Right segment
    a[n - 1] = 2;
    b[n - 1] = 7;
    c[n - 1] = 0;
    r[n - 1] = 8 * K[n - 1] + K[n];

    // Solves Ax=b with the Thomas algorithm (from Wikipedia)
    for (let i = 1; i < n; i += 1) {
      const m = a[i] / b[i - 1];
      b[i] -= m * c[i - 1];
      r[i] -= m * r[i - 1];
    }

    p1[n - 1] = r[n - 1] / b[n - 1];
    for (let i = n - 2; i >= 0; --i) {
      p1[i] = (r[i] - c[i] * p1[i + 1]) / b[i];
    }

    // We have p1, now compute p2
    for (let i = 0; i < n - 1; i++) {
      p2[i] = 2 * K[i + 1] - p1[i + 1];
    }

    p2[n - 1] = 0.5 * (K[n] + p1[n - 1]);

    return { p1, p2 };
  }
}
