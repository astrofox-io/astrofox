import {
  round,
  ceil,
  floor,
  clamp,
  decimals,
  roundTo,
  val2pct,
  log10,
  db2mag,
  mag2db,
  deg2rad,
  rad2deg,
  hash,
} from '../../src/utils/math';

test('rounding number properly', () => {
  expect(round(5.1)).toBe(5);
  expect(round(5.9)).toBe(6);
});

test('ceiling number properly', () => {
  expect(ceil(5.2)).toBe(6);
  expect(ceil(5)).toBe(5);
});

test('floor operation working properly', () => {
  expect(floor(5.2)).toBe(5);
});

test('clamps value between min and max properly', () => {
  expect(clamp(1, 2, 8)).toBe(2);
  expect(clamp(10, 2, 8)).toBe(8);
  expect(clamp(8, 2, 8)).toBe(8);
});

test('count decimal places in a number properly', () => {
  expect(decimals(5)).toBe(0);
  expect(decimals(5.298)).toBe(3);
});

test('round to nearest given interval properly', () => {
  expect(roundTo(5.6, 10)).toBe(10);
  expect(roundTo(11, -5)).toBe(5);
  expect(roundTo(10, 5.55)).toContain(11.0);
});

test('find percent value of a number in a range properly', () => {
  expect(val2pct(50, 20, 20)).toBe(20);
  expect(val2pct(500, 20, 30)).toBe(1);
  expect(val2pct(0, 20, 30)).toBe(0);
  expect(val2pct(50, 20, 80)).toBe(0.5);
});

test('calculate log base 10 properly', () => {
  expect(log10(100)).toBe(2);
});

test('calculate decibels to magnitude properly', () => {
  expect(db2mag(20)).toBe(10.000000000000002);
});

test('calculate magnitude to decibels properly', () => {
  expect(mag2db(20)).toBe(26.02059991327962);
});

test('convert degrees to radians properly', () => {
  expect(deg2rad(180)).toBe(3.141592653589793);
});

test('convert radians to degrees properly', () => {
  expect(rad2deg(3.141592653589793)).toBe(180);
});

test('find hash code of a string properly', () => {
  expect(hash('')).toBe(0);
  expect(hash('astrofox')).toBe(-332709840);
});
