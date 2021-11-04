/* eslint-disable no-bitwise, no-nested-ternary */
// Fast rounding
export function round(val) {
  return (val + 0.5) << 0;
}

// Fast ceiling
export function ceil(val) {
  const n = val << 0;
  return n === val ? n : n + 1;
}

// Fast floor
export function floor(val) {
  return ~~val;
}

// Clamps value between min and max
export function clamp(num, min, max) {
  return num < min ? min : num > max ? max : num;
}

// Decimal places in a number
export function decimals(num) {
  if (num % 1 !== 0) {
    return num.toString().split('.')[1].length;
  }
  return 0;
}

// Round to nearest given interval
export function roundTo(num, step) {
  const d = decimals(step);
  const n = ceil(num / step) * step;

  return d > 0 ? n.toFixed(d) : n;
}

// Percent value of a number in a range
export function val2pct(val, min, max) {
  const n = (val - min) / (max - min);

  return clamp(n, 0, 1);
}

// Log base 10
export function log10(val) {
  return Math.log(val) / Math.LN10;
}

// Decibels to magnitude: Math.pow(10, 0.05 * val);
export function db2mag(val) {
  return Math.exp(0.1151292546497023 * val);
}

// Magnitude to decibels: 20 * log10(db)
export function mag2db(val) {
  return 20 * log10(val);
}

// Gets normalized value from decibels
export function normalize(db, min, max) {
  return val2pct(db2mag(db), db2mag(min), db2mag(max));
}

// Degrees to radians
export function deg2rad(val) {
  return val * 0.017453292519943295;
}

// Radians to degrees
export function rad2deg(val) {
  return val * 57.29577951308232;
}

// Hash code of a string
export function hash(s) {
  let h = 0;
  if (s.length === 0) return h;

  for (let i = 0; i < s.length; i++) {
    const chr = s.charCodeAt(i);
    h = (h << 5) - h + chr;
    h |= 0;
  }

  return h;
}
