const TAU = Math.PI * 2;

export const GRID_MOTION_OPTIONS = [
  'Static',
  'Horizontal',
  'Vertical',
  'Diagonal',
  'Radial',
  'Sweep',
  'Noise',
] as const;

export interface GridMotionContext {
  u: number;
  v: number;
  centeredU: number;
  centeredV: number;
  radialDistance: number;
  normalizedDistance: number;
  angle: number;
  time: number;
  frequencyX: number;
  frequencyY: number;
  averageFrequency: number;
  rows: number;
  columns: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function wrap01(value: number) {
  const wrapped = value % 1;
  return wrapped < 0 ? wrapped + 1 : wrapped;
}

function wrapIndex(value: number, size: number) {
  const wrapped = value % size;
  return wrapped < 0 ? wrapped + size : wrapped;
}

export function createGridMotionContext(
  columnIndex: number,
  rowIndex: number,
  columns: number,
  rows: number,
  time: number,
  frequencyX: number,
  frequencyY: number,
): GridMotionContext {
  const u = columns <= 1 ? 0 : columnIndex / (columns - 1);
  const v = rows <= 1 ? 0 : rowIndex / (rows - 1);
  const centeredU = u - 0.5;
  const centeredV = v - 0.5;
  const radialDistance = Math.sqrt(centeredU * centeredU + centeredV * centeredV);
  const normalizedDistance = clamp(radialDistance / Math.sqrt(0.5), 0, 1);

  return {
    u,
    v,
    centeredU,
    centeredV,
    radialDistance,
    normalizedDistance,
    angle: Math.atan2(centeredV, centeredU),
    time,
    frequencyX: Math.max(0.05, Number(frequencyX) || 0.05),
    frequencyY: Math.max(0.05, Number(frequencyY) || 0.05),
    averageFrequency: Math.max(
      0.05,
      ((Number(frequencyX) || 0.05) + (Number(frequencyY) || 0.05)) * 0.5,
    ),
    rows,
    columns,
  };
}

export function sampleProceduralGridMotion(
  motion: string,
  context: GridMotionContext,
  amplitude: number,
) {
  const {
    u,
    v,
    radialDistance,
    normalizedDistance,
    angle,
    time,
    frequencyX,
    frequencyY,
    averageFrequency,
  } = context;

  switch (motion) {
    case 'Static':
      return (Math.sin(u * frequencyX * TAU) + Math.sin(v * frequencyY * TAU)) * 0.5 * amplitude;
    case 'Vertical':
      return Math.sin((v * frequencyY - time) * TAU) * amplitude;
    case 'Diagonal':
      return Math.sin(((u * 0.72 + v * 0.28) * averageFrequency - time) * TAU) * amplitude;
    case 'Radial':
      return (
        Math.sin((normalizedDistance * 3 * averageFrequency - time * 0.75) * TAU) *
        (1 - normalizedDistance * 0.35) *
        amplitude
      );
    case 'Sweep':
      return (
        Math.sin(angle * averageFrequency * 4 + time * TAU + radialDistance * 6) *
        (0.55 + (1 - normalizedDistance) * 0.45) *
        amplitude
      );
    case 'Noise': {
      const noiseA = Math.sin(
        (u * frequencyX * 12 + time * 1.7) * 1.9 +
          Math.sin((v * frequencyY * 12 - time * 1.3) * 0.8),
      );
      const noiseB = Math.cos(
        (v * frequencyY * 12 - time * 1.1) * 1.6 +
          Math.sin((u * frequencyX * 12 + time * 0.7) * 0.7),
      );

      return (noiseA + noiseB) * 0.5 * amplitude;
    }
    default:
      return Math.sin((u * frequencyX - time) * TAU) * amplitude;
  }
}

function sampleSpectrumBinLinear(values: Float32Array, index: number, count: number) {
  if (values.length === 0 || count <= 1) {
    return values[0] ?? 0;
  }

  const position = (index / (count - 1)) * Math.max(0, values.length - 1);
  const lower = Math.floor(position);
  const upper = Math.min(values.length - 1, lower + 1);
  const mix = position - lower;
  const start = values[lower] ?? 0;
  const end = values[upper] ?? start;

  return start + (end - start) * mix;
}

function sampleStaticSpectrumField(
  values: Float32Array,
  row: number,
  column: number,
  rows: number,
  columns: number,
) {
  if (!values.length) {
    return 0;
  }

  const totalCells = Math.max(2, rows * columns);
  return sampleSpectrumBinLinear(values, row * columns + column, totalCells);
}

function sampleStaticSpectrumGridLinear(
  values: Float32Array,
  row: number,
  column: number,
  rows: number,
  columns: number,
) {
  if (rows <= 0 || columns <= 0) {
    return 0;
  }

  const rowWrapped = wrapIndex(row, rows);
  const columnWrapped = wrapIndex(column, columns);
  const row0 = Math.floor(rowWrapped);
  const row1 = (row0 + 1) % rows;
  const column0 = Math.floor(columnWrapped);
  const column1 = (column0 + 1) % columns;
  const rowMix = rowWrapped - row0;
  const columnMix = columnWrapped - column0;
  const a = sampleStaticSpectrumField(values, row0, column0, rows, columns);
  const b = sampleStaticSpectrumField(values, row0, column1, rows, columns);
  const c = sampleStaticSpectrumField(values, row1, column0, rows, columns);
  const d = sampleStaticSpectrumField(values, row1, column1, rows, columns);
  const top = a + (b - a) * columnMix;
  const bottom = c + (d - c) * columnMix;

  return top + (bottom - top) * rowMix;
}

function sampleStaticSpectrumNormalized(
  values: Float32Array,
  u: number,
  v: number,
  rows: number,
  columns: number,
) {
  return sampleStaticSpectrumGridLinear(
    values,
    wrap01(v) * rows,
    wrap01(u) * columns,
    rows,
    columns,
  );
}

export function sampleSpectrumGridMotion(
  values: Float32Array,
  motion: string,
  context: GridMotionContext,
) {
  if (!values.length) {
    return 0;
  }

  const { u, v, normalizedDistance, angle, time, rows, columns } = context;

  switch (motion) {
    case 'Static':
      return sampleStaticSpectrumNormalized(values, u, v, rows, columns);
    case 'Vertical':
      return sampleStaticSpectrumNormalized(values, u, v + time * 0.08, rows, columns);
    case 'Diagonal':
      return sampleSpectrumBinLinear(
        values,
        wrap01(u * 0.72 + v * 0.28 + time * 0.08) * Math.max(1, rows * columns - 1),
        Math.max(2, rows * columns),
      );
    case 'Radial':
      return sampleSpectrumBinLinear(
        values,
        wrap01(normalizedDistance + time * 0.08) * Math.max(1, rows * columns - 1),
        Math.max(2, rows * columns),
      );
    case 'Sweep':
      return sampleSpectrumBinLinear(
        values,
        wrap01(angle / TAU + 0.5 + time * 0.08) * Math.max(1, rows * columns - 1),
        Math.max(2, rows * columns),
      );
    case 'Noise': {
      const noiseU =
        u + Math.sin((u * 10 + time * 1.7) * 1.9 + Math.sin((v * 8 - time) * 0.8)) * 0.12;
      const noiseV =
        v + Math.cos((v * 10 - time * 1.1) * 1.6 + Math.sin((u * 7 + time) * 0.7)) * 0.12;

      return sampleStaticSpectrumNormalized(values, noiseU, noiseV, rows, columns);
    }
    default:
      return sampleStaticSpectrumNormalized(values, u + time * 0.08, v, rows, columns);
  }
}
