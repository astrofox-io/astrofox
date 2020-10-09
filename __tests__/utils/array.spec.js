import { isDefined, contains, reverse } from '../../src/utils/array';

test('check if array is defined', () => {
  expect(isDefined([1, 2, 3])).toBe(true);
});

test('check if arr1 contains arr2', () => {
  expect(contains([1, 2, 4], [1, 2, 3])).toBe(true);
  expect(contains([1, 2, 3], [4, 5, 6])).toBe(false);
});

test('reverse an array properly', () => {
  expect(reverse([1, 2, 3])).toEqual([3, 2, 1]);
  expect(reverse([1, 2, 3])).not.toBe([1, 2, 3]);
});
