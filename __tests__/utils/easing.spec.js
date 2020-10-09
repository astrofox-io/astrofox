import {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
} from '../../src/utils/easing';

test('linear constant', () => {
  expect(linear(10)).toBe(10);
});

test('accelerating from zero velocity properly', () => {
  expect(easeInQuad(10)).toBe(100);
});

test('decelerating to zero velocity properly', () => {
  expect(easeOutQuad(10)).toBe(-80);
});

test('acceleration until halfway, then deceleration properly', () => {
  expect(easeInOutQuad(0)).toBe(0);
  expect(easeInOutQuad(10)).toBe(-161);
});

test('accelerating from zero velocity properly', () => {
  expect(easeInCubic(10)).toBe(1000);
});

test('decelerating to zero velocity properly', () => {
  expect(easeOutCubic(10)).toBe(730);
});

test('acceleration until halfway, then deceleration properly', () => {
  expect(easeInOutCubic(0.3)).toBe(0.108);
  expect(easeInOutCubic(10)).toBe(2917);
});

test('accelerating from zero velocity properly', () => {
  expect(easeInQuart(10)).toBe(10000);
});

test('decelerating to zero velocity properly', () => {
  expect(easeOutQuart(10)).toBe(-6560);
});

test('acceleration until halfway, then deceleration properly', () => {
  expect(easeInOutQuart(0.3)).toBe(0.0648);
  expect(easeInOutQuart(10)).toBe(-52487);
});

test('accelerating from zero velocity properly', () => {
  expect(easeInQuint(10)).toBe(100000);
});

test('decelerating to zero velocity properly', () => {
  expect(easeOutQuint(10)).toBe(59050);
});

test('acceleration until halfway, then deceleration properly', () => {
  expect(easeInOutQuint(0.3)).toBe(0.03888);
  expect(easeInOutQuint(10)).toBe(944785);
});
